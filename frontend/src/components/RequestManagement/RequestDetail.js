import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Tabs, Tab, ListGroup, Row, Col, Table, Modal } from 'react-bootstrap';
import { getRequestById } from '../../services/requestService';
import EditPostModal from './EditPostModal';
import OfferModal from './OfferModal';
import { useAuth } from '../../context/AuthContext';
import { downloadDealReceipt } from '../../utils/receiptGenerator';

const RequestDetail = ({ allRequests, acceptedDeals, onBack, onAcceptOffer, onDeclineOffer, onUpdatePost, onDeletePost, showToast, refreshRequests }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [request, setRequest] = useState(null);
  const [loadingReq, setLoadingReq] = useState(true);

  const [key, setKey] = useState('matched');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [activeMatchedRequest, setActiveMatchedRequest] = useState(null);

  const fetchSingleRequest = useCallback(async () => {
    try {
      setLoadingReq(true);
      const data = await getRequestById(id);
      setRequest(data);
      setLoadingReq(false);
    } catch (error) {
      console.error('Error loading request details:', error);
      if (showToast) showToast('Failed to load request details', 'danger');
      setLoadingReq(false);
    }
  }, [id, showToast]);

  useEffect(() => {
    if (id) {
      fetchSingleRequest();
    }
  }, [id, fetchSingleRequest]);

  const handleLocalUpdate = async (reqId, updatedData) => {
    try {
      await onUpdatePost(reqId, updatedData);
      await fetchSingleRequest();
      setShowEditModal(false);
    } catch (error) {
      console.error("Failed to refresh after update", error);
    }
  };

  const handleLocalDelete = async (reqId) => {
    try {
      await onDeletePost(reqId);
      navigate('/my-requests'); 
    } catch (error) {
      console.error("Failed to navigate after delete", error);
    }
  };

  const handleLocalAcceptOffer = async (reqId, offer) => {
    try {
      await onAcceptOffer(reqId, offer);
      await fetchSingleRequest();
    } catch (error) {
      console.error("Failed to refresh after accepting offer", error);
    }
  };

  const handleLocalDeclineOffer = async (reqId, offer) => {
    try {
      await onDeclineOffer(reqId, offer);
      await fetchSingleRequest();
    } catch (error) {
      console.error("Failed to refresh after declining offer", error);
    }
  };

  if (loadingReq) {
    return <div className="text-center py-5">Loading request details from server...</div>;
  }

  if (!request) {
    return <div className="text-center py-5 text-muted">Request not found.</div>;
  }

  // Sri Lankan neighboring district map for "Nearest Post" scoring
  const nearbyDistricts = {
    colombo: ['gampaha', 'kalutara'],
    gampaha: ['colombo', 'kurunegala', 'kegalle', 'kalutara'],
    kalutara: ['colombo', 'galle', 'ratnapura'],
    kandy: ['matale', 'nuwara eliya', 'kegalle', 'kurunegala', 'badulla'],
    matale: ['kandy', 'anuradhapura', 'polonnaruwa', 'kurunegala'],
    'nuwara eliya': ['kandy', 'badulla', 'ratnapura', 'kegalle'],
    galle: ['kalutara', 'matara', 'ratnapura'],
    matara: ['galle', 'hambantota', 'ratnapura'],
    hambantota: ['matara', 'ratnapura', 'monaragala'],
    kurunegala: ['gampaha', 'puttalam', 'anuradhapura', 'matale', 'kandy', 'kegalle'],
    puttalam: ['kurunegala', 'anuradhapura', 'gampaha'],
    anuradhapura: ['puttalam', 'kurunegala', 'matale', 'polonnaruwa', 'trincomalee', 'vavuniya'],
    polonnaruwa: ['anuradhapura', 'matale', 'batticaloa', 'trincomalee', 'ampara'],
    badulla: ['nuwara eliya', 'kandy', 'monaragala', 'ratnapura', 'ampara'],
    monaragala: ['badulla', 'ampara', 'hambantota', 'ratnapura'],
    ratnapura: ['kalutara', 'galle', 'matara', 'hambantota', 'monaragala', 'badulla', 'nuwara eliya', 'kegalle'],
    kegalle: ['gampaha', 'kurunegala', 'kandy', 'nuwara eliya', 'ratnapura'],
    jaffna: ['kilinochchi'],
    kilinochchi: ['jaffna', 'mullaitivu', 'mannar'],
    mannar: ['kilinochchi', 'vavuniya', 'anuradhapura'],
    vavuniya: ['mannar', 'kilinochchi', 'mullaitivu', 'anuradhapura', 'trincomalee'],
    mullaitivu: ['kilinochchi', 'vavuniya', 'trincomalee'],
    trincomalee: ['mullaitivu', 'vavuniya', 'anuradhapura', 'polonnaruwa', 'batticaloa'],
    batticaloa: ['trincomalee', 'polonnaruwa', 'ampara'],
    ampara: ['batticaloa', 'polonnaruwa', 'badulla', 'monaragala']
  };

  const getProximityInfo = (locA = '', locB = '') => {
    const a = locA.trim().toLowerCase();
    const b = locB.trim().toLowerCase();
    if (a === b) return { score: 50, label: '📍 Same District (Nearest)' };
    if (nearbyDistricts[a]?.includes(b)) return { score: 30, label: '🚗 Nearby District' };
    return { score: 10, label: `📍 ${locB}` };
  };

  const oppositeType = request.requestType === 'Buyer' ? 'Seller' : 'Buyer';

  // Helper to check if a post belongs to the same owner
  const isSameOwner = (postA, postB) => {
    if (postA.userId && postB.userId) {
      return String(postA.userId) === String(postB.userId);
    }
    if (user && postB.userId && String(postB.userId) === String(user.id)) {
      return true;
    }
    return (
      postA.buyerName &&
      postB.buyerName &&
      postA.buyerName.trim().toLowerCase() === postB.buyerName.trim().toLowerCase()
    );
  };

  // Helper to check if Seller has enough stock to fulfill Buyer's request
  const hasEnoughQuantity = (currentReq, candidateReq) => {
    const currentQty = Number(currentReq.quantity) || 0;
    const candidateQty = Number(candidateReq.quantity) || 0;

    if (currentReq.requestType === 'Seller') {
      return candidateQty <= currentQty;
    }
    return candidateQty >= currentQty;
  };

  // 1. Filter by same product, opposite type, different owner, valid quantity, and active stock
  const rawMatches = allRequests.filter(req =>
    req.id !== request.id &&
    req.requestType === oppositeType &&
    req.title.trim().toLowerCase() === request.title.trim().toLowerCase() &&
    !isSameOwner(request, req) &&
    hasEnoughQuantity(request, req) &&
    !(req.status.includes('Fulfilled') || req.quantity <= 0)
  );

  // 2. Score each match by Nearest Location + Best Price
  const prices = rawMatches.map(m => Number(m.startingPrice) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const matchedRequestsList = rawMatches
    .map(match => {
      const proximity = getProximityInfo(request.location, match.location);
      const price = Number(match.startingPrice) || 0;

      let priceScore = 50;
      if (maxPrice > minPrice) {
        priceScore = request.requestType === 'Buyer'
          ? ((maxPrice - price) / (maxPrice - minPrice)) * 50
          : ((price - minPrice) / (maxPrice - minPrice)) * 50;
      }

      const totalScore = proximity.score + priceScore;
      return { ...match, totalScore, proximityLabel: proximity.label };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const bestMatch = matchedRequestsList.length > 0 ? matchedRequestsList[0] : null;

  const requestAcceptedDeals = acceptedDeals.filter(deal => deal.requestId === request.id);

  // Rank Received Offers using Nearest Location, Best Price, Valid Quantity & Delivery Date
  const getRankedOffers = () => {
    if (!request.offers || request.offers.length === 0) return [];

    // Filter out self-offers if any exist
    const validOffers = request.offers.filter(offer => {
      if ((offer.status || 'Pending') !== 'Pending') return false;
      if (offer.senderId && request.userId && String(offer.senderId) === String(request.userId)) return false;
      if (offer.sender && request.buyerName && offer.sender.trim().toLowerCase() === request.buyerName.trim().toLowerCase()) return false;
      return true;
    });

    const offerPrices = validOffers.map(o => Number(o.offeredPrice) || 0);
    const minOfferPrice = offerPrices.length ? Math.min(...offerPrices) : 0;
    const maxOfferPrice = offerPrices.length ? Math.max(...offerPrices) : 0;
    const targetQty = Number(request.quantity) || 0;

    return validOffers
      .map((offer, idx) => {
        const price = Number(offer.offeredPrice) || 0;
        const offeredQty = Number(offer.quantityOffered) || 0;

        // Check if quantity is feasible (if Seller, buyer cannot ask for more than available stock)
        const isQuantityValid = request.requestType === 'Seller'
          ? offeredQty <= targetQty
          : offeredQty > 0;

        // 1. Proximity Score (40 pts max)
        const proximity = offer.senderLocation
          ? getProximityInfo(request.location, offer.senderLocation)
          : { score: 20, label: '📍 Partner Location' };
        const locationScore = (proximity.score / 50) * 40;

        // 2. Best Price Score (40 pts max)
        let priceScore = 40;
        if (maxOfferPrice > minOfferPrice) {
          priceScore = request.requestType === 'Seller'
            ? ((price - minOfferPrice) / (maxOfferPrice - minOfferPrice)) * 40 // Seller wants highest price
            : ((maxOfferPrice - price) / (maxOfferPrice - minOfferPrice)) * 40; // Buyer wants lowest price
        }

        // 3. Quantity & Delivery Score (20 pts max)
        const qtyRatio = targetQty > 0 ? Math.min(offeredQty, targetQty) / targetQty : 1;
        const qtyScore = isQuantityValid ? qtyRatio * 20 : -100; // Penalize impossible quantities

        const totalScore = locationScore + priceScore + qtyScore;

        return {
          ...offer,
          originalIndex: idx,
          totalScore,
          isQuantityValid,
          proximityLabel: proximity.label
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const rankedOffers = getRankedOffers();
  const bestOffer = rankedOffers.length > 0 && rankedOffers[0].isQuantityValid ? rankedOffers[0] : null;

  const handleOpenMatchModal = (matchReq) => {
    setActiveMatchedRequest(matchReq);
    setShowMatchModal(true);
  };

  const copyRequestId = () => {
    navigator.clipboard.writeText(request.id);
    if (showToast) showToast(`Request ID ${request.id} copied to clipboard!`, 'info');
  };

  return (
    <Container fluid className="px-0">
      {/* Breadcrumb Navigation & Top Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-muted small" style={{ cursor: 'pointer' }} onClick={onBack}>
            🏠 My Requests & Matches
          </span>
          <span className="text-muted small mx-2">›</span>
          <span className="fw-bold text-dark small">Request Details</span>
        </div>
        <div className="d-flex gap-2">
          <Button 
            variant="outline-success" 
            size="sm" 
            className="fw-bold px-3 bg-white shadow-sm" 
            style={{ borderRadius: '8px' }}
            onClick={() => setShowEditModal(true)}
          >
            ✏️ Edit Post
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="fw-bold px-3 bg-white shadow-sm" 
            style={{ borderRadius: '8px' }}
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete Post
          </Button>
        </div>
      </div>

      {/* Scenic Background Hero Banner Card */}
      <Card className="border-0 shadow-sm mb-4 position-relative overflow-hidden rounded-4 bg-white">
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'url("/farm-banner.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(8px)',
            transform: 'scale(1.05)',
            zIndex: 0,
            top: 0,
            left: 0
          }}
        />
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(90deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.85) 45%, rgba(255,255,255,0.1) 100%)',
            zIndex: 1,
            top: 0,
            left: 0
          }}
        />
        <div className="p-5 position-relative d-flex flex-column justify-content-center" style={{ minHeight: '340px', zIndex: 2 }}>
          <Row className="align-items-center g-4 w-100 m-0">
            <Col md={5} className="px-0">
              <div className="d-flex align-items-center gap-3 mb-3">
                <Badge bg={request.requestType === 'Buyer' ? 'primary' : 'success'} className="px-4 py-2 rounded-pill fs-6 shadow-sm">
                  {request.requestType}
                </Badge>
                <Badge bg="light" className="px-4 py-2 rounded-pill text-dark shadow-sm border fs-6">
                  🏷️ {request.category}
                </Badge>
              </div>
              <h1 className="fw-bold display-4 mb-3 text-dark" style={{ letterSpacing: '-1px' }}>{request.title}</h1>
              <div className="d-flex align-items-center gap-3 text-muted fw-bold mb-3 fs-6">
                <span>📍 {request.location}</span>
                <span>•</span>
                <span>📅 Valid Until: {request.biddingEndTime}</span>
              </div>
              <p className="text-secondary mb-0 fs-6">{request.description}</p>
            </Col>
            <Col md={4} className="text-center">
              {request.image ? (
                <div className="position-relative d-inline-block">
                  <img 
                    src={request.image} 
                    alt={request.title} 
                    className="rounded-4 shadow-lg border border-3 border-white bg-white" 
                    style={{ width: '320px', height: '200px', objectFit: 'cover' }} 
                  />
                </div>
              ) : (
                <div className="bg-light rounded-4 shadow-sm border d-inline-flex align-items-center justify-content-center text-muted fs-6" style={{ width: '320px', height: '200px' }}>
                  📷 No Image Available
                </div>
              )}
            </Col>
            <Col md={3} className="text-end align-self-start pt-2 pr-0">
              <div className="bg-white px-4 py-2 rounded-4 shadow-sm border d-inline-flex align-items-center gap-3 text-start">
                <div>
                  <span className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>Request ID</span>
                  <strong className="text-dark fs-6">{request.id}</strong>
                </div>
                <Button variant="light" size="sm" className="p-2 border-0 bg-light rounded-3 shadow-sm" onClick={copyRequestId} title="Copy ID">
                  📋
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Four Statistics Cards Grid */}
        <Card.Body className="bg-white p-4 border-top position-relative" style={{ zIndex: 2 }}>
          <Row className="g-3">
            <Col md={2}>
              <div className="bg-light p-3 rounded-4 border-0 h-100">
                <span className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Target Price</span>
                <h5 className="text-success fw-bold mb-0 text-truncate">LKR {request.startingPrice}</h5>
              </div>
            </Col>
            <Col md={3}>
              <div className="bg-light p-3 rounded-4 border-0 h-100">
                <span className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Quantity Available</span>
                <h5 className="text-dark fw-bold mb-0 text-truncate">📦 {request.quantity || 0} Kg</h5>
              </div>
            </Col>
            <Col md={4}>
              <div className="bg-light p-3 rounded-4 border-0 h-100">
                <span className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Current Status</span>
                <div className="overflow-hidden">
                  <Badge bg="warning" text="dark" className="px-3 py-2 fs-6 rounded-pill text-wrap text-start d-inline-block w-100 text-truncate">
                    ⏳ {request.status}
                  </Badge>
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="bg-light p-3 rounded-4 border-0 h-100 d-flex justify-content-between align-items-center">
                <div className="text-truncate">
                  <span className="text-muted small d-block mb-1" style={{ fontSize: '11px' }}>Contact Person</span>
                  <strong className="text-dark text-truncate d-block">{request.buyerName || 'My Profile'}</strong>
                </div>
                <span className="text-muted fs-4">›</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs & Content Section */}
      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-4">
          <Tabs id="request-details-tabs" activeKey={key} onSelect={(k) => setKey(k)} className="mb-4 border-bottom pb-2">
            <Tab eventKey="matched" title={`⚡ Matched Requests (${matchedRequestsList.length})`}>
              <div className="py-2">
                {matchedRequestsList.length > 0 ? (
                  <>
                    {/* Highlighted Top Best Match Banner */}
                    {bestMatch && (
                      <Card 
                        className="border-success border-2 shadow-sm mb-4 rounded-4" 
                        style={{ backgroundColor: '#f2fbf5', cursor: 'pointer' }}
                        onClick={() => handleOpenMatchModal(bestMatch)}
                      >
                        <Card.Body className="p-4">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                            <div className="d-flex align-items-center gap-2">
                              <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 shadow-sm">
                                ⭐ Best Match (Nearest & Best Price)
                              </Badge>
                              <Badge bg={bestMatch.requestType === 'Buyer' ? 'primary' : 'dark'} className="px-3 py-2 rounded-pill">
                                {bestMatch.requestType}
                              </Badge>
                              <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">
                                {bestMatch.proximityLabel}
                              </Badge>
                            </div>
                            <small className="text-muted fw-semibold">ID: {bestMatch.id}</small>
                          </div>

                          <Row className="align-items-center mt-3 g-3">
                            <Col md={7}>
                              <h4 className="fw-bold text-dark mb-1">{bestMatch.title}</h4>
                              <p className="text-secondary small mb-2">{bestMatch.description}</p>
                              <div className="d-flex flex-wrap gap-3 small fw-semibold text-muted">
                                <span>📍 {bestMatch.location}</span>
                                <span>
                                  📦 {bestMatch.requestType === 'Buyer' ? 'Needs' : 'Available'}: {bestMatch.quantity || 0} Kg
                                </span>
                                <span>👤 {bestMatch.buyerName || 'Farmer'}</span>
                              </div>
                            </Col>
                            <Col md={5} className="text-md-end">
                              <span className="text-muted small d-block">
                                {bestMatch.requestType === 'Seller' ? 'Best Asking Price' : 'Best Target Price'}
                              </span>
                              <h3 className="fw-bold text-success mb-2">LKR {bestMatch.startingPrice}</h3>
                              <Button variant="success" size="sm" className="fw-bold px-4 py-2 rounded-3">
                                Respond to Best Match →
                              </Button>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {/* All Matched Posts Grid */}
                    <h6 className="fw-bold text-secondary mb-3">All Matching Posts ({matchedRequestsList.length})</h6>
                    <Row className="g-3">
                      {matchedRequestsList.map((match, idx) => {
                        const isTopMatch = idx === 0;
                        return (
                          <Col md={6} key={match.id}>
                            <Card 
                              className={`shadow-sm h-100 rounded-3 ${isTopMatch ? 'border-success border-2' : 'border'}`} 
                              style={{ cursor: 'pointer', transition: 'all 0.2s' }} 
                              onClick={() => handleOpenMatchModal(match)}
                            >
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <div className="d-flex gap-2">
                                    <Badge bg={match.requestType === 'Buyer' ? 'primary' : 'success'}>{match.requestType}</Badge>
                                    {isTopMatch && <Badge bg="success">⭐ Best Match</Badge>}
                                  </div>
                                  <small className="text-muted">ID: {match.id}</small>
                                </div>
                                <h5 className="fw-bold">{match.title}</h5>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <small className="text-muted">{match.proximityLabel}</small>
                                  <Badge bg="warning" text="dark">📦 {match.quantity || 0} Kg</Badge>
                                </div>
                                <div className="d-flex justify-content-between align-items-center">
                                  <strong className="text-success">LKR {match.startingPrice}</strong>
                                  <Badge bg="light" text="success" className="border border-success">
                                    {isTopMatch ? 'Top Ranked ✅' : 'Matched'}
                                  </Badge>
                                </div>
                              </Card.Body>
                            </Card>
                          </Col>
                        );
                      })}
                    </Row>
                  </>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 text-success fs-1">📦</div>
                    <h5 className="fw-bold text-dark">No automatic matches found yet</h5>
                    <p className="text-muted small mb-4">Compatible posts for {request.title} from the opposite marketplace will appear here.</p>
                    <Button variant="success" className="fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#136534', border: 'none', borderRadius: '8px' }} onClick={() => window.location.href = '/hub'}>
                      🔍 Explore Matching Requests
                    </Button>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="offers" title={`📩 Received Offers (${rankedOffers.length})`}>
              <div className="py-2">
                {rankedOffers.length > 0 ? (
                  <>
                    {/* Highlighted Best Offer Banner */}
                    {bestOffer && (
                      <Card className="border-success border-2 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f2fbf5' }}>
                        <Card.Body className="p-4">
                          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                            <div className="d-flex flex-wrap align-items-center gap-2">
                              <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 shadow-sm">
                                ⭐ Best Offer (Nearest, Best Price & Valid Qty)
                              </Badge>
                              <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">
                                {bestOffer.proximityLabel}
                              </Badge>
                              <Badge bg="info" className="px-3 py-2 rounded-pill text-dark">
                                📅 Delivery: {bestOffer.deliveryDate}
                              </Badge>
                            </div>
                          </div>

                          <Row className="align-items-center g-3">
                            <Col md={7}>
                              <h5 className="fw-bold text-dark mb-1">From: {bestOffer.sender || 'Registered Partner'}</h5>
                              <p className="text-muted fst-italic small mb-2">
                                "{bestOffer.remarks || 'No remarks added'}"
                              </p>
                              <div className="d-flex flex-wrap gap-3 small fw-semibold text-secondary">
                                <span>📦 Offered Quantity: {bestOffer.quantityOffered} Kg</span>
                                <span>📅 Expected Delivery: {bestOffer.deliveryDate}</span>
                              </div>
                            </Col>
                            <Col md={5} className="text-md-end">
                              <span className="text-muted small d-block">Best Offered Price</span>
                              <h3 className="fw-bold text-success mb-3">LKR {bestOffer.offeredPrice}</h3>
                              <div className="d-flex justify-content-md-end gap-2">
                                <Button 
                                  variant="success" 
                                  size="sm" 
                                  className="fw-bold px-4 py-2 rounded-3 shadow-sm" 
                                  onClick={() => handleLocalAcceptOffer(request.id, bestOffer)}
                                >
                                  Accept Best Offer ✅
                                </Button>
                                <Button 
                                  variant="outline-danger" 
                                  size="sm" 
                                  className="fw-bold px-3 py-2 rounded-3 bg-white" 
                                  onClick={() => window.confirm("Are you sure?") && handleLocalDeclineOffer(request.id, bestOffer)}
                                >
                                  Decline ❌
                                </Button>
                              </div>
                            </Col>
                          </Row>
                        </Card.Body>
                      </Card>
                    )}

                    {/* All Received Offers List */}
                    <h6 className="fw-bold text-secondary mb-3">All Received Offers ({rankedOffers.length})</h6>
                    <ListGroup className="gap-2">
                      {rankedOffers.map((offer, index) => {
                        const isTopOffer = bestOffer && index === 0;
                        return (
                          <ListGroup.Item 
                            key={index} 
                            className={`p-3 border rounded-4 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3 ${isTopOffer ? 'border-success border-2 bg-light' : ''}`}
                          >
                            <div>
                              <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                                <strong className="text-success fs-5">LKR {offer.offeredPrice}</strong>
                                <Badge bg="warning" text="dark" className="px-2 py-1">📦 {offer.quantityOffered} kg</Badge>
                                <Badge bg="info" className="px-2 py-1 text-dark">Delivery: {offer.deliveryDate}</Badge>
                                <Badge bg="light" text="dark" className="border px-2 py-1">{offer.proximityLabel}</Badge>
                                {isTopOffer && <Badge bg="success" className="px-3 py-1 rounded-pill">⭐ Best Offer</Badge>}
                                {!offer.isQuantityValid && (
                                  <Badge bg="danger" className="px-2 py-1 rounded-pill">⚠️ Exceeds Stock</Badge>
                                )}
                              </div>
                              <div className="small text-dark mt-2"><strong>From:</strong> {offer.sender || 'Registered Partner'}</div>
                              <div className="small text-muted fst-italic">"{offer.remarks || 'No remarks added'}"</div>
                            </div>
                            <div className="d-flex gap-2">
                              <Button variant="success" size="sm" className="fw-bold px-4 py-2 rounded-3 shadow-sm" onClick={() => handleLocalAcceptOffer(request.id, offer)}>Accept ✅</Button>
                              <Button variant="outline-danger" size="sm" className="fw-bold px-4 py-2 rounded-3 shadow-sm bg-white" onClick={() => window.confirm("Are you sure?") && handleLocalDeclineOffer(request.id, offer)}>Decline ❌</Button>
                            </div>
                          </ListGroup.Item>
                        );
                      })}
                    </ListGroup>
                  </>
                ) : (
                  <div className="text-center py-5 text-muted">No direct offers received yet.</div>
                )}
              </div>
            </Tab>

            <Tab eventKey="accepted" title={`🤝 Accepted Deals (${requestAcceptedDeals.length})`}>
              <div className="py-2">
                {requestAcceptedDeals.length > 0 ? (
                  <div className="table-responsive mt-2">
                    <Table hover className="align-middle mb-0 text-nowrap border rounded-3">
                      <thead className="table-light">
                        <tr>
                          <th>Partner / Supplier</th>
                          <th>Agreed Price (LKR)</th>
                          <th>Quantity</th>
                          <th>Delivery Date</th>
                          <th>Remarks</th>
                          <th>Status</th>
                          <th>Receipt</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestAcceptedDeals.map((deal, idx) => (
                          <tr key={idx}>
                            <td className="fw-bold">{deal.sender || 'Registered Partner'}</td>
                            <td className="fw-bold text-success">LKR {deal.offeredPrice}</td>
                            <td><Badge bg="warning" text="dark" className="px-2 py-1">📦 {deal.quantityOffered} kg</Badge></td>
                            <td>{deal.deliveryDate}</td>
                            <td className="text-muted small">"{deal.remarks || 'No remarks'}"</td>
                            <td><Badge bg="success" className="px-3 py-1 rounded-pill">Confirmed & Processing 🚚</Badge></td>
                            <td>
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="fw-bold rounded-pill px-3"
                                onClick={() =>
                                  downloadDealReceipt({
                                    receiptId: `RCP-${request.id}-${idx + 1}`,
                                    requestId: request.id,
                                    productTitle: request.title,
                                    category: request.category,
                                    postType: request.requestType,
                                    postOwnerName: request.buyerName,
                                    postOwnerLocation: request.location,
                                    offerSenderName: deal.sender,
                                    offerSenderLocation: 'Partner District',
                                    agreedPrice: deal.offeredPrice,
                                    quantity: deal.quantityOffered,
                                    deliveryDate: deal.deliveryDate,
                                    remarks: deal.remarks
                                  })
                                }
                              >
                                📄 Download Receipt
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-5 text-muted">No accepted deals yet.</div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Extracted Edit Post Modal */}
      <EditPostModal
        show={showEditModal}
        onHide={() => setShowEditModal(false)}
        request={request}
        onUpdatePost={handleLocalUpdate}
        showToast={showToast}
      />

      {/* Extracted Offer Modal for Matched Requests */}
      <OfferModal
        show={showMatchModal}
        onHide={() => setShowMatchModal(false)}
        targetRequest={activeMatchedRequest}
        refreshRequests={refreshRequests}
        showToast={showToast}
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>⚠️ Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-secondary mb-0">
            Are you sure you want to delete this post (<strong>{request.id}</strong>)? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="danger" className="fw-bold" onClick={() => { setShowDeleteModal(false); handleLocalDelete(request.id); }}>
            Yes, Delete Post 🗑️
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestDetail;