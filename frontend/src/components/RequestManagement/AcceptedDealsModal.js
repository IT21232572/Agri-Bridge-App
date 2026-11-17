import React from 'react';
import { Modal, Table, Badge, Button } from 'react-bootstrap';
import { downloadDealReceipt } from '../../utils/receiptGenerator';

const AcceptedDealsModal = ({ show, onHide, request, requestAcceptedDeals }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton className="bg-warning text-dark">
        <Modal.Title className="h5 fw-bold">
          🤝 Accepted Deals for {request.title} ({requestAcceptedDeals.length})
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {requestAcceptedDeals.length > 0 ? (
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap border rounded-3">
              <thead className="table-light">
                <tr>
                  <th>Partner / Supplier</th>
                  <th>Deal Type</th>
                  <th>Agreed Price (LKR)</th>
                  <th>Quantity</th>
                  <th>Delivery Date</th>
                  <th>Remarks</th>
                  <th>Status</th>
                  <th>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {requestAcceptedDeals.map((deal, idx) => (
                  <tr key={deal.key || idx}>
                    <td className="fw-bold">{deal.partnerName}</td>
                    <td>
                      <Badge
                        bg={deal.direction === 'Sent Offer' ? 'info' : 'primary'}
                        text={deal.direction === 'Sent Offer' ? 'dark' : 'white'}
                        className="px-2 py-1 rounded-pill"
                      >
                        {deal.direction}
                      </Badge>
                    </td>
                    <td className="fw-bold text-success">LKR {deal.agreedPrice}</td>
                    <td>
                      <Badge bg="warning" text="dark" className="px-2 py-1">
                        📦 {deal.quantityOffered} kg
                      </Badge>
                    </td>
                    <td>{deal.deliveryDate}</td>
                    <td className="text-muted small">"{deal.remarks || 'No remarks'}"</td>
                    <td>
                      <Badge bg="success" className="px-3 py-1 rounded-pill">
                        Confirmed & Processing 🚚
                      </Badge>
                    </td>
                    <td>
                      <Button
                        variant="outline-success"
                        size="sm"
                        className="fw-bold rounded-pill px-3"
                        onClick={() => downloadDealReceipt(deal.receiptParams)}
                      >
                        📄 Download Receipt
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-5 text-muted">
            No accepted deals yet for this post.
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="bg-light">
        <Button variant="secondary" onClick={onHide}>Close</Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AcceptedDealsModal;