import React, { useState } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import AcceptedDeals from './components/RequestManagement/AcceptedDeals';
import { Button, Container, Alert, Badge } from 'react-bootstrap';

const initialRequests = [
  {
    id: 'REQ-101',
    requestType: 'Buyer Demand',
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
      { id: 'OFF-1', sender: 'Dambulla Agro Farm', offeredPrice: 340, deliveryDate: '2026-10-23', remarks: 'Grade A onions available in 25kg bags.' },
      { id: 'OFF-2', sender: 'Matale Rural Supplier', offeredPrice: 345, deliveryDate: '2026-10-22', remarks: 'Freshly dried, immediate pickup ready.' }
    ]
  },
  {
    id: 'REQ-102',
    requestType: 'Seller Supply',
    title: '500kg Organic Cavendish Bananas Available',
    category: 'Fruits',
    location: 'Embilipitiya',
    startingPrice: 180,
    biddingEndTime: '2026-10-22 12:00',
    description: 'Fresh harvest ready for bulk buyers. Export standard with minimal bruises.',
    buyerName: 'Nimal Farms (Seller)',
    contact: '+94 71 987 6543',
    status: 'Pending Match',
    offers: [
      { id: 'OFF-3', sender: 'Colombo Fruit Chain', offeredPrice: 175, deliveryDate: '2026-10-21', remarks: 'Can arrange own refrigerated transport.' }
    ]
  },
  {
    id: 'REQ-103',
    requestType: 'Buyer Demand',
    title: '100kg Pumpkin Needed',
    category: 'Vegetables',
    location: 'Matara',
    startingPrice: 150,
    biddingEndTime: '2026-10-20 15:30',
    description: 'Urgently looking for fresh local pumpkins around Matara area.',
    buyerName: 'Kamal Stores (Buyer)',
    contact: '+94 70 456 7890',
    status: 'Pending Match',
    offers: []
  }
];

function App() {
  const [view, setView] = useState('list'); // Default view set to Request & Supply Hub
  const [requests, setRequests] = useState(initialRequests);
  const [acceptedDeals, setAcceptedDeals] = useState([]);
  const [matchAlert, setMatchAlert] = useState(null);

  const handleAddRequest = (newReq) => {
    newReq.offers = [];
    const oppositeType = newReq.requestType === 'Buyer Demand' ? 'Seller Supply' : 'Buyer Demand';

    const matchedItems = requests.filter(req => 
      req.requestType === oppositeType &&
      req.category.toLowerCase() === newReq.category.toLowerCase() &&
      req.location.toLowerCase() === newReq.location.toLowerCase()
    );

    if (matchedItems.length > 0) {
      const bestMatch = matchedItems[0];
      newReq.status = `Matched ✅ (with ${bestMatch.id})`;

      const updatedList = requests.map(req => 
        req.id === bestMatch.id 
          ? { ...req, status: `Matched ✅ (with ${newReq.id})` } 
          : req
      );

      setRequests([newReq, ...updatedList]);
      setMatchAlert({
        newPost: newReq,
        matchedPost: bestMatch
      });
    } else {
      setRequests([newReq, ...requests]);
      setMatchAlert(null);
      alert("Post published! Status set to 'Pending Match'.");
    }

    setView('my-requests');
  };

  const handleSubmitOffer = (reqId, newOffer) => {
    setRequests(requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          offers: [...(req.offers || []), newOffer]
        };
      }
      return req;
    }));
  };

  const handleAcceptOffer = (reqId, acceptedOffer) => {
    const targetReq = requests.find(r => r.id === reqId);

    setAcceptedDeals([
      ...acceptedDeals,
      {
        ...acceptedOffer,
        requestId: reqId,
        requestTitle: targetReq ? targetReq.title : 'Crop Request'
      }
    ]);

    setRequests(requests.map(req => {
      if (req.id === reqId) {
        return {
          ...req,
          status: `Offer Accepted 🤝 (LKR ${acceptedOffer.offeredPrice})`,
          offers: req.offers.filter(o => o !== acceptedOffer)
        };
      }
      return req;
    }));

    alert(`🎉 Offer Accepted! Moved to 'Accepted Deals' page.`);
  };

  const handleDeleteRequest = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  const handleUpdateRequest = (updatedReq) => {
    setRequests(requests.map(req => req.id === updatedReq.id ? updatedReq : req));
  };

  return (
    <div className="App bg-light min-vh-100 py-3">
      <Container className="mb-3">
        {/* Navigation Bar - Request & Supply Hub is now first */}
        <div className="d-flex gap-2 mb-3">
          <Button 
            variant={view === 'list' ? 'success' : 'outline-success'} 
            onClick={() => setView('list')}
          >
            Request & Supply Hub
          </Button>
          <Button 
            variant={view === 'my-requests' ? 'success' : 'outline-success'} 
            onClick={() => setView('my-requests')}
          >
            My Requests & Matches
          </Button>
          <Button 
            variant={view === 'accepted-deals' ? 'success' : 'outline-success'} 
            onClick={() => setView('accepted-deals')}
          >
            🤝 Accepted Deals <Badge bg="light" text="dark">{acceptedDeals.length}</Badge>
          </Button>
          <Button 
            variant={view === 'add' ? 'success' : 'outline-success'} 
            onClick={() => setView('add')}
          >
            + Post Demand / Supply
          </Button>
        </div>

        {matchAlert && (
          <Alert variant="success" onClose={() => setMatchAlert(null)} dismissible className="shadow-sm border-success">
            <Alert.Heading className="fw-bold">🎉 Automated Match Found & Email Alerts Sent!</Alert.Heading>
            <p className="mb-1">
              Your new <strong>{matchAlert.newPost.requestType}</strong> (<em>{matchAlert.newPost.title}</em>) 
              automatically matched with existing <strong>{matchAlert.matchedPost.requestType}</strong> (ID: <strong>{matchAlert.matchedPost.id}</strong>).
            </p>
          </Alert>
        )}
      </Container>

      {view === 'list' && (
        <RequestList 
          requests={requests} 
          onNavigateToAdd={() => setView('add')} 
          onSubmitOffer={handleSubmitOffer}
        />
      )}
      {view === 'my-requests' && (
        <MyRequests 
          requests={requests} 
          onDeleteRequest={handleDeleteRequest} 
          onUpdateRequest={handleUpdateRequest} 
          onAcceptOffer={handleAcceptOffer}
        />
      )}
      {view === 'accepted-deals' && (
        <AcceptedDeals 
          acceptedDeals={acceptedDeals} 
        />
      )}
      {view === 'add' && (
        <AddRequest 
          onAddRequest={handleAddRequest} 
        />
      )}
    </div>
  );
}

export default App;