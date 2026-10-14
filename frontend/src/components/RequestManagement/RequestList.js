import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Form, Badge, InputGroup } from 'react-bootstrap';

// Viva ekata pennanna dummy requests set ekak
const initialRequests = [
  {
    id: '1',
    title: 'Need 100kg Big Onions',
    category: 'Vegetables',
    location: 'Dambulla',
    startingPrice: 350,
    biddingEndTime: '2026-10-25 18:00',
    description: 'Looking for high quality dried big onions from local farms.'
  },
  {
    id: '2',
    title: '500kg Organic Cavendish Bananas',
    category: 'Fruits',
    location: 'Embilipitiya',
    startingPrice: 180,
    biddingEndTime: '2026-10-22 12:00',
    description: 'Bulk order for export standard bananas with minimal bruises.'
  },
  {
    id: '3',
    title: 'Paddy Seeds (BG 352)',
    category: 'Seeds',
    location: 'Polonnaruwa',
    startingPrice: 220,
    biddingEndTime: '2026-10-20 15:30',
    description: 'Certified paddy seeds needed for upcoming Maha season.'
  }
];

const RequestList = () => {
  const [requests, setRequests] = useState(initialRequests);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Search saha Filter logic eka
  const filteredRequests = requests.filter(req => {
    const matchesSearch = req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          req.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || req.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <Container className="mt-4 mb-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="fw-bold text-success mb-1">Agri Requests Marketplace</h2>
          <p className="text-muted">Browse buyers' current crop & resource demands</p>
        </div>
        <Button variant="success" className="fw-bold shadow-sm">
          + Post New Request
        </Button>
      </div>

      {/* Search & Category Filter Section */}
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

      {/* Requests Display Grid */}
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

                  <Button variant="outline-success" className="w-100 fw-bold">
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
    </Container>
  );
};

export default RequestList;