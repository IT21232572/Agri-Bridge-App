import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';
import OfferModal from './OfferModal';

const RequestList = ({ requests, onNavigateToAdd, refreshRequests, showToast }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedType, setSelectedType] = useState('All');

  const [showModal, setShowModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);

  const filteredRequests = requests.filter(req => {
    const isFulfilled = req.quantity === 0 || (req.status && req.status.includes('Fully Fulfilled'));
    if (isFulfilled) return false;

    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    const matchesType = selectedType === 'All' || req.requestType === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  const handleOpenModal = (req) => {
    setActiveRequest(req);
    setShowModal(true);
  };

  return (
    <Container fluid className="px-0">
      {/* Scenic Banner Card */}
      {/* Scenic Banner Card */}
      <Card 
        className="border-0 shadow-sm mb-4 position-relative overflow-hidden" 
        style={{ 
          borderRadius: '12px',
          background: 'url("/farm-banner.png")', // Moved background here
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="p-4 text-white d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ color: '#0f3d24' }}>
              <span className="small fw-bold text-uppercase tracking-wider opacity-75">AGRI-BRIDGE</span>
              <h2 className="fw-bold mb-1 display-6" style={{ color: '#0f3d24' }}>Request & Supply Hub</h2>
              <p className="mb-0 opacity-90 small fw-semibold">Two-way marketplace connecting Buyers & Sellers automatically.</p>
            </div>
            <Button 
              variant="success" 
              className="fw-bold shadow px-4 py-2" 
              style={{ backgroundColor: '#136534', border: 'none', borderRadius: '8px' }}
              onClick={onNavigateToAdd}
            >
              + Post Buyer / Seller
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        {/* Removed 'bg-white' and 'border-top'. Added a slight translucent glass effect for readability! */}
        <Card.Body className="p-3" style={{ backgroundColor: 'rgba(255, 255, 255, 0.4)', backdropFilter: 'blur(5px)' }}>
          <Row className="g-3 align-items-center">
            <Col md={5}>
              <InputGroup>
                <InputGroup.Text className="bg-white border-end-0 text-muted">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  className="border-start-0 ps-0 shadow-none"
                  placeholder="Search by crop, keyword, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={4}>
              <Form.Select
                className="shadow-none"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                <option value="All">👥 All Post Types (Buyers & Sellers)</option>
                <option value="Buyer">🛒 Buyers Only</option>
                <option value="Seller">🚜 Sellers Only</option>
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Select
                className="shadow-none"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="All">🏷️ All Categories</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
                <option value="Seeds">Seeds</option>
                <option value="Fertilizer">Fertilizer</option>
                <option value="Equipment">Equipment</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Product Cards Grid */}
      <Row className="g-4">
        {filteredRequests.length > 0 ? (
          filteredRequests.map((req) => (
            <Col md={4} key={req.id || req._id}>
              <Card className="h-100 shadow-sm border-0 rounded-4 overflow-hidden bg-white">
                <Card.Body className="d-flex flex-column p-4">
                  {req.image && (
                    <div className="mb-3 position-relative">
                      <img 
                        src={req.image} 
                        alt={req.title} 
                        className="rounded-3 w-100 shadow-sm" 
                        style={{ height: '150px', objectFit: 'cover' }} 
                      />
                    </div>
                  )}

                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <Badge bg={req.requestType === 'Buyer' ? 'primary' : 'success'} className="px-2 py-1 rounded-pill">
                      {req.requestType === 'Buyer' ? '🛒 Buyer' : '🚜 Seller'}
                    </Badge>
                    <span className="text-muted small">🏷️ {req.category}</span>
                  </div>

                  <Card.Title className="fw-bold mb-1 text-dark fs-5">{req.title}</Card.Title>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <small className="text-muted">📍 {req.location}</small>
                    <Badge bg="warning" text="dark" className="px-2 py-1">📦 {req.quantity || 0} Kg</Badge>
                  </div>

                  <Card.Text className="text-secondary small flex-grow-1 mb-3">
                    {req.description}
                  </Card.Text>
                  
                  <div className="bg-light p-3 rounded-3 mb-3 border-0">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <span className="small text-muted">
                        {req.requestType === 'Buyer' ? 'Target Price:' : 'Asking Price:'}
                      </span>
                      <strong className="text-success fs-6">LKR {req.startingPrice}</strong>
                    </div>
                    <div className="d-flex justify-content-between align-items-center">
                      <span className="small text-muted">Valid Until:</span>
                      <small className="fw-semibold text-danger">📅 {req.biddingEndTime}</small>
                    </div>
                  </div>

                  <div>
                    <Button 
                      variant="outline-success" 
                      className="w-100 fw-bold py-2 rounded-3"
                      onClick={() => handleOpenModal(req)}
                    >
                      View Details & Respond →
                    </Button>
                  </div>
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

      {/* Reusable Offer Modal */}
      <OfferModal
        show={showModal}
        onHide={() => setShowModal(false)}
        targetRequest={activeRequest}
        refreshRequests={refreshRequests}
        showToast={showToast}
      />
    </Container>
  );
};

export default RequestList;