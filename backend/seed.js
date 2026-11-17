const mongoose = require('mongoose');
const User = require('./models/User');
const Shipment = require('./models/Shipment');
require('dotenv').config();
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI, { family: 4 });
  console.log('Connected to DB');

  const drivers = await User.find({ role: 'Driver' });
  const sunil = drivers.find(d => d.email === 'sunil.driver@agribridge.lk') || drivers[0];
  const kamal = drivers.find(d => d.email === 'kamal.driver@agribridge.lk') || drivers[1] || sunil;

  const demoShipments = [
    {
      trackingNumber: 'TRK-2026-88401',
      orderId: 'REQ-379',
      orderTitle: '500kg Premium Willard Mangoes',
      sender: {
        name: 'Nimal Fernando',
        phone: '+94 78 333 9911',
        pickupAddress: 'Block 4, Dedicated Economic Centre',
        city: 'Dambulla',
        district: 'Matale',
        lat: 7.8731,
        lng: 80.6511
      },
      recipient: {
        name: 'Ruwan Wijesinghe',
        phone: '+94 77 999 5544',
        deliveryAddress: 'Bay 12, Manning Wholesale Market',
        city: 'Peliyagoda',
        district: 'Gampaha',
        lat: 6.9649,
        lng: 79.8860
      },
      packageDetails: {
        category: 'Fruits',
        quantity: 500,
        unit: 'kg',
        weightKg: 500,
        specialHandling: 'Perishable / Keep Cool'
      },
      assignedDriver: sunil ? {
        driverId: sunil._id,
        name: sunil.name,
        phone: sunil.phone,
        vehicleType: sunil.driverDetails?.vehicleType,
        vehicleNumber: sunil.driverDetails?.vehicleNumber,
        assignedAt: new Date(Date.now() - 4 * 60 * 60 * 1000)
      } : {},
      status: 'In-Transit',
      priority: 'Express',
      estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000),
      routeOptimization: {
        distanceKm: 148,
        estimatedDurationMinutes: 190,
        optimizedRoute: [
          'Dambulla Economic Center Hub',
          'Kurunegala Central Highway Interchange',
          'Mirigama Logistics Expressway Corridor',
          'Peliyagoda Manning Terminal'
        ]
      },
      trackingTimeline: [
        {
          status: 'Pending',
          location: 'Dambulla Agricultural Center',
          timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
          note: 'Harvest graded and packaged into ventilated crates.',
          updatedBy: 'Farmgate Dispatch'
        },
        {
          status: 'Dispatched',
          location: 'Dambulla Freight Hub',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
          note: 'Loaded into refrigerated truck WP-LB-9482. Driver departed.',
          updatedBy: 'Driver Sunil Perera'
        },
        {
          status: 'In-Transit',
          location: 'Kurunegala Highway Gateway',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
          note: 'Passing Kurunegala checkpoint. Climate control stable at 14°C.',
          updatedBy: 'Driver Sunil Perera'
        }
      ],
      proofOfDelivery: {
        method: 'OTP',
        otp: '492815',
        isVerified: false
      }
    },
    {
      trackingNumber: 'TRK-2026-92140',
      orderId: 'REQ-250',
      orderTitle: '1200kg Upcountry Carrots & Leeks',
      sender: {
        name: 'Keppetipola Farmers Guild',
        phone: '+94 77 444 8822',
        pickupAddress: 'Highland Farm Valley, Boralanda Road',
        city: 'Nuwara Eliya',
        district: 'Nuwara Eliya',
        lat: 6.9497,
        lng: 80.7891
      },
      recipient: {
        name: 'Lanka Fresh Supermarkets Logistics',
        phone: '+94 11 234 5678',
        deliveryAddress: 'Central Cold Storage, Orugodawatta',
        city: 'Colombo',
        district: 'Colombo',
        lat: 6.9271,
        lng: 79.8612
      },
      packageDetails: {
        category: 'Vegetables',
        quantity: 1200,
        unit: 'kg',
        weightKg: 1200,
        specialHandling: 'Heavy Load'
      },
      assignedDriver: kamal ? {
        driverId: kamal._id,
        name: kamal.name,
        phone: kamal.phone,
        vehicleType: kamal.driverDetails?.vehicleType,
        vehicleNumber: kamal.driverDetails?.vehicleNumber,
        assignedAt: new Date(Date.now() - 28 * 60 * 60 * 1000)
      } : {},
      status: 'Delivered',
      priority: 'Standard',
      estimatedDelivery: new Date(Date.now() - 12 * 60 * 60 * 1000),
      actualDelivery: new Date(Date.now() - 11 * 60 * 60 * 1000),
      routeOptimization: {
        distanceKm: 165,
        estimatedDurationMinutes: 240,
        optimizedRoute: ['Nuwara Eliya Depot', 'Gampola Transit', 'Kadugannawa Pass', 'Colombo Orugodawatta']
      },
      trackingTimeline: [
        {
          status: 'Pending',
          location: 'Nuwara Eliya Hub',
          timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000),
          note: 'Sorted and weighed at high-altitude depot.',
          updatedBy: 'Station Supervisor'
        },
        {
          status: 'Dispatched',
          location: 'Keppetipola Station',
          timestamp: new Date(Date.now() - 28 * 60 * 60 * 1000),
          note: 'Loaded on Heavy Lorry CP-ND-6031.',
          updatedBy: 'Driver Kamal Bandara'
        },
        {
          status: 'In-Transit',
          location: 'Peradeniya Highway Section',
          timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000),
          note: 'En route without delay.',
          updatedBy: 'Driver Kamal Bandara'
        },
        {
          status: 'Delivered',
          location: 'Orugodawatta Receiving Warehouse',
          timestamp: new Date(Date.now() - 11 * 60 * 60 * 1000),
          note: 'Goods received in perfect condition. Proof OTP 819203 verified.',
          updatedBy: 'Receiving Officer'
        }
      ],
      proofOfDelivery: {
        method: 'OTP',
        otp: '819203',
        isVerified: true,
        verifiedAt: new Date(Date.now() - 11 * 60 * 60 * 1000),
        notes: 'Signed by Warehouse Manager Priyantha.'
      }
    },
    {
      trackingNumber: 'TRK-2026-61029',
      orderId: 'REQ-108',
      orderTitle: '800kg Organic Red Rice',
      sender: {
        name: 'Rajarata Paddy Cooperative',
        phone: '+94 25 222 3344',
        pickupAddress: 'Paddy Silo #2, Industrial Zone',
        city: 'Anuradhapura',
        district: 'Anuradhapura',
        lat: 8.3114,
        lng: 80.4037
      },
      recipient: {
        name: 'Green Leaf Distributors',
        phone: '+94 77 123 7788',
        deliveryAddress: 'Distribution Depot, Wattala',
        city: 'Wattala',
        district: 'Gampaha',
        lat: 6.9895,
        lng: 79.8917
      },
      packageDetails: {
        category: 'Grains',
        quantity: 800,
        unit: 'kg',
        weightKg: 800,
        specialHandling: 'Express Dry'
      },
      status: 'Pending',
      priority: 'Standard',
      estimatedDelivery: new Date(Date.now() + 24 * 60 * 60 * 1000),
      routeOptimization: {
        distanceKm: 195,
        estimatedDurationMinutes: 260,
        optimizedRoute: ['Anuradhapura Agro Zone', 'Kurunegala Junction', 'Ambepussa Corridor', 'Wattala Depot']
      },
      trackingTimeline: [
        {
          status: 'Pending',
          location: 'Anuradhapura Agricultural Storage',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
          note: 'Order finalized and moisture levels certified. Ready for driver dispatch.',
          updatedBy: 'Silo Superintendent'
        }
      ],
      proofOfDelivery: {
        method: 'OTP',
        otp: '739104',
        isVerified: false
      }
    },
    {
      trackingNumber: 'TRK-2026-30419',
      orderId: 'REQ-502',
      orderTitle: '350kg Jaffna Red Onions',
      sender: {
        name: 'Northern Agro Producers Ltd',
        phone: '+94 21 222 9988',
        pickupAddress: 'Tirunelveli Farmers Market',
        city: 'Jaffna',
        district: 'Jaffna',
        lat: 9.6615,
        lng: 80.0255
      },
      recipient: {
        name: 'Colombo Central Canteen Suppliers',
        phone: '+94 71 200 4000',
        deliveryAddress: 'Old Moor Street Bulk Yard',
        city: 'Colombo',
        district: 'Colombo',
        lat: 6.9271,
        lng: 79.8612
      },
      packageDetails: {
        category: 'Vegetables',
        quantity: 350,
        unit: 'kg',
        weightKg: 350,
        specialHandling: 'Perishable / Keep Cool'
      },
      status: 'Dispatched',
      isDelayed: true,
      delayReason: 'Heavy monsoon rains and road repairs on A9 Highway section near Medawachchiya.',
      priority: 'Urgent',
      estimatedDelivery: new Date(Date.now() - 5 * 60 * 60 * 1000),
      routeOptimization: {
        distanceKm: 395,
        estimatedDurationMinutes: 480,
        optimizedRoute: ['Jaffna Market', 'Vavuniya Transit', 'Medawachchiya', 'Dambulla', 'Colombo']
      },
      trackingTimeline: [
        {
          status: 'Pending',
          location: 'Jaffna Agrarian Market Hub',
          timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000),
          note: 'Packed in breathable mesh bags.',
          updatedBy: 'Hub Coordinator'
        },
        {
          status: 'Dispatched',
          location: 'Jaffna Exit Checkpoint',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
          note: 'Carrier vehicle dispatched toward Colombo.',
          updatedBy: 'Logistics Desk'
        },
        {
          status: 'In-Transit',
          location: 'Medawachchiya Bypass',
          timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000),
          note: 'Delayed: Weather conditions and traffic diversion. Driver notified dispatch.',
          updatedBy: 'Control Tower Alert'
        }
      ],
      proofOfDelivery: {
        method: 'OTP',
        otp: '294109',
        isVerified: false
      }
    }
  ];

  for (const item of demoShipments) {
    const existing = await Shipment.findOne({ trackingNumber: item.trackingNumber });
    if (!existing) {
      await Shipment.create(item);
      console.log('Seeded shipment:', item.trackingNumber);
    }
  }

  console.log('Total shipments in DB:', await Shipment.countDocuments());
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
