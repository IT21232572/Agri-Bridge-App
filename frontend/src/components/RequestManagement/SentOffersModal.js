import React from 'react';
import { Modal, Table, Badge, Button } from 'react-bootstrap';

const SentOffersModal = ({ show, onHide, request, sentOffersFromThisPost }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-info text-dark">
        <Modal.Title className="h5 fw-bold">
          📤 Offers Sent From Advertisement {request.id} ({sentOffersFromThisPost.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {sentOffersFromThisPost.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap border rounded-3">
              <thead className="table-light">
                <tr>
                  <th>Matched Post</th>
                  <th>Partner</th>
                  <th>Your Offered Price</th>
                  <th>Quantity</th>
                  <th>Delivery Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sentOffersFromThisPost.map(item => (
                  <tr key={item.key}>
                    <td>
                      <div className="fw-bold text-success">{item.targetPost.title}</div>
                      <small className="text-muted">
                        {item.targetPost.id} • {item.targetPost.requestType} ({item.targetPost.location})
                      </small>
                    </td>
                    <td>{item.targetPost.buyerName || 'Partner'}</td>
                    <td className="fw-bold">LKR {item.offer.offeredPrice} / Kg</td>
                    <td>
                      <Badge bg="warning" text="dark">📦 {item.offer.quantityOffered} Kg</Badge>
                    </td>
                    <td>📅 {item.offer.deliveryDate}</td>
                    <td>
                      {item.status === 'Pending' && (
                        <Badge bg="warning" text="dark" className="px-3 py-1 rounded-pill">⏳ Pending</Badge>
                      )}
                      {item.status === 'Declined' && (
                        <Badge bg="danger" className="px-3 py-1 rounded-pill">❌ Declined</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            No pending sent offers from this post. Accepted offers move to <strong>Accepted Deals</strong>.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default SentOffersModal;