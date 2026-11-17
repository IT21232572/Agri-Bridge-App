import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Nav, Toast, ToastContainer, Button, Dropdown, Badge } from 'react-bootstrap';
import { useRequestContext } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    clearSelectedRequest,
    fetchRequests,
    toastInfo,
    setToastInfo,
    notifications = [],
    handleMarkNotificationsRead
  } = useRequestContext();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNavClick = () => {
    clearSelectedRequest();
    fetchRequests();
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleBellToggle = (isOpen) => {
    if (isOpen && unreadCount > 0 && handleMarkNotificationsRead) {
      handleMarkNotificationsRead();
    }
  };

  return (
    <div className="d-flex bg-light" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div 
        className="d-flex flex-column text-white p-3 shadow" 
        style={{ width: '280px', backgroundColor: '#0f3d24', height: '100vh', flexShrink: 0 }}
      >
        <div className="d-flex align-items-center mb-4 px-2 pt-2">
          <span className="fs-4 fw-bold text-white d-flex align-items-center gap-2">
            🌱 Agri-Bridge
          </span>
        </div>

        <Nav className="flex-column gap-2 mb-auto">
          <Nav.Link 
            as={Link} 
            to="/hub" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${location.pathname === '/hub' || location.pathname === '/' ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            🛒 Request & Supply Hub
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/my-requests" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${location.pathname === '/my-requests' ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            My Requests & Matches
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/my-offers" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${location.pathname === '/my-offers' ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            Sent Offers
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/add" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${location.pathname === '/add' ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            ➕ Create Advertisement
          </Nav.Link>
        </Nav>

        <hr className="text-secondary" />
        <div className="px-2 pb-2">
          <small className="text-white-50 d-block">Help & Support</small>
          <span className="small fw-semibold text-white">support@agribridge.lk</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column h-100">
        
        {/* Top Header */}
        <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted small">
              Welcome back, <strong>{user ? user.name : 'Guest'}</strong>
            </span>
          </div>
          <div className="d-flex align-items-center gap-3">
            {user ? (
              <>
                {/* Notification Bell Dropdown */}
                <Dropdown align="end" onToggle={handleBellToggle}>
                  <Dropdown.Toggle
                    variant="light"
                    size="sm"
                    className="position-relative border-0 bg-light rounded-circle p-2"
                    id="notification-bell-dropdown"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <Badge
                        bg="danger"
                        pill
                        className="position-absolute top-0 start-100 translate-middle"
                        style={{ fontSize: '0.65rem' }}
                      >
                        {unreadCount}
                      </Badge>
                    )}
                  </Dropdown.Toggle>

                  <Dropdown.Menu className="shadow border-0 rounded-4 p-2" style={{ width: '320px', maxHeight: '360px', overflowY: 'auto' }}>
                    <div className="px-3 py-2 border-bottom d-flex justify-content-between align-items-center">
                      <strong className="small text-dark">Notifications</strong>
                      <small className="text-muted">{notifications.length} total</small>
                    </div>

                    {notifications.length > 0 ? (
                      notifications.map((notif, idx) => (
                        <Dropdown.Item
                          key={notif._id || idx}
                          className="py-2 px-3 rounded-3 text-wrap border-bottom"
                          onClick={() => {
                            handleNavClick();
                            navigate('/my-offers');
                          }}
                        >
                          <div className="fw-bold small text-success">{notif.title}</div>
                          <div className="small text-secondary">{notif.message}</div>
                          {notif.createdAt && (
                            <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                              {new Date(notif.createdAt).toLocaleString()}
                            </small>
                          )}
                        </Dropdown.Item>
                      ))
                    ) : (
                      <div className="text-center py-4 text-muted small">
                        No notifications yet.
                      </div>
                    )}
                  </Dropdown.Menu>
                </Dropdown>

                <div 
                  className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                  style={{ width: '35px', height: '35px' }}
                  title={user.email}
                >
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <Button variant="outline-danger" size="sm" className="fw-semibold" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <Link to="/login" className="btn btn-success btn-sm fw-semibold px-3">
                Login / Register
              </Link>
            )}
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      {/* Global Toast Notification */}
      <ToastContainer position="bottom-end" className="p-3" style={{ zIndex: 9999 }}>
        <Toast 
          onClose={() => setToastInfo({ ...toastInfo, show: false })} 
          show={toastInfo.show} 
          delay={3500} 
          autohide
          bg={toastInfo.bg}
        >
          <Toast.Body className="text-white fw-bold">
            {toastInfo.message}
          </Toast.Body>
        </Toast>
      </ToastContainer>
    </div>
  );
};

export default MainLayout;