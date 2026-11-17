import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Badge, Button, Form, InputGroup, 
  ProgressBar, Alert, Spinner, ListGroup 
} from 'react-bootstrap';
import { useLocation } from 'react-router-dom';
import { trackShipment, getAllShipments, verifyProofOfDelivery } from '../../services/shipmentService';

const ShipmentTracking = ({ showToast }) => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialTrk = queryParams.get('trk') || '';

  const [trackingNumber, setTrackingNumber] = useState(initialTrk);
  const [shipment, setShipment] = useState(null);
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Proof of Delivery verification form
  const [otpInput, setOtpInput] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Load recent tracking IDs for quick access
  useEffect(() => {
    const loadRecent = async () => {
      try {
        const list = await getAllShipments();
        setRecentShipments(list.slice(0, 5));
        if (initialTrk) {
          handleSearch(initialTrk);
        } else if (list.length > 0) {
          // Default to first active shipment
          setTrackingNumber(list[0].trackingNumber);
          handleSearch(list[0].trackingNumber);
        }
      } catch (err) {
        console.error('Error fetching recent shipments:', err);
      }
    };
    loadRecent();
  }, [initialTrk]);

  const handleSearch = async (trkCode) => {
    const code = trkCode || trackingNumber;
    if (!code || !code.trim()) return;

    try {
      setLoading(true);
      setError('');
      const data = await trackShipment(code.trim());
      setShipment(data);
    } catch (err) {
      setShipment(null);
      setError(err.response?.data?.error || `Tracking ID "${code}" not found.`);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpInput.trim() || !shipment) return;

    try {
      setVerifyLoading(true);
      const res = await verifyProofOfDelivery(shipment._id, {
        otp: otpInput.trim(),
        recipientSignature: shipment.recipient?.name || 'Verified Recipient',
        notes: 'Confirmed via Live Tracking Portal'
      });
      showToast?.('Delivery verified successfully!', 'success');
      setShipment(res.shipment);
      setOtpInput('');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Invalid OTP code', 'danger');
    } finally {
      setVerifyLoading(false);
    }
  };

  const getStepProgress = (status) => {
    switch (status) {
      case 'Pending': return 15;
      case 'Dispatched': return 45;
      case 'In-Transit': return 75;
      case 'Delivered': return 100;
      default: return 0;
    }
  };

  const isStepDone = (stepStatus, currentStatus) => {
    const order = ['Pending', 'Dispatched', 'In-Transit', 'Delivered'];
    return order.indexOf(currentStatus) >= order.indexOf(stepStatus);
  };

  return (
    <div className="shipment-tracking-container pb-5">
      {/* Title */}
      <div className="mb-4">
        <h3 className="fw-bold text-success mb-1 d-flex align-items-center gap-2">
          📍 Real-Time Agricultural Shipment & Freight Tracking
        </h3>
        <p className="text-muted small mb-0">
          Track live dispatch progress, driver milestones, temperature-controlled delivery, and proof of delivery.
        </p>
      </div>

      {/* Tracking Input Card */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-4">
          <Form onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
            <Row className="g-2">
              <Col md={9}>
                <InputGroup size="lg">
                  <InputGroup.Text className="bg-white border-end-0">📦</InputGroup.Text>
                  <Form.Control
                    type="text"
                    placeholder="Enter Tracking ID (e.g. TRK-2026-88401)..."
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="border-start-0 fw-semibold"
                  />
                </InputGroup>
              </Col>
              <Col md={3}>
                <Button 
                  variant="success" 
                  size="lg" 
                  type="submit" 
                  className="w-100 fw-bold shadow-sm"
                  disabled={loading}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : 'Track Package 🚀'}
                </Button>
              </Col>
            </Row>
          </Form>

          {/* Quick Select Buttons */}
          {recentShipments.length > 0 && (
            <div className="mt-3 d-flex flex-wrap align-items-center gap-2">
              <span className="small text-muted fw-semibold">Recent Packages:</span>
              {recentShipments.map(s => (
                <Button
                  key={s._id}
                  variant={trackingNumber === s.trackingNumber ? 'success' : 'outline-secondary'}
                  size="sm"
                  className="py-1 px-2 text-decoration-none"
                  style={{ fontSize: '0.8rem' }}
                  onClick={() => {
                    setTrackingNumber(s.trackingNumber);
                    handleSearch(s.trackingNumber);
                  }}
                >
                  {s.trackingNumber} ({s.packageDetails?.category})
                </Button>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      {/* Error Message */}
      {error && (
        <Alert variant="danger" className="shadow-sm">
          ⚠️ {error}
        </Alert>
      )}

      {/* Tracking Result View */}
      {shipment && (
        <Row className="g-4">
          {/* Main Visual Stepper & Progress */}
          <Col lg={8}>
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white py-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <span className="small text-muted">Tracking Code:</span>
                  <h5 className="fw-bold text-success mb-0">{shipment.trackingNumber}</h5>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <Badge bg={shipment.priority === 'Express' ? 'danger' : 'warning'} className="p-2">
                    {shipment.priority} Priority
                  </Badge>
                  <Badge bg={shipment.status === 'Delivered' ? 'success' : 'primary'} className="p-2 fs-6">
                    {shipment.status}
                  </Badge>
                  {shipment.isDelayed && (
                    <Badge bg="danger" className="p-2 fs-6">
                      ⚠️ Delayed
                    </Badge>
                  )}
                </div>
              </Card.Header>

              <Card.Body className="p-4">
                {/* Visual Stepper */}
                <div className="mb-4">
                  <ProgressBar 
                    now={getStepProgress(shipment.status)} 
                    variant={shipment.status === 'Delivered' ? 'success' : 'primary'} 
                    style={{ height: '8px' }} 
                    className="mb-3"
                  />

                  <Row className="text-center g-1">
                    <Col xs={3}>
                      <div className={`fw-bold small ${isStepDone('Pending', shipment.status) ? 'text-success' : 'text-muted'}`}>
                        {isStepDone('Pending', shipment.status) ? '✅' : '⚪'} 1. Pending
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Order Registered</div>
                    </Col>
                    <Col xs={3}>
                      <div className={`fw-bold small ${isStepDone('Dispatched', shipment.status) ? 'text-success' : 'text-muted'}`}>
                        {isStepDone('Dispatched', shipment.status) ? '✅' : '⚪'} 2. Dispatched
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Driver Assigned</div>
                    </Col>
                    <Col xs={3}>
                      <div className={`fw-bold small ${isStepDone('In-Transit', shipment.status) ? 'text-primary' : 'text-muted'}`}>
                        {isStepDone('In-Transit', shipment.status) ? '🚛' : '⚪'} 3. In-Transit
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.72rem' }}>On Delivery Route</div>
                    </Col>
                    <Col xs={3}>
                      <div className={`fw-bold small ${isStepDone('Delivered', shipment.status) ? 'text-success' : 'text-muted'}`}>
                        {isStepDone('Delivered', shipment.status) ? '🤝' : '⚪'} 4. Delivered
                      </div>
                      <div className="small text-muted" style={{ fontSize: '0.72rem' }}>Handover Verified</div>
                    </Col>
                  </Row>
                </div>

                {/* Delay Alert if any */}
                {shipment.isDelayed && (
                  <Alert variant="danger" className="small py-2 mb-4">
                    <strong>Transit Alert:</strong> {shipment.delayReason || 'Transit schedule is behind schedule due to highway conditions.'}
                  </Alert>
                )}

                {/* Route Waypoints Overview */}
                <div className="p-3 bg-light rounded mb-4 border">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-bold small text-dark">
                      🗺️ Optimized Logistics Corridor (~{shipment.routeOptimization?.distanceKm || 140} km)
                    </span>
                    <span className="small text-muted">
                      Estimated Duration: {Math.round((shipment.routeOptimization?.estimatedDurationMinutes || 180) / 60)} hours
                    </span>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    {shipment.routeOptimization?.optimizedRoute?.map((wp, idx) => (
                      <Badge key={idx} bg="white" className="text-dark border p-2 fw-normal">
                        📍 {wp}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Milestone Audit Timeline */}
                <h6 className="fw-bold text-dark mb-3">🕒 Real-Time Status & Audit Milestones</h6>
                <div className="timeline-container ps-3 border-start border-3 border-success">
                  {shipment.trackingTimeline?.slice().reverse().map((event, idx) => (
                    <div key={idx} className="mb-3 position-relative ps-3">
                      <div 
                        className="position-absolute bg-success rounded-circle" 
                        style={{ width: '10px', height: '10px', left: '-20px', top: '5px' }}
                      />
                      <div className="d-flex justify-content-between align-items-center">
                        <strong className="text-success">{event.status} — {event.location}</strong>
                        <small className="text-muted">{new Date(event.timestamp).toLocaleString()}</small>
                      </div>
                      <div className="text-secondary small mt-1">{event.note}</div>
                      <div className="small text-muted" style={{ fontSize: '0.75rem' }}>Updated by: {event.updatedBy}</div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Right Sidebar: Driver & Proof of Delivery */}
          <Col lg={4}>
            {/* Driver Profile Card */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white py-3 fw-bold text-dark">
                🚛 Assigned Driver & Vehicle
              </Card.Header>
              <Card.Body className="p-3">
                {shipment.assignedDriver?.name ? (
                  <div>
                    <div className="d-flex align-items-center gap-3 mb-3">
                      <div 
                        className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-4"
                        style={{ width: '50px', height: '50px' }}
                      >
                        {shipment.assignedDriver.name.charAt(0)}
                      </div>
                      <div>
                        <h6 className="fw-bold mb-0">{shipment.assignedDriver.name}</h6>
                        <span className="small text-muted">Certified Logistics Partner</span>
                        <div className="small text-warning">★★★★★ 4.9 Rating</div>
                      </div>
                    </div>

                    <ListGroup variant="flush" className="small">
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Vehicle Type:</span>
                        <strong>{shipment.assignedDriver.vehicleType || 'Cargo Lorry'}</strong>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">License Plate:</span>
                        <strong>{shipment.assignedDriver.vehicleNumber || 'WP-LB-9482'}</strong>
                      </ListGroup.Item>
                      <ListGroup.Item className="px-0 py-2 d-flex justify-content-between">
                        <span className="text-muted">Driver Contact:</span>
                        <a href={`tel:${shipment.assignedDriver.phone}`} className="text-success fw-bold text-decoration-none">
                          📞 {shipment.assignedDriver.phone}
                        </a>
                      </ListGroup.Item>
                    </ListGroup>
                  </div>
                ) : (
                  <div className="text-center py-3 text-muted">
                    <p className="small mb-2">No driver assigned yet.</p>
                    <Badge bg="warning" className="text-dark">Awaiting Dispatch Assignment</Badge>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Proof of Delivery (PoD) Section */}
            <Card className="border-0 shadow-sm mb-4">
              <Card.Header className="bg-white py-3 fw-bold text-success d-flex justify-content-between align-items-center">
                <span>✍️ Proof of Delivery (PoD)</span>
                {shipment.proofOfDelivery?.isVerified ? (
                  <Badge bg="success">Verified & Closed</Badge>
                ) : (
                  <Badge bg="warning" className="text-dark">Pending Sign-off</Badge>
                )}
              </Card.Header>
              <Card.Body className="p-3">
                {shipment.proofOfDelivery?.isVerified ? (
                  <div>
                    <div className="text-center py-2 mb-2 text-success">
                      <div className="fs-1">🤝</div>
                      <div className="fw-bold">Package Successfully Delivered!</div>
                      <small className="text-muted">
                        Verified at: {new Date(shipment.proofOfDelivery.verifiedAt).toLocaleString()}
                      </small>
                    </div>
                    <div className="small p-2 bg-light rounded border">
                      <div><strong>Sign-off:</strong> {shipment.proofOfDelivery.recipientSignature || 'Verified'}</div>
                      {shipment.proofOfDelivery.notes && (
                        <div><strong>Remarks:</strong> {shipment.proofOfDelivery.notes}</div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="bg-light p-3 rounded mb-3 text-center border">
                      <div className="small text-muted">Delivery Security Code (OTP):</div>
                      <div className="fs-3 fw-bold text-success letter-spacing-2">
                        {shipment.proofOfDelivery?.otp || '492815'}
                      </div>
                      <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                        Share this code with the delivery driver upon receiving produce.
                      </small>
                    </div>

                    <Form onSubmit={handleVerifyOtp}>
                      <Form.Group className="mb-2">
                        <Form.Label className="small fw-bold">Recipient Handover Verification</Form.Label>
                        <InputGroup size="sm">
                          <Form.Control
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value)}
                            required
                          />
                          <Button variant="success" type="submit" disabled={verifyLoading}>
                            {verifyLoading ? 'Verifying...' : 'Confirm PoD'}
                          </Button>
                        </InputGroup>
                      </Form.Group>
                    </Form>
                  </div>
                )}
              </Card.Body>
            </Card>

            {/* Sender & Recipient Summary */}
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white py-3 fw-bold text-dark">
                📋 Contact & Destination Summary
              </Card.Header>
              <Card.Body className="p-3 small">
                <div className="mb-2">
                  <span className="text-muted d-block">Origin (Seller/Farmgate):</span>
                  <strong>{shipment.sender?.name}</strong> • {shipment.sender?.phone}
                  <div className="text-muted">{shipment.sender?.pickupAddress}, {shipment.sender?.city}</div>
                </div>
                <hr className="my-2" />
                <div>
                  <span className="text-muted d-block">Destination (Buyer/Depot):</span>
                  <strong>{shipment.recipient?.name}</strong> • {shipment.recipient?.phone}
                  <div className="text-muted">{shipment.recipient?.deliveryAddress}, {shipment.recipient?.city}</div>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
};

export default ShipmentTracking;
