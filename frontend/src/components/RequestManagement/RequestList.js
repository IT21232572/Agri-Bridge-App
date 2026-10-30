import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup, Modal } from 'react-bootstrap';

const RequestList = ({ requests, onNavigateToAdd, onSubmitOffer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [offerData, setOfferData] = useState({
    offeredPrice: '',
    quantityOffered: '',
    deliveryDate: '',
    remarks: ''
  });

  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    const matchesType = selectedType === 'All' || req.requestType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOpenModal = (req) => {
    setActiveRequest(req);
    setOfferData({ offeredPrice: '', quantityOffered: '', deliveryDate: '', remarks: '' });
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
    const newOffer = {
      sender: 'Current Logged In User',
      offeredPrice: offerData.offeredPrice,
      quantityOffered: offerData.quantityOffered,
      deliveryDate: offerData.deliveryDate,
      remarks: offerData.remarks
    };

    onSubmitOffer(activeRequest.id, newOffer);
    alert(`Offer of LKR ${offerData.offeredPrice} for ${offerData.quantityOffered}kg submitted successfully!`);
    handleCloseModal();
  };

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1">Agri-Bridge Request & Supply Hub</h2>
          <p className="text-muted">Two-way marketplace connecting Buyers & Sellers automatically</p>
        </div>
        <Button variant="success" className="fw-bold shadow-sm" onClick={onNavigateToAdd}>
          + Post Buyer / Seller
        </Button>
      </div>

      <Card className="p-3 mb-4 shadow-sm border-0 bg-light">
        <Row className="g-3">
          <Col md={5}>
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
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="All">All Post Types (Buyers & Sellers)</option>
              <option value="Buyer">🛒 Buyers Only</option>
              <option value="Seller">🚜 Sellers Only</option>
            </Form.Select>
          </Col>
          <Col md={3}>
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

      <Row className="g-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <Col md={4} key={req.id}>
              <Card className={`h-100 shadow-sm border-0 ${req.status.includes('Matched') ? 'border-start border-success border-4' : ''}`}>
                <Card.Body className="d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg={req.requestType === 'Buyer' ? 'primary' : 'success'} className="px-2 py-1">
                      {req.requestType === 'Buyer' ? '🛒 Buyer' : '🚜 Seller'}
                    </Badge>
                    <Badge bg="secondary" className="px-2 py-1">{req.category}</Badge>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <small className="text-muted fw-semibold">📍 {req.location}</small>
                    {req.status.includes('Matched') && (
                      <Badge bg="warning" text="dark">⚡ Auto-Matched</Badge>
                    )}
                  </div>

                  <Card.Title className="fw-bold mb-2">{req.title}</Card.Title>
                  <Card.Text className="text-secondary small flex-grow-1">
                    {req.description}
                  </Card.Text>
                  
                  <div className="bg-light p-2 rounded mb-3">
                    <div className="d-flex justify-content-between">
                      <span className="small text-muted">
                        {req.requestType === 'Buyer' ? 'Target Price:' : 'Asking Price:'}
                      </span>
                      <strong className="text-success">LKR {req.startingPrice}</strong>
                    </div>
                    <div className="d-flex justify-content-between mt-1">
                      <span className="small text-muted">Valid Until:</span>
                      <small className="fw-semibold text-danger">{req.biddingEndTime}</small>
                    </div>
                  </div>

                  <Button 
                    variant="outline-success" 
                    className="w-100 fw-bold"
                    onClick={() => handleOpenModal(req)}
                  >
                    View Details & Respond
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <Col xs={12} className="text-center py-5">
            <h5 className="text-muted">No posts found matching your filter.</h5>
          </Col>
        )}
      </Row>

      {/* Details & Counter Offer Modal */}
      {activeRequest && (
        <Modal show={showModal} onHide={handleCloseModal} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="h5">
              {activeRequest.requestType} Details & Direct Response
            </Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <Row className="mb-3">
              <Col md={8}>
                <Badge bg={activeRequest.requestType === 'Buyer' ? 'primary' : 'success'} className="mb-2 me-2">
                  {activeRequest.requestType}
                </Badge>
                <Badge bg="secondary" className="mb-2">{activeRequest.category}</Badge>
                <h4 className="fw-bold text-dark">{activeRequest.title}</h4>
                <span className="text-muted small">📍 Location: {activeRequest.location}</span>
                <p className="mt-3 text-secondary">{activeRequest.description}</p>
              </Col>
              <Col md={4} className="border-start">
                <div className="bg-light p-3 rounded">
                  <span className="text-muted small d-block">Listed Price:</span>
                  <h4 className="text-success fw-bold">LKR {activeRequest.startingPrice}</h4>
                  <hr />
                  <span className="text-muted small d-block">Posted By:</span>
                  <strong className="d-block text-dark">{activeRequest.buyerName || 'Farmer / Buyer'}</strong>
                  <small className="text-muted">{activeRequest.contact || '+94 77 000 0000'}</small>
                </div>
              </Col>
            </Row>

            <hr />

            <h5 className="fw-bold text-success mb-3">Send Counter Offer / Direct Bid</h5>
            <Form onSubmit={handleOfferSubmit}>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Your Price (LKR)</Form.Label>
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
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Quantity (Kg)</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantityOffered"
                      placeholder="E.g. 500"
                      value={offerData.quantityOffered}
                      onChange={handleOfferChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Expected Delivery Date</Form.Label>
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
                <Form.Label className="fw-semibold">Remarks / Message</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  name="remarks"
                  placeholder="Provide details about stock quality, transport, etc."
                  value={offerData.remarks}
                  onChange={handleOfferChange}
                />
              </Form.Group>

              <div className="d-flex justify-content-end gap-2 mt-4">
                <Button variant="secondary" onClick={handleCloseModal}>
                  Close
                </Button>
                <Button variant="success" type="submit" className="fw-bold px-4">
                  Submit Offer
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