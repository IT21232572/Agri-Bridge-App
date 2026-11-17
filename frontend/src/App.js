import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RequestProvider, useRequestContext } from './context/RequestContext';
import { AuthProvider } from './context/AuthContext';
import MainLayout from './components/Layout/MainLayout';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';

// Logistics & User Management Components
import LogisticsDashboard from './components/LogisticsManagement/LogisticsDashboard';
import ShipmentTracking from './components/LogisticsManagement/ShipmentTracking';
import LogisticsReports from './components/LogisticsManagement/LogisticsReports';
import UserDirectory from './components/UserManagement/UserDirectory';
import ProfilePage from './components/UserManagement/ProfilePage';

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
    <MainLayout>
      <Routes>
        {/* Existing Routes (Maintained 100% Intact) */}
        <Route 
          path="/" 
          element={
            <RequestList 
              requests={requests} 
              refreshRequests={fetchRequests}
              showToast={showToast}
              onNavigateToAdd={() => window.location.href = '/add'}
            />
          } 
        />
        <Route 
          path="/hub" 
          element={
            <RequestList 
              requests={requests} 
              refreshRequests={fetchRequests}
              showToast={showToast}
              onNavigateToAdd={() => window.location.href = '/add'}
            />
          } 
        />
        <Route 
          path="/my-requests" 
          element={
            <MyRequests 
              requests={requests} 
              onDeleteRequest={handleDeleteRequest} 
              onSelectRequest={setSelectedRequest}
              showToast={showToast}
            />
          } 
        />
        <Route 
          path="/request/:id" 
          element={
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
          } 
        />
        <Route 
          path="/add" 
          element={<AddRequest onAddSuccess={handleAddRequest} showToast={showToast} />} 
        />

        {/* User & Logistics Management Routes */}
        <Route 
          path="/logistics" 
          element={<LogisticsDashboard showToast={showToast} />} 
        />
        <Route 
          path="/tracking" 
          element={<ShipmentTracking showToast={showToast} />} 
        />
        <Route 
          path="/logistics-reports" 
          element={<LogisticsReports showToast={showToast} />} 
        />
        <Route 
          path="/users" 
          element={<UserDirectory showToast={showToast} />} 
        />
        <Route 
          path="/profile" 
          element={<ProfilePage showToast={showToast} />} 
        />
      </Routes>
    </MainLayout>
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
