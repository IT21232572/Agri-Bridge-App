import React from 'react';
import { Modal, Card, Badge, Button, Row, Col } from 'react-bootstrap';

const MatchedRequestsModal = ({ show, onHide, request, matchedRequestsList, bestMatch, onSelectMatch }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title className="h5 fw-bold">
          ⚡ Matched Requests for {request.title} ({matchedRequestsList.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {matchedRequestsList.length > 0 ? (
          <>
            {/* Highlighted Top Best Match Banner */}
            {bestMatch && (
              <Card
                className="border-success border-2 shadow-sm mb-4 rounded-4"
                style={{ backgroundColor: '#f2fbf5', cursor: 'pointer' }}
                onClick={() => onSelectMatch(bestMatch)}
              >
                <Card.Body className="p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-2">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 shadow-sm">
                        ⭐ Best Match (Nearest & Best Price)
                      </Badge>
                      <Badge bg={bestMatch.requestType === 'Buyer' ? 'primary' : 'dark'} className="px-3 py-2 rounded-pill">
                        {bestMatch.requestType}
                      </Badge>
                      <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">
                        {bestMatch.proximityLabel}
                      </Badge>
                    </div>
                    <small className="text-muted fw-semibold">ID: {bestMatch.id}</small>
                  </div>

                  <Row className="align-items-center mt-3 g-3">
                    <Col md={7}>
                      <h4 className="fw-bold text-dark mb-1">{bestMatch.title}</h4>
                      <p className="text-secondary small mb-2">{bestMatch.description}</p>
                      <div className="d-flex flex-wrap gap-3 small fw-semibold text-muted">
                        <span>📍 {bestMatch.location}</span>
                        <span>
                          📦 {bestMatch.requestType === 'Buyer' ? 'Needs' : 'Available'}: {bestMatch.quantity || 0} Kg
                        </span>
                        <span>👤 {bestMatch.buyerName || 'Farmer'}</span>
                      </div>
                    </Col>
                    <Col md={5} className="text-md-end">
                      <span className="text-muted small d-block">
                        {bestMatch.requestType === 'Seller' ? 'Best Asking Price' : 'Best Target Price'}
                      </span>
                      <h3 className="fw-bold text-success mb-2">LKR {bestMatch.startingPrice}</h3>
                      <Button variant="success" size="sm" className="fw-bold px-4 py-2 rounded-3">
                        Respond to Best Match →
                      </Button>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* All Matched Posts Grid */}
            <h6 className="fw-bold text-secondary mb-3">All Matching Posts ({matchedRequestsList.length})</h6>
            <Row className="g-3">
              {matchedRequestsList.map((match, idx) => {
                const isTopMatch = idx === 0;
                return (
                  <Col md={6} key={match.id}>
                    <Card
                      className={`shadow-sm h-100 rounded-3 bg-white ${isTopMatch ? 'border-success border-2' : 'border'}`}
                      style={{ cursor: 'pointer', transition: 'all 0.2s' }}
                      onClick={() => onSelectMatch(match)}
                    >
                      <Card.Body>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <div className="d-flex gap-2">
                            <Badge bg={match.requestType === 'Buyer' ? 'primary' : 'success'}>{match.requestType}</Badge>
                            {isTopMatch && <Badge bg="success">⭐ Best Match</Badge>}
                          </div>
                          <small className="text-muted">ID: {match.id}</small>
                        </div>
                        <h5 className="fw-bold">{match.title}</h5>
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <small className="text-muted">{match.proximityLabel}</small>
                          <Badge bg="warning" text="dark">📦 {match.quantity || 0} Kg</Badge>
                        </div>
                        <div className="d-flex justify-content-between align-items-center">
                          <strong className="text-success">LKR {match.startingPrice}</strong>
                          <Badge bg="light" text="success" className="border border-success">
                            {isTopMatch ? 'Top Ranked ✅' : 'Click to Send Offer →'}
                          </Badge>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          </>
        ) : (
          <div className="text-center py-5 bg-white rounded-4">
            <div className="mb-3 text-success fs-1">📦</div>
            <h5 className="fw-bold text-dark">No automatic matches found yet</h5>
            <p className="text-muted small mb-4">
              Compatible posts for {request.title} from the opposite marketplace will appear here.
            </p>
            <Button
              variant="success"
              className="fw-bold px-4 py-2 shadow-sm"
              style={{ backgroundColor: '#136534', border: 'none', borderRadius: '8px' }}
              onClick={() => (window.location.href = '/hub')}
            >
              🔍 Explore Marketplace Hub
            </Button>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-white">
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default MatchedRequestsModal;