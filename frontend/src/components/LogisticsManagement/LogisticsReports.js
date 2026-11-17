import React, { useState, useEffect } from 'react';
import { 
  Card, Row, Col, Table, Badge, Button, Tabs, Tab, 
  ProgressBar, Spinner, InputGroup, Form 
} from 'react-bootstrap';
import { getLogisticsAnalytics } from '../../services/shipmentService';

const LogisticsReports = ({ showToast }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('completed');
  const [searchTerm, setSearchTerm] = useState('');

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await getLogisticsAnalytics();
      setData(res);
    } catch (err) {
      console.error('Failed to load reports:', err);
      showToast?.('Error loading analytics reports', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Export CSV Helper
  const handleExportCSV = (reportType) => {
    if (!data) return;
    let csvContent = "data:text/csv;charset=utf-8,";

    if (reportType === 'completed') {
      csvContent += "Tracking Number,Order Title,Sender City,Recipient City,Driver,Actual Delivery,Proof Verified\n";
      data.completedShipments.forEach(s => {
        csvContent += `"${s.trackingNumber}","${s.orderTitle}","${s.sender?.city}","${s.recipient?.city}","${s.assignedDriver?.name || 'N/A'}","${s.actualDelivery ? new Date(s.actualDelivery).toLocaleString() : ''}","${s.proofOfDelivery?.isVerified ? 'Yes' : 'No'}"\n`;
      });
    } else if (reportType === 'delayed') {
      csvContent += "Tracking Number,Order Title,Status,Priority,Estimated Delivery,Delay Reason,Driver\n";
      data.delayedShipments.forEach(s => {
        csvContent += `"${s.trackingNumber}","${s.orderTitle}","${s.status}","${s.priority}","${new Date(s.estimatedDelivery).toLocaleString()}","${s.delayReason || 'Transit delay'}","${s.assignedDriver?.name || 'Unassigned'}"\n`;
      });
    } else if (reportType === 'drivers') {
      csvContent += "Driver Name,Phone,Vehicle,Assigned Deliveries,Completed,Delayed,On-Time Rate,Rating\n";
      data.driverMetrics.forEach(d => {
        csvContent += `"${d.name}","${d.phone}","${d.vehicleType}",${d.totalAssigned},${d.completedCount},${d.delayedCount},"${d.onTimePercentage}%",${d.rating}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `AgriBridge_${reportType}_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="logistics-reports-container pb-5">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-success mb-1 d-flex align-items-center gap-2">
            📊 Operational Logistics Report Generator
          </h3>
          <p className="text-muted small mb-0">
            Audit-grade performance metrics, shipment delivery turnaround, delay tracking, and driver SLAs.
          </p>
        </div>
        <div className="d-flex gap-2">
          <Button variant="outline-dark" onClick={handlePrint}>
            🖨️ Print Report
          </Button>
          <Button variant="success" onClick={() => handleExportCSV(activeTab)}>
            📥 Export CSV ({activeTab.toUpperCase()})
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="success" />
          <div className="mt-2 text-muted small">Generating analytics reports...</div>
        </div>
      ) : data ? (
        <>
          {/* Executive Summary Cards */}
          <Row className="g-3 mb-4">
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm p-3 bg-white text-center">
                <div className="small text-muted fw-bold">TOTAL COMPLETED</div>
                <div className="fs-2 fw-bold text-success mt-1">{data.summary?.completedCount || 0}</div>
                <div className="small text-muted">Deliveries with PoD verified</div>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm p-3 bg-white text-center border-start border-danger border-4">
                <div className="small text-danger fw-bold">DELAYED DELIVERIES</div>
                <div className="fs-2 fw-bold text-danger mt-1">{data.summary?.delayedCount || 0}</div>
                <div className="small text-danger">Schedule breached</div>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm p-3 bg-white text-center">
                <div className="small text-muted fw-bold">ACTIVE LOGISTICS CORRIDORS</div>
                <div className="fs-2 fw-bold text-primary mt-1">{data.summary?.activeCount || 0}</div>
                <div className="small text-muted">Shipments currently in-transit</div>
              </Card>
            </Col>
            <Col xs={6} md={3}>
              <Card className="border-0 shadow-sm p-3 bg-white text-center">
                <div className="small text-muted fw-bold">REGISTERED DRIVERS</div>
                <div className="fs-2 fw-bold text-dark mt-1">{data.summary?.totalDrivers || 0}</div>
                <div className="small text-success fw-semibold">
                  {data.summary?.activeDriversCount || 0} available for dispatch
                </div>
              </Card>
            </Col>
          </Row>

          {/* Search bar inside reports */}
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-3">
              <InputGroup>
                <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Filter records in report table..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>
            </Card.Body>
          </Card>

          {/* Report Tabs */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <Tabs
                activeKey={activeTab}
                onSelect={(k) => setActiveTab(k)}
                className="mb-4"
              >
                {/* 1. Completed Deliveries Report */}
                <Tab eventKey="completed" title={`✅ Completed Deliveries (${data.completedShipments?.length || 0})`}>
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th>Tracking Code</th>
                          <th>Produce Order</th>
                          <th>Route</th>
                          <th>Driver Assigned</th>
                          <th>Delivered Timestamp</th>
                          <th>Proof of Delivery</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.completedShipments
                          ?.filter(s => !searchTerm || s.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) || s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((s) => (
                            <tr key={s._id}>
                              <td>
                                <strong className="text-success">{s.trackingNumber}</strong>
                              </td>
                              <td>
                                <div className="fw-semibold">{s.orderTitle}</div>
                                <div className="small text-muted">{s.packageDetails?.quantity} {s.packageDetails?.unit}</div>
                              </td>
                              <td>
                                {s.sender?.city} ➔ {s.recipient?.city}
                                <div className="small text-muted">~{s.routeOptimization?.distanceKm || 120} km</div>
                              </td>
                              <td>
                                {s.assignedDriver?.name || 'Dedicated Partner'}
                                <div className="small text-muted">{s.assignedDriver?.vehicleType}</div>
                              </td>
                              <td>
                                {s.actualDelivery ? new Date(s.actualDelivery).toLocaleString() : 'Recently'}
                              </td>
                              <td>
                                <Badge bg="success" className="p-2">
                                  ✓ OTP Verified ({s.proofOfDelivery?.otp})
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

                {/* 2. Delayed Shipments Report */}
                <Tab eventKey="delayed" title={`⚠️ Delayed Shipments (${data.delayedShipments?.length || 0})`}>
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th>Tracking Code</th>
                          <th>Produce Order</th>
                          <th>Status</th>
                          <th>Priority</th>
                          <th>Scheduled ETA</th>
                          <th>Delay Cause / Reason</th>
                          <th>Driver & Contact</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.delayedShipments
                          ?.filter(s => !searchTerm || s.orderTitle.toLowerCase().includes(searchTerm.toLowerCase()) || s.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((s) => (
                            <tr key={s._id}>
                              <td>
                                <strong className="text-danger">{s.trackingNumber}</strong>
                              </td>
                              <td>
                                <div className="fw-semibold">{s.orderTitle}</div>
                                <div className="small text-muted">{s.packageDetails?.quantity} {s.packageDetails?.unit}</div>
                              </td>
                              <td>
                                <Badge bg="warning" className="text-dark">{s.status}</Badge>
                              </td>
                              <td>
                                <Badge bg={s.priority === 'Express' ? 'danger' : 'secondary'}>{s.priority}</Badge>
                              </td>
                              <td>
                                <span className="text-danger fw-semibold">
                                  {new Date(s.estimatedDelivery).toLocaleString()}
                                </span>
                              </td>
                              <td>
                                <div className="text-danger small fw-semibold">
                                  {s.delayReason || 'Transit bottleneck / schedule overdue'}
                                </div>
                              </td>
                              <td>
                                {s.assignedDriver?.name || 'Unassigned'}
                                {s.assignedDriver?.phone && (
                                  <div className="small text-muted">{s.assignedDriver.phone}</div>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>

                {/* 3. Driver Performance Metrics */}
                <Tab eventKey="drivers" title={`🚛 Driver Performance Metrics (${data.driverMetrics?.length || 0})`}>
                  <div className="table-responsive">
                    <Table hover align="middle" className="mb-0">
                      <thead className="table-light small text-uppercase">
                        <tr>
                          <th>Driver Name</th>
                          <th>Assigned Vehicle</th>
                          <th>Total Deliveries</th>
                          <th>Completed</th>
                          <th>On-Time Rate %</th>
                          <th>Customer Rating</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.driverMetrics
                          ?.filter(d => !searchTerm || d.name.toLowerCase().includes(searchTerm.toLowerCase()))
                          .map((d) => (
                            <tr key={d.driverId}>
                              <td>
                                <div className="fw-bold">{d.name}</div>
                                <div className="small text-muted">📞 {d.phone}</div>
                              </td>
                              <td>
                                <div>{d.vehicleType}</div>
                                <div className="small text-muted">{d.vehicleNumber}</div>
                              </td>
                              <td>
                                <strong>{d.totalAssigned}</strong>
                              </td>
                              <td>
                                <span className="text-success fw-bold">{d.completedCount}</span>
                              </td>
                              <td style={{ minWidth: '150px' }}>
                                <div className="d-flex justify-content-between small fw-bold mb-1">
                                  <span>{d.onTimePercentage}%</span>
                                  <span className="text-muted">{d.delayedCount} delayed</span>
                                </div>
                                <ProgressBar 
                                  now={d.onTimePercentage} 
                                  variant={d.onTimePercentage >= 90 ? 'success' : d.onTimePercentage >= 75 ? 'warning' : 'danger'} 
                                  style={{ height: '6px' }}
                                />
                              </td>
                              <td>
                                <div className="text-warning fw-bold">
                                  ★ {d.rating}
                                </div>
                              </td>
                              <td>
                                <Badge bg={d.currentStatus === 'Available' ? 'success' : d.currentStatus === 'On Delivery' ? 'primary' : 'secondary'}>
                                  {d.currentStatus}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </Table>
                  </div>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </>
      ) : null}
    </div>
  );
};

export default LogisticsReports;
