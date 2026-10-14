import React, { useState } from 'react';
import { Container, Table, Button, Badge, Card, Modal, Form } from 'react-bootstrap';

const MyRequests = ({ requests, onDeleteRequest, onUpdateRequest }) => {
  const [showEditModal, setShowEditModal] = useState(false);
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
    switch (status) {
      case 'Active':
        return <Badge bg="success">Active</Badge>;
      case 'Pending Match':
        return <Badge bg="warning" text="dark">Pending Match</Badge>;
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
          <span>My Crop Requests & Bids</span>
          <Badge bg="light" text="dark" className="px-3 py-2">
            Total: {requests.length} Requests
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Req ID</th>
                  <th>Title & Category</th>
                  <th>Location</th>
                  <th>Base Price (LKR)</th>
                  <th>End Date</th>
                  <th>Offers</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="fw-semibold text-secondary">{req.id}</td>
                      <td>
                        <div className="fw-bold">{req.title}</div>
                        <small className="text-muted">{req.category}</small>
                      </td>
                      <td>📍 {req.location}</td>
                      <td className="fw-bold text-success">{req.startingPrice}</td>
                      <td>{req.biddingEndTime}</td>
                      <td>
                        <Badge bg="primary" pill>
                          {req.offersCount || 0} Bids
                        </Badge>
                      </td>
                      <td>{getStatusBadge(req.status || 'Active')}</td>
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
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No requests found.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Modal */}
      {selectedReq && (
        <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered>
          <Form onSubmit={handleSaveEdit}>
            <Modal.Header closeButton>
              <Modal.Title>Edit Request: {selectedReq.id}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Request Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={selectedReq.title}
                  onChange={handleInputChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Base Price (LKR)</Form.Label>
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