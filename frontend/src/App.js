import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { RequestProvider, useRequestContext } from './context/RequestContext';
import MainLayout from './components/Layout/MainLayout';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';
import Login from './components/Auth/Login';
import Register from './components/Auth/Register';
import MySentOffers from './components/RequestManagement/MySentOffers';

// Redirects guests to /login and wraps authenticated pages in MainLayout
const ProtectedLayout = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div className="text-center mt-5">Checking authentication...</div>;
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/login" replace />;
};

// Redirects already-logged-in users away from /login and /register
const PublicAuthRoute = ({ children }) => {
  const { user, authLoading } = useAuth();
  if (authLoading) return <div className="text-center mt-5">Loading...</div>;
  return user ? <Navigate to="/hub" replace /> : children;
};

const AppRoutes = () => {
  const { 
    loading, 
    requests, 
    acceptedDeals, 
    setSelectedRequest, 
    fetchRequests, 
    handleAddRequest, 
    handleDeleteRequest, 
    handleUpdatePost, 
    handleAcceptOffer, 
    handleDeclineOffer, 
    showToast 
  } = useRequestContext();

  if (loading) {
    return <div className="text-center mt-5">Loading Agri-Bridge data from database...</div>;
  }

  return (
    <Routes>
      {/* Public Auth Routes (No Sidebar or Header) */}
      <Route 
        path="/login" 
        element={
          <PublicAuthRoute>
            <Login />
          </PublicAuthRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicAuthRoute>
            <Register />
          </PublicAuthRoute>
        } 
      />

      {/* Protected App Routes (With Sidebar & Header) */}
      <Route 
        path="/" 
        element={<Navigate to="/hub" replace />} 
      />
      <Route 
        path="/hub" 
        element={
          <ProtectedLayout>
            <RequestList 
              requests={requests} 
              refreshRequests={fetchRequests}
              showToast={showToast}
              onNavigateToAdd={() => window.location.href = '/add'}
            />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/my-requests" 
        element={
          <ProtectedLayout>
            <MyRequests 
              requests={requests} 
              onDeleteRequest={handleDeleteRequest} 
              onSelectRequest={setSelectedRequest}
              showToast={showToast}
            />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/my-offers" 
        element={
          <ProtectedLayout>
            <MySentOffers requests={requests} />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/request/:id" 
        element={
          <ProtectedLayout>
            <RequestDetail 
              allRequests={requests}
              acceptedDeals={acceptedDeals}
              onBack={() => window.history.back()}
              onAcceptOffer={handleAcceptOffer}
              onDeclineOffer={handleDeclineOffer}
              onUpdatePost={handleUpdatePost}
              onDeletePost={handleDeleteRequest}
              showToast={showToast}
              refreshRequests={fetchRequests}
            />
          </ProtectedLayout>
        } 
      />
      <Route 
        path="/add" 
        element={
          <ProtectedLayout>
            <AddRequest onAddSuccess={handleAddRequest} showToast={showToast} />
          </ProtectedLayout>
        } 
      />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <RequestProvider>
        <Router>
          <AppRoutes />
        </Router>
      </RequestProvider>
    </AuthProvider>
  );
}

export default App;