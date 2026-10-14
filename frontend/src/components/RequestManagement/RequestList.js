import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap';

const RequestList = ({ requests, onNavigateToAdd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [offerData, setOfferData] = useState({
    offeredPrice: '',
    deliveryDate: '',
    remarks: ''
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleOpenModal = (req) => {
    setActiveRequest(req);
    setOfferData({ offeredPrice: '', deliveryDate: '', remarks: '' });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setActiveRequest(null);
  };

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfferSubmit = (e) => {
    e.preventDefault();
    alert(`Offer of LKR ${offerData.offeredPrice} submitted successfully for "${activeRequest.title}"! (Alert sent to buyer)`);
    handleCloseModal();
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1">Agri Requests Marketplace</h2>
          <p className="text-muted">Browse buyers' current crop & resource demands</p>
        </div>
        <Button variant="success" className="fw-bold shadow-sm" onClick={onNavigateToAdd}>
          + Post New Request
        </Button>
      </div>

      {/* Search & Category Filter */}
      <Card className="p-3 mb-4 shadow-sm border-0 bg-light">
        <Row className="g-3">
          <Col md={8}>
            <InputGroup>
              <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by crop, keyword, or location..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </Col>
          <Col md={4}>
            <Form.Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="All">All Categories</option>
              <option value="Vegetables">Vegetables</option>
              <option value="Fruits">Fruits</option>
              <option value="Seeds">Seeds</option>
              <option value="Fertilizer">Fertilizer</option>
              <option value="Equipment">Equipment</option>
            </Form.Select>
          </Col>
        </Row>
      </Card>

      {/* Grid */}
      <Row className="g-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <Col md={4} key={req.id}>
              <Card className="h-100 shadow-sm border-0">
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <Badge bg="success" className="px-2 py-1">{req.category}</Badge>
                    <small className="text-muted">📍 {req.location}</small>
                  </div>
                  <Card.Title className="fw-bold mb-2">{req.title}</Card.Title>
                  <Card.Text className="text-secondary small flex-grow-1">
                    {req.description}
                  </Card.Text>
                  
                  <div className="bg-light p-2 rounded mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="small text-muted">Base / Target Price:</span>
                      <strong className="text-success">LKR {req.startingPrice}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="small text-muted">Ends at:</span>
                      <small className="fw-semibold text-danger">{req.biddingEndTime}</small>
                    </div>
                  </div>

                  <Button 
                    variant="outline-success" 
                    className="w-100 fw-bold"
                    onClick={() => handleOpenModal(req)}
                  >
                    View Details & Offer
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center py-5">
            <h5 className="text-muted">No requests found matching your filter.</h5>
          </Col>
        )}
      </Row>

      {/* Modal */}
      {activeRequest && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="h5">Request Details & Place Offer</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Row className="mb-3">
              <Col md={8}>
                <h4 className="fw-bold text-dark">{activeRequest.title}</h4>
                <Badge bg="secondary" className="me-2">{activeRequest.category}</Badge>
                <span className="text-muted small">📍 {activeRequest.location}</span>
                <p className="mt-3 text-secondary">{activeRequest.description}</p>
              </Col>
              <Col md={4} className="border-start">
                <div className="bg-light p-3 rounded">
                  <span className="text-muted small d-block">Target/Base Price:</span>
                  <h4 className="text-success fw-bold">LKR {activeRequest.startingPrice}</h4>
                  <hr />
                  <span className="text-muted small d-block">Posted By:</span>
                  <strong className="d-block text-dark">{activeRequest.buyerName}</strong>
                  <small className="text-muted">{activeRequest.contact}</small>
                </div>
              </Col>
            </Row>

            <hr />

            <h5 className="fw-bold text-success mb-3">Submit Your Offer / Bid</h5>
            <Form onSubmit={handleOfferSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Your Offered Price (LKR)</Form.Label>
                    <Form.Control
                      type="number"
                      name="offeredPrice"
                      placeholder={`E.g. ${activeRequest.startingPrice}`}
                      value={offerData.offeredPrice}
                      onChange={handleOfferChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Estimated Delivery / Available Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="deliveryDate"
                      value={offerData.deliveryDate}
                      onChange={handleOfferChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Note / Supply Remarks</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="remarks"
                  placeholder="Provide details about stock quality, delivery conditions, etc."
                  value={offerData.remarks}
                  onChange={handleOfferChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="success" type="submit" className="fw-bold px-4">
                  Send Offer
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>
      )}
    </Container>
  );
};

export default RequestList;