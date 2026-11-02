import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Button, Toast, ToastContainer } from 'react-bootstrap';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';
import { 
  getAllRequests, 
  createRequest, 
  updateRequest, 
  deleteRequest, 
  addOfferToRequest 
} from './services/requestService';

function App() {
  const [requests, setRequests] = useState([]);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Toast state notification setup
  const [toastInfo, setToastInfo] = useState({ show: false, message: '', bg: 'success' });

  const showToast = (message, bg = 'success') => {
    setToastInfo({ show: true, message, bg });
  };

  // Fetch requests from MongoDB Atlas
  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Handle adding a post and re-fetching from backend
  const handleAddRequest = async (newReq) => {
    try {
      await createRequest(newReq);
      await fetchRequests(); // Force refresh state from MongoDB Atlas
      showToast('Post published successfully to MongoDB Atlas! 🚀', 'success');
    } catch (error) {
      showToast('Failed to save post to backend.', 'danger');
      throw error;
    }
  };

  const handleDeleteRequest = async (id) => {
    try {
      await deleteRequest(id);
      await fetchRequests();
      setSelectedRequest(null);
      showToast('Request deleted successfully.', 'success');
    } catch (error) {
      showToast('Failed to delete request', 'danger');
    }
  };

  const handleUpdatePost = async (id, updatedData) => {
    try {
      const updatedDoc = await updateRequest(id, updatedData);
      await fetchRequests();
      if (selectedRequest) setSelectedRequest(updatedDoc);
      showToast('Post updated successfully!', 'success');
    } catch (error) {
      showToast('Failed to update post', 'danger');
    }
  };

  const handleAcceptOffer = async (reqId, acceptedOffer) => {
    try {
      const newDeal = {
        ...acceptedOffer,
        requestId: reqId,
        requestTitle: requests.find(r => r.id === reqId)?.title || 'Crop Request'
      };
      setAcceptedDeals([...acceptedDeals, newDeal]);

      const targetReq = requests.find(r => r.id === reqId);
      if (targetReq) {
        const updatedOffers = targetReq.offers.filter(o => o !== acceptedOffer);
        const payload = {
          ...targetReq,
          status: `Offer Accepted 🤝 (LKR ${acceptedOffer.offeredPrice})`,
          offers: updatedOffers
        };
        const updatedDoc = await updateRequest(reqId, payload);
        await fetchRequests();
        setSelectedRequest(updatedDoc);
      }
      showToast('🎉 Offer Accepted successfully!', 'success');
    } catch (error) {
      showToast('Failed to accept offer', 'danger');
    }
  };

  const handleDeclineOffer = async (reqId, declinedOffer) => {
    try {
      const targetReq = requests.find(r => r.id === reqId);
      if (targetReq) {
        const updatedOffers = targetReq.offers.filter(o => o !== declinedOffer);
        const payload = { ...targetReq, offers: updatedOffers };
        const updatedDoc = await updateRequest(reqId, payload);
        await fetchRequests();
        setSelectedRequest(updatedDoc);
      }
      showToast('❌ Offer declined.', 'warning');
    } catch (error) {
      showToast('Failed to decline offer', 'danger');
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading Agri-Bridge data from database...</div>;
  }

  return (
    <Router>
      <div className="App bg-light min-vh-100 py-3">
        <Container className="mb-3">
          <div className="d-flex gap-2 mb-3">
            <Button as={Link} to="/" variant="outline-success" onClick={() => { setSelectedRequest(null); fetchRequests(); }}>
              My Requests & Matches
            </Button>
            <Button as={Link} to="/hub" variant="outline-success" onClick={() => { setSelectedRequest(null); fetchRequests(); }}>
              Request & Supply Hub
            </Button>
            <Button as={Link} to="/add" variant="outline-success" onClick={() => setSelectedRequest(null)}>
              + Add Post
            </Button>
          </div>
        </Container>

        {selectedRequest ? (
          <RequestDetail 
            request={selectedRequest}
            allRequests={requests}
            acceptedDeals={acceptedDeals}
            onBack={() => { setSelectedRequest(null); fetchRequests(); }}
            onAcceptOffer={handleAcceptOffer}
            onDeclineOffer={handleDeclineOffer}
            onUpdatePost={handleUpdatePost}
            onDeletePost={handleDeleteRequest}
            showToast={showToast}
          />
        ) : (
          <Routes>
            <Route 
              path="/" 
              element={
                <MyRequests 
                  requests={requests} 
                  onDeleteRequest={handleDeleteRequest} 
                  onSelectRequest={(req) => setSelectedRequest(req)}
                />
              } 
            />
            <Route 
              path="/hub" 
              element={
                <RequestList 
                  requests={requests} 
                  refreshRequests={fetchRequests}
                  onDeleteRequest={handleDeleteRequest}
                  showToast={showToast}
                />
              } 
            />
            <Route 
              path="/add" 
              element={<AddRequest onAddSuccess={handleAddRequest} />} 
            />
          </Routes>
        )}

        {/* Floating Toast Notification Container */}
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
    </Router>
  );
}

export default App;