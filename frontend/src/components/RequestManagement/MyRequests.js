import React, { useState } from 'react';
import { Container, Table, Badge, Card, Modal, Button, Row, Col, InputGroup, Form, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MyRequests = ({ requests, onDeleteRequest, showToast }) => {
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [requestToDelete, setRequestToDelete] = useState(null);
  
  // Filter & Search State
  const [filter, setFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Delete Handlers
  const handleOpenDeleteModal = (e, req) => {
    e.stopPropagation();
    setRequestToDelete(req);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = () => {
    if (requestToDelete) {
      onDeleteRequest(requestToDelete.id);
      if (showToast) showToast(`Request ${requestToDelete.id} cancelled successfully.`, 'danger');
    }
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  // Helper to calculate active automated matches
  const getMatchCount = (req) => {
    const oppositeType = req.requestType === 'Buyer' ? 'Seller' : 'Buyer';
    const matches = requests.filter(r => 
      r.id !== req.id &&
      r.requestType === oppositeType &&
      r.category.toLowerCase() === req.category.toLowerCase() &&
      r.location.toLowerCase() === req.location.toLowerCase()
    );
    return matches.length;
  };

  // Stats Calculations
  const totalPosts = requests.length;
  const pendingCount = requests.filter(r => r.status.includes('Pending')).length;
  const partialCount = requests.filter(r => r.status.includes('Partial')).length;
  const fulfilledCount = requests.filter(r => r.status.includes('Fulfilled') || r.status.includes('Accepted')).length;

  // Filter Logic
  const filteredRequests = requests.filter(req => {
    const matchesSearch = 
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFilter = true;
    if (filter === 'Pending') matchesFilter = req.status.includes('Pending');
    if (filter === 'Partial') matchesFilter = req.status.includes('Partial');
    if (filter === 'Fulfilled') matchesFilter = req.status.includes('Fulfilled') || req.status.includes('Accepted');

    return matchesSearch && matchesFilter;
  });

  return (
    <Container fluid className="px-0 mb-5">
      
      {/* Scenic Header & Stats Section */}
      <Card className="border-0 shadow-sm mb-4 position-relative overflow-hidden rounded-4 bg-white">
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'url("/farm-banner.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.3,
            zIndex: 0
          }}
        />
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(180deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.6) 100%)',
            zIndex: 1
          }}
        />
        
        <div className="p-4 position-relative" style={{ zIndex: 2 }}>
          <div className="mb-4">
            <span className="text-muted small">🏠 My Requests & Matches</span>
            <h3 className="fw-bold text-dark mt-2 mb-1">My Requests & Automated Match Status</h3>
            <p className="text-secondary small mb-0">Track your posts, offers, and matches in one place.</p>
          </div>

          <Row className="g-3">
            <Col md={3}>
              <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3 h-100">
                <div className="bg-light text-success rounded p-2 fs-4">📄</div>
                <div>
                  <span className="text-muted small fw-semibold d-block">Total Posts</span>
                  <h4 className="text-dark fw-bold mb-0">{totalPosts}</h4>
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3 h-100">
                <div className="bg-warning bg-opacity-10 text-warning rounded p-2 fs-4">🤝</div>
                <div>
                  <span className="text-muted small fw-semibold d-block">Pending Match</span>
                  <h4 className="text-dark fw-bold mb-0">{pendingCount}</h4>
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3 h-100">
                <div className="bg-primary bg-opacity-10 text-primary rounded p-2 fs-4">📚</div>
                <div>
                  <span className="text-muted small fw-semibold d-block">Partial Matches</span>
                  <h4 className="text-dark fw-bold mb-0">{partialCount}</h4>
                </div>
              </div>
            </Col>
            <Col md={3}>
              <div className="bg-white p-3 rounded-4 shadow-sm border-0 d-flex align-items-center gap-3 h-100">
                <div className="bg-success bg-opacity-10 text-success rounded p-2 fs-4">✅</div>
                <div>
                  <span className="text-muted small fw-semibold d-block">Fully Fulfilled</span>
                  <h4 className="text-dark fw-bold mb-0">{fulfilledCount}</h4>
                </div>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
        
        {/* Filters and Search Bar */}
        <Card.Header className="bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex gap-2">
            <Button 
              variant={filter === 'All' ? 'success' : 'light'} 
              size="sm" 
              className={`rounded-pill px-3 fw-semibold ${filter === 'All' ? '' : 'text-muted border'}`}
              onClick={() => setFilter('All')}
            >
              ⊞ All Posts ({totalPosts})
            </Button>
            <Button 
              variant={filter === 'Pending' ? 'success' : 'light'} 
              size="sm" 
              className={`rounded-pill px-3 fw-semibold ${filter === 'Pending' ? '' : 'text-muted border'}`}
              onClick={() => setFilter('Pending')}
            >
              🕒 Pending Match ({pendingCount})
            </Button>
            <Button 
              variant={filter === 'Partial' ? 'success' : 'light'} 
              size="sm" 
              className={`rounded-pill px-3 fw-semibold ${filter === 'Partial' ? '' : 'text-muted border'}`}
              onClick={() => setFilter('Partial')}
            >
              📚 Partial Match ({partialCount})
            </Button>
            <Button 
              variant={filter === 'Fulfilled' ? 'success' : 'light'} 
              size="sm" 
              className={`rounded-pill px-3 fw-semibold ${filter === 'Fulfilled' ? '' : 'text-muted border'}`}
              onClick={() => setFilter('Fulfilled')}
            >
              ✅ Fully Fulfilled ({fulfilledCount})
            </Button>
          </div>

          <div style={{ width: '250px' }}>
            <InputGroup size="sm">
              <InputGroup.Text className="bg-white text-muted border-end-0">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by Req ID, title..."
                className="border-start-0 shadow-none ps-0"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap" style={{ cursor: 'pointer' }}>
              <thead>
                <tr>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Req ID</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Role</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Title & Category</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Location</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Valid Until</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Offers & Matches</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#afeebd' }}>Status</th>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold text-center" style={{ backgroundColor: '#afeebd' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const matchCount = getMatchCount(req);
                    const offerCount = req.offers ? req.offers.length : 0;

                    // Status Badge Styling logic
                    let statusBg = 'warning';
                    let statusClass = 'rounded-pill px-3 py-2 bg-opacity-25 border border-warning text-dark';
                    let statusIcon = '⏳ ';

                    if (req.status.includes('Fulfilled') || req.status.includes('Accepted')) {
                      statusBg = 'success';
                      statusClass = 'rounded-pill px-3 py-2 text-white';
                      statusIcon = '✅ ';
                    } else if (req.status.includes('Partial')) {
                      statusBg = 'info'; // Changes Partial Match to Blue
                      statusClass = 'rounded-pill px-3 py-2 bg-opacity-25 border border-info text-dark';
                      statusIcon = '🔄 ';
                    }

                    return (
                      <tr 
                        key={req.id} 
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        <td className="px-4 fw-semibold text-secondary small">{req.id}</td>
                        <td>
                          <Badge 
                            bg={req.requestType === 'Buyer' ? 'primary' : 'success'} 
                            className="bg-opacity-10 rounded-pill px-3 py-2"
                            text={req.requestType === 'Buyer' ? 'primary' : 'success'}
                          >
                            {req.requestType === 'Buyer' ? '🛒 Buyer' : '🚜 Seller'}
                          </Badge>
                        </td>
                        <td>
                          <div className="fw-bold text-success">{req.title}</div>
                          <small className="text-muted">{req.category}</small>
                        </td>
                        <td className="small">📍 {req.location}</td>
                        <td className="small">📅 {req.biddingEndTime}</td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <Badge bg="light" text="dark" className="border fw-normal px-2 py-1">
                              📩 {offerCount} Offers
                            </Badge>
                            <Badge bg="success" className="bg-opacity-10 border border-success border-opacity-25 text-success fw-bold px-2 py-1">
                              ⚡ {matchCount} Matches
                            </Badge>
                          </div>
                        </td>
                        <td>
                          <Badge bg={statusBg} className={statusClass}>
                            {statusIcon}{req.status}
                          </Badge>
                        </td>
                        <td className="px-4 text-center" onClick={(e) => e.stopPropagation()}>
                          <Dropdown drop="start">
                            <Dropdown.Toggle variant="light" size="sm" className="bg-transparent border-0 shadow-none fs-5 text-muted p-0">
                              ⋮
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item onClick={() => navigate(`/request/${req.id}`)}>📄 View Details</Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item className="text-danger fw-semibold" onClick={(e) => handleOpenDeleteModal(e, req)}>
                                🗑️ Cancel Request
                              </Dropdown.Item>
                            </Dropdown.Menu>
                          </Dropdown>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5 text-muted">
                      No posts found matching your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Delete Confirmation Modal */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title>⚠️ Confirm Cancellation</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <p className="text-secondary mb-0">
            Are you sure you want to cancel request <strong>{requestToDelete?.id}</strong> ({requestToDelete?.title})? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Keep Post
          </Button>
          <Button variant="danger" className="fw-bold" onClick={handleConfirmDelete}>
            Yes, Cancel Request 🗑️
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyRequests;