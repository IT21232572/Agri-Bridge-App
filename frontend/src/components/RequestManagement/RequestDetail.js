import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Row, Col, Modal } from 'react-bootstrap';
import { getRequestById } from '../../services/requestService';
import EditPostModal from './EditPostModal';
import OfferModal from './OfferModal';
import MatchedRequestsModal from './MatchedRequestsModal';
import ReceivedOffersModal from './ReceivedOffersModal';
import SentOffersModal from './SentOffersModal';
import AcceptedDealsModal from './AcceptedDealsModal';
import { useAuth } from '../../context/AuthContext';
import { getUnitByCategory } from '../../utils/unitHelper';

const RequestDetail = ({
  allRequests,
  acceptedDeals,
  onBack,
  onAcceptOffer,
  onDeclineOffer,
  onUpdatePost,
  onDeletePost,
  showToast,
  refreshRequests
}) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [request, setRequest] = useState(null);
  const [loadingReq, setLoadingReq] = useState(true);

  // Active popup state: 'matched' | 'offers' | 'sent' | 'accepted' | null
  const [activePopup, setActivePopup] = useState(null);
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
      console.error('Failed to refresh after update', error);
    }
  };

  const handleLocalDelete = async (reqId) => {
    try {
      await onDeletePost(reqId);
      navigate('/my-requests');
    } catch (error) {
      console.error('Failed to navigate after delete', error);
    }
  };

  const handleLocalAcceptOffer = async (reqId, offer) => {
    try {
      await onAcceptOffer(reqId, offer);
      await fetchSingleRequest();
    } catch (error) {
      console.error('Failed to refresh after accepting offer', error);
    }
  };

  const handleLocalDeclineOffer = async (reqId, offer) => {
    try {
      await onDeclineOffer(reqId, offer);
      await fetchSingleRequest();
    } catch (error) {
      console.error('Failed to refresh after declining offer', error);
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
    const displayLoc = locB.trim();
    if (a === b) return { score: 50, label: `📍 ${displayLoc} (Same District)` };
    if (nearbyDistricts[a]?.includes(b)) return { score: 30, label: `🚗 ${displayLoc} (Nearby District)` };
    return { score: 10, label: `📍 ${displayLoc}` };
  };

  const oppositeType = request.requestType === 'Buyer' ? 'Seller' : 'Buyer';

  const isSameOwner = (postA, postB) => {
    if (postA.userId && postB.userId) return String(postA.userId) === String(postB.userId);
    if (user && postB.userId && String(postB.userId) === String(user.id)) return true;
    return (
      postA.buyerName &&
      postB.buyerName &&
      postA.buyerName.trim().toLowerCase() === postB.buyerName.trim().toLowerCase()
    );
  };

  const hasAvailableQuantity = (candidateReq) => {
    return (Number(candidateReq.quantity) || 0) > 0;
  };

  // 1. Matched Requests (supports full & partial matches, prioritizing full qty coverage)
  const rawMatches = allRequests.filter(
    req =>
      req.id !== request.id &&
      req.requestType === oppositeType &&
      req.title.trim().toLowerCase() === request.title.trim().toLowerCase() &&
      !isSameOwner(request, req) &&
      hasAvailableQuantity(req) &&
      !(req.status.includes('Fulfilled') || Number(req.quantity) <= 0)
  );

  const prices = rawMatches.map(m => Number(m.startingPrice) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;
  const currentReqQty = Number(request.quantity) || 0;

  const matchedRequestsList = rawMatches
    .map(match => {
      const proximity = getProximityInfo(request.location, match.location);
      const price = Number(match.startingPrice) || 0;
      const matchQty = Number(match.quantity) || 0;

      let priceScore = 40;
      if (maxPrice > minPrice) {
        priceScore =
          request.requestType === 'Buyer'
            ? ((maxPrice - price) / (maxPrice - minPrice)) * 40
            : ((price - minPrice) / (maxPrice - minPrice)) * 40;
      }

      // Bonus score (up to 20 pts) based on how much of the requested quantity can be fulfilled
      const qtyRatio = currentReqQty > 0 ? Math.min(matchQty, currentReqQty) / currentReqQty : 1;
      const qtyScore = qtyRatio * 20;

      return {
        ...match,
        totalScore: proximity.score + priceScore + qtyScore,
        proximityLabel: proximity.label
      };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const bestMatch = matchedRequestsList.length > 0 ? matchedRequestsList[0] : null;

  // Helper to resolve the sender's advertisement location first, falling back to offer.senderLocation
  const getOfferLocation = (offer) => {
    if (offer.sourceRequestId) {
      const sourcePost = allRequests.find(r => String(r.id) === String(offer.sourceRequestId));
      if (sourcePost?.location) return sourcePost.location;
    }
    return offer.senderLocation || '';
  };

  // 2. Received Offers
  const getRankedOffers = () => {
    if (!request.offers || request.offers.length === 0) return [];

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
        const isQuantityValid = request.requestType === 'Seller' ? offeredQty <= targetQty : offeredQty > 0;

        const effectiveLocation = getOfferLocation(offer);
        const proximity = effectiveLocation
          ? getProximityInfo(request.location, effectiveLocation)
          : { score: 20, label: '📍 Partner Location' };
        const locationScore = (proximity.score / 50) * 40;

        let priceScore = 40;
        if (maxOfferPrice > minOfferPrice) {
          priceScore =
            request.requestType === 'Seller'
              ? ((price - minOfferPrice) / (maxOfferPrice - minOfferPrice)) * 40
              : ((maxOfferPrice - price) / (maxOfferPrice - minOfferPrice)) * 40;
        }

        const qtyRatio = targetQty > 0 ? Math.min(offeredQty, targetQty) / targetQty : 1;
        const qtyScore = isQuantityValid ? qtyRatio * 20 : -100;

        return {
          ...offer,
          senderLocation: effectiveLocation,
          originalIndex: idx,
          totalScore: locationScore + priceScore + qtyScore,
          isQuantityValid,
          proximityLabel: proximity.label
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  };

  const rankedOffers = getRankedOffers();
  const bestOffer = rankedOffers.length > 0 && rankedOffers[0].isQuantityValid ? rankedOffers[0] : null;

  // 3. Collect all offers sent from this post
  const allSentOffersFromThisPost = [];
  allRequests.forEach(targetPost => {
    (targetPost.offers || []).forEach((offer, idx) => {
      if (offer.sourceRequestId && String(offer.sourceRequestId) === String(request.id)) {
        allSentOffersFromThisPost.push({
          key: `${targetPost.id}-${idx}`,
          status: offer.status || 'Pending',
          offer,
          targetPost
        });
      }
    });
  });

  // Only keep non-accepted offers (Pending / Declined) in Sent Offers
  const sentOffersFromThisPost = allSentOffersFromThisPost.filter(
    item => item.status !== 'Accepted'
  );

  // 4. Accepted Deals (Both Received Offers Accepted by You + Sent Offers Accepted by Partner)
  const receivedAcceptedDeals = (request.offers || [])
    .filter(offer => offer.status === 'Accepted')
    .map((deal, idx) => ({
      key: `received-${deal._id || idx}`,
      direction: 'Received Offer',
      partnerName: deal.sender || 'Registered Partner',
      agreedPrice: deal.offeredPrice,
      quantityOffered: deal.quantityOffered,
      deliveryDate: deal.deliveryDate,
      remarks: deal.remarks,
      receiptParams: {
        receiptId: `RCP-${request.id}-${idx + 1}`,
        requestId: request.id,
        productTitle: request.title,
        category: request.category,
        postType: request.requestType,
        postOwnerName: request.buyerName,
        postOwnerLocation: request.location,
        postOwnerContact: request.contact,
        offerSenderName: deal.sender,
        offerSenderLocation: getOfferLocation(deal) || 'Partner District',
        offerSenderContact: deal.senderContact,
        agreedPrice: deal.offeredPrice,
        quantity: deal.quantityOffered,
        deliveryDate: deal.deliveryDate,
        remarks: deal.remarks
      }
    }));

  const sentAcceptedDeals = allSentOffersFromThisPost
    .filter(item => item.status === 'Accepted')
    .map(item => ({
      key: `sent-${item.key}`,
      direction: 'Sent Offer',
      partnerName: item.targetPost.buyerName || 'Registered Partner',
      agreedPrice: item.offer.offeredPrice,
      quantityOffered: item.offer.quantityOffered,
      deliveryDate: item.offer.deliveryDate,
      remarks: item.offer.remarks,
      receiptParams: {
        receiptId: `RCP-${request.id}-${item.targetPost.id}`,
        requestId: `${request.id} ↔ ${item.targetPost.id}`,
        productTitle: request.title,
        category: request.category,
        postType: item.targetPost.requestType,
        postOwnerName: item.targetPost.buyerName,
        postOwnerLocation: item.targetPost.location,
        postOwnerContact: item.targetPost.contact,
        offerSenderName: item.offer.sender,
        offerSenderLocation: request.location || item.offer.senderLocation,
        offerSenderContact: item.offer.senderContact || request.contact,
        agreedPrice: item.offer.offeredPrice,
        quantity: item.offer.quantityOffered,
        deliveryDate: item.offer.deliveryDate,
        remarks: item.offer.remarks
      }
    }));

  const requestAcceptedDeals = [...receivedAcceptedDeals, ...sentAcceptedDeals];

  const handleOpenMatchModal = (matchReq) => {
    setActivePopup(null);
    setActiveMatchedRequest(matchReq);
    setShowMatchModal(true);
  };

  const copyRequestId = () => {
    navigator.clipboard.writeText(request.id);
    if (showToast) showToast(`Request ID ${request.id} copied to clipboard!`, 'info');
  };

  // 4 Highlighted Action Button Cards config
  const actionCards = [
    {
      key: 'matched',
      icon: '⚡',
      title: 'Matched Requests',
      subtitle: 'Auto-matched ads & best price',
      count: matchedRequestsList.length,
      accentColor: '#136534',
      softBg: '#f2fbf5',
      iconBg: 'rgba(19, 101, 52, 0.14)',
      glowColor: 'rgba(25, 135, 84, 0.25)',
      badgeBg: 'success'
    },
    {
      key: 'offers',
      icon: '📩',
      title: 'Received Offers',
      subtitle: 'Incoming bids ranked by value',
      count: rankedOffers.length,
      accentColor: '#0d6efd',
      softBg: '#f3f8ff',
      iconBg: 'rgba(13, 110, 253, 0.14)',
      glowColor: 'rgba(13, 110, 253, 0.25)',
      badgeBg: 'primary'
    },
    {
      key: 'sent',
      icon: '📤',
      title: 'Sent Offers',
      subtitle: 'Bids sent from this advertisement',
      count: sentOffersFromThisPost.length,
      accentColor: '#087990',
      softBg: '#f0fbfd',
      iconBg: 'rgba(13, 202, 240, 0.18)',
      glowColor: 'rgba(13, 202, 240, 0.3)',
      badgeBg: 'info'
    },
    {
      key: 'accepted',
      icon: '🤝',
      title: 'Accepted Deals',
      subtitle: 'Confirmed deals & order receipts',
      count: requestAcceptedDeals.length,
      accentColor: '#b45309',
      softBg: '#fffbeb',
      iconBg: 'rgba(245, 158, 11, 0.18)',
      glowColor: 'rgba(245, 158, 11, 0.3)',
      badgeBg: 'warning'
    }
  ];

  return (
    <Container fluid className="px-0 pb-4">
      {/* Breadcrumb Navigation & Top Action Buttons */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <span className="text-muted small" style={{ cursor: 'pointer' }} onClick={onBack}>
            🏠 My Requests &amp; Matches
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
            ✏️ Edit Advertisement
          </Button>
          <Button
            variant="outline-danger"
            size="sm"
            className="fw-bold px-3 bg-white shadow-sm"
            style={{ borderRadius: '8px' }}
            onClick={() => setShowDeleteModal(true)}
          >
            🗑️ Delete Advertisement
          </Button>
        </div>
      </div>

      {/* Shaded Green Hero Banner & Stats Card */}
      <Card className="border-0 shadow-sm mb-4 position-relative overflow-hidden rounded-4 bg-white">
        <div
          className="p-4 p-md-5 position-relative overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 75% 48%, rgba(22, 163, 74, 0.34) 0%, rgba(34, 197, 94, 0.16) 42%, transparent 70%), linear-gradient(120deg, #effaf3 0%, #c8eed6 52%, #97dca9 100%)',
            minHeight: '305px'
          }}
        >
          {/* Top-Right Request ID Floating Badge */}
          <div
            className="d-flex justify-content-end mb-3 mb-lg-0"
            style={{
              position: 'relative',
              zIndex: 5
            }}
          >
            <div
              className="bg-white px-3 py-2 rounded-4 d-inline-flex align-items-center gap-3"
              style={{
                boxShadow: '0 8px 24px rgba(15, 61, 36, 0.12)'
              }}
            >
              <div>
                <span className="text-muted d-block fw-semibold" style={{ fontSize: '11px' }}>
                  Request ID
                </span>
                <strong className="text-dark" style={{ fontSize: '14px' }}>
                  {request.id}
                </strong>
              </div>
              <Button
                variant="light"
                size="sm"
                className="p-2 border-0 rounded-3"
                style={{ backgroundColor: '#dcfce7', color: '#15803d' }}
                onClick={copyRequestId}
                title="Copy ID"
              >
                📋
              </Button>
            </div>
          </div>

          <Row className="align-items-center g-4 mt-lg-n4">
            {/* Left Side: Role & Category Pills, Dark Title, Location & Date Pills, Description */}
            <Col lg={6}>
              <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                <Badge
                  bg={request.requestType === 'Buyer' ? 'primary' : 'success'}
                  className="px-3 py-2 rounded-pill fw-semibold shadow-sm"
                  style={{ fontSize: '0.82rem' }}
                >
                  {request.requestType === 'Buyer' ? '🛒 Buyer' : '🚜 Seller'}
                </Badge>
                <span
                  className="bg-white px-3 py-2 rounded-pill fw-semibold text-dark shadow-sm"
                  style={{ fontSize: '0.82rem' }}
                >
                  🏷️ {request.category}
                </span>
              </div>

              <h1
                className="fw-bold mb-3"
                style={{
                  color: '#0f291e',
                  fontSize: 'clamp(2.1rem, 3.6vw, 3rem)',
                  letterSpacing: '-0.8px'
                }}
              >
                {request.title}
              </h1>

              {/* White Pill Chips for Location & Expiry */}
              <div className="d-flex align-items-center gap-2 flex-wrap mb-3">
                <span className="bg-white px-3 py-2 rounded-pill small fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-1">
                  <span>📍</span>
                  <span>{request.location}</span>
                </span>
                <span className="bg-white px-3 py-2 rounded-pill small fw-semibold text-dark shadow-sm d-inline-flex align-items-center gap-1">
                  <span>📅</span>
                  <span>Valid Until: {request.biddingEndTime}</span>
                </span>
              </div>

              <p
                className="fst-italic mb-0 fw-medium"
                style={{ maxWidth: '500px', color: '#1f4d36' }}
              >
                {request.description}
              </p>
            </Col>

            {/* Center-Right Side: Tilted White-Framed Product Card */}
            <Col lg={6} className="d-flex justify-content-center justify-content-lg-start ps-lg-2">
              <div
                className="bg-white p-2"
                style={{
                  width: '100%',
                  maxWidth: '345px',
                  height: '235px',
                  borderRadius: '26px',
                  border: '6px solid #ffffff',
                  transform: 'rotate(2.2deg)',
                  boxShadow: '0 18px 36px rgba(15, 61, 36, 0.18)',
                  position: 'relative',
                  zIndex: 2
                }}
              >
                {request.image ? (
                  <img
                    src={request.image}
                    alt={request.title}
                    className="w-100 h-100"
                    style={{ objectFit: 'cover', borderRadius: '18px' }}
                  />
                ) : (
                  <div
                    className="w-100 h-100 d-flex align-items-center justify-content-center fs-1"
                    style={{ backgroundColor: '#dcfce7', borderRadius: '18px' }}
                  >
                    🌱
                  </div>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Four Statistics Cards Grid */}
        <Card.Body className="bg-white p-4 border-top position-relative" style={{ zIndex: 2 }}>
          <Row className="g-3">
            {/* Highlighted Target Price Card */}
            <Col md={3}>
              <div
                className="p-3 rounded-4 h-100 text-white shadow-sm d-flex flex-column justify-content-center"
                style={{
                  background: 'linear-gradient(135deg, #136534 0%, #198754 100%)'
                }}
              >
                <span className="text-white-50 fw-semibold d-block mb-1" style={{ fontSize: '12px' }}>
                  Target Price
                </span>
                <h4 className="fw-bold mb-0 text-truncate">LKR {request.startingPrice}</h4>
              </div>
            </Col>

            {/* Quantity Available Card */}
            <Col md={3}>
              <div className="bg-light p-3 rounded-4 border border-secondary-subtle shadow-sm h-100 d-flex flex-column justify-content-center">
                <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '12px' }}>
                  Quantity Available
                </span>
                <h4 className="text-dark fw-bold mb-0 text-truncate">
                  📦 {request.quantity || 0} {getUnitByCategory(request.category)}
                </h4>
              </div>
            </Col>

            {/* Current Status Card */}
            <Col md={3}>
              <div className="bg-light p-3 rounded-4 border border-secondary-subtle shadow-sm h-100 d-flex flex-column justify-content-center">
                <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '12px' }}>
                  Current Status
                </span>
                <div>
                  <Badge
                    bg="warning"
                    text="dark"
                    className="px-3 py-2 fs-6 rounded-pill shadow-sm d-inline-block w-100 text-truncate text-start"
                  >
                    ⏳ {request.status}
                  </Badge>
                </div>
              </div>
            </Col>

            {/* Contact Person Card */}
            <Col md={3}>
              <div className="bg-light p-3 rounded-4 border border-secondary-subtle shadow-sm h-100 d-flex justify-content-between align-items-center">
                <div className="text-truncate">
                  <span className="text-muted fw-semibold d-block mb-1" style={{ fontSize: '12px' }}>
                    Contact Person
                  </span>
                  <strong className="text-dark fs-6 text-truncate d-block">
                    {request.buyerName || 'My Profile'}
                  </strong>
                </div>
                <span className="text-secondary fs-4 fw-bold">›</span>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* 4 Highlighted Interactive Action Button Cards */}
      <Row className="g-3 mt-1">
        {actionCards.map(item => (
          <Col md={6} lg={3} key={item.key}>
            <Card
              role="button"
              onClick={() => setActivePopup(item.key)}
              className="rounded-4 h-100"
              style={{
                cursor: 'pointer',
                backgroundColor: item.softBg,
                border: '1px solid rgba(0, 0, 0, 0.08)',
                borderLeft: `6px solid ${item.accentColor}`,
                boxShadow: '0 4px 14px rgba(0, 0, 0, 0.06)',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0, 0, 0, 0.12)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(0, 0, 0, 0.06)';
              }}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center fs-3 shadow-sm"
                    style={{
                      width: '52px',
                      height: '52px',
                      backgroundColor: item.iconBg
                    }}
                  >
                    {item.icon}
                  </div>
                  <Badge
                    bg={item.count > 0 ? item.badgeBg : 'secondary'}
                    text={item.badgeBg === 'warning' || item.badgeBg === 'info' ? 'dark' : 'white'}
                    className="fs-6 px-3 py-2 rounded-pill"
                    style={{
                      boxShadow: item.count > 0 ? `0 0 0 5px ${item.glowColor}` : 'none'
                    }}
                  >
                    {item.count}
                  </Badge>
                </div>

                <div>
                  <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                  <p className="text-secondary small mb-3">{item.subtitle}</p>
                  <div
                    className="fw-bold small px-3 py-2 rounded-3 d-flex align-items-center justify-content-between bg-white border"
                    style={{ color: item.accentColor }}
                  >
                    <span>Click to View Details</span>
                    <span className="fs-6">→</span>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 4 Modular Popup Modals */}
      <MatchedRequestsModal
        show={activePopup === 'matched'}
        onHide={() => setActivePopup(null)}
        request={request}
        matchedRequestsList={matchedRequestsList}
        bestMatch={bestMatch}
        onSelectMatch={handleOpenMatchModal}
      />

      <ReceivedOffersModal
        show={activePopup === 'offers'}
        onHide={() => setActivePopup(null)}
        request={request}
        rankedOffers={rankedOffers}
        bestOffer={bestOffer}
        onAcceptOffer={handleLocalAcceptOffer}
        onDeclineOffer={handleLocalDeclineOffer}
      />

      <SentOffersModal
        show={activePopup === 'sent'}
        onHide={() => setActivePopup(null)}
        request={request}
        sentOffersFromThisPost={sentOffersFromThisPost}
      />

      <AcceptedDealsModal
        show={activePopup === 'accepted'}
        onHide={() => setActivePopup(null)}
        request={request}
        requestAcceptedDeals={requestAcceptedDeals}
      />

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
        sourceRequest={request}
        refreshRequests={() => {
          refreshRequests();
          fetchSingleRequest();
        }}
        showToast={showToast}
      />

      {/* Custom Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>⚠️ Confirm Deletion</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-secondary mb-0">
            Are you sure you want to delete this advertisement (<strong>{request.id}</strong>)? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button
            variant="danger"
            className="fw-bold"
            onClick={() => {
              setShowDeleteModal(false);
              handleLocalDelete(request.id);
            }}
          >
            Yes, Delete Advertisement 🗑️
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestDetail;