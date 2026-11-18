import React, { useState } from 'react';
import { Card, Form, Button, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      await login(email, password);
      navigate('/my-requests');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Check your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputStyle = {
    backgroundColor: '#f1f3f2',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.72rem 0.95rem',
    fontSize: '0.94rem',
    color: '#1e293b'
  };

  return (
    <div className="min-vh-100 d-flex" style={{ backgroundColor: '#f6f7f4' }}>
      <Row className="g-0 w-100 min-vh-100">
        {/* Left Hero Brand Panel */}
        <Col
          lg={6}
          className="d-none d-lg-flex flex-column justify-content-between p-5 text-white position-relative overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 78% 22%, rgba(234, 179, 8, 0.62) 0%, rgba(202, 138, 4, 0.24) 32%, transparent 62%), linear-gradient(155deg, #09351e 0%, #0e4a2b 58%, #135c36 100%)'
          }}
        >
          {/* Decorative Subtle Bottom Wave SVG */}
          <svg
            viewBox="0 0 600 120"
            preserveAspectRatio="none"
            className="position-absolute bottom-0 start-0 w-100"
            style={{ height: '95px', opacity: 0.16, pointerEvents: 'none' }}
          >
            <path
              d="M0,45 C150,95 350,0 600,55 L600,120 L0,120 Z"
              fill="#86efac"
            />
            <path
              d="M0,75 C200,25 420,105 600,65 L600,120 L0,120 Z"
              fill="#bbf7d0"
            />
          </svg>

          {/* Top-Left Brand Logo */}
          <div className="d-flex align-items-center gap-3 position-relative" style={{ zIndex: 2 }}>
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
                fontSize: '1.25rem'
              }}
            >
              🌱
            </div>
            <span className="fw-bold fs-4 text-white" style={{ letterSpacing: '-0.3px' }}>
              Agri-Bridge
            </span>
          </div>

          {/* Bottom-Left Headline & Crop Pills */}
          <div className="position-relative mb-2" style={{ zIndex: 2, maxWidth: '470px' }}>
            <h1
              className="fw-bold text-white mb-3"
              style={{
                fontSize: 'clamp(2.3rem, 3.4vw, 3.15rem)',
                lineHeight: 1.12,
                letterSpacing: '-1px'
              }}
            >
              Fresh crops,
              <br />
              matched to the
              <br />
              right buyer.
            </h1>

            <p
              className="mb-4 fw-normal"
              style={{ color: 'rgba(255, 255, 255, 0.78)', fontSize: '1rem', lineHeight: 1.55 }}
            >
              Post what you grow or need, and Agri-Bridge finds the best match for you.
            </p>

            <div className="d-flex flex-wrap gap-2">
              {[
                { icon: '🥕', label: 'Carrots' },
                { icon: '🧅', label: 'Big Onions' },
                { icon: '🍅', label: 'Tomatoes' }
              ].map((item) => (
                <span
                  key={item.label}
                  className="px-3 py-2 rounded-pill small fw-semibold d-inline-flex align-items-center gap-2"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    border: '1px solid rgba(255, 255, 255, 0.16)',
                    color: '#e2f5ea',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </span>
              ))}
            </div>
          </div>
        </Col>

        {/* Right Form Panel */}
        <Col
          xs={12}
          lg={6}
          className="d-flex flex-column justify-content-center align-items-center p-4 p-md-5"
        >
          {/* Mobile Brand Header */}
          <div className="d-flex d-lg-none align-items-center gap-2 mb-4">
            <div
              className="rounded-3 d-flex align-items-center justify-content-center shadow-sm"
              style={{
                width: '36px',
                height: '36px',
                background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)'
              }}
            >
              🌱
            </div>
            <span className="fw-bold fs-4 text-dark">Agri-Bridge</span>
          </div>

          <Card
            className="border-0 rounded-4 bg-white w-100 overflow-hidden"
            style={{
              maxWidth: '450px',
              borderTop: '4px solid #15803d',
              boxShadow: '0 14px 36px rgba(15, 23, 42, 0.08)'
            }}
          >
            <Card.Body className="p-4 p-sm-5">
              <div className="mb-4">
                <h2 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-0.5px' }}>
                  Welcome Back
                </h2>
                <p className="text-muted small mb-0">
                  Sign in to your Agri-Bridge account to manage requests and offers
                </p>
              </div>

              {error && (
                <Alert variant="danger" className="py-2 px-3 small rounded-3">
                  {error}
                </Alert>
              )}

              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-dark">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    placeholder="farmer@agribridge.lk"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                    className="shadow-none"
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-dark">Password</Form.Label>
                  <Form.Control
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={inputStyle}
                    className="shadow-none"
                    required
                  />
                </Form.Group>

                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-100 fw-bold py-2 text-white border-0"
                  style={{
                    borderRadius: '10px',
                    padding: '0.75rem',
                    background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
                    boxShadow: '0 6px 18px rgba(249, 115, 22, 0.32)'
                  }}
                >
                  {submitting ? 'Signing In...' : 'Sign In & Continue'}
                </Button>
              </Form>

              <div className="text-center mt-4 small text-secondary">
                Don&apos;t have an account?{' '}
                <Link
                  to="/register"
                  className="fw-bold text-decoration-underline"
                  style={{ color: '#15803d' }}
                >
                  Register here
                </Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Login;