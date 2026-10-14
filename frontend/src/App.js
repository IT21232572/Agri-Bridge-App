import React, { useState } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';
import { Button, Container } from 'react-bootstrap';

function App() {
  const [view, setView] = useState('list'); // 'list' | 'add' | 'my-requests'

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

      {view === 'list' && <RequestList />}
      {view === 'add' && <AddRequest />}
      {view === 'my-requests' && <MyRequests />}
    </div>
  );
}

export default App;