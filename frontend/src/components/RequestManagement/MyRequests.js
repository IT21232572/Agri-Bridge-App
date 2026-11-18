import React, { useState } from 'react';
import { Container, Table, Badge, Card, Modal, Button, Row, Col, InputGroup, Form, Dropdown } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const MyRequests = ({ requests, onDeleteRequest, showToast }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
      if (showToast) showToast(`Advertisement ${requestToDelete.id} cancelled successfully.`, 'danger');
    }
    setShowDeleteModal(false);
    setRequestToDelete(null);
  };

  // Helper to calculate active automated matches (supports both full & partial quantities)
  const getMatchCount = (req) => {
    const oppositeType = req.requestType === 'Buyer' ? 'Seller' : 'Buyer';

    const matches = requests.filter(r => {
      if (r.id === req.id) return false;
      if (r.requestType !== oppositeType) return false;
      if (r.title.trim().toLowerCase() !== req.title.trim().toLowerCase()) return false;
      if (r.status.includes('Fulfilled') || Number(r.quantity) <= 0) return false;

      // Exclude posts by the same user
      const sameUserById = req.userId && r.userId && String(req.userId) === String(r.userId);
      const sameLoggedInUser = user && r.userId && String(r.userId) === String(user.id);
      const sameUserByName =
        req.buyerName &&
        r.buyerName &&
        req.buyerName.trim().toLowerCase() === r.buyerName.trim().toLowerCase();

      if (sameUserById || sameLoggedInUser || sameUserByName) return false;

      return true;
    });

    return matches.length;
  };

  // Only show advertisements created by the currently logged-in user
  const myOwnRequests = requests.filter(
    (r) => user && (r.userId === user.id || r.buyerName === user.name)
  );

  // Stats Calculations (based on user's own advertisements)
  const totalPosts = myOwnRequests.length;
  const pendingCount = myOwnRequests.filter(r => r.status.includes('Pending')).length;
  const partialCount = myOwnRequests.filter(r => r.status.includes('Partial')).length;
  const fulfilledCount = myOwnRequests.filter(r => r.status.includes('Fulfilled') || r.status.includes('Accepted')).length;

  // Filter Logic (based on user's own advertisements)
  const filteredRequests = myOwnRequests.filter(req => {
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

  const statCards = [
    {
      label: 'Total Advertisements',
      value: totalPosts,
      icon: '📄',
      iconBg: '#ede9fe',
      borderColor: '#8b5cf6'
    },
    {
      label: 'Pending Match',
      value: pendingCount,
      icon: '🤝',
      iconBg: '#fef3c7',
      borderColor: '#f59e0b'
    },
    {
      label: 'Partial Matches',
      value: partialCount,
      icon: '📚',
      iconBg: '#dbeafe',
      borderColor: '#3b82f6'
    },
    {
      label: 'Fully Fulfilled',
      value: fulfilledCount,
      icon: '✅',
      iconBg: '#dcfce7',
      borderColor: '#16a34a'
    }
  ];

  const filterTabs = [
    { key: 'All', icon: '⊞', label: `All Advertisements (${totalPosts})` },
    { key: 'Pending', icon: '🕒', label: `Pending Match (${pendingCount})` },
    { key: 'Partial', icon: '📚', label: `Partial Match (${partialCount})` },
    { key: 'Fulfilled', icon: '✅', label: `Fully Fulfilled (${fulfilledCount})` }
  ];

  return (
    <Container fluid className="px-0 mb-5">

      {/* Deep Green Gradient Hero Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background:
            'radial-gradient(circle at 85% 45%, rgba(234, 179, 8, 0.45) 0%, rgba(22, 101, 52, 0.2) 38%, transparent 65%), linear-gradient(120deg, #0b3d22 0%, #14532d 55%, #1e6b38 100%)',
          paddingBottom: '5.5rem'
        }}
      >
        <div className="d-flex align-items-center gap-2 small fw-semibold mb-2" style={{ color: '#bbf7d0' }}>
          <span>🏠</span>
          <span>My Requests &amp; Matches</span>
        </div>
        <h2 className="fw-bold display-6 mb-2" style={{ letterSpacing: '-0.5px' }}>
          My Requests &amp; Automated Match Status
        </h2>
        <p className="mb-4 text-white-50 fw-medium">
          Track your advertisements, offers, and matches in one place.
        </p>
      </div>

      {/* 4 Overlapping Stat Cards with Color Bottom Accents */}
      <Row className="g-3 px-3 px-md-4 position-relative" style={{ marginTop: '-48px', zIndex: 2 }}>
        {statCards.map((stat, idx) => (
          <Col sm={6} lg={3} key={idx}>
            <Card
              className="border-0 rounded-4 bg-white h-100"
              style={{
                borderBottom: `4px solid ${stat.borderColor}`,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Card.Body className="p-3 p-xl-4 d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center fs-4 flex-shrink-0"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: stat.iconBg
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <span className="text-muted small fw-semibold d-block">{stat.label}</span>
                  <h3 className="text-dark fw-bold mb-0 lh-1 mt-1">{stat.value}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Table Card */}
      <Card
        className="border-0 rounded-4 overflow-hidden bg-white mt-4"
        style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)' }}
      >
        {/* Filters and Search Bar */}
        <Card.Header className="bg-white p-4 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap gap-2">
            {filterTabs.map((tab) => {
              const isActive = filter === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="sm"
                  className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: isActive ? '#15803d' : '#ffffff',
                    color: isActive ? '#ffffff' : '#4b5563',
                    border: isActive ? '1px solid #15803d' : '1px solid #e5e7eb',
                    boxShadow: isActive ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setFilter(tab.key)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>

          <div style={{ minWidth: '250px', maxWidth: '300px', flexGrow: 1 }}>
            <InputGroup className="rounded-pill overflow-hidden border bg-light">
              <InputGroup.Text className="bg-light text-muted border-0 ps-3">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by Req ID, title..."
                className="bg-light border-0 shadow-none ps-0 small py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>

        <Card.Body className="px-4 pb-4 pt-0">
          <div className="table-responsive rounded-3">
            <Table hover className="align-middle mb-0 text-nowrap" style={{ cursor: 'pointer' }}>
              <thead>
                <tr>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold rounded-start" style={{ backgroundColor: '#dcfce7' }}>Req ID</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Role</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Title &amp; Category</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Location</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Valid Until</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Offers &amp; Matches</th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>Status</th>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold text-center rounded-end" style={{ backgroundColor: '#dcfce7' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.length > 0 ? (
                  filteredRequests.map((req) => {
                    const matchCount = getMatchCount(req);
                    const offerCount = req.offers ? req.offers.length : 0;
                    const isBuyer = req.requestType === 'Buyer';

                    // Status Badge Styling & Display Label logic
                    let statusBg = 'warning';
                    let statusClass = 'rounded-pill px-3 py-2 text-dark fw-semibold';
                    let statusIcon = '🟡 ';
                    let statusLabel = req.status;

                    if (req.status.includes('Fulfilled') || req.status.includes('Accepted')) {
                      statusBg = 'success';
                      statusClass = 'rounded-pill px-3 py-2 text-white fw-semibold';
                      statusIcon = '✅ ';
                    } else if (req.status.includes('Partial')) {
                      statusBg = 'info';
                      statusClass = 'rounded-pill px-3 py-2 text-dark fw-semibold';
                      statusIcon = '🔄 ';
                    } else if (req.status.includes('Pending') && matchCount > 0) {
                      statusBg = 'primary';
                      statusClass = 'rounded-pill px-3 py-2 text-white fw-semibold';
                      statusIcon = '⚡ ';
                      statusLabel = 'Matches Found';
                    }

                    return (
                      <tr
                        key={req.id}
                        style={{ cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}
                        onClick={() => navigate(`/request/${req.id}`)}
                      >
                        <td className="px-4 py-3 fw-semibold text-secondary small">{req.id}</td>
                        <td className="py-3">
                          <span
                            className="px-3 py-1 rounded-pill fw-semibold small d-inline-flex align-items-center gap-1"
                            style={{
                              backgroundColor: isBuyer ? '#eff6ff' : '#ecfdf5',
                              color: isBuyer ? '#2563eb' : '#15803d',
                              border: `1px solid ${isBuyer ? '#dbeafe' : '#d1fae5'}`
                            }}
                          >
                            <span>{isBuyer ? '🛒' : '🚜'}</span>
                            <span>{req.requestType}</span>
                          </span>
                        </td>
                        <td className="py-3">
                          <div className="fw-bold" style={{ color: '#15803d' }}>{req.title}</div>
                          <small className="text-muted">{req.category}</small>
                        </td>
                        <td className="py-3 small fw-medium">📍 {req.location}</td>
                        <td className="py-3 small fw-medium text-secondary">📅 {req.biddingEndTime}</td>
                        <td className="py-3">
                          <div className="d-flex align-items-center gap-2">
                            <span
                              className="px-3 py-1 rounded-pill small fw-semibold d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: offerCount > 0 ? '#e0f2fe' : '#f1f5f9',
                                color: offerCount > 0 ? '#0369a1' : '#475569'
                              }}
                            >
                              <span>📩</span>
                              <span>{offerCount} Offers</span>
                            </span>

                            <span
                              className="px-3 py-1 rounded-pill small fw-bold d-inline-flex align-items-center gap-1"
                              style={{
                                backgroundColor: matchCount > 0 ? '#f97316' : '#f1f5f9',
                                color: matchCount > 0 ? '#ffffff' : '#64748b',
                                boxShadow:
                                  matchCount > 0
                                    ? '0 3px 10px rgba(249, 115, 22, 0.32)'
                                    : 'none'
                              }}
                            >
                              <span>⚡</span>
                              <span>{matchCount} Matches</span>
                            </span>
                          </div>
                        </td>
                        <td className="py-3">
                          <Badge bg={statusBg} className={statusClass}>
                            {statusIcon}{statusLabel}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                          <Dropdown drop="start">
                            <Dropdown.Toggle
                              variant="light"
                              size="sm"
                              className="rounded-circle border d-inline-flex align-items-center justify-content-center p-0 shadow-none text-muted"
                              style={{ width: '34px', height: '34px', backgroundColor: '#ffffff' }}
                            >
                              ⋮
                            </Dropdown.Toggle>
                            <Dropdown.Menu className="shadow border-0 rounded-3">
                              <Dropdown.Item onClick={() => navigate(`/request/${req.id}`)}>
                                📄 View Details
                              </Dropdown.Item>
                              <Dropdown.Divider />
                              <Dropdown.Item
                                className="text-danger fw-semibold"
                                onClick={(e) => handleOpenDeleteModal(e, req)}
                              >
                                🗑️ Cancel Advertisement
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
                      No advertisements found matching your filters.
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
            Are you sure you want to cancel advertisement <strong>{requestToDelete?.id}</strong> ({requestToDelete?.title})? This action cannot be undone.
          </p>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Keep Advertisement
          </Button>
          <Button variant="danger" className="fw-bold" onClick={handleConfirmDelete}>
            Yes, Cancel Advertisement 🗑️
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default MyRequests;