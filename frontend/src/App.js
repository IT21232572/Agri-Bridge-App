import React, { useState } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import { Button, Container } from 'react-bootstrap';

const initialRequests = [
  {
    id: 'REQ-101',
    title: 'Need 100kg Big Onions',
    category: 'Vegetables',
    location: 'Dambulla',
    startingPrice: 350,
    biddingEndTime: '2026-10-25 18:00',
    description: 'Looking for high quality dried big onions directly from local farms. Must be clean and packed in 25kg bags.',
    buyerName: 'Sunil Perera (Wholesale Trader)',
    contact: '+94 77 123 4567',
    status: 'Active',
    offersCount: 4
  },
  {
    id: 'REQ-102',
    title: '500kg Organic Cavendish Bananas',
    category: 'Fruits',
    location: 'Embilipitiya',
    startingPrice: 180,
    biddingEndTime: '2026-10-22 12:00',
    description: 'Bulk order for export standard bananas with minimal bruises. Green harvest state preferred.',
    buyerName: 'AgroExports Pvt Ltd',
    contact: '+94 71 987 6543',
    status: 'Pending Match',
    offersCount: 1
  },
  {
    id: 'REQ-103',
    title: 'Paddy Seeds (BG 352)',
    category: 'Seeds',
    location: 'Polonnaruwa',
    startingPrice: 220,
    biddingEndTime: '2026-10-20 15:30',
    description: 'Certified paddy seeds needed for upcoming Maha season. Germination rate should exceed 85%.',
    buyerName: 'Kamal Jayawardena',
    contact: '+94 70 456 7890',
    status: 'Completed',
    offersCount: 6
  }
];

function App() {
  const [view, setView] = useState('list');
  const [requests, setRequests] = useState(initialRequests);

  // Add Request Handler
  const handleAddRequest = (newReq) => {
    setRequests([newReq, ...requests]);
    alert("New crop request published successfully!");
    setView('list'); // Redirect to Browse Requests
  };

  // Delete Request Handler
  const handleDeleteRequest = (id) => {
    setRequests(requests.filter(req => req.id !== id));
  };

  // Update Request Handler
  const handleUpdateRequest = (updatedReq) => {
    setRequests(requests.map(req => req.id === updatedReq.id ? updatedReq : req));
  };

  return (
    <div className="App bg-light min-vh-100 py-3">
      <Container className="mb-3 d-flex gap-2">
        <Button 
          variant={view === 'list' ? 'success' : 'outline-success'} 
          onClick={() => setView('list')}
        >
          Browse Requests
        </Button>
        <Button 
          variant={view === 'add' ? 'success' : 'outline-success'} 
          onClick={() => setView('add')}
        >
          + Post Request
        </Button>
        <Button 
          variant={view === 'my-requests' ? 'success' : 'outline-success'} 
          onClick={() => setView('my-requests')}
        >
          My Requests Dashboard
        </Button>
      </Container>

      {view === 'list' && (
        <RequestList 
          requests={requests} 
          onNavigateToAdd={() => setView('add')} 
        />
      )}
      {view === 'add' && (
        <AddRequest 
          onAddRequest={handleAddRequest} 
        />
      )}
      {view === 'my-requests' && (
        <MyRequests 
          requests={requests} 
          onDeleteRequest={handleDeleteRequest} 
          onUpdateRequest={handleUpdateRequest} 
        />
      )}
    </div>
  );
}

export default App;