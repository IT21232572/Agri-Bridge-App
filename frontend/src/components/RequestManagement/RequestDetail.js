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
    if (a === b) return { score: 50, label: '📍 Same District (Nearest)' };
    if (nearbyDistricts[a]?.includes(b)) return { score: 30, label: '🚗 Nearby District' };
    return { score: 10, label: `📍 ${locB}` };
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

  const hasEnoughQuantity = (currentReq, candidateReq) => {
    const currentQty = Number(currentReq.quantity) || 0;
    const candidateQty = Number(candidateReq.quantity) || 0;
    return currentReq.requestType === 'Seller' ? candidateQty <= currentQty : candidateQty >= currentQty;
  };

  // 1. Matched Requests
  const rawMatches = allRequests.filter(
    req =>
      req.id !== request.id &&
      req.requestType === oppositeType &&
      req.title.trim().toLowerCase() === request.title.trim().toLowerCase() &&
      !isSameOwner(request, req) &&
      hasEnoughQuantity(request, req) &&
      !(req.status.includes('Fulfilled') || req.quantity <= 0)
  );

  const prices = rawMatches.map(m => Number(m.startingPrice) || 0);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const matchedRequestsList = rawMatches
    .map(match => {
      const proximity = getProximityInfo(request.location, match.location);
      const price = Number(match.startingPrice) || 0;
      let priceScore = 50;
      if (maxPrice > minPrice) {
        priceScore =
          request.requestType === 'Buyer'
            ? ((maxPrice - price) / (maxPrice - minPrice)) * 50
            : ((price - minPrice) / (maxPrice - minPrice)) * 50;
      }
      return { ...match, totalScore: proximity.score + priceScore, proximityLabel: proximity.label };
    })
    .sort((a, b) => b.totalScore - a.totalScore);

  const bestMatch = matchedRequestsList.length > 0 ? matchedRequestsList[0] : null;

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

        const proximity = offer.senderLocation
          ? getProximityInfo(request.location, offer.senderLocation)
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
        offerSenderLocation: deal.senderLocation || 'Partner District',
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
        offerSenderLocation: item.offer.senderLocation || request.location,
        offerSenderContact: item.offer.senderContact || request.contact,
        agreedPrice: item.offer.offeredPrice,
        quantity: item.offer.quantityOffered,
        deliveryDate: item.offer.deliveryDate,
        remarks: item.offer.remarks
      }
    }));

  const requestAcceptedDeals = [...receivedAcceptedDeals, ...sentAcceptedDeals];

  const handleOpenMatchModal = (matchReq) => {
    setActivePopup(null); // Close MatchedRequestsModal before opening OfferModal
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
      subtitle: 'Auto-matched posts & best price',
      count: matchedRequestsList.length,
      accentColor: '#198754',
      badgeBg: 'success'
    },
    {
      key: 'offers',
      icon: '📩',
      title: 'Received Offers',
      subtitle: 'Incoming bids ranked by value',
      count: rankedOffers.length,
      accentColor: '#0d6efd',
      badgeBg: 'primary'
    },
    {
      key: 'sent',
      icon: '📤',
      title: 'Sent Offers',
      subtitle: 'Bids sent from this post',
      count: sentOffersFromThisPost.length,
      accentColor: '#0dcaf0',
      badgeBg: 'info'
    },
    {
      key: 'accepted',
      icon: '🤝',
      title: 'Accepted Deals',
      subtitle: 'Confirmed deals & receipts',
      count: requestAcceptedDeals.length,
      accentColor: '#ffc107',
      badgeBg: 'warning'
    }
  ];

  return (
    <Container fluid className="px-0 pb-4">
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
        <div className="p-5 position-relative d-flex flex-column justify-content-center" style={{ minHeight: '300px', zIndex: 2 }}>
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
                <div
                  className="bg-light rounded-4 shadow-sm border d-inline-flex align-items-center justify-content-center text-muted fs-6"
                  style={{ width: '320px', height: '200px' }}
                >
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

      {/* 4 Highlighted Interactive Action Button Cards */}
      <Row className="g-3">
        {actionCards.map(item => (
          <Col md={6} lg={3} key={item.key}>
            <Card
              role="button"
              onClick={() => setActivePopup(item.key)}
              className="border-0 shadow-sm rounded-4 h-100 bg-white"
              style={{
                cursor: 'pointer',
                borderTop: `4px solid ${item.accentColor}`,
                transition: 'transform 0.18s ease, box-shadow 0.18s ease'
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 0.75rem 1.5rem rgba(0, 0, 0, 0.1)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <Card.Body className="p-4 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center fs-3 bg-light"
                    style={{ width: '50px', height: '50px' }}
                  >
                    {item.icon}
                  </div>
                  <Badge
                    bg={item.count > 0 ? item.badgeBg : 'secondary'}
                    text={item.badgeBg === 'warning' || item.badgeBg === 'info' ? 'dark' : 'white'}
                    className="fs-6 px-3 py-2 rounded-pill shadow-sm"
                  >
                    {item.count}
                  </Badge>
                </div>

                <div>
                  <h5 className="fw-bold text-dark mb-1">{item.title}</h5>
                  <p className="text-muted small mb-3">{item.subtitle}</p>
                  <div className="fw-bold small d-flex align-items-center justify-content-between" style={{ color: item.accentColor }}>
                    <span>Click to View Details</span>
                    <span>→</span>
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