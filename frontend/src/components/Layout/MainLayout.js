import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Toast, ToastContainer, Button, Badge } from 'react-bootstrap';
import { useRequestContext } from '../../context/RequestContext';
import { useAuth } from '../../context/AuthContext';
import GlobalSearchModal from '../LogisticsManagement/GlobalSearchModal';

const MainLayout = ({ children }) => {
  const location = useLocation();
  const [showSearchModal, setShowSearchModal] = useState(false);
  
  // Grab from contexts
  const { clearSelectedRequest, fetchRequests, toastInfo, setToastInfo } = useRequestContext();
  const { currentUser } = useAuth();

  const handleNavClick = () => {
    clearSelectedRequest();
    fetchRequests();
  };

  const isNavActive = (path) => {
    if (path === '/hub') {
      return location.pathname === '/hub' || location.pathname === '/';
    }
    return location.pathname === path;
  };

  return (
    <div className="d-flex bg-light" style={{ height: '100vh', overflow: 'hidden' }}>
      
      {/* Sidebar Navigation */}
      <div 
        className="d-flex flex-column text-white p-3 shadow" 
        style={{ width: '280px', backgroundColor: '#0f3d24', height: '100vh', flexShrink: 0, overflowY: 'auto' }}
      >
        <div className="d-flex align-items-center mb-3 px-2 pt-1">
          <span className="fs-4 fw-bold text-white d-flex align-items-center gap-2">
            🌱 Agri-Bridge
          </span>
        </div>

        {/* Search trigger button in sidebar */}
        <div className="px-2 mb-3">
          <Button 
            variant="outline-light" 
            size="sm" 
            className="w-100 text-start text-white-50 bg-dark bg-opacity-25 border-0 py-2 d-flex align-items-center gap-2"
            onClick={() => setShowSearchModal(true)}
          >
            <span>🔍</span>
            <span className="small">Search platform...</span>
          </Button>
        </div>

        <small className="text-white-50 text-uppercase px-3 mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          Marketplace
        </small>
        <Nav className="flex-column gap-1 mb-3">
          <Nav.Link 
            as={Link} 
            to="/hub" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/hub') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            🛒 Request & Supply Hub
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/my-requests" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/my-requests') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            📋 My Requests & Matches
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/add" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/add') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            ➕ Add Post
          </Nav.Link>
        </Nav>

        <small className="text-white-50 text-uppercase px-3 mb-1" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>
          Users & Logistics
        </small>
        <Nav className="flex-column gap-1 mb-auto">
          <Nav.Link 
            as={Link} 
            to="/logistics" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/logistics') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            🚚 Logistics & Dispatch
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/tracking" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/tracking') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            📍 Live Package Tracker
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/logistics-reports" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/logistics-reports') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            📊 Logistics Reports
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/users" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/users') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            👥 User & Driver Directory
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/profile" 
            onClick={handleNavClick}
            className={`text-white rounded py-2 px-3 fw-semibold ${isNavActive('/profile') ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            👤 My Profile & Roles
          </Nav.Link>
        </Nav>

        <hr className="text-secondary my-2" />
        <div className="px-2 pb-1">
          <small className="text-white-50 d-block">Logged in as:</small>
          <div className="small fw-bold text-white d-flex align-items-center justify-content-between">
            <span className="text-truncate" style={{ maxWidth: '160px' }}>
              {currentUser?.name || 'Admin Manager'}
            </span>
            <Badge bg="success" style={{ fontSize: '0.68rem' }}>
              {currentUser?.role || 'Admin'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column h-100">
        
        {/* Top Header */}
        <div className="bg-white border-bottom px-4 py-3 d-flex justify-content-between align-items-center shadow-sm" style={{ flexShrink: 0 }}>
          <div className="d-flex align-items-center gap-3">
            <Button 
              variant="light" 
              size="sm" 
              className="border d-flex align-items-center gap-2 text-muted px-3 py-1 rounded-pill"
              onClick={() => setShowSearchModal(true)}
            >
              <span>🔍</span>
              <span className="small">Search users, drivers, orders, shipments...</span>
              <Badge bg="secondary" className="ms-2">Ctrl+K</Badge>
            </Button>
          </div>

          <div className="d-flex align-items-center gap-3">
            <div className="text-end d-none d-md-block">
              <div className="small fw-bold text-dark">{currentUser?.name || 'Admin Manager'}</div>
              <div className="small text-muted" style={{ fontSize: '0.75rem' }}>
                {currentUser?.email || 'admin@agribridge.lk'} • <strong className="text-success">{currentUser?.role || 'Admin'}</strong>
              </div>
            </div>

            <Link to="/profile" className="text-decoration-none">
              <div 
                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" 
                style={{ width: '38px', height: '38px', cursor: 'pointer' }}
                title="View Profile"
              >
                {currentUser?.name?.charAt(0) || 'A'}
              </div>
            </Link>
          </div>
        </div>

        {/* Viewport Content */}
        <div className="p-4 flex-grow-1" style={{ overflowY: 'auto' }}>
          {children}
        </div>
      </div>

      {/* Global Search Modal */}
      <GlobalSearchModal show={showSearchModal} onHide={() => setShowSearchModal(false)} />

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
