import React, { useState } from 'react';
import { Container, Table, Button, Badge, Card, Modal, Form, ListGroup } from 'react-bootstrap';

const MyRequests = ({ requests, onDeleteRequest, onUpdateRequest, onAcceptOffer }) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showOffersModal, setShowOffersModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this request?")) {
      onDeleteRequest(id);
    }
  };

  const handleEditClick = (req) => {
    setSelectedReq({ ...req });
    setShowEditModal(true);
  };

  const handleViewOffers = (req) => {
    setSelectedReq(req);
    setShowOffersModal(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    onUpdateRequest(selectedReq);
    setShowEditModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSelectedReq({ ...selectedReq, [name]: value });
  };

  const getStatusBadge = (status) => {
    if (status.includes('Matched')) {
      return <Badge bg="success" className="px-2 py-1">{status}</Badge>;
    }
    if (status.includes('Offer Accepted')) {
      return <Badge bg="info" text="dark" className="px-2 py-1">{status}</Badge>;
    }
    switch (status) {
      case 'Active':
        return <Badge bg="primary">Active</Badge>;
      case 'Pending Match':
        return <Badge bg="warning" text="dark">⏳ Pending Match</Badge>;
      case 'Completed':
        return <Badge bg="secondary">Completed</Badge>;
      default:
        return <Badge bg="info">{status}</Badge>;
    }
  };

  return (
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm border-0">
        <Card.Header as="h5" className="bg-success text-white py-3 d-flex justify-content-between align-items-center">
          <span>My Requests & Automated Match Status</span>
          <Badge bg="light" text="dark" className="px-3 py-2">
            Total: {requests.length} Posts
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Req ID</th>
                  <th>Role Type</th>
                  <th>Title & Category</th>
                  <th>Location</th>
                  <th>Price (LKR)</th>
                  <th>Valid Until</th>
                  <th>Pending Offers</th>
                  <th>Match / Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="fw-semibold text-secondary">{req.id}</td>
                      <td>
                        <Badge bg={req.requestType === 'Buyer Demand' ? 'primary' : 'success'}>
                          {req.requestType || 'Buyer Demand'}
                        </Badge>
                      </td>
                      <td>
                        <div className="fw-bold">{req.title}</div>
                        <small className="text-muted">{req.category}</small>
                      </td>
                      <td>📍 {req.location}</td>
                      <td className="fw-bold text-success">{req.startingPrice}</td>
                      <td>{req.biddingEndTime}</td>
                      <td>
                        <Button 
                          variant={req.offers && req.offers.length > 0 ? "outline-primary" : "light"}
                          size="sm"
                          className="fw-bold"
                          onClick={() => handleViewOffers(req)}
                        >
                          📩 {req.offers ? req.offers.length : 0} Offers
                        </Button>
                      </td>
                      <td>{getStatusBadge(req.status || 'Pending Match')}</td>
                      <td className="text-center">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          className="me-2"
                          onClick={() => handleEditClick(req)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(req.id)}
                        >
                          Cancel
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="text-center py-4 text-muted">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* View & Manage Offers Modal */}
      {selectedReq && (
        <Modal show={showOffersModal} onHide={() => setShowOffersModal(false)} size="lg" centered>
          <Modal.Header closeButton className="bg-success text-white">
            <Modal.Title className="h5">Offers Received for: {selectedReq.title}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            <p className="text-muted mb-3">
              Review direct offers sent by other users. Accepting an offer moves it to 'Accepted Deals' and locks this order.
            </p>
            {selectedReq.offers && selectedReq.offers.length > 0 ? (
              <ListGroup className="gap-2">
                {selectedReq.offers.map((offer, index) => (
                  <ListGroup.Item key={index} className="p-3 border rounded shadow-sm d-flex justify-content-between align-items-center">
                    <div>
                      <div className="d-flex align-items-center gap-2 mb-1">
                        <strong className="text-success fs-5">LKR {offer.offeredPrice}</strong>
                        <Badge bg="info">Delivery: {offer.deliveryDate}</Badge>
                      </div>
                      <div className="small text-dark"><strong>From:</strong> {offer.sender || 'Registered Partner'}</div>
                      <div className="small text-muted fst-italic">"{offer.remarks || 'No remarks added'}"</div>
                    </div>
                    <div>
                      <Button 
                        variant="success" 
                        size="sm" 
                        className="fw-bold px-3"
                        onClick={() => {
                          onAcceptOffer(selectedReq.id, offer);
                          setShowOffersModal(false);
                        }}
                      >
                        Accept Deal ✅
                      </Button>
                    </div>
                  </ListGroup.Item>
                ))}
              </ListGroup>
            ) : (
              <div className="text-center py-4 text-muted">
                No direct pending offers for this post right now.
              </div>
            )}
          </Modal.Body>
        </Modal>
      )}

      {/* Edit Modal */}
      {selectedReq && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Form onSubmit={handleSaveEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Post: {selectedReq.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={selectedReq.title}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Price (LKR)</Form.Label>
                <Form.Control
                  type="number"
                  name="startingPrice"
                  value={selectedReq.startingPrice}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={selectedReq.location}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </Button>
              <Button variant="success" type="submit">
                Save Changes
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      )}
    </Container>
  );
};

export default MyRequests;