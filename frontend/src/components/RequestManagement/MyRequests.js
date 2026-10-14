import React, { useState } from 'react';
import { Container, Table, Button, Badge, Card, Modal, Form } from 'react-bootstrap';

const initialMyRequests = [
  {
    id: 'REQ-101',
    title: 'Need 100kg Big Onions',
    category: 'Vegetables',
    location: 'Dambulla',
    startingPrice: 350,
    biddingEndTime: '2026-10-25',
    status: 'Active',
    offersCount: 4
  },
  {
    id: 'REQ-102',
    title: '500kg Organic Cavendish Bananas',
    category: 'Fruits',
    location: 'Embilipitiya',
    startingPrice: 180,
    biddingEndTime: '2026-10-22',
    status: 'Pending Match',
    offersCount: 1
  },
  {
    id: 'REQ-103',
    title: 'Paddy Seeds (BG 352)',
    category: 'Seeds',
    location: 'Polonnaruwa',
    startingPrice: 220,
    biddingEndTime: '2026-10-10',
    status: 'Completed',
    offersCount: 6
  }
];

const MyRequests = () => {
  const [requests, setRequests] = useState(initialMyRequests);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedReq, setSelectedReq] = useState(null);

  // Delete Action
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel/delete this request?")) {
      setRequests(requests.filter(item => item.id !== id));
    }
  };

  // Edit Modal Open
  const handleEditClick = (req) => {
    setSelectedReq({ ...req });
    setShowEditModal(true);
  };

  // Edit Save Action
  const handleSaveEdit = (e) => {
    e.preventDefault();
    setRequests(requests.map(item => (item.id === selectedReq.id ? selectedReq : item)));
    setShowEditModal(false);
  };

  // Edit form input change
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
                          {req.offersCount} Bids
                        </Badge>
                      </td>
                      <td>{getStatusBadge(req.status)}</td>
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
                      No active requests posted yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Edit Request Modal */}
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