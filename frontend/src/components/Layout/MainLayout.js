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

  const navItems = [
    {
      path: '/hub',
      label: '🛒 Request & Supply Hub',
      isActive: location.pathname === '/hub' || location.pathname === '/'
    },
    {
      path: '/my-requests',
      label: 'My Requests & Matches',
      isActive: location.pathname === '/my-requests'
    },
    {
      path: '/my-offers',
      label: 'Sent Offers',
      isActive: location.pathname === '/my-offers'
    }
  ];

  return (
    <div className="d-flex bg-light" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div 
        className="d-flex flex-column text-white py-4 px-3 shadow position-relative" 
        style={{ width: '280px', backgroundColor: '#0b321d', height: '100vh', flexShrink: 0 }}
      >
        {/* Brand Header with Rounded Orange Icon Box */}
        <div className="d-flex align-items-center gap-3 mb-4 px-2 pt-1">
          <div
            className="d-flex align-items-center justify-content-center shadow-sm"
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              fontSize: '1.25rem',
              flexShrink: 0
            }}
          >
            🌱
          </div>
          <span className="fs-4 fw-bold text-white" style={{ letterSpacing: '-0.3px' }}>
            Agri-Bridge
          </span>
        </div>

        {/* Navigation Links */}
        <Nav className="flex-column gap-2 mt-2">
          {navItems.map((item) => (
            <div key={item.path} className="position-relative">
              {/* Left-edge vertical accent bar for active item */}
              {item.isActive && (
                <span
                  style={{
                    position: 'absolute',
                    left: '-16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '5px',
                    height: '26px',
                    backgroundColor: '#f97316',
                    borderRadius: '0 6px 6px 0',
                    boxShadow: '0 0 10px rgba(249, 115, 22, 0.7)'
                  }}
                />
              )}

              <Nav.Link
                as={Link}
                to={item.path}
                onClick={handleNavClick}
                className="px-3 py-3 fw-semibold d-flex align-items-center"
                style={{
                  borderRadius: '12px',
                  color: item.isActive ? '#ffffff' : 'rgba(255, 255, 255, 0.85)',
                  backgroundColor: item.isActive ? 'rgba(255, 255, 255, 0.14)' : 'transparent',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  if (!item.isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.07)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!item.isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'rgba(255, 255, 255, 0.85)';
                  }
                }}
              >
                {item.label}
              </Nav.Link>
            </div>
          ))}
        </Nav>

        {/* High-Visibility Create Advertisement CTA Button */}
        <div className="mt-4 mb-auto">
          <Button
            as={Link}
            to="/add"
            onClick={handleNavClick}
            className="w-100 py-3 fw-bold text-white border-0 d-flex align-items-center justify-content-center gap-2"
            style={{
              borderRadius: '14px',
              background: location.pathname === '/add'
                ? 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)'
                : 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              boxShadow: '0 6px 18px rgba(249, 115, 22, 0.38)',
              fontSize: '0.98rem',
              transition: 'transform 0.18s ease, box-shadow 0.18s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 10px 24px rgba(249, 115, 22, 0.52)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 6px 18px rgba(249, 115, 22, 0.38)';
            }}
          >
            <span className="fs-5 lh-1">+</span>
            <span>Create Advertisement</span>
          </Button>
        </div>

        <hr style={{ borderColor: 'rgba(255, 255, 255, 0.15)' }} />
        <div className="px-2 pb-1">
          <small className="text-white-50 d-block">Help &amp; Support</small>
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