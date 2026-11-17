import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    district: 'Colombo'
  });
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(formData);
      navigate('/my-requests');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '85vh' }}>
      <Card className="shadow border-0 rounded-4 p-4" style={{ width: '100%', maxWidth: '480px' }}>
        <div className="text-center mb-3">
          <h3 className="fw-bold text-success">🌱 Farmer Registration</h3>
          <p className="text-muted small">Create your Agri-Bridge account to post and match requests</p>
        </div>

        {error && <Alert variant="danger" className="py-2 small">{error}</Alert>}

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Full Name</Form.Label>
            <Form.Control name="name" placeholder="Kamal Perera" onChange={handleChange} required />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold small">Email Address</Form.Label>
            <Form.Control type="email" name="email" placeholder="kamal@example.com" onChange={handleChange} required />
          </Form.Group>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">District</Form.Label>
                <Form.Control name="district" value={formData.district} onChange={handleChange} required />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">Phone Number</Form.Label>
                <Form.Control name="phone" placeholder="+94 77 123 4567" onChange={handleChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-4">
            <Form.Label className="fw-semibold small">Password</Form.Label>
            <Form.Control type="password" name="password" minLength="6" placeholder="Min 6 characters" onChange={handleChange} required />
          </Form.Group>

          <Button variant="success" type="submit" className="w-100 fw-bold py-2 rounded-3">
            Register & Continue
          </Button>
        </Form>

        <div className="text-center mt-3 small">
          Already have an account? <Link to="/login" className="text-success fw-bold">Login here</Link>
        </div>
      </Card>
    </Container>
  );
};

export default Register;