import React, { useState } from 'react';
import { Container, Card, Badge, Button, Tabs, Tab, ListGroup, Row, Col, Table, Modal, Form } from 'react-bootstrap';

const RequestDetail = ({ request, allRequests, acceptedDeals, onBack, onAcceptOffer, onDeclineOffer, onUpdatePost, onDeletePost }) => {
  const [key, setKey] = useState('matched');
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Edit form state
  const [editFormData, setEditFormData] = useState({
    title: request.title,
    category: request.category,
    location: request.location,
    startingPrice: request.startingPrice,
    biddingEndTime: request.biddingEndTime,
    description: request.description
  });

  const oppositeType = request.requestType === 'Buyer' ? 'Seller' : 'Buyer';
  const matchedRequestsList = allRequests.filter(req => 
    req.id !== request.id &&
    req.requestType === oppositeType &&
    req.category.toLowerCase() === request.category.toLowerCase() &&
    req.location.toLowerCase() === request.location.toLowerCase()
  );

  const requestAcceptedDeals = acceptedDeals.filter(deal => deal.requestId === request.id);

  // Smart Best Offer Calculation Logic (Weighted Scoring)
  const getBestOfferId = () => {
    if (!request.offers || request.offers.length === 0) return null;

    let bestId = null;
    let highestScore = -1;

    request.offers.forEach((offer, index) => {
      let score = 0;
      const price = parseFloat(offer.offeredPrice);

      // Price competitiveness score
      if (request.requestType === 'Seller') {
        score += (price * 0.4); 
      } else {
        score += ((1000 / price) * 40); 
      }

      // Quantity fulfillment score
      const targetQty = parseFloat(request.quantity || 100);
      const offeredQty = parseFloat(offer.quantityOffered || 100);
      const qtyDifference = Math.abs(targetQty - offeredQty);
      const qtyScore = Math.max(0, 30 - (qtyDifference * 0.1));
      score += qtyScore;

      // Delivery urgency base score
      score += 30;

      if (score > highestScore) {
        highestScore = score;
        bestId = index;
      }
    });

    return bestId;
  };

  const bestOfferIndex = getBestOfferId();

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdatePost(request.id, editFormData);
    setShowEditModal(false);
    alert("Post updated successfully! ✏️");
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <Button variant="outline-secondary" size="sm" className="mb-3 fw-bold" onClick={onBack}>
          ← Back to My Requests
        </Button>
        <div className="d-flex gap-2">
          <Button variant="outline-primary" size="sm" className="fw-bold" onClick={() => setShowEditModal(true)}>
            ✏️ Edit Post
          </Button>
          <Button 
            variant="outline-danger" 
            size="sm" 
            className="fw-bold" 
            onClick={() => {
              if (window.confirm("Are you sure you want to delete this post?")) {
                onDeletePost(request.id);
              }
            }}
          >
            🗑️ Delete Post
          </Button>
        </div>
      </div>

      {/* Request Header Card */}
      <Card className="shadow-sm border-0 mb-4 bg-light">
        <Card.Body className="p-4">
          <div className="d-flex justify-content-between align-items-center mb-2">
            <div>
              <Badge bg={request.requestType === 'Buyer' ? 'primary' : 'success'} className="me-2 px-2 py-1">
                {request.requestType}
              </Badge>
              <Badge bg="secondary" className="px-2 py-1">{request.category}</Badge>
            </div>
            <span className="text-muted fw-semibold">Req ID: {request.id}</span>
          </div>

          <h2 className="fw-bold text-dark mb-2">{request.title}</h2>
          <p className="text-muted mb-3">📍 Location: <strong>{request.location}</strong> | Valid Until: {request.biddingEndTime}</p>
          <p className="text-secondary">{request.description}</p>

          <Row className="mt-3 g-3">
            <Col md={4}>
              <div className="bg-white p-3 rounded border">
                <span className="text-muted small d-block">Target / Asking Price:</span>
                <h4 className="text-success fw-bold mb-0">LKR {request.startingPrice}</h4>
              </div>
            </Col>
            <Col md={4}>
              <div className="bg-white p-3 rounded border">
                <span className="text-muted small d-block">Current Status:</span>
                <h5 className="text-dark fw-bold mb-0">{request.status}</h5>
              </div>
            </Col>
            <Col md={4}>
              <div className="bg-white p-3 rounded border">
                <span className="text-muted small d-block">Contact Person:</span>
                <strong className="text-dark">{request.buyerName || 'My Profile'}</strong>
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Tabs Card */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4">
          <Tabs
            id="request-details-tabs"
            activeKey={key}
            onSelect={(k) => setKey(k)}
            className="mb-4"
          >
            <Tab eventKey="matched" title={`⚡ Matched Requests (${matchedRequestsList.length})`}>
              <div className="py-2">
                <p className="text-muted small mb-3">
                  Compatible posts from the opposite marketplace based on category, location, and pricing logic.
                </p>
                {matchedRequestsList.length > 0 ? (
                  <Row className="g-3">
                    {matchedRequestsList.map((match) => (
                      <Col md={6} key={match.id}>
                        <Card className="border shadow-sm h-100">
                          <Card.Body>
                            <div className="d-flex justify-content-between mb-2">
                              <Badge bg={match.requestType === 'Buyer' ? 'primary' : 'success'}>
                                {match.requestType}
                              </Badge>
                              <small className="text-muted">ID: {match.id}</small>
                            </div>
                            <h5 className="fw-bold">{match.title}</h5>
                            <p className="small text-muted mb-2">📍 {match.location}</p>
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
                  <div className="text-center py-4 text-muted">
                    No automatic matches found for this request yet.
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="offers" title={`📩 Received Offers (${request.offers ? request.offers.length : 0})`}>
              <div className="py-2">
                <p className="text-muted small mb-3">
                  Review direct bids and counter-offers. The system automatically highlights the best recommendation based on price, quantity, and delivery speed.
                </p>
                {request.offers && request.offers.length > 0 ? (
                  <ListGroup className="gap-2">
                    {request.offers.map((offer, index) => {
                      const isBest = index === bestOfferIndex;
                      return (
                        <ListGroup.Item 
                          key={index} 
                          className={`p-3 border rounded shadow-sm d-flex justify-content-between align-items-center ${isBest ? 'border-success border-2 bg-light' : ''}`}
                        >
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <strong className="text-success fs-5">LKR {offer.offeredPrice}</strong>
                              <Badge bg="warning" text="dark">📦 {offer.quantityOffered} kg</Badge>
                              <Badge bg="info">Delivery: {offer.deliveryDate}</Badge>
                              {isBest && (
                                <Badge bg="success" className="px-2 py-1">⭐ Best Value / Recommended</Badge>
                              )}
                            </div>
                            <div className="small text-dark"><strong>From:</strong> {offer.sender || 'Registered Partner'}</div>
                            <div className="small text-muted fst-italic">"{offer.remarks || 'No remarks added'}"</div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button 
                              variant="success" 
                              size="sm" 
                              className="fw-bold px-3"
                              onClick={() => onAcceptOffer(request.id, offer)}
                            >
                              Accept Deal ✅
                            </Button>
                            <Button 
                              variant="outline-danger" 
                              size="sm" 
                              className="fw-bold px-3"
                              onClick={() => {
                                if (window.confirm("Are you sure you want to decline this offer?")) {
                                  onDeclineOffer(request.id, offer);
                                }
                              }}
                            >
                              Decline ❌
                            </Button>
                          </div>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No direct offers received yet for this request.
                  </div>
                )}
              </div>
            </Tab>

            <Tab eventKey="accepted" title={`🤝 Accepted Deals (${requestAcceptedDeals.length})`}>
              <div className="py-2">
                <p className="text-muted small mb-3">
                  Deals successfully accepted for this request, ready for payment and logistics processing.
                </p>
                {requestAcceptedDeals.length > 0 ? (
                  <div className="table-responsive">
                    <Table hover className="align-middle mb-0 text-nowrap">
                      <thead className="table-light">
                        <tr>
                          <th>Partner / Supplier</th>
                          <th>Agreed Price (LKR)</th>
                          <th>Quantity</th>
                          <th>Delivery Date</th>
                          <th>Remarks</th>
                          <th>Status</th>
                          <th className="text-center">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {requestAcceptedDeals.map((deal, idx) => (
                          <tr key={idx}>
                            <td className="fw-bold">{deal.sender || 'Registered Partner'}</td>
                            <td className="fw-bold text-success">LKR {deal.offeredPrice}</td>
                            <td><Badge bg="warning" text="dark">{deal.quantityOffered} kg</Badge></td>
                            <td>{deal.deliveryDate}</td>
                            <td className="text-muted small">"{deal.remarks || 'No remarks'}"</td>
                            <td>
                              <Badge bg="success">Confirmed & Processing 🚚</Badge>
                            </td>
                            <td className="text-center">
                              <Button variant="outline-success" size="sm" onClick={() => alert(`Proceeding to logistics module.`)}>
                                View Details
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-4 text-muted">
                    No accepted deals yet for this request.
                  </div>
                )}
              </div>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>

      {/* Edit Post Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>✏️ Edit Post ({request.id})</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleEditSubmit}>
            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="title"
                    value={editFormData.title}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={editFormData.category}
                    onChange={handleEditChange}
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Equipment">Equipment</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={editFormData.location}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Price (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    name="startingPrice"
                    value={editFormData.startingPrice}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Valid Until</Form.Label>
                  <Form.Control
                    type="text"
                    name="biddingEndTime"
                    value={editFormData.biddingEndTime}
                    onChange={handleEditChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit" className="fw-bold px-4">
                Save Changes ✅
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </Container>
  );
};

export default RequestDetail;