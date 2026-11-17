import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/my-requests');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <Card className="shadow border-0 rounded-4 p-4" style={{ width: '100%', maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <h3 className="fw-bold text-success">🌱 Agri-Bridge Login</h3>
          <p className="text-muted small">Sign in to manage your crop requests and offers</p>
        </div>

        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Email Address</Form.Label>
            <Form.Control
              type="email"
              placeholder="farmer@agribridge.lk"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </Form.Group>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small">Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100 fw-bold py-2 rounded-3">
            Sign In
          </Button>
        </Form>

        <div className="text-center mt-3 small">
          Don't have an account? <Link to="/register" className="text-success fw-bold">Register here</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Login;