import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RequestProvider, useRequestContext } from './context/RequestContext';
import MainLayout from './components/Layout/MainLayout';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';

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
      </Routes>
    </MainLayout>
  );
};

function App() {
  return (
    <RequestProvider>
      <Router>
        <AppRoutes />
      </Router>
    </RequestProvider>
  );
}

export default App;