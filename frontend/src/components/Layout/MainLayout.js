import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Nav, Toast, ToastContainer } from 'react-bootstrap';
import { useRequestContext } from '../../context/RequestContext';

const MainLayout = ({ children }) => {
  const location = useLocation();
  
  // Grab setSelectedRequest from the context
  const { clearSelectedRequest, fetchRequests, toastInfo, setToastInfo } = useRequestContext();

  const handleNavClick = () => {
    clearSelectedRequest(); // <-- This directly targets the raw state setter and clears it instantly!
    fetchRequests();
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
            📋 My Requests & Matches
          </Nav.Link>

          <Nav.Link 
            as={Link} 
            to="/add" 
            onClick={handleNavClick} // <-- Updated to use handleNavClick so it clears selectedRequest too!
            className={`text-white rounded py-2 px-3 fw-semibold ${location.pathname === '/add' ? 'bg-success shadow-sm' : ''}`}
            style={{ transition: 'all 0.2s' }}
          >
            ➕ Add Post
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
            <span className="text-muted small">Welcome back, <strong>My Profile</strong></span>
          </div>
          <div className="d-flex align-items-center gap-3">
            <span className="text-muted" style={{ cursor: 'pointer' }}>🔔</span>
            <div className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm" style={{ width: '35px', height: '35px' }}>
              K
            </div>
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