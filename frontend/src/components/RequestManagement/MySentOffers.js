import React, { useState } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { downloadDealReceipt } from '../../utils/receiptGenerator';

const MySentOffers = ({ requests }) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');

  // Flatten all offers sent by the currently logged-in user
  const mySentOffers = [];
  requests.forEach(req => {
    (req.offers || []).forEach((offer, idx) => {
      const isMine =
        user &&
        ((offer.senderId && String(offer.senderId) === String(user.id)) ||
          (offer.sender && offer.sender.trim().toLowerCase() === user.name.trim().toLowerCase()));

      if (isMine) {
        mySentOffers.push({
          key: `${req.id}-${idx}`,
          status: offer.status || 'Pending',
          offer,
          request: req
        });
      }
    });
  });

  const pendingCount = mySentOffers.filter(item => item.status === 'Pending').length;
  const acceptedCount = mySentOffers.filter(item => item.status === 'Accepted').length;
  const declinedCount = mySentOffers.filter(item => item.status === 'Declined').length;

  const filteredOffers = mySentOffers.filter(item =>
    statusFilter === 'All' ? true : item.status === statusFilter
  );

  const handleDownload = (item) => {
    downloadDealReceipt({
      receiptId: `RCP-${item.request.id}-${item.offer.quantityOffered}`,
      requestId: item.request.id,
      productTitle: item.request.title,
      category: item.request.category,
      postType: item.request.requestType,
      postOwnerName: item.request.buyerName,
      postOwnerLocation: item.request.location,
      postOwnerContact: item.request.contact,
      offerSenderName: item.offer.sender,
      offerSenderLocation: item.offer.senderLocation || user?.district,
      offerSenderContact: item.offer.senderContact || user?.phone || user?.contact,
      agreedPrice: item.offer.offeredPrice,
      quantity: item.offer.quantityOffered,
      deliveryDate: item.offer.deliveryDate,
      remarks: item.offer.remarks
    });
  };

  return (
    <Container fluid className="px-0 mb-5">
      <Card className="border-0 shadow-sm mb-4 rounded-4 bg-white p-4">
        <span className="text-muted small">📩 Offer Tracking & Receipts</span>
        <h3 className="fw-bold text-dark mt-1 mb-1">My Sent Offers & Deal Receipts</h3>
        <p className="text-secondary small mb-3">
          Track the approval status of offers you sent and download official receipts for accepted deals.
        </p>

        <Row className="g-3">
          <Col md={3}>
            <div className="bg-light p-3 rounded-4">
              <span className="text-muted small d-block">Total Sent</span>
              <h4 className="fw-bold mb-0">{mySentOffers.length}</h4>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-warning bg-opacity-10 p-3 rounded-4">
              <span className="text-muted small d-block">Pending Review</span>
              <h4 className="fw-bold text-warning mb-0">{pendingCount}</h4>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-success bg-opacity-10 p-3 rounded-4">
              <span className="text-muted small d-block">Accepted Deals</span>
              <h4 className="fw-bold text-success mb-0">{acceptedCount}</h4>
            </div>
          </Col>
          <Col md={3}>
            <div className="bg-danger bg-opacity-10 p-3 rounded-4">
              <span className="text-muted small d-block">Declined</span>
              <h4 className="fw-bold text-danger mb-0">{declinedCount}</h4>
            </div>
          </Col>
        </Row>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
        <Card.Header className="bg-white py-3 d-flex gap-2 flex-wrap">
          {['All', 'Pending', 'Accepted', 'Declined'].map(tab => (
            <Button
              key={tab}
              size="sm"
              variant={statusFilter === tab ? 'success' : 'light'}
              className="rounded-pill px-3 fw-semibold"
              onClick={() => setStatusFilter(tab)}
            >
              {tab}
            </Button>
          ))}
        </Card.Header>

        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Post & Crop</th>
                  <th className="py-3 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Post Owner</th>
                  <th className="py-3 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Your Offered Price</th>
                  <th className="py-3 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Quantity</th>
                  <th className="py-3 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Delivery Date</th>
                  <th className="py-3 border-0 small fw-bold" style={{ backgroundColor: '#afeebd' }}>Status</th>
                  <th className="py-3 px-4 border-0 small fw-bold text-center" style={{ backgroundColor: '#afeebd' }}>Receipt</th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.length > 0 ? (
                  filteredOffers.map(item => (
                    <tr key={item.key}>
                      <td className="px-4">
                        <div className="fw-bold text-success">{item.request.title}</div>
                        <small className="text-muted">{item.request.id} • {item.request.requestType} ({item.request.location})</small>
                      </td>
                      <td>{item.request.buyerName || 'Farmer'}</td>
                      <td className="fw-bold text-dark">LKR {item.offer.offeredPrice} / Kg</td>
                      <td><Badge bg="warning" text="dark">📦 {item.offer.quantityOffered} Kg</Badge></td>
                      <td>📅 {item.offer.deliveryDate}</td>
                      <td>
                        {item.status === 'Accepted' && (
                          <Badge bg="success" className="px-3 py-2 rounded-pill">✅ Accepted</Badge>
                        )}
                        {item.status === 'Pending' && (
                          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill">⏳ Pending</Badge>
                        )}
                        {item.status === 'Declined' && (
                          <Badge bg="danger" className="px-3 py-2 rounded-pill">❌ Declined</Badge>
                        )}
                      </td>
                      <td className="px-4 text-center">
                        {item.status === 'Accepted' ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="fw-bold px-3 rounded-pill shadow-sm"
                            onClick={() => handleDownload(item)}
                          >
                            📄 Download Receipt
                          </Button>
                        ) : (
                          <span className="text-muted small">Available when accepted</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-muted">
                      No sent offers found in this category.
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

export default MySentOffers;