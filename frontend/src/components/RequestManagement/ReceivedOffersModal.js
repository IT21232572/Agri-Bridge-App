import React from 'react';
import { Modal, Card, Badge, Button, ListGroup, Row, Col } from 'react-bootstrap';

const ReceivedOffersModal = ({ show, onHide, request, rankedOffers, bestOffer, onAcceptOffer, onDeclineOffer }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="h5 fw-bold">
          📩 Received Offers for {request.title} ({rankedOffers.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4 bg-light">
        {rankedOffers.length > 0 ? (
          <>
            {/* Highlighted Best Offer Banner */}
            {bestOffer && (
              <Card className="border-success border-2 shadow-sm mb-4 rounded-4" style={{ backgroundColor: '#f2fbf5' }}>
                <Card.Body className="p-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                    <div className="d-flex flex-wrap align-items-center gap-2">
                      <Badge bg="success" className="px-3 py-2 rounded-pill fs-6 shadow-sm">
                        ⭐ Best Offer (Nearest, Best Price & Valid Qty)
                      </Badge>
                      <Badge bg="light" text="dark" className="border px-3 py-2 rounded-pill">
                        {bestOffer.proximityLabel}
                      </Badge>
                      <Badge bg="info" className="px-3 py-2 rounded-pill text-dark">
                        📅 Delivery: {bestOffer.deliveryDate}
                      </Badge>
                    </div>
                  </div>

                  <Row className="align-items-center g-3">
                    <Col md={7}>
                      <h5 className="fw-bold text-dark mb-1">From: {bestOffer.sender || 'Registered Partner'}</h5>
                      <p className="text-muted fst-italic small mb-2">
                        "{bestOffer.remarks || 'No remarks added'}"
                      </p>
                      <div className="d-flex flex-wrap gap-3 small fw-semibold text-secondary">
                        <span>📦 Offered Quantity: {bestOffer.quantityOffered} Kg</span>
                        <span>📅 Expected Delivery: {bestOffer.deliveryDate}</span>
                      </div>
                    </Col>
                    <Col md={5} className="text-md-end">
                      <span className="text-muted small d-block">Best Offered Price</span>
                      <h3 className="fw-bold text-success mb-3">LKR {bestOffer.offeredPrice}</h3>
                      <div className="d-flex justify-content-md-end gap-2">
                        <Button
                          variant="success"
                          size="sm"
                          className="fw-bold px-4 py-2 rounded-3 shadow-sm"
                          onClick={() => onAcceptOffer(request.id, bestOffer)}
                        >
                          Accept Best Offer ✅
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          className="fw-bold px-3 py-2 rounded-3 bg-white"
                          onClick={() => window.confirm('Are you sure?') && onDeclineOffer(request.id, bestOffer)}
                        >
                          Decline ❌
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            )}

            {/* All Received Offers List */}
            <h6 className="fw-bold text-secondary mb-3">All Received Offers ({rankedOffers.length})</h6>
            <ListGroup className="gap-2">
              {rankedOffers.map((offer, index) => {
                const isTopOffer = bestOffer && index === 0;
                return (
                  <ListGroup.Item
                    key={index}
                    className={`p-3 border rounded-4 shadow-sm d-flex flex-wrap justify-content-between align-items-center gap-3 ${
                      isTopOffer ? 'border-success border-2 bg-white' : 'bg-white'
                    }`}
                  >
                    <div>
                      <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                        <strong className="text-success fs-5">LKR {offer.offeredPrice}</strong>
                        <Badge bg="warning" text="dark" className="px-2 py-1">📦 {offer.quantityOffered} kg</Badge>
                        <Badge bg="info" className="px-2 py-1 text-dark">Delivery: {offer.deliveryDate}</Badge>
                        <Badge bg="light" text="dark" className="border px-2 py-1">{offer.proximityLabel}</Badge>
                        {isTopOffer && <Badge bg="success" className="px-3 py-1 rounded-pill">⭐ Best Offer</Badge>}
                        {!offer.isQuantityValid && (
                          <Badge bg="danger" className="px-2 py-1 rounded-pill">⚠️ Exceeds Stock</Badge>
                        )}
                      </div>
                      <div className="small text-dark mt-2">
                        <strong>From:</strong> {offer.sender || 'Registered Partner'}
                      </div>
                      <div className="small text-muted fst-italic">"{offer.remarks || 'No remarks added'}"</div>
                    </div>
                    <div className="d-flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        className="fw-bold px-4 py-2 rounded-3 shadow-sm"
                        onClick={() => onAcceptOffer(request.id, offer)}
                      >
                        Accept ✅
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        className="fw-bold px-4 py-2 rounded-3 shadow-sm bg-white"
                        onClick={() => window.confirm('Are you sure?') && onDeclineOffer(request.id, offer)}
                      >
                        Decline ❌
                      </Button>
                    </div>
                  </ListGroup.Item>
                );
              })}
            </ListGroup>
          </>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 text-muted">
            No pending direct offers received for this post yet.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-white">
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ReceivedOffersModal;