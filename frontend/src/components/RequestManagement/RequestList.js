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
      <Card 
        className="border-0 shadow-sm mb-4 position-relative overflow-hidden" 
        style={{ 
          borderRadius: '12px',
          background: 'url("/farm-banner.png")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="p-4 text-white d-flex flex-column justify-content-between">
          <div className="d-flex justify-content-between align-items-start">
            <div style={{ color: '#0f3d24' }}>
              <span className="small fw-bold text-uppercase tracking-wider opacity-75">AGRI-BRIDGE</span>
              <h2 className="fw-bold mb-1 display-6" style={{ color: '#0f3d24' }}>Request &amp; Supply Hub</h2>
              <p className="mb-0 opacity-90 small fw-semibold">Two-way marketplace connecting Buyers &amp; Sellers automatically.</p>
            </div>
            <Button 
              variant="success" 
              className="fw-bold shadow px-4 py-2" 
              style={{ backgroundColor: '#136534', border: 'none', borderRadius: '8px' }}
              onClick={onNavigateToAdd}
            >
              + Create Advertisement
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
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
                <option value="All">👥 All Advertisement Types (Buyers &amp; Sellers)</option>
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
          filteredRequests.map((req) => {
            const isBuyer = req.requestType === 'Buyer';
            const accentColor = isBuyer ? '#0d6efd' : '#136534';
            const softBoxBg = isBuyer ? '#f2f7ff' : '#f1faf4';

            return (
              <Col md={6} lg={4} key={req.id || req._id}>
                <Card
                  className="h-100 rounded-4 overflow-hidden bg-white"
                  style={{
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
                    transition: 'transform 0.18s ease, box-shadow 0.18s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-5px)';
                    e.currentTarget.style.boxShadow = '0 12px 26px rgba(0, 0, 0, 0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.06)';
                  }}
                >
                  {/* Top Full-Bleed Image with Floating Badges */}
                  <div className="position-relative bg-light" style={{ height: '175px' }}>
                    {req.image ? (
                      <img
                        src={req.image}
                        alt={req.title}
                        className="w-100 h-100"
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        className="w-100 h-100 d-flex align-items-center justify-content-center fs-1"
                        style={{ backgroundColor: softBoxBg }}
                      >
                        🌱
                      </div>
                    )}

                    {/* Top-Left: Role Badge */}
                    <Badge
                      bg={isBuyer ? 'primary' : 'success'}
                      className="position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill shadow-sm d-flex align-items-center gap-1"
                      style={{ fontSize: '0.78rem', letterSpacing: '0.2px' }}
                    >
                      <span>{isBuyer ? '🛒' : '🚜'}</span>
                      <span>{req.requestType}</span>
                    </Badge>

                    {/* Top-Right: Quantity Pill */}
                    <Badge
                      bg="warning"
                      text="dark"
                      className="position-absolute top-0 end-0 m-3 px-3 py-2 rounded-pill shadow-sm fw-bold"
                      style={{ fontSize: '0.78rem' }}
                    >
                      📦 {req.quantity || 0} Kg
                    </Badge>
                  </div>

                  {/* Card Content Body */}
                  <Card.Body className="p-4 d-flex flex-column justify-content-between">
                    <div>
                      {/* Category Pill */}
                      <span
                        className="d-inline-block px-2 py-1 rounded-pill fw-semibold mb-2"
                        style={{
                          fontSize: '0.75rem',
                          backgroundColor: '#f1f3f5',
                          color: '#495057'
                        }}
                      >
                        🏷️ {req.category}
                      </span>

                      {/* Product Title & Location */}
                      <h5 className="fw-bold text-dark mb-1">{req.title}</h5>
                      <div className="text-secondary small fw-medium mb-2">
                        📍 {req.location}
                      </div>

                      {/* Short Description */}
                      <p
                        className="text-muted small mb-3"
                        style={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          minHeight: '38px'
                        }}
                      >
                        {req.description}
                      </p>
                    </div>

                    <div>
                      {/* Left-Bordered Price & Expiry Box */}
                      <div
                        className="p-3 rounded-3 mb-3"
                        style={{
                          backgroundColor: softBoxBg,
                          borderLeft: `4px solid ${accentColor}`
                        }}
                      >
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-secondary small fw-medium">
                            {isBuyer ? 'Target Price:' : 'Asking Price:'}
                          </span>
                          <span
                            className="fw-bold fs-6"
                            style={{ color: accentColor }}
                          >
                            LKR {req.startingPrice}
                          </span>
                        </div>

                        <div className="d-flex justify-content-between align-items-center">
                          <span className="text-secondary small fw-medium">
                            Valid Until:
                          </span>
                          <span className="text-danger small fw-semibold">
                            📅 {req.biddingEndTime}
                          </span>
                        </div>
                      </div>

                      {/* Solid High-Contrast Action Button */}
                      <Button
                        variant={isBuyer ? 'primary' : 'success'}
                        className="w-100 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                        onClick={() => handleOpenModal(req)}
                      >
                        <span>View Details &amp; Respond</span>
                        <span>→</span>
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            );
          })
        ) : (
          <Col xs={12} className="text-center py-5">
            <h5 className="text-muted">No advertisements found matching your filter.</h5>
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