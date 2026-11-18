import React, { useState } from 'react';
import { Container, Card, Table, Badge, Button, Row, Col, InputGroup, Form } from 'react-bootstrap';
import { useAuth } from '../../context/AuthContext';
import { downloadDealReceipt } from '../../utils/receiptGenerator';

const MySentOffers = ({ requests = [] }) => {
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

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

  const totalCount = mySentOffers.length;
  const pendingCount = mySentOffers.filter(item => item.status === 'Pending').length;
  const acceptedCount = mySentOffers.filter(item => item.status === 'Accepted').length;
  const declinedCount = mySentOffers.filter(item => item.status === 'Declined').length;

  const filteredOffers = mySentOffers.filter(item => {
    const matchesStatus = statusFilter === 'All' ? true : item.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      (item.request.title || '').toLowerCase().includes(q) ||
      (item.request.id || '').toLowerCase().includes(q) ||
      (item.request.buyerName || '').toLowerCase().includes(q) ||
      (item.request.location || '').toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

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

  const statCards = [
    {
      label: 'Total Sent',
      value: totalCount,
      icon: '📤',
      iconBg: '#ede9fe',
      borderColor: '#8b5cf6'
    },
    {
      label: 'Pending Review',
      value: pendingCount,
      icon: '⏳',
      iconBg: '#fef3c7',
      borderColor: '#f59e0b'
    },
    {
      label: 'Accepted Deals',
      value: acceptedCount,
      icon: '🤝',
      iconBg: '#dcfce7',
      borderColor: '#16a34a'
    },
    {
      label: 'Declined',
      value: declinedCount,
      icon: '❌',
      iconBg: '#fee2e2',
      borderColor: '#ef4444'
    }
  ];

  const filterTabs = [
    { key: 'All', icon: '⊞', label: `All (${totalCount})` },
    { key: 'Pending', icon: '⏳', label: `Pending (${pendingCount})` },
    { key: 'Accepted', icon: '✅', label: `Accepted (${acceptedCount})` },
    { key: 'Declined', icon: '❌', label: `Declined (${declinedCount})` }
  ];

  return (
    <Container fluid className="px-0 mb-5">
      {/* Deep Green Gradient Hero Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background:
            'radial-gradient(circle at 85% 45%, rgba(234, 179, 8, 0.45) 0%, rgba(22, 101, 52, 0.2) 38%, transparent 65%), linear-gradient(120deg, #0b3d22 0%, #14532d 55%, #1e6b38 100%)',
          paddingBottom: '5.5rem'
        }}
      >
        <div className="d-flex align-items-center gap-2 small fw-semibold mb-2" style={{ color: '#bbf7d0' }}>
          <span>📩</span>
          <span>Offer Tracking &amp; Receipts</span>
        </div>
        <h2 className="fw-bold display-6 mb-2" style={{ letterSpacing: '-0.5px' }}>
          My Sent Offers &amp; Deal Receipts
        </h2>
        <p className="mb-4 text-white-50 fw-medium">
          Track the approval status of offers you sent and download official receipts for accepted deals.
        </p>
      </div>

      {/* 4 Overlapping Stat Cards with Color Bottom Accents */}
      <Row className="g-3 px-3 px-md-4 position-relative" style={{ marginTop: '-48px', zIndex: 2 }}>
        {statCards.map((stat, idx) => (
          <Col sm={6} lg={3} key={idx}>
            <Card
              className="border-0 rounded-4 bg-white h-100"
              style={{
                borderBottom: `4px solid ${stat.borderColor}`,
                boxShadow: '0 8px 20px rgba(0, 0, 0, 0.08)'
              }}
            >
              <Card.Body className="p-3 p-xl-4 d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center fs-4 flex-shrink-0"
                  style={{
                    width: '48px',
                    height: '48px',
                    backgroundColor: stat.iconBg
                  }}
                >
                  {stat.icon}
                </div>
                <div>
                  <span className="text-muted small fw-semibold d-block">{stat.label}</span>
                  <h3 className="text-dark fw-bold mb-0 lh-1 mt-1">{stat.value}</h3>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Main Table Card */}
      <Card
        className="border-0 rounded-4 overflow-hidden bg-white mt-4"
        style={{ boxShadow: '0 6px 24px rgba(0, 0, 0, 0.06)' }}
      >
        {/* Filter Pills & Search Bar */}
        <Card.Header className="bg-white p-4 border-0 d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div className="d-flex flex-wrap gap-2">
            {filterTabs.map(tab => {
              const isActive = statusFilter === tab.key;
              return (
                <Button
                  key={tab.key}
                  size="sm"
                  className="rounded-pill px-3 py-2 fw-semibold d-flex align-items-center gap-2"
                  style={{
                    backgroundColor: isActive ? '#15803d' : '#ffffff',
                    color: isActive ? '#ffffff' : '#4b5563',
                    border: isActive ? '1px solid #15803d' : '1px solid #e5e7eb',
                    boxShadow: isActive ? '0 4px 12px rgba(21, 128, 61, 0.25)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onClick={() => setStatusFilter(tab.key)}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </Button>
              );
            })}
          </div>

          <div style={{ minWidth: '250px', maxWidth: '300px', flexGrow: 1 }}>
            <InputGroup className="rounded-pill overflow-hidden border bg-light">
              <InputGroup.Text className="bg-light text-muted border-0 ps-3">🔍</InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Search by crop, Req ID, owner..."
                className="bg-light border-0 shadow-none ps-0 small py-2"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </InputGroup>
          </div>
        </Card.Header>

        <Card.Body className="px-4 pb-4 pt-0">
          <div className="table-responsive rounded-3">
            <Table hover className="align-middle mb-0 text-nowrap">
              <thead>
                <tr>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold rounded-start" style={{ backgroundColor: '#dcfce7' }}>
                    Advertisement &amp; Crop
                  </th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>
                    Advertisement Owner
                  </th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>
                    Your Offered Price
                  </th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>
                    Quantity
                  </th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>
                    Delivery Date
                  </th>
                  <th className="py-3 border-0 text-dark small fw-bold" style={{ backgroundColor: '#dcfce7' }}>
                    Status
                  </th>
                  <th className="py-3 px-4 border-0 text-dark small fw-bold text-center rounded-end" style={{ backgroundColor: '#dcfce7' }}>
                    Receipt
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOffers.length > 0 ? (
                  filteredOffers.map(item => (
                    <tr key={item.key} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td className="px-4 py-3">
                        <div className="fw-bold" style={{ color: '#15803d' }}>
                          {item.request.title}
                        </div>
                        <small className="text-muted">
                          {item.request.id} • {item.request.requestType} ({item.request.location})
                        </small>
                      </td>
                      <td className="py-3 fw-medium text-dark">
                        {item.request.buyerName || 'Farmer'}
                      </td>
                      <td className="py-3 fw-bold text-dark">
                        LKR {item.offer.offeredPrice} / Kg
                      </td>
                      <td className="py-3">
                        <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-bold">
                          📦 {item.offer.quantityOffered} Kg
                        </Badge>
                      </td>
                      <td className="py-3 small fw-medium text-secondary">
                        📅 {item.offer.deliveryDate}
                      </td>
                      <td className="py-3">
                        {item.status === 'Accepted' && (
                          <Badge bg="success" className="px-3 py-2 rounded-pill fw-semibold">
                            ✅ Accepted
                          </Badge>
                        )}
                        {item.status === 'Pending' && (
                          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-semibold">
                            ⏳ Pending
                          </Badge>
                        )}
                        {item.status === 'Declined' && (
                          <Badge bg="danger" className="px-3 py-2 rounded-pill fw-semibold">
                            ❌ Declined
                          </Badge>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {item.status === 'Accepted' ? (
                          <Button
                            variant="success"
                            size="sm"
                            className="fw-bold px-3 py-2 rounded-pill shadow-sm"
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
                      No sent offers found matching your filters.
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