import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Card, Badge, Button, Tabs, Tab, ListGroup, Row, Col, Table, Modal } from 'react-bootstrap';
import { getRequestById } from '../../services/requestService';
import EditPostModal from './EditPostModal';
import OfferModal from './OfferModal';

const RequestDetail = ({ allRequests, acceptedDeals, onBack, onAcceptOffer, onDeclineOffer, onUpdatePost, onDeletePost, showToast, refreshRequests }) => {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [request, setRequest] = useState(null);
  const [loadingReq, setLoadingReq] = useState(true);

  const [key, setKey] = useState('matched');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [showMatchModal, setShowMatchModal] = useState(false);
  const [activeMatchedRequest, setActiveMatchedRequest] = useState(null);

  useEffect(() => {
    const fetchSingleRequest = async () => {
      try {
        setLoadingReq(true);
        const data = await getRequestById(id);
        setRequest(data);
        setLoadingReq(false);
      } catch (error) {
        console.error('Error loading request details:', error);
        showToast('Failed to load request details', 'danger');
        setLoadingReq(false);
      }
    };

    if (id) {
      fetchSingleRequest();
    }
  }, [id]);

  if (loadingReq) {
    return <div className="text-center py-5">Loading request details from server...</div>;
  }

  if (!request) {
    return <div className="text-center py-5 text-muted">Request not found.</div>;
  }

  const oppositeType = request.requestType === 'Buyer' ? 'Seller' : 'Buyer';
  const matchedRequestsList = allRequests.filter(req => 
    req.id !== request.id &&
    req.requestType === oppositeType &&
    req.category.toLowerCase() === request.category.toLowerCase() &&
    req.location.toLowerCase() === request.location.toLowerCase()
  );

  const requestAcceptedDeals = acceptedDeals.filter(deal => deal.requestId === request.id);

  const getBestOfferId = () => {
    if (!request.offers || request.offers.length === 0) return null;
    let bestId = null;
    let highestScore = -1;

    request.offers.forEach((offer, index) => {
      let score = 0;
      const price = parseFloat(offer.offeredPrice);

      if (request.requestType === 'Seller') {
        score += (price * 0.4); 
      } else {
        score += ((1000 / price) * 40); 
      }

      const targetQty = parseFloat(request.quantity || 100);
      const offeredQty = parseFloat(offer.quantityOffered || 100);
      const qtyDifference = Math.abs(targetQty - offeredQty);
      const qtyScore = Math.max(0, 30 - (qtyDifference * 0.1));
      score += qtyScore;
      score += 30;

      if (score > highestScore) {
        highestScore = score;
        bestId = index;
      }
    });

    return bestId;
  };

  const bestOfferIndex = getBestOfferId();

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
                  <Row className="g-3 mt-2">
                    {matchedRequestsList.map((match) => (
                      <Col md={6} key={match.id}>
                        <Card className="border shadow-sm h-100 rounded-3" style={{ cursor: 'pointer', transition: 'all 0.2s' }} onClick={() => handleOpenMatchModal(match)}>
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <Badge bg={match.requestType === 'Buyer' ? 'primary' : 'success'}>{match.requestType}</Badge>
                              <small className="text-muted">ID: {match.id}</small>
                            </div>
                            <h5 className="fw-bold">{match.title}</h5>
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <small className="text-muted">📍 {match.location}</small>
                              <Badge bg="warning" text="dark">📦 {match.quantity || 0} Kg</Badge>
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <strong className="text-success">LKR {match.startingPrice}</strong>
                              <Badge bg="success">Auto-Matched ✅</Badge>
                            </div>
                          </Card.Body>
                        </Card>
                      </Col>
                    ))}
                  </Row>
                ) : (
                  <div className="text-center py-5">
                    <div className="mb-3 text-success fs-1">📦</div>
                    <h5 className="fw-bold text-dark">No automatic matches found yet</h5>
                    <p className="text-muted small mb-4">Compatible posts from the opposite marketplace will appear here.</p>
                    <Button variant="success" className="fw-bold px-4 py-2 shadow-sm" style={{ backgroundColor: '#136534', border: 'none', borderRadius: '8px' }} onClick={() => window.location.href = '/hub'}>
                      🔍 Explore Matching Requests
                    </Button>
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="offers" title={`📩 Received Offers (${request.offers ? request.offers.length : 0})`}>
              <div className="py-2">
                {request.offers && request.offers.length > 0 ? (
                  <ListGroup className="gap-2 mt-2">
                    {request.offers.map((offer, index) => {
                      const isBest = index === bestOfferIndex;
                      return (
                        <ListGroup.Item key={index} className={`p-3 border rounded-4 shadow-sm d-flex justify-content-between align-items-center ${isBest ? 'border-success border-2 bg-light' : ''}`}>
                          <div>
                            <div className="d-flex align-items-center gap-3 mb-1">
                              <strong className="text-success fs-5">LKR {offer.offeredPrice}</strong>
                              <Badge bg="warning" text="dark" className="px-2 py-1">📦 {offer.quantityOffered} kg</Badge>
                              <Badge bg="info" className="px-2 py-1 text-dark">Delivery: {offer.deliveryDate}</Badge>
                              {isBest && <Badge bg="success" className="px-3 py-1 rounded-pill">⭐ Best Value</Badge>}
                            </div>
                            <div className="small text-dark mt-2"><strong>From:</strong> {offer.sender || 'Registered Partner'}</div>
                            <div className="small text-muted fst-italic">"{offer.remarks || 'No remarks added'}"</div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="success" size="sm" className="fw-bold px-4 py-2 rounded-3 shadow-sm" onClick={() => onAcceptOffer(request.id, offer)}>Accept ✅</Button>
                            <Button variant="outline-danger" size="sm" className="fw-bold px-4 py-2 rounded-3 shadow-sm bg-white" onClick={() => window.confirm("Are you sure?") && onDeclineOffer(request.id, offer)}>Decline ❌</Button>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
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
        onUpdatePost={onUpdatePost}
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
          <Button variant="danger" className="fw-bold" onClick={() => { setShowDeleteModal(false); onDeletePost(request.id); }}>
            Yes, Delete Post 🗑️
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default RequestDetail;