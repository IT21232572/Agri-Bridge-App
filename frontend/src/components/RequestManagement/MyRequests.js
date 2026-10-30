import React from 'react';
import { Container, Table, Button, Badge, Card } from 'react-bootstrap';

const MyRequests = ({ requests, onDeleteRequest, onSelectRequest }) => {
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
            <Table hover className="align-middle mb-0 text-nowrap" style={{ cursor: 'pointer' }}>
              <thead className="table-light">
                <tr>
                  <th>Req ID</th>
                  <th>Role Type</th>
                  <th>Title & Category</th>
                  <th>Location</th>
                  <th>Price (LKR)</th>
                  <th>Valid Until</th>
                  <th>Offers & Matches</th>
                  <th>Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {requests.length > 0 ? (
                  requests.map((req) => (
                    <tr key={req.id}>
                      <td className="fw-semibold text-secondary" onClick={() => onSelectRequest(req)}>{req.id}</td>
                      <td onClick={() => onSelectRequest(req)}>
                        <Badge bg={req.requestType === 'Buyer' ? 'primary' : 'success'}>
                          {req.requestType || 'Buyer'}
                        </Badge>
                      </td>
                      <td onClick={() => onSelectRequest(req)}>
                        <div className="fw-bold text-success text-decoration-underline">{req.title}</div>
                        <small className="text-muted">{req.category}</small>
                      </td>
                      <td onClick={() => onSelectRequest(req)}>📍 {req.location}</td>
                      <td className="fw-bold text-success" onClick={() => onSelectRequest(req)}>{req.startingPrice}</td>
                      <td onClick={() => onSelectRequest(req)}>{req.biddingEndTime}</td>
                      <td onClick={() => onSelectRequest(req)}>
                        <Badge bg="light" text="dark" className="border">
                          📩 {req.offers ? req.offers.length : 0} Offers
                        </Badge>
                      </td>
                      <td onClick={() => onSelectRequest(req)}>
                        <Badge bg={req.status.includes('Matched') || req.status.includes('Accepted') ? 'success' : 'warning'} text={req.status.includes('Matched') || req.status.includes('Accepted') ? 'white' : 'dark'}>
                          {req.status}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm("Are you sure you want to cancel this request?")) {
                              onDeleteRequest(req.id);
                            }
                          }}
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
    </Container>
  );
};

export default MyRequests;