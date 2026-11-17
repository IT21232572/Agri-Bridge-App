import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Badge, Button, Form, Modal, 
  InputGroup, Alert, Spinner, Dropdown 
} from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { 
  getAllShipments, createShipment, assignDriver, 
  autoAssignDriver, updateShipmentStatus, verifyProofOfDelivery 
} from '../../services/shipmentService';
import { getAllDrivers } from '../../services/authService';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Dambulla', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Galle', 'Matara', 'Hambantota', 'Jaffna'
];

const LogisticsDashboard = ({ showToast }) => {
  const navigate = useNavigate();
  const [shipments, setShipments] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [delayedOnly, setDelayedOnly] = useState(false);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPodModal, setShowPodModal] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Form states
  const [newShipment, setNewShipment] = useState({
    orderTitle: '',
    orderId: '',
    sender: { name: '', phone: '', pickupAddress: '', city: 'Dambulla', district: 'Matale' },
    recipient: { name: '', phone: '', deliveryAddress: '', city: 'Colombo', district: 'Colombo' },
    packageDetails: { category: 'Vegetables', quantity: 100, unit: 'kg', weightKg: 100, specialHandling: 'Perishable / Keep Cool' },
    priority: 'Standard',
    estimatedDeliveryHours: 24
  });

  const [selectedDriverId, setSelectedDriverId] = useState('');
  const [statusUpdateForm, setStatusUpdateForm] = useState({
    status: '',
    location: '',
    note: '',
    delayReason: ''
  });
  const [podForm, setPodForm] = useState({ otp: '', signature: '', notes: '' });
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [shipmentsData, driversData] = await Promise.all([
        getAllShipments(),
        getAllDrivers()
      ]);
      setShipments(shipmentsData);
      setDrivers(driversData);
    } catch (err) {
      console.error('Failed to load logistics data:', err);
      showToast?.('Error fetching logistics data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtered shipments
  const filteredShipments = shipments.filter(s => {
    if (statusFilter !== 'All' && s.status !== statusFilter) return false;
    if (priorityFilter !== 'All' && s.priority !== priorityFilter) return false;
    if (delayedOnly && !s.isDelayed) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        s.trackingNumber?.toLowerCase().includes(q) ||
        s.orderTitle?.toLowerCase().includes(q) ||
        s.sender?.city?.toLowerCase().includes(q) ||
        s.recipient?.city?.toLowerCase().includes(q) ||
        s.assignedDriver?.name?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });

  // KPI Calculations
  const totalCount = shipments.length;
  const pendingCount = shipments.filter(s => s.status === 'Pending').length;
  const inTransitCount = shipments.filter(s => ['Dispatched', 'In-Transit'].includes(s.status)).length;
  const deliveredCount = shipments.filter(s => s.status === 'Delivered').length;
  const delayedCount = shipments.filter(s => s.isDelayed).length;
  const availableDriversCount = drivers.filter(d => d.driverDetails?.isAvailable).length;

  // Handle New Shipment Submit
  const handleCreateShipment = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await createShipment(newShipment);
      showToast?.('Shipment created and scheduled successfully!', 'success');
      setShowCreateModal(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to create shipment', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Smart Auto-Assignment
  const handleAutoAssign = async (shipmentId) => {
    try {
      setActionLoading(true);
      const res = await autoAssignDriver(shipmentId);
      showToast?.(res.message || 'Driver auto-assigned via AI optimization!', 'success');
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Auto-assignment failed', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Manual Driver Assignment
  const handleManualAssign = async (e) => {
    e.preventDefault();
    if (!selectedDriverId) return;
    try {
      setActionLoading(true);
      await assignDriver(selectedShipment._id, selectedDriverId);
      showToast?.('Driver assigned successfully', 'success');
      setShowAssignModal(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to assign driver', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Status Transition
  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await updateShipmentStatus(selectedShipment._id, statusUpdateForm);
      showToast?.('Shipment status updated', 'success');
      setShowStatusModal(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Status update failed', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle Proof of Delivery (PoD)
  const handleVerifyPoD = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      await verifyProofOfDelivery(selectedShipment._id, {
        otp: podForm.otp,
        recipientSignature: podForm.signature || 'Digital Sign-off',
        notes: podForm.notes
      });
      showToast?.('Delivery verified! Proof of delivery recorded.', 'success');
      setShowPodModal(false);
      fetchData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Proof of delivery verification failed', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Delivered': return <Badge bg="success">Delivered 🤝</Badge>;
      case 'In-Transit': return <Badge bg="primary">In-Transit 🚛</Badge>;
      case 'Dispatched': return <Badge bg="info" className="text-dark">Dispatched 📦</Badge>;
      case 'Pending': return <Badge bg="warning" className="text-dark">Pending Match ⏳</Badge>;
      default: return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'Express': return <Badge bg="danger">⚡ Express</Badge>;
      case 'Urgent': return <Badge bg="warning" className="text-dark">🔥 Urgent</Badge>;
      default: return <Badge bg="light" className="text-dark border">Standard</Badge>;
    }
  };

  return (
    <div className="logistics-dashboard pb-5">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-success mb-1 d-flex align-items-center gap-2">
            🚚 Logistics & Order Dispatch Operations
          </h3>
          <p className="text-muted small mb-0">
            Real-time agricultural freight management, route optimization, driver assignment & tracking.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-success" onClick={() => navigate('/tracking')}>
            📍 Live Tracker
          </Button>
          <Button variant="outline-dark" onClick={() => navigate('/logistics-reports')}>
            📊 Report Generator
          </Button>
          <Button variant="success" className="shadow-sm fw-semibold" onClick={() => setShowCreateModal(true)}>
            ➕ Create Shipment
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white">
            <div className="text-muted small fw-semibold">TOTAL SHIPMENTS</div>
            <div className="fs-3 fw-bold text-dark mt-1">{totalCount}</div>
            <div className="text-muted small">Registered</div>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white">
            <div className="text-muted small fw-semibold">PENDING MATCH</div>
            <div className="fs-3 fw-bold text-warning mt-1">{pendingCount}</div>
            <div className="text-muted small">Awaiting driver</div>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white">
            <div className="text-muted small fw-semibold">IN-TRANSIT</div>
            <div className="fs-3 fw-bold text-primary mt-1">{inTransitCount}</div>
            <div className="text-muted small">On the road</div>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white">
            <div className="text-muted small fw-semibold">COMPLETED</div>
            <div className="fs-3 fw-bold text-success mt-1">{deliveredCount}</div>
            <div className="text-muted small">Verified PoD</div>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white border-start border-danger border-4">
            <div className="text-danger small fw-semibold">DELAYED ALERTS</div>
            <div className="fs-3 fw-bold text-danger mt-1">{delayedCount}</div>
            <div className="text-danger small">Schedule exceeded</div>
          </Card>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Card className="border-0 shadow-sm text-center p-3 h-100 bg-white">
            <div className="text-muted small fw-semibold">FLEET READY</div>
            <div className="fs-3 fw-bold text-info mt-1">{availableDriversCount}</div>
            <div className="text-muted small">Drivers online</div>
          </Card>
        </Col>
      </Row>

      {/* Filter and Search Bar */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            <Col md={4}>
              <InputGroup>
                <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search tracking #, commodity, city, driver..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Delivered">Delivered</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
                <option value="All">All Priorities</option>
                <option value="Standard">Standard</option>
                <option value="Urgent">Urgent</option>
                <option value="Express">Express</option>
              </Form.Select>
            </Col>
            <Col xs={6} md={2}>
              <Form.Check
                type="switch"
                id="delayed-filter"
                label="Delayed Only"
                checked={delayedOnly}
                onChange={(e) => setDelayedOnly(e.target.checked)}
                className="fw-semibold text-danger"
              />
            </Col>
            <Col xs={6} md={2} className="text-end">
              <Button variant="outline-secondary" size="sm" onClick={() => {
                setStatusFilter('All');
                setPriorityFilter('All');
                setSearchQuery('');
                setDelayedOnly(false);
              }}>
                Reset Filters
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Shipments Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center">
          <span className="fw-bold text-dark">
            Shipments & Dispatch Console ({filteredShipments.length})
          </span>
          <span className="small text-muted">
            Algorithm-optimized routing with Sri Lankan agricultural corridors
          </span>
        </Card.Header>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <div className="mt-2 text-muted small">Loading shipments...</div>
          </div>
        ) : filteredShipments.length === 0 ? (
          <div className="text-center py-5 text-muted">
            No shipments match the current filters.
          </div>
        ) : (
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Tracking ID</th>
                  <th>Produce / Order</th>
                  <th>Route & Distance</th>
                  <th>Assigned Driver</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredShipments.map((s) => (
                  <tr key={s._id}>
                    <td>
                      <Link 
                        to={`/tracking?trk=${s.trackingNumber}`}
                        className="fw-bold text-success text-decoration-none"
                      >
                        {s.trackingNumber}
                      </Link>
                      <div className="small text-muted">
                        {new Date(s.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold">{s.orderTitle}</div>
                      <div className="small text-muted">
                        {s.packageDetails?.quantity} {s.packageDetails?.unit} • {s.packageDetails?.specialHandling}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{s.sender?.city}</strong> ➔ <strong>{s.recipient?.city}</strong>
                      </div>
                      <div className="small text-muted">
                        ~{s.routeOptimization?.distanceKm || 120} km ({Math.round((s.routeOptimization?.estimatedDurationMinutes || 180) / 60)} hrs)
                      </div>
                    </td>
                    <td>
                      {s.assignedDriver?.name ? (
                        <div>
                          <div className="fw-semibold">{s.assignedDriver.name}</div>
                          <div className="small text-muted">
                            {s.assignedDriver.vehicleType} • {s.assignedDriver.phone}
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="text-warning small fw-bold">Unassigned</span>
                          <div className="mt-1">
                            <Button 
                              variant="outline-success" 
                              size="sm" 
                              className="py-0 px-2"
                              style={{ fontSize: '0.75rem' }}
                              onClick={() => handleAutoAssign(s._id)}
                              disabled={actionLoading}
                            >
                              ⚡ Smart Auto-Assign
                            </Button>
                          </div>
                        </div>
                      )}
                    </td>
                    <td>
                      {getStatusBadge(s.status)}
                      {s.isDelayed && (
                        <div className="mt-1">
                          <Badge bg="danger" className="p-1">⚠️ Delayed</Badge>
                        </div>
                      )}
                    </td>
                    <td>{getPriorityBadge(s.priority)}</td>
                    <td>
                      <Dropdown align="end">
                        <Dropdown.Toggle variant="light" size="sm" className="border shadow-sm">
                          ⚙️ Options
                        </Dropdown.Toggle>
                        <Dropdown.Menu>
                          <Dropdown.Item onClick={() => navigate(`/tracking?trk=${s.trackingNumber}`)}>
                            📍 Live Package Tracking
                          </Dropdown.Item>

                          {s.status !== 'Delivered' && (
                            <>
                              <Dropdown.Divider />
                              <Dropdown.Item onClick={() => handleAutoAssign(s._id)}>
                                ⚡ Smart Auto-Assign Driver (AI)
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => {
                                setSelectedShipment(s);
                                setShowAssignModal(true);
                              }}>
                                👤 Manual Driver Assignment
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => {
                                setSelectedShipment(s);
                                setStatusUpdateForm({
                                  status: s.status,
                                  location: s.recipient?.city || 'Transit Checkpoint',
                                  note: '',
                                  delayReason: s.delayReason || ''
                                });
                                setShowStatusModal(true);
                              }}>
                                🔄 Update Status & Checkpoint
                              </Dropdown.Item>
                              <Dropdown.Item onClick={() => {
                                setSelectedShipment(s);
                                setPodForm({ otp: '', signature: '', notes: '' });
                                setShowPodModal(true);
                              }}>
                                ✍️ Confirm Proof of Delivery (PoD)
                              </Dropdown.Item>
                            </>
                          )}
                        </Dropdown.Menu>
                      </Dropdown>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* MODAL 1: Create New Shipment */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">➕ Create New Agricultural Shipment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleCreateShipment}>
          <Modal.Body>
            <Row className="g-3">
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Shipment Title / Commodity Description *</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. 500kg Premium Willard Mangoes" 
                    value={newShipment.orderTitle}
                    onChange={(e) => setNewShipment({ ...newShipment, orderTitle: e.target.value })}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Order / Request Reference ID</Form.Label>
                  <Form.Control 
                    type="text" 
                    placeholder="e.g. REQ-379 (optional)" 
                    value={newShipment.orderId}
                    onChange={(e) => setNewShipment({ ...newShipment, orderId: e.target.value })}
                  />
                </Form.Group>
              </Col>

              <Col md={12}><hr className="my-1" /><h6 className="fw-bold text-success mb-2">📍 Origin (Farmer / Seller)</h6></Col>
              
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Sender Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.sender.name}
                    onChange={(e) => setNewShipment({ ...newShipment, sender: { ...newShipment.sender, name: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Sender Contact Phone *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.sender.phone}
                    onChange={(e) => setNewShipment({ ...newShipment, sender: { ...newShipment.sender, phone: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Pickup District</Form.Label>
                  <Form.Select 
                    value={newShipment.sender.district}
                    onChange={(e) => setNewShipment({ 
                      ...newShipment, 
                      sender: { ...newShipment.sender, district: e.target.value, city: e.target.value } 
                    })}
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Pickup Address / Farm Location *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.sender.pickupAddress}
                    onChange={(e) => setNewShipment({ ...newShipment, sender: { ...newShipment.sender, pickupAddress: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>

              <Col md={12}><hr className="my-1" /><h6 className="fw-bold text-primary mb-2">🏁 Destination (Buyer / Recipient)</h6></Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Recipient Name *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.recipient.name}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient: { ...newShipment.recipient, name: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Recipient Contact Phone *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.recipient.phone}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient: { ...newShipment.recipient, phone: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Delivery District</Form.Label>
                  <Form.Select 
                    value={newShipment.recipient.district}
                    onChange={(e) => setNewShipment({ 
                      ...newShipment, 
                      recipient: { ...newShipment.recipient, district: e.target.value, city: e.target.value } 
                    })}
                  >
                    {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Delivery Address *</Form.Label>
                  <Form.Control 
                    type="text" 
                    value={newShipment.recipient.deliveryAddress}
                    onChange={(e) => setNewShipment({ ...newShipment, recipient: { ...newShipment.recipient, deliveryAddress: e.target.value } })}
                    required 
                  />
                </Form.Group>
              </Col>

              <Col md={12}><hr className="my-1" /><h6 className="fw-bold text-dark mb-2">📦 Package & Transport Specifications</h6></Col>

              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Weight (kg)</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={newShipment.packageDetails.weightKg}
                    onChange={(e) => setNewShipment({ 
                      ...newShipment, 
                      packageDetails: { 
                        ...newShipment.packageDetails, 
                        weightKg: Number(e.target.value),
                        quantity: Number(e.target.value)
                      } 
                    })}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Produce Handling Requirement</Form.Label>
                  <Form.Select 
                    value={newShipment.packageDetails.specialHandling}
                    onChange={(e) => setNewShipment({ 
                      ...newShipment, 
                      packageDetails: { ...newShipment.packageDetails, specialHandling: e.target.value } 
                    })}
                  >
                    <option value="Perishable / Keep Cool">Perishable / Keep Cool (Refrigerated)</option>
                    <option value="Heavy Load">Heavy Load (Lorry Required)</option>
                    <option value="Standard">Standard Agricultural Freight</option>
                    <option value="Fragile">Fragile / Handled with Care</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Priority Level</Form.Label>
                  <Form.Select 
                    value={newShipment.priority}
                    onChange={(e) => setNewShipment({ ...newShipment, priority: e.target.value })}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Urgent">Urgent</option>
                    <option value="Express">Express</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="small fw-bold">Est. Hours</Form.Label>
                  <Form.Control 
                    type="number" 
                    value={newShipment.estimatedDeliveryHours}
                    onChange={(e) => setNewShipment({ ...newShipment, estimatedDeliveryHours: Number(e.target.value) })}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={actionLoading}>
              {actionLoading ? 'Creating...' : 'Create Shipment & Generate Tracking'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL 2: Manual Driver Assignment */}
      <Modal show={showAssignModal} onHide={() => setShowAssignModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Assign Driver to Shipment</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleManualAssign}>
          <Modal.Body>
            <p className="small text-muted">
              Assigning driver for <strong>{selectedShipment?.orderTitle}</strong> ({selectedShipment?.trackingNumber}).
            </p>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Select Active Driver</Form.Label>
              <Form.Select 
                value={selectedDriverId} 
                onChange={(e) => setSelectedDriverId(e.target.value)}
                required
              >
                <option value="">-- Choose an available driver --</option>
                {drivers.map(d => (
                  <option key={d._id} value={d._id}>
                    {d.name} — {d.driverDetails?.vehicleType} ({d.location?.city}) ★ {d.driverDetails?.rating || 5.0}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Alert variant="info" className="small">
              💡 Tip: You can also use the <strong>Smart Auto-Assign</strong> button to let the algorithm match the best driver automatically based on proximity and vehicle capacity.
            </Alert>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowAssignModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={actionLoading || !selectedDriverId}>
              Confirm Assignment
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL 3: Update Status & Checkpoint */}
      <Modal show={showStatusModal} onHide={() => setShowStatusModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Update Shipment Status</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleStatusUpdate}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">New Status</Form.Label>
              <Form.Select 
                value={statusUpdateForm.status}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, status: e.target.value })}
              >
                <option value="Pending">Pending</option>
                <option value="Dispatched">Dispatched</option>
                <option value="In-Transit">In-Transit</option>
                <option value="Delivered">Delivered</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Current Milestone Checkpoint / Location</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="e.g. Kurunegala Highway Interchange" 
                value={statusUpdateForm.location}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, location: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Status Update Note</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="e.g. Cargo inspected and moving smoothly towards Colombo"
                value={statusUpdateForm.note}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, note: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold text-danger">Delay Reason (if delayed)</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Leave blank if on schedule"
                value={statusUpdateForm.delayReason}
                onChange={(e) => setStatusUpdateForm({ ...statusUpdateForm, delayReason: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowStatusModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={actionLoading}>
              Save Milestone Update
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>

      {/* MODAL 4: Proof of Delivery (PoD) Confirmation */}
      <Modal show={showPodModal} onHide={() => setShowPodModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold text-success">✍️ Proof of Delivery Confirmation</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleVerifyPoD}>
          <Modal.Body>
            <div className="bg-light p-3 rounded mb-3">
              <div className="small text-muted">Tracking Code: <strong>{selectedShipment?.trackingNumber}</strong></div>
              <div className="small text-muted">Recipient: <strong>{selectedShipment?.recipient?.name}</strong> ({selectedShipment?.recipient?.phone})</div>
              <div className="small text-muted">
                System OTP generated for recipient: <strong className="text-success fs-6">{selectedShipment?.proofOfDelivery?.otp}</strong>
              </div>
            </div>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Enter Delivery Confirmation OTP *</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="6-digit OTP code"
                value={podForm.otp}
                onChange={(e) => setPodForm({ ...podForm, otp: e.target.value })}
                required
              />
              <Form.Text className="text-muted">
                Provided by the recipient to verify package handover.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Recipient Signature / Sign-off Name</Form.Label>
              <Form.Control 
                type="text" 
                placeholder="Recipient full name / digital sign-off"
                value={podForm.signature}
                onChange={(e) => setPodForm({ ...podForm, signature: e.target.value })}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Handover Remarks / Delivery Notes</Form.Label>
              <Form.Control 
                as="textarea" 
                rows={2} 
                placeholder="e.g. All produce crates inspected in fresh condition."
                value={podForm.notes}
                onChange={(e) => setPodForm({ ...podForm, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowPodModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={actionLoading}>
              Confirm Delivery & Close Order
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default LogisticsDashboard;
