import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge, Tab, Tabs } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { updateUserProfile } from '../../services/authService';

const DISTRICTS = [
  'Colombo', 'Gampaha', 'Kalutara', 'Kandy', 'Matale', 'Nuwara Eliya',
  'Dambulla', 'Kurunegala', 'Anuradhapura', 'Polonnaruwa', 'Badulla',
  'Monaragala', 'Ratnapura', 'Galle', 'Matara', 'Hambantota', 'Jaffna'
];

const ProfilePage = ({ showToast }) => {
  const { currentUser, login, register, logout, quickSwitchRole, setCurrentUser } = useAuth();

  const [activeTab, setActiveTab] = useState('profile');
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    location: { address: '', city: 'Colombo', district: 'Colombo' },
    driverDetails: {
      vehicleType: 'Refrigerated Truck',
      vehicleNumber: '',
      licenseNumber: '',
      currentStatus: 'Available'
    }
  });

  // Login form
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('password123');

  // Register form
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Buyer',
    phone: '',
    location: { address: '', city: 'Colombo', district: 'Colombo' }
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || '',
        location: {
          address: currentUser.location?.address || '',
          city: currentUser.location?.city || 'Colombo',
          district: currentUser.location?.district || 'Colombo'
        },
        driverDetails: {
          vehicleType: currentUser.driverDetails?.vehicleType || 'Refrigerated Truck',
          vehicleNumber: currentUser.driverDetails?.vehicleNumber || '',
          licenseNumber: currentUser.driverDetails?.licenseNumber || '',
          currentStatus: currentUser.driverDetails?.currentStatus || 'Available'
        }
      });
    }
  }, [currentUser]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await updateUserProfile(profileForm);
      showToast?.('Profile updated successfully!', 'success');
      if (res.user) setCurrentUser(res.user);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Profile update failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await login(loginEmail, loginPassword);
      showToast?.('Logged in successfully!', 'success');
      setActiveTab('profile');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Login failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await register(regForm);
      showToast?.('Account created and logged in!', 'success');
      setActiveTab('profile');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Registration failed', 'danger');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-page-container pb-5">
      {/* Title */}
      <div className="mb-4">
        <h3 className="fw-bold text-success mb-1 d-flex align-items-center gap-2">
          👤 User Account, Profile & Role Management
        </h3>
        <p className="text-muted small mb-0">
          Control your authentication credentials, update profile and location, and manage logistics partner details.
        </p>
      </div>

      {/* Quick Role Switcher Banner */}
      <Card className="border-0 shadow-sm mb-4 bg-light">
        <Card.Body className="p-3">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
            <div>
              <span className="fw-bold small text-dark d-block">🧪 Quick Role Demo Switcher</span>
              <span className="small text-muted">Instantly switch active session role for testing & demonstration:</span>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button 
                variant={currentUser?.role === 'Admin' ? 'danger' : 'outline-danger'} 
                size="sm" 
                onClick={() => { quickSwitchRole('Admin'); showToast?.('Switched to Admin Manager', 'success'); }}
              >
                👑 Admin
              </Button>
              <Button 
                variant={currentUser?.role === 'Driver' ? 'primary' : 'outline-primary'} 
                size="sm" 
                onClick={() => { quickSwitchRole('Driver'); showToast?.('Switched to Express Driver', 'success'); }}
              >
                🚛 Driver
              </Button>
              <Button 
                variant={currentUser?.role === 'Seller' ? 'success' : 'outline-success'} 
                size="sm" 
                onClick={() => { quickSwitchRole('Seller'); showToast?.('Switched to Produce Seller', 'success'); }}
              >
                🌱 Seller
              </Button>
              <Button 
                variant={currentUser?.role === 'Buyer' ? 'info' : 'outline-info'} 
                size="sm" 
                className="text-dark"
                onClick={() => { quickSwitchRole('Buyer'); showToast?.('Switched to Wholesale Buyer', 'success'); }}
              >
                🛒 Buyer
              </Button>
            </div>
          </div>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm">
        <Card.Body className="p-4">
          <Tabs activeKey={activeTab} onSelect={(k) => setActiveTab(k)} className="mb-4">
            <Tab eventKey="profile" title="📋 Current Account Profile">
              {currentUser ? (
                <Form onSubmit={handleUpdateProfile}>
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <div className="d-flex align-items-center gap-3">
                      <div 
                        className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-3"
                        style={{ width: '60px', height: '60px' }}
                      >
                        {currentUser.name?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <h5 className="fw-bold mb-0">{currentUser.name}</h5>
                        <div className="text-muted small">{currentUser.email}</div>
                        <Badge bg={currentUser.role === 'Admin' ? 'danger' : currentUser.role === 'Driver' ? 'primary' : 'success'} className="mt-1">
                          Role: {currentUser.role}
                        </Badge>
                      </div>
                    </div>
                    <Button variant="outline-danger" size="sm" onClick={logout}>
                      🚪 Logout
                    </Button>
                  </div>

                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileForm.name}
                          onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Contact Phone Number</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileForm.phone}
                          onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Operating District</Form.Label>
                        <Form.Select
                          value={profileForm.location.district}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            location: { ...profileForm.location, district: e.target.value, city: e.target.value }
                          })}
                        >
                          {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label className="small fw-bold">Address / Street</Form.Label>
                        <Form.Control
                          type="text"
                          value={profileForm.location.address}
                          onChange={(e) => setProfileForm({
                            ...profileForm,
                            location: { ...profileForm.location, address: e.target.value }
                          })}
                        />
                      </Form.Group>
                    </Col>

                    {/* Driver-Specific fields */}
                    {currentUser.role === 'Driver' && (
                      <Col md={12}>
                        <div className="p-3 bg-light rounded mt-3 border">
                          <h6 className="fw-bold text-primary mb-3">🚛 Logistics Fleet & Vehicle Settings</h6>
                          <Row className="g-3">
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">Vehicle Classification</Form.Label>
                                <Form.Select
                                  value={profileForm.driverDetails.vehicleType}
                                  onChange={(e) => setProfileForm({
                                    ...profileForm,
                                    driverDetails: { ...profileForm.driverDetails, vehicleType: e.target.value }
                                  })}
                                >
                                  <option value="Refrigerated Truck">Refrigerated Truck (Cold Chain)</option>
                                  <option value="Heavy Lorry">Heavy Lorry (Bulk Freight)</option>
                                  <option value="Light Truck">Light Truck</option>
                                  <option value="Pickup Van">Pickup Van</option>
                                  <option value="Three-Wheeler">Three-Wheeler (Short Haul)</option>
                                </Form.Select>
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">Vehicle License Plate</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={profileForm.driverDetails.vehicleNumber}
                                  placeholder="e.g. WP-LB-9482"
                                  onChange={(e) => setProfileForm({
                                    ...profileForm,
                                    driverDetails: { ...profileForm.driverDetails, vehicleNumber: e.target.value }
                                  })}
                                />
                              </Form.Group>
                            </Col>
                            <Col md={4}>
                              <Form.Group>
                                <Form.Label className="small fw-bold">Driving License Number</Form.Label>
                                <Form.Control
                                  type="text"
                                  value={profileForm.driverDetails.licenseNumber}
                                  placeholder="e.g. B-3829104"
                                  onChange={(e) => setProfileForm({
                                    ...profileForm,
                                    driverDetails: { ...profileForm.driverDetails, licenseNumber: e.target.value }
                                  })}
                                />
                              </Form.Group>
                            </Col>
                          </Row>
                        </div>
                      </Col>
                    )}

                    <Col md={12} className="text-end mt-4">
                      <Button variant="success" type="submit" disabled={loading} className="px-4 fw-semibold">
                        {loading ? 'Saving...' : '💾 Save Profile Updates'}
                      </Button>
                    </Col>
                  </Row>
                </Form>
              ) : (
                <div className="text-center py-4">
                  <p>You are not logged in.</p>
                  <Button variant="success" onClick={() => setActiveTab('login')}>Go to Login</Button>
                </div>
              )}
            </Tab>

            {/* Tab 2: Login */}
            <Tab eventKey="login" title="🔑 Sign In to Existing Account">
              <Form onSubmit={handleLoginSubmit} style={{ maxWidth: '480px' }} className="mx-auto py-3">
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="e.g. admin@agribridge.lk"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold">Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                  <Form.Text className="text-muted">
                    Demo accounts password: <code>password123</code>
                  </Form.Text>
                </Form.Group>
                <Button variant="success" type="submit" className="w-100 fw-bold" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </Form>
            </Tab>

            {/* Tab 3: Register */}
            <Tab eventKey="register" title="➕ Register New Account">
              <Form onSubmit={handleRegisterSubmit} style={{ maxWidth: '600px' }} className="mx-auto py-3">
                <Row className="g-3">
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Full Name *</Form.Label>
                      <Form.Control
                        type="text"
                        value={regForm.name}
                        onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Email Address *</Form.Label>
                      <Form.Control
                        type="email"
                        value={regForm.email}
                        onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Password *</Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="At least 6 characters"
                        value={regForm.password}
                        onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Role & Access Level *</Form.Label>
                      <Form.Select
                        value={regForm.role}
                        onChange={(e) => setRegForm({ ...regForm, role: e.target.value })}
                      >
                        <option value="Buyer">Buyer / Merchant</option>
                        <option value="Seller">Seller / Farmer</option>
                        <option value="Driver">Driver / Logistics Partner</option>
                        <option value="Admin">Administrator</option>
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Contact Phone Number *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="+94 7X XXX XXXX"
                        value={regForm.phone}
                        onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group>
                      <Form.Label className="small fw-bold">Operating District</Form.Label>
                      <Form.Select
                        value={regForm.location.district}
                        onChange={(e) => setRegForm({
                          ...regForm,
                          location: { ...regForm.location, district: e.target.value, city: e.target.value }
                        })}
                      >
                        {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                      </Form.Select>
                    </Form.Group>
                  </Col>
                  <Col md={12}>
                    <Button variant="success" type="submit" className="w-100 fw-bold mt-2" disabled={loading}>
                      {loading ? 'Creating Account...' : 'Complete Registration'}
                    </Button>
                  </Col>
                </Row>
              </Form>
            </Tab>
          </Tabs>
        </Card.Body>
      </Card>
    </div>
  );
};

export default ProfilePage;
