import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Container, Button } from 'react-bootstrap';
import AddRequest from './components/RequestManagement/AddRequest';
import RequestList from './components/RequestManagement/RequestList';
import MyRequests from './components/RequestManagement/MyRequests';

function App() {
  return (
    <Router>
      <div className="App bg-light min-vh-100 py-3">
        <Container className="mb-3">
          <div className="d-flex gap-2 mb-3">
            <Button as={Link} to="/" variant="outline-success">
              My Requests & Matches
            </Button>
            <Button as={Link} to="/hub" variant="outline-success">
              Request & Supply Hub
            </Button>
            <Button as={Link} to="/add" variant="outline-success">
              + Add Post
            </Button>
          </div>
        </Container>

        <Routes>
          <Route path="/" element={<MyRequests />} />
          <Route path="/hub" element={<RequestList />} />
          <Route path="/add" element={<AddRequest />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;