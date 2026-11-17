import React, { useState, useEffect } from 'react';
import { 
  Card, Table, Badge, Button, Form, Row, Col, 
  InputGroup, Modal, Spinner, Tabs, Tab 
} from 'react-bootstrap';
import { getAllUsers, updateUserRole, updateDriverAvailability, deleteUser } from '../../services/authService';

const UserDirectory = ({ showToast }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [activeTab, setActiveTab] = useState('all-users');

  // Modal for changing user role
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newRole, setNewRole] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await getAllUsers();
      setUsers(data);
    } catch (err) {
      console.error('Failed to load users:', err);
      showToast?.('Error loading users list', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenRoleModal = (user) => {
    setSelectedUser(user);
    setNewRole(user.role);
    setNewStatus(user.status || 'Active');
    setShowRoleModal(true);
  };

  const handleSaveRole = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      setActionLoading(true);
      await updateUserRole(selectedUser._id, { role: newRole, status: newStatus });
      showToast?.(`User role updated to ${newRole} (${newStatus})`, 'success');
      setShowRoleModal(false);
      fetchUsers();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to update role', 'danger');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteUser = async (user) => {
    // STRICT SECURITY: Admin profiles cannot be deleted by anyone!
    if (user.role === 'Admin' || user.email === 'admin@agribridge.lk') {
      showToast?.('Security Violation: Admin profiles are permanently protected and cannot be deleted by anyone!', 'danger');
      return;
    }

    const confirm = window.confirm(`Are you sure you want to delete user account "${user.name}" (${user.email})?`);
    if (!confirm) return;

    try {
      await deleteUser(user._id);
      showToast?.(`User ${user.name} deleted successfully.`, 'success');
      fetchUsers();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Failed to delete user', 'danger');
    }
  };

  const handleToggleDriverStatus = async (driverId, currentStatus) => {
    const nextStatus = currentStatus === 'Available' ? 'Off Duty' : 'Available';
    try {
      await updateDriverAvailability(driverId, {
        currentStatus: nextStatus,
        isAvailable: nextStatus === 'Available'
      });
      showToast?.(`Driver status changed to ${nextStatus}`, 'success');
      fetchUsers();
    } catch (err) {
      showToast?.('Failed to update driver status', 'danger');
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const match = (
        u.name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q) ||
        u.phone?.toLowerCase().includes(q) ||
        u.location?.city?.toLowerCase().includes(q) ||
        u.driverDetails?.vehicleType?.toLowerCase().includes(q)
      );
      if (!match) return false;
    }
    return true;
  });

  const driversList = users.filter(u => u.role === 'Driver');

  const getRoleBadge = (role) => {
    switch (role) {
      case 'Admin': return <Badge bg="danger">Admin</Badge>;
      case 'Driver': return <Badge bg="primary">Driver / Logistics</Badge>;
      case 'Seller': return <Badge bg="success">Seller / Farmer</Badge>;
      case 'Buyer': return <Badge bg="info" className="text-dark">Buyer / Merchant</Badge>;
      default: return <Badge bg="secondary">{role}</Badge>;
    }
  };

  return (
    <div className="user-directory-container pb-5">
      {/* Title */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
          <h3 className="fw-bold text-success mb-1 d-flex align-items-center gap-2">
            👥 User & Driver Access Control Directory
          </h3>
          <p className="text-muted small mb-0">
            Manage user roles, permission levels (Admin, Driver, Seller, Buyer), account verification & fleet status.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Card className="border-0 shadow-sm mb-4">
        <Card.Body className="p-3">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-3">
            <Tab eventKey="all-users" title={`All Registered Users (${users.length})`} />
            <Tab eventKey="drivers" title={`🚛 Logistics Drivers Fleet (${driversList.length})`} />
          </Tabs>

          <Row className="g-2 align-items-center">
            <Col md={6}>
              <InputGroup>
                <InputGroup.Text className="bg-white">🔍</InputGroup.Text>
                <Form.Control
                  type="text"
                  placeholder="Search user by name, email, phone, city, or vehicle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </InputGroup>
            </Col>
            <Col md={3}>
              <Form.Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                <option value="All">All Permission Roles</option>
                <option value="Admin">Admin</option>
                <option value="Driver">Driver / Logistics Partner</option>
                <option value="Seller">Seller / Farmer</option>
                <option value="Buyer">Buyer</option>
              </Form.Select>
            </Col>
            <Col md={3} className="text-end">
              <Button variant="outline-secondary" size="sm" onClick={() => { setSearchQuery(''); setRoleFilter('All'); }}>
                Reset Filter
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Table Content */}
      <Card className="border-0 shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="success" />
            <div className="mt-2 text-muted small">Loading user directory...</div>
          </div>
        ) : activeTab === 'all-users' ? (
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>User Profile</th>
                  <th>Role & Permissions</th>
                  <th>Contact Phone</th>
                  <th>Location / District</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <div 
                          className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold"
                          style={{ width: '38px', height: '38px' }}
                        >
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="fw-semibold">{u.name}</div>
                          <div className="small text-muted">{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getRoleBadge(u.role)}</td>
                    <td>{u.phone}</td>
                    <td>
                      {u.location?.city || 'Sri Lanka'}
                      {u.location?.district && <div className="small text-muted">{u.location.district}</div>}
                    </td>
                    <td>
                      <Badge bg={u.status === 'Active' ? 'success' : 'danger'}>
                        {u.status || 'Active'}
                      </Badge>
                    </td>
                    <td>
                      <small className="text-muted">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </small>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-1">
                        <Button
                          variant="outline-dark"
                          size="sm"
                          onClick={() => handleOpenRoleModal(u)}
                          className="py-1 px-2"
                          style={{ fontSize: '0.8rem' }}
                        >
                          ⚙️ Edit
                        </Button>

                        {u.role === 'Admin' || u.email === 'admin@agribridge.lk' ? (
                          <Badge bg="light" className="text-danger border border-danger py-1 px-2" style={{ fontSize: '0.75rem' }} title="Admin profile is permanently protected from deletion">
                            🛡️ Protected (Cannot Delete)
                          </Badge>
                        ) : (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => handleDeleteUser(u)}
                            className="py-1 px-2"
                            style={{ fontSize: '0.8rem' }}
                            title="Delete this user"
                          >
                            🗑️ Delete
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          /* Drivers Fleet View */
          <div className="table-responsive">
            <Table hover align="middle" className="mb-0">
              <thead className="table-light small text-uppercase">
                <tr>
                  <th>Driver Name</th>
                  <th>Assigned Vehicle</th>
                  <th>Plate & License</th>
                  <th>Operating Hub</th>
                  <th>Performance Rating</th>
                  <th>Availability</th>
                  <th>Toggle Status</th>
                </tr>
              </thead>
              <tbody>
                {driversList.map((d) => (
                  <tr key={d._id}>
                    <td>
                      <div className="fw-bold">{d.name}</div>
                      <div className="small text-muted">{d.email} • {d.phone}</div>
                    </td>
                    <td>
                      <div className="fw-semibold">{d.driverDetails?.vehicleType || 'Cargo Lorry'}</div>
                    </td>
                    <td>
                      <Badge bg="light" className="text-dark border">
                        {d.driverDetails?.vehicleNumber || 'WP-LB-9482'}
                      </Badge>
                      <div className="small text-muted">Lic: {d.driverDetails?.licenseNumber || 'B-3829104'}</div>
                    </td>
                    <td>
                      {d.location?.city} ({d.location?.district})
                    </td>
                    <td>
                      <div className="text-warning fw-bold">
                        ★ {d.driverDetails?.rating || 4.9}
                      </div>
                      <div className="small text-muted">
                        {d.driverDetails?.totalDeliveries || 0} deliveries completed
                      </div>
                    </td>
                    <td>
                      <Badge bg={d.driverDetails?.isAvailable ? 'success' : 'secondary'}>
                        {d.driverDetails?.currentStatus || 'Available'}
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant={d.driverDetails?.isAvailable ? 'outline-danger' : 'outline-success'}
                        size="sm"
                        onClick={() => handleToggleDriverStatus(d._id, d.driverDetails?.currentStatus)}
                        className="py-0 px-2"
                        style={{ fontSize: '0.75rem' }}
                      >
                        {d.driverDetails?.isAvailable ? 'Mark Off-Duty' : 'Set Available'}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Card>

      {/* Edit Role Modal */}
      <Modal show={showRoleModal} onHide={() => setShowRoleModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="fw-bold">Manage User Role & Permission Level</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSaveRole}>
          <Modal.Body>
            <p className="small text-muted">
              Updating access level for <strong>{selectedUser?.name}</strong> ({selectedUser?.email}).
            </p>

            {(selectedUser?.role === 'Admin' || selectedUser?.email === 'admin@agribridge.lk') && (
              <div className="alert alert-warning small py-2 mb-3">
                🛡️ <strong>System Protection Active:</strong> Administrator profile is protected. Admin accounts cannot be deleted, suspended, or demoted.
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Select Role & Permissions</Form.Label>
              <Form.Select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                <option value="Admin">Admin (Full Control, Dispatch, Fleet & Audit)</option>
                <option value="Driver">Driver / Logistics Partner (Dispatch & Route Access)</option>
                <option value="Seller">Seller / Farmer (Create Shipments & Track Sales)</option>
                <option value="Buyer">Buyer / Merchant (Receive Shipments & Confirm PoD)</option>
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="small fw-bold">Account Verification Status</Form.Label>
              <Form.Select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                <option value="Active">Active (Permitted)</option>
                <option value="Suspended">Suspended (Access Blocked)</option>
              </Form.Select>
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowRoleModal(false)}>Cancel</Button>
            <Button variant="success" type="submit" disabled={actionLoading}>
              Save Changes
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
};

export default UserDirectory;
