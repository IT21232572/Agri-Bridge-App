import React, { useState } from 'react';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import { Button, Container } from 'react-bootstrap';

function App() {
  const [view, setView] = useState('list'); // 'list' hari 'add' hari

  return (
    <div className="App bg-light min-vh-100 py-3">
      <Container className="mb-3 d-flex gap-2">
        <Button 
          variant={view === 'list' ? 'success' : 'outline-success'} 
          onClick={() => setView('list')}
        >
          View Requests List
        </Button>
        <Button 
          variant={view === 'add' ? 'success' : 'outline-success'} 
          onClick={() => setView('add')}
        >
          Add New Request Form
        </Button>
      </Container>

      {view === 'list' ? <RequestList /> : <AddRequest />}
    </div>
  );
}

export default App;