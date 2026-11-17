import React, { useState, useEffect } from 'react';
import { Modal, Form, InputGroup, Badge, Spinner, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { unifiedSearch } from '../../services/shipmentService';

const GlobalSearchModal = ({ show, onHide }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const data = await unifiedSearch(searchTerm.trim());
        setResults(data);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectShipment = (trackingNumber) => {
    onHide();
    navigate(`/tracking?trk=${trackingNumber}`);
  };

  const handleSelectUser = () => {
    onHide();
    navigate('/users');
  };

  const handleSelectOrder = () => {
    onHide();
    navigate('/hub');
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fw-bold fs-5 text-success d-flex align-items-center gap-2">
          🔍 Unified Search Engine
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-2">
        <p className="text-muted small mb-3">
          Search across <strong>Users</strong>, <strong>Drivers</strong>, <strong>Orders/Requests</strong>, and <strong>Deliveries</strong> in real-time.
        </p>

        <InputGroup className="mb-3 shadow-sm">
          <InputGroup.Text className="bg-white border-end-0 fs-5">🔎</InputGroup.Text>
          <Form.Control
            type="text"
            placeholder="Type a user name, driver, commodity, location, or tracking ID (e.g. Colombo, Sunil, TRK, Mango)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border-start-0 py-2"
            autoFocus
          />
          {loading && (
            <InputGroup.Text className="bg-white">
              <Spinner animation="border" size="sm" variant="success" />
            </InputGroup.Text>
          )}
        </InputGroup>

        {results && (
          <div className="search-results-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
            <div className="d-flex justify-content-between align-items-center mb-2 px-1">
              <span className="small text-muted">
                Found <strong>{results.totalMatches}</strong> total results for "{results.query}"
              </span>
            </div>

            {results.totalMatches === 0 ? (
              <div className="text-center py-4 text-muted">
                No matching records found. Try another search term.
              </div>
            ) : (
              <Row className="g-3">
                {/* 1. Deliveries & Shipments */}
                {results.shipments?.length > 0 && (
                  <Col md={12}>
                    <Card className="border-0 shadow-sm bg-light">
                      <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-2">
                        <span>🚚 Deliveries & Shipments</span>
                        <Badge bg="success">{results.shipments.length}</Badge>
                      </Card.Header>
                      <Card.Body className="p-2">
                        {results.shipments.map((s) => (
                          <div
                            key={s._id}
                            className="p-2 mb-1 bg-white rounded border d-flex justify-content-between align-items-center"
                            style={{ cursor: 'pointer' }}
                            onClick={() => handleSelectShipment(s.trackingNumber)}
                          >
                            <div>
                              <strong className="text-success">{s.trackingNumber}</strong> — {s.orderTitle}
                              <div className="small text-muted">
                                {s.sender?.city} ➔ {s.recipient?.city} • Driver: {s.assignedDriver?.name || 'Unassigned'}
                              </div>
                            </div>
                            <div className="text-end">
                              <Badge bg={s.status === 'Delivered' ? 'success' : s.status === 'In-Transit' ? 'primary' : 'warning'}>
                                {s.status}
                              </Badge>
                              {s.isDelayed && <Badge bg="danger" className="ms-1">Delayed</Badge>}
                            </div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                )}

                {/* 2. Drivers */}
                {results.drivers?.length > 0 && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm bg-light h-100">
                      <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-2">
                        <span>🚛 Drivers & Logistics</span>
                        <Badge bg="info">{results.drivers.length}</Badge>
                      </Card.Header>
                      <Card.Body className="p-2">
                        {results.drivers.map((d) => (
                          <div
                            key={d._id}
                            className="p-2 mb-1 bg-white rounded border"
                            style={{ cursor: 'pointer' }}
                            onClick={handleSelectUser}
                          >
                            <div className="fw-semibold">{d.name}</div>
                            <div className="small text-muted">
                              {d.driverDetails?.vehicleType} ({d.driverDetails?.vehicleNumber || 'No plate'}) • {d.location?.city}
                            </div>
                            <div className="small mt-1 d-flex justify-content-between">
                              <span className="text-warning">★ {d.driverDetails?.rating || 5.0}</span>
                              <Badge bg={d.driverDetails?.isAvailable ? 'success' : 'secondary'}>
                                {d.driverDetails?.currentStatus || 'Available'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                )}

                {/* 3. Users */}
                {results.users?.length > 0 && (
                  <Col md={6}>
                    <Card className="border-0 shadow-sm bg-light h-100">
                      <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-2">
                        <span>👥 Registered Users</span>
                        <Badge bg="secondary">{results.users.length}</Badge>
                      </Card.Header>
                      <Card.Body className="p-2">
                        {results.users.map((u) => (
                          <div
                            key={u._id}
                            className="p-2 mb-1 bg-white rounded border"
                            style={{ cursor: 'pointer' }}
                            onClick={handleSelectUser}
                          >
                            <div className="fw-semibold">{u.name}</div>
                            <div className="small text-muted">{u.email} • {u.location?.city || 'Sri Lanka'}</div>
                            <Badge bg="dark" className="mt-1">{u.role}</Badge>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                )}

                {/* 4. Requests & Orders */}
                {results.orders?.length > 0 && (
                  <Col md={12}>
                    <Card className="border-0 shadow-sm bg-light">
                      <Card.Header className="bg-white fw-bold d-flex justify-content-between align-items-center py-2">
                        <span>📦 Agricultural Orders & Posts</span>
                        <Badge bg="dark">{results.orders.length}</Badge>
                      </Card.Header>
                      <Card.Body className="p-2">
                        {results.orders.map((o) => (
                          <div
                            key={o._id}
                            className="p-2 mb-1 bg-white rounded border d-flex justify-content-between align-items-center"
                            style={{ cursor: 'pointer' }}
                            onClick={handleSelectOrder}
                          >
                            <div>
                              <strong>{o.id || 'REQ'}</strong>: {o.title} ({o.category})
                              <div className="small text-muted">{o.location} • {o.quantity} kg • LKR {o.startingPrice}</div>
                            </div>
                            <Badge bg="success">{o.status}</Badge>
                          </div>
                        ))}
                      </Card.Body>
                    </Card>
                  </Col>
                )}
              </Row>
            )}
          </div>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default GlobalSearchModal;
