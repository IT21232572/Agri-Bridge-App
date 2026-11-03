import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Button } from 'react-bootstrap';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar', 
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya', 
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const EditPostModal = ({ show, onHide, request, onUpdatePost, showToast }) => {
  const [editFormData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Sync state when a new request is passed in or modal opens
  useEffect(() => {
    if (request) {
      setFormData({
        title: request.title || '',
        category: request.category || 'Vegetables',
        location: request.location || 'Colombo',
        quantity: request.quantity || '',
        startingPrice: request.startingPrice || '',
        biddingEndTime: request.biddingEndTime || '',
        description: request.description || '',
        image: request.image || ''
      });
      setImagePreview(request.image || null);
    }
  }, [request, show]);

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    onUpdatePost(request.id, {
      ...editFormData,
      quantity: Number(editFormData.quantity),
      startingPrice: Number(editFormData.startingPrice)
    });
    onHide();
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-success text-white">
        <Modal.Title>✏️ Edit Post ({request?.id})</Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-4">
        <Form onSubmit={handleEditSubmit}>
          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Title / Product Name</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={editFormData.title || ''}
                  onChange={handleEditChange}
                  required
                />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">Category</Form.Label>
                <Form.Select name="category" value={editFormData.category || ''} onChange={handleEditChange}>
                  <option value="Vegetables">Vegetables</option>
                  <option value="Fruits">Fruits</option>
                  <option value="Seeds">Seeds</option>
                  <option value="Fertilizer">Fertilizer</option>
                  <option value="Equipment">Equipment</option>
                </Form.Select>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold">District / Location</Form.Label>
                <Form.Select name="location" value={editFormData.location || ''} onChange={handleEditChange} required>
                  {SRI_LANKA_DISTRICTS.map((district, idx) => (
                    <option key={idx} value={district}>{district}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Quantity (Kg / Units)</Form.Label>
                <Form.Control type="number" name="quantity" value={editFormData.quantity || ''} onChange={handleEditChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Price per Unit (LKR)</Form.Label>
                <Form.Control type="number" name="startingPrice" value={editFormData.startingPrice || ''} onChange={handleEditChange} required />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold">Valid Until</Form.Label>
                <Form.Control type="date" name="biddingEndTime" value={editFormData.biddingEndTime || ''} onChange={handleEditChange} required />
              </Form.Group>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold">Update Product Image 📸</Form.Label>
                <Form.Control type="file" accept="image/*" onChange={handleImageChange} />
              </Form.Group>
            </Col>
          </Row>

          {imagePreview && (
            <div className="mb-3 text-center bg-light p-3 rounded">
              <span className="d-block text-muted small mb-2">Image Preview:</span>
              <img src={imagePreview} alt="Crop preview" style={{ maxHeight: '150px', objectFit: 'contain' }} className="rounded border shadow-sm" />
            </div>
          )}

          <Form.Group className="mb-3">
            <Form.Label className="fw-semibold">Description</Form.Label>
            <Form.Control as="textarea" rows={3} name="description" value={editFormData.description || ''} onChange={handleEditChange} required />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2 mt-4">
            <Button variant="secondary" onClick={onHide}>Cancel</Button>
            <Button variant="success" type="submit" className="fw-bold px-4">Save Changes ✅</Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditPostModal;