import React from 'react';
import { Container, Table, Badge, Card, Button } from 'react-bootstrap';

const AcceptedDeals = ({ acceptedDeals }) => {
  return (
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm border-0">
        <Card.Header as="h5" className="bg-success text-white py-3 d-flex justify-content-between align-items-center">
          <span>🤝 Accepted Deals & Active Orders</span>
          <Badge bg="light" text="dark" className="px-3 py-2">
            Total Deals: {acceptedDeals.length}
          </Badge>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead className="table-light">
                <tr>
                  <th>Deal ID</th>
                  <th>Request Title</th>
                  <th>Partner / Supplier</th>
                  <th>Agreed Price (LKR)</th>
                  <th>Delivery Date</th>
                  <th>Remarks</th>
                  <th>Order Status</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {acceptedDeals.length > 0 ? (
                  acceptedDeals.map((deal, index) => (
                    <tr key={index}>
                      <td className="fw-semibold text-secondary">DEAL-{1000 + index}</td>
                      <td className="fw-bold">{deal.requestTitle}</td>
                      <td>{deal.sender || 'Registered Partner'}</td>
                      <td className="fw-bold text-success">LKR {deal.offeredPrice}</td>
                      <td>{deal.deliveryDate}</td>
                      <td className="text-muted small">"{deal.remarks || 'No remarks'}"</td>
                      <td>
                        <Badge bg="success" className="px-2 py-1">
                          Confirmed & Processing 🚚
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Button variant="outline-success" size="sm" onClick={() => alert(`Proceeding to Order & Logistics Module for Deal DEALS-${1000 + index}`)}>
                          View Order Details
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-muted">
                      No accepted deals yet.
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

export default AcceptedDeals;