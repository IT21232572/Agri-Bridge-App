import React, { useState } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import RequestDetail from './components/RequestManagement/RequestDetail';
import { Button, Container } from 'react-bootstrap';

const initialRequests = [
  {
    id: 'REQ-101',
    requestType: 'Buyer',
    title: 'Need 100kg Big Onions',
    category: 'Vegetables',
    location: 'Dambulla',
    startingPrice: 350,
    biddingEndTime: '2026-10-25 18:00',
    description: 'Looking for high quality dried big onions directly from local farms.',
    buyerName: 'Sunil Perera (Wholesale Buyer)',
    contact: '+94 77 123 4567',
    status: 'Pending Match',
    offers: [
      { sender: 'Dambulla Agro Farm', offeredPrice: 340, quantityOffered: 100, deliveryDate: '2026-10-23', remarks: 'Grade A onions available in 25kg bags.' }
    ]
  },
  {
    id: 'REQ-102',
    requestType: 'Seller',
    title: '500kg Organic Cavendish Bananas Available',
    category: 'Fruits',
    location: 'Embilipitiya',
    startingPrice: 180,
    biddingEndTime: '2026-10-22 12:00',
    description: 'Fresh harvest ready for bulk buyers. Export standard with minimal bruises.',
    buyerName: 'Nimal Farms (Seller)',
    contact: '+94 71 987 6543',
    status: 'Pending Match',
    offers: []
  }
];

function App() {
  const [view, setView] = useState('my-requests');
  const [requests, setRequests] = useState(initialRequests);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);

  const handleAddRequest = (newReq) => {
    newReq.offers = [];
    setRequests([newReq, ...requests]);
    setView('my-requests');
    alert("Post published successfully!");
  };

  const handleSubmitOffer = (reqId, newOffer) => {
    setRequests(requests.map(req => {
      if (req.id === reqId) {
        return { ...req, offers: [...(req.offers || []), newOffer] };
      }
      return req;
    }));
  };

  const handleAcceptOffer = (reqId, acceptedOffer) => {
    const newDeal = {
      ...acceptedOffer,
      requestId: reqId,
      requestTitle: requests.find(r => r.id === reqId)?.title || 'Crop Request'
    };

    setAcceptedDeals([...acceptedDeals, newDeal]);

    const updatedRequests = requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: `Offer Accepted 🤝 (LKR ${acceptedOffer.offeredPrice})`,
          offers: req.offers.filter(o => o !== acceptedOffer)
        };
      }
      return req;
    });

    setRequests(updatedRequests);

    const target = updatedRequests.find(r => r.id === reqId);
    if (target) {
      setSelectedRequest(target);
    }

    alert(`🎉 Offer Accepted! Moved to Accepted Deals tab inside this request.`);
  };

  const handleDeclineOffer = (reqId, declinedOffer) => {
    const updatedRequests = requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          offers: req.offers.filter(o => o !== declinedOffer)
        };
      }
      return req;
    });

    setRequests(updatedRequests);

    const target = updatedRequests.find(r => r.id === reqId);
    if (target) {
      setSelectedRequest(target);
    }

    alert(`❌ Offer declined and removed successfully.`);
  };

  const handleDeleteRequest = (id) => {
    setRequests(requests.filter(req => req.id !== id));
    setSelectedRequest(null);
  };
  // Update Post Handler
const handleUpdatePost = (reqId, updatedData) => {
  const updatedRequests = requests.map(req => {
    if (req.id === reqId) {
      return { ...req, ...updatedData };
    }
    return req;
  });

  setRequests(updatedRequests);
  const target = updatedRequests.find(r => r.id === reqId);
  if (target) {
    setSelectedRequest(target);
  }
};
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