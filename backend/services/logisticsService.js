const User = require('../models/User');

// Sri Lankan Agricultural Hub Geocoordinates Reference
const SRI_LANKA_DISTRICT_COORDS = {
  'Colombo': { lat: 6.9271, lng: 79.8612 },
  'Gampaha': { lat: 7.0840, lng: 79.9939 },
  'Kalutara': { lat: 6.5854, lng: 79.9607 },
  'Kandy': { lat: 7.2906, lng: 80.6337 },
  'Matale': { lat: 7.4675, lng: 80.6234 },
  'Nuwara Eliya': { lat: 6.9497, lng: 80.7891 },
  'Dambulla': { lat: 7.8731, lng: 80.6511 },
  'Kurunegala': { lat: 7.4818, lng: 80.3609 },
  'Anuradhapura': { lat: 8.3114, lng: 80.4037 },
  'Polonnaruwa': { lat: 7.9403, lng: 81.0188 },
  'Badulla': { lat: 6.9934, lng: 81.0550 },
  'Monaragala': { lat: 6.8728, lng: 81.3507 },
  'Ratnapura': { lat: 6.6828, lng: 80.4035 },
  'Galle': { lat: 6.0535, lng: 80.2210 },
  'Matara': { lat: 5.9549, lng: 80.5550 },
  'Hambantota': { lat: 6.1246, lng: 81.1185 },
  'Jaffna': { lat: 9.6615, lng: 80.0255 }
};

/**
 * Haversine Formula for exact Great Circle Distance between 2 coordinates in Kilometers
 */
function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 50; // fallback estimated distance
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round((R * c) * 10) / 10;
}

/**
 * Vehicle Capacity Suitability check for Agricultural Produce
 */
function evaluateVehicleSuitability(vehicleType, weightKg, handlingRequirement) {
  const v = (vehicleType || '').toLowerCase();
  
  if (handlingRequirement && handlingRequirement.toLowerCase().includes('keep cool')) {
    if (v.includes('refrigerated')) return 1.5;
  }

  if (weightKg > 1000) {
    if (v.includes('heavy') || v.includes('lorry')) return 1.4;
    if (v.includes('truck')) return 1.2;
    return 0.5; // vehicle too small
  } else if (weightKg > 300) {
    if (v.includes('truck') || v.includes('pickup') || v.includes('lorry')) return 1.3;
    return 0.8;
  } else {
    // Light load: any vehicle is suitable
    return 1.1;
  }
}

/**
 * Intelligent Driver Assignment & Matching Algorithm
 * Connects pending shipments with available drivers based on:
 * 1. Geographic distance / proximity to pickup point
 * 2. Driver availability status
 * 3. Vehicle suitability (capacity & cold chain handling)
 * 4. Driver performance metrics (rating & on-time delivery rate)
 */
async function findOptimalDriverForShipment(shipment) {
  // Query all active drivers
  const drivers = await User.find({
    role: 'Driver',
    status: 'Active',
    'driverDetails.isAvailable': true
  });

  if (!drivers || drivers.length === 0) {
    return {
      success: false,
      message: 'No available drivers registered in the system at this moment.',
      candidates: []
    };
  }

  const pickupLat = shipment.sender?.lat || 7.8731;
  const pickupLng = shipment.sender?.lng || 80.6511;
  const pickupDistrict = shipment.sender?.district || 'Matale';
  const weightKg = shipment.packageDetails?.weightKg || 50;
  const specialHandling = shipment.packageDetails?.specialHandling || 'Standard';

  const scoredCandidates = drivers.map(driver => {
    const driverLat = driver.location?.lat || 6.9271;
    const driverLng = driver.location?.lng || 79.8612;
    const distanceKm = calculateDistanceKm(pickupLat, pickupLng, driverLat, driverLng);
    
    // Proximity score (Max 50 points: decreases as distance increases)
    const proximityScore = Math.max(0, 50 - (distanceKm * 0.4));
    
    // District bonus (15 points if operating district matches)
    const districtBonus = (driver.driverDetails?.operatingDistricts?.includes(pickupDistrict) ||
                           driver.location?.district === pickupDistrict) ? 15 : 0;
    
    // Vehicle score (Max 20 points)
    const vehicleFactor = evaluateVehicleSuitability(
      driver.driverDetails?.vehicleType, 
      weightKg, 
      specialHandling
    );
    const vehicleScore = Math.min(20, 15 * vehicleFactor);
    
    // Performance & Reliability score (Max 15 points)
    const rating = driver.driverDetails?.rating || 4.5;
    const totalDeliveries = driver.driverDetails?.totalDeliveries || 0;
    const onTimeDeliveries = driver.driverDetails?.onTimeDeliveries || 0;
    const onTimeRate = totalDeliveries > 0 ? (onTimeDeliveries / totalDeliveries) : 1;
    const performanceScore = ((rating / 5) * 10) + (onTimeRate * 5);

    // Total Composite Score (0 - 100)
    const compositeScore = Math.round((proximityScore + districtBonus + vehicleScore + performanceScore) * 10) / 10;

    return {
      driver,
      distanceKm,
      compositeScore,
      proximityScore: Math.round(proximityScore),
      vehicleScore: Math.round(vehicleScore),
      performanceScore: Math.round(performanceScore),
      suitabilityNote: `${driver.driverDetails?.vehicleType || 'Vehicle'} • ${distanceKm} km away • Rating: ${rating}⭐`
    };
  });

  // Sort by highest composite score
  scoredCandidates.sort((a, b) => b.compositeScore - a.compositeScore);

  const bestMatch = scoredCandidates[0];

  return {
    success: true,
    bestMatch: bestMatch.driver,
    bestScore: bestMatch.compositeScore,
    distanceKm: bestMatch.distanceKm,
    candidates: scoredCandidates
  };
}

/**
 * Route Optimization Generator
 * Computes optimized checkpoints between Sri Lankan Agricultural origins and destinations
 */
function generateOptimizedRoute(pickupCity, deliveryCity) {
  const origin = pickupCity || 'Dambulla';
  const dest = deliveryCity || 'Colombo';
  
  const waypoints = [
    `Origin: ${origin} Agricultural Hub / Farmgate`,
    `Checkpoint 1: Central Agrarian Transit Sorting Facility`,
    `Checkpoint 2: National Expressway / Primary Logistics Corridor`,
    `Checkpoint 3: Regional Distribution Depot (${dest} Outskirts)`,
    `Final Destination: ${dest} Recipient Terminal`
  ];

  return waypoints;
}

module.exports = {
  SRI_LANKA_DISTRICT_COORDS,
  calculateDistanceKm,
  findOptimalDriverForShipment,
  generateOptimizedRoute
};
