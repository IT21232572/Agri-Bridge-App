import React, { useState, useEffect } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';
import { Button, Container } from 'react-bootstrap';
import { 
  getAllRequests, 
  createRequest, 
  updateRequest, 
  deleteRequest, 
  addOfferToRequest 
} from './services/requestService';

function App() {
  const [view, setView] = useState('my-requests');
  const [requests, setRequests] = useState([]);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch all requests from MongoDB Atlas on component mount
  const fetchRequests = async () => {
    try {
      const data = await getAllRequests();
      setRequests(data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests from backend:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  // Add new post to MongoDB
  const handleAddRequest = async (newReq) => {
    try {
      const formattedReq = {
        ...newReq,
        id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
        startingPrice: Number(newReq.startingPrice),
        status: 'Pending Match',
        offers: []
      };
      
      await createRequest(formattedReq);
      await fetchRequests(); // Refresh list from DB
      setView('my-requests');
      alert("Post published successfully to MongoDB!");
    } catch (error) {
      alert("Failed to publish post to server.");
    }
  };

  // Submit offer/bid to backend
  const handleSubmitOffer = async (reqId, newOffer) => {
    try {
      const formattedOffer = {
        ...newOffer,
        offeredPrice: Number(newOffer.offeredPrice),
        quantityOffered: Number(newOffer.quantityOffered)
      };

      const updatedDoc = await addOfferToRequest(reqId, formattedOffer);
      await fetchRequests();
      
      // Keep selected request in sync if modal/detail view is active
      if (selectedRequest && selectedRequest.id === reqId) {
        setSelectedRequest(updatedDoc);
      }
    } catch (error) {
      alert("Failed to submit offer to server.");
    }
  };

  // Accept offer handler
  const handleAcceptOffer = async (reqId, acceptedOffer) => {
    try {
      const newDeal = {
        ...acceptedOffer,
        requestId: reqId,
        requestTitle: requests.find(r => r.id === reqId)?.title || 'Crop Request'
      };

      setAcceptedDeals([...acceptedDeals, newDeal]);

      // Update status on backend
      const targetReq = requests.find(r => r.id === reqId);
      if (targetReq) {
        const updatedOffers = targetReq.offers.filter(o => o !== acceptedOffer);
        const updatePayload = {
          ...targetReq,
          status: `Offer Accepted 🤝 (LKR ${acceptedOffer.offeredPrice})`,
          offers: updatedOffers
        };

        const updatedDoc = await updateRequest(reqId, updatePayload);
        await fetchRequests();
        setSelectedRequest(updatedDoc);
      }

      alert(`🎉 Offer Accepted! Moved to Accepted Deals tab inside this request.`);
    } catch (error) {
      alert("Failed to accept offer on server.");
    }
  };

  // Decline offer handler
  const handleDeclineOffer = async (reqId, declinedOffer) => {
    try {
      const targetReq = requests.find(r => r.id === reqId);
      if (targetReq) {
        const updatedOffers = targetReq.offers.filter(o => o !== declinedOffer);
        const updatePayload = {
          ...targetReq,
          offers: updatedOffers
        };

        const updatedDoc = await updateRequest(reqId, updatePayload);
        await fetchRequests();
        setSelectedRequest(updatedDoc);
      }

      alert(`❌ Offer declined and removed successfully.`);
    } catch (error) {
      alert("Failed to decline offer on server.");
    }
  };

  // Delete Request handler
  const handleDeleteRequest = async (id) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteRequest(id);
        await fetchRequests();
        setSelectedRequest(null);
      } catch (error) {
        alert("Failed to delete request from server.");
      }
    }
  };

  // Update Post Handler
  const handleUpdatePost = async (reqId, updatedData) => {
    try {
      const updatedDoc = await updateRequest(reqId, updatedData);
      await fetchRequests();
      if (updatedDoc) {
        setSelectedRequest(updatedDoc);
      }
      alert("Post updated successfully!");
    } catch (error) {
      alert("Failed to update post on server.");
    }
  };

  if (loading) {
    return <div className="text-center mt-5">Loading Agri-Bridge data from database...</div>;
  }

  return (
    <div className="App bg-light min-vh-100 py-3">
      <Container className="mb-3">
        <div className="d-flex gap-2 mb-3">
          <Button 
            variant={view === 'my-requests' && !selectedRequest ? 'success' : 'outline-success'} 
            onClick={() => { setSelectedRequest(null); setView('my-requests'); }}
          >
            My Requests & Matches
          </Button>
          <Button 
            variant={view === 'list' ? 'success' : 'outline-success'} 
            onClick={() => { setSelectedRequest(null); setView('list'); }}
          >
            Request & Supply Hub
          </Button>
          <Button 
            variant={view === 'add' ? 'success' : 'outline-success'} 
            onClick={() => { setSelectedRequest(null); setView('add'); }}
          >
            + Add Post
          </Button>
        </div>
      </Container>

      {selectedRequest ? (
        <RequestDetail 
          request={selectedRequest} 
          allRequests={requests} 
          acceptedDeals={acceptedDeals}
          onBack={() => setSelectedRequest(null)} 
          onAcceptOffer={handleAcceptOffer}
          onDeclineOffer={handleDeclineOffer}
          onUpdatePost={handleUpdatePost}
        />
      ) : (
        <>
          {view === 'my-requests' && (
            <MyRequests 
              requests={requests} 
              onDeleteRequest={handleDeleteRequest} 
              onSelectRequest={(req) => setSelectedRequest(req)}
            />
          )}
          {view === 'list' && (
            <RequestList 
              requests={requests} 
              onNavigateToAdd={() => setView('add')} 
              onSubmitOffer={handleSubmitOffer}
            />
          )}
          {view === 'add' && (
            <AddRequest onAddRequest={handleAddRequest} />
          )}
        </>
      )}
    </div>
  );
}

export default App;