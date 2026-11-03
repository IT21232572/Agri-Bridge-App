import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Badge, Button } from 'react-bootstrap';
import { addOfferToRequest } from '../../services/requestService';

const OfferModal = ({ show, onHide, targetRequest, refreshRequests, showToast }) => {
  const [offerData, setOfferData] = useState({
    offeredPrice: '',
    quantityOffered: '',
    deliveryDate: '',
    remarks: ''
  });

  // Reset form when modal opens
  useEffect(() => {
    if (show) {
      setOfferData({ offeredPrice: '', quantityOffered: '', deliveryDate: '', remarks: '' });
    }
  }, [show]);

  const handleOfferChange = (e) => {
    const { name, value } = e.target;
    setOfferData(prev => ({ ...prev, [name]: value }));
  };

  const handleOfferSubmit = async (e) => {
    e.preventDefault();
    if (!targetRequest) return;

    const newOffer = {
      sender: 'Current Logged In User',
      offeredPrice: Number(offerData.offeredPrice),
      quantityOffered: Number(offerData.quantityOffered),
      deliveryDate: offerData.deliveryDate,
      remarks: offerData.remarks
    };

    try {
      await addOfferToRequest(targetRequest.id, newOffer);
      if (showToast) showToast(`Offer of LKR ${offerData.offeredPrice} submitted successfully! 🚀`, 'success');
      onHide();
      if (refreshRequests) refreshRequests();
    } catch (error) {
      if (showToast) showToast('Failed to submit offer to server.', 'danger');
    }
  };

  if (!targetRequest) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title className="h5">
          {targetRequest.requestType} Details & Direct Response
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Row className="mb-3 align-items-center">
          <Col md={5}>
            <Badge bg={targetRequest.requestType === 'Buyer' ? 'primary' : 'success'} className="mb-2 me-2">
              {targetRequest.requestType}
            </Badge>
            <Badge bg="secondary" className="mb-2">{targetRequest.category}</Badge>
            <h4 className="fw-bold text-dark">{targetRequest.title}</h4>
            <div className="d-flex align-items-center gap-2 mb-2">
              <span className="text-muted small">📍 Location: {targetRequest.location}</span>
              <Badge bg="warning" text="dark">📦 {targetRequest.quantity || 0} Kg</Badge>
            </div>
            <p className="mt-2 text-secondary small">{targetRequest.description}</p>
          </Col>

          <Col md={3} className="text-center px-1">
            {targetRequest.image ? (
              <img 
                src={targetRequest.image} 
                alt={targetRequest.title} 
                className="rounded shadow-sm border" 
                style={{ width: '100px', height: '100px', objectFit: 'cover' }} 
              />
            ) : (
              <div className="text-muted small border rounded p-2 bg-light" style={{ height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                📷 No Image
              </div>
            )}
          </Col>

          <Col md={4} className="border-start">
            <div className="bg-light p-3 rounded">
              <span className="text-muted small d-block">Listed Price:</span>
              <h4 className="text-success fw-bold">LKR {targetRequest.startingPrice}</h4>
              <hr className="my-2" />
              <span className="text-muted small d-block">Posted By:</span>
              <strong className="d-block text-dark">{targetRequest.buyerName || 'My Profile'}</strong>
              <small className="text-muted">{targetRequest.contact || '+94 77 123 4567'}</small>
            </div>
          </Col>
        </Row>

        <hr />

        <h5 className="fw-bold text-success mb-3">Send Counter Offer / Direct Bid</h5>
        <Form onSubmit={handleOfferSubmit}>
          <Row>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Your Price (LKR)</Form.Label>
                <Form.Control
                  type="number"
                  name="offeredPrice"
                  placeholder={`E.g. ${targetRequest.startingPrice}`}
                  value={offerData.offeredPrice}
                  onChange={handleOfferChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Quantity (Kg)</Form.Label>
                <Form.Control
                  type="number"
                  name="quantityOffered"
                  placeholder="E.g. 500"
                  value={offerData.quantityOffered}
                  onChange={handleOfferChange}
                  required
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Expected Delivery Date</Form.Label>
                <Form.Control
                  type="date"
                  name="deliveryDate"
                  value={offerData.deliveryDate}
                  onChange={handleOfferChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Remarks / Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={2}
              name="remarks"
              placeholder="Provide details about stock quality, transport, etc."
              value={offerData.remarks}
              onChange={handleOfferChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide}>
              Close
            </Button>
            <Button variant="success" type="submit" className="fw-bold px-4">
              Submit Offer
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default OfferModal;