import React, { useState, useRef } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const SRI_LANKA_DISTRICTS = [
  'Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo',
  'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara',
  'Kandy', 'Kegalle', 'Kilinochchi', 'Kurunegala', 'Mannar',
  'Matale', 'Matara', 'Monaragala', 'Mullaitivu', 'Nuwara Eliya',
  'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'
];

const CATEGORY_PRODUCTS = {
  Vegetables: ['Big Onions', 'Carrots', 'Tomatoes', 'Cabbage', 'Potatoes', 'Green Chillies', 'Beans', 'Leeks'],
  Fruits: ['Cavendish Bananas', 'Papaya', 'Mangoes', 'Pineapple', 'Passion Fruit', 'Avocado', 'Watermelon'],
  Seeds: ['Paddy Seeds (BG350)', 'Hybrid Tomato Seeds', 'Chillie Seeds', 'Corn Seeds', 'Vegetable Seed Packets'],
  Fertilizer: ['Urea', 'Muriate of Potash (MOP)', 'Triple Super Phosphate (TSP)', 'Organic Compost', 'Liquid Fertilizer'],
  Equipment: ['Water Pumps', 'Sprayers', 'Rotavators', 'Drip Irrigation Kits', 'Pruning Shears']
};

const AddRequest = ({ onAddSuccess, showToast }) => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    requestType: 'Buyer',
    category: 'Vegetables',
    productName: 'Big Onions',
    isCustomProduct: false,
    customProductName: '',
    location: 'Colombo',
    quantity: '',
    startingPrice: '',
    biddingEndTime: '',
    image: '',
    description: '',
    buyerName: 'My Profile',
    contact: '+94 77 123 4567'
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      setFormData({
        ...formData,
        category: value,
        productName: CATEGORY_PRODUCTS[value] ? CATEGORY_PRODUCTS[value][0] : ''
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const processSelectedFile = (file) => {
    if (!file) return;

    const maxSize = 2 * 1024 * 1024;
    if (file.size > maxSize) {
      if (showToast) {
        showToast('Image size exceeds 2MB limit. Please choose a smaller image or compress it.', 'danger');
      } else {
        alert('Image size exceeds 2MB limit. Please choose a smaller image.');
      }
      if (fileInputRef.current) fileInputRef.current.value = null;
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
      setFormData((prev) => ({ ...prev, image: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleImageChange = (e) => {
    processSelectedFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processSelectedFile(e.dataTransfer.files?.[0]);
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRemoveImage = (e) => {
    e.stopPropagation();
    setImagePreview(null);
    setFormData((prev) => ({ ...prev, image: '' }));
    if (fileInputRef.current) fileInputRef.current.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (Number(formData.quantity) <= 0) {
      if (showToast) showToast('Quantity must be greater than 0', 'danger');
      return;
    }
    if (Number(formData.startingPrice) < 0) {
      if (showToast) showToast('Price cannot be a negative number', 'danger');
      return;
    }

    const finalProduct = formData.isCustomProduct ? formData.customProductName : formData.productName;

    const newReq = {
      ...formData,
      title: finalProduct,
      id: `REQ-${Date.now().toString().slice(-6)}`,
      quantity: Number(formData.quantity),
      startingPrice: Number(formData.startingPrice),
      status: 'Pending Match',
      offers: []
    };

    try {
      await onAddSuccess(newReq);
      navigate('/');
    } catch (error) {
      console.error(error);
    }
  };

  const currentProducts = CATEGORY_PRODUCTS[formData.category] || [];

  const fieldStyle = {
    backgroundColor: '#f1f3f2',
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.68rem 0.95rem',
    fontSize: '0.93rem',
    color: '#1e293b'
  };

  return (
    <Container fluid className="px-0 mb-5">
      {/* Deep Green Gradient Hero Banner */}
      <div
        className="rounded-4 p-4 p-md-5 text-white position-relative overflow-hidden shadow-sm"
        style={{
          background:
            'radial-gradient(circle at 85% 45%, rgba(234, 179, 8, 0.45) 0%, rgba(22, 101, 52, 0.2) 38%, transparent 65%), linear-gradient(120deg, #0b3d22 0%, #14532d 55%, #1e6b38 100%)',
          paddingBottom: '4.5rem'
        }}
      >
        <div className="d-flex align-items-center gap-2 small fw-semibold mb-2 text-uppercase" style={{ color: '#bbf7d0' }}>
          <span>⚡</span>
          <span>ADD ADVERTISEMENT</span>
        </div>
        <h1 className="fw-bold display-6 mb-2 text-white" style={{ letterSpacing: '-0.5px' }}>
          Create New Advertisement
        </h1>
        <p className="text-white-50 mb-0 fw-medium">
          Share your produce requirement or supply advertisement with the Agri-Bridge community.
        </p>
      </div>

      <Form
        onSubmit={handleSubmit}
        className="px-2 px-md-3 position-relative"
        style={{ marginTop: '-34px', zIndex: 2 }}
      >
        {/* Section 1: Advertisement Type Card (Orange Top Accent) */}
        <Card
          className="border-0 rounded-4 bg-white mb-4 overflow-hidden"
          style={{
            borderTop: '4px solid #f97316',
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center fs-5"
                style={{ width: '38px', height: '38px', backgroundColor: '#ffedd5' }}
              >
                📝
              </div>
              <h5 className="fw-bold text-dark mb-0">Advertisement Type</h5>
            </div>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Advertisement Role Type</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    style={fieldStyle}
                    className="shadow-none fw-medium"
                  >
                    <option value="Buyer">🛒 Buyer (Looking to Buy)</option>
                    <option value="Seller">🚜 Seller (Have Stock Available)</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Category</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{ ...fieldStyle, color: '#15803d', fontWeight: 600 }}
                    className="shadow-none"
                  >
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Equipment">Equipment</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section 2: Product Information Card (Green Top Accent) */}
        <Card
          className="border-0 rounded-4 bg-white mb-4 overflow-hidden"
          style={{
            borderTop: '4px solid #16a34a',
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-4">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center fs-5"
                style={{ width: '38px', height: '38px', backgroundColor: '#dcfce7' }}
              >
                📦
              </div>
              <h5 className="fw-bold text-dark mb-0">Product Information</h5>
            </div>

            {/* Product / Crop Name */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <Form.Label className="fw-bold small text-dark mb-0">
                  Product / Crop Name <span className="text-danger">*</span>
                </Form.Label>
                <Button
                  type="button"
                  variant="link"
                  size="sm"
                  className="p-0 text-decoration-none fw-bold"
                  style={{ color: '#15803d', fontSize: '0.82rem' }}
                  onClick={() => setFormData({ ...formData, isCustomProduct: !formData.isCustomProduct })}
                >
                  {formData.isCustomProduct ? '← Pick from dropdown list' : '+ Type custom product name'}
                </Button>
              </div>

              {!formData.isCustomProduct ? (
                <Form.Select
                  name="productName"
                  value={formData.productName}
                  onChange={handleChange}
                  required
                  style={fieldStyle}
                  className="shadow-none fw-medium"
                >
                  {currentProducts.map((prod, idx) => (
                    <option key={idx} value={prod}>
                      {prod}
                    </option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  name="customProductName"
                  placeholder="Type exact product name (e.g. Red Sweet Potatoes)"
                  value={formData.customProductName}
                  onChange={handleChange}
                  required
                  style={fieldStyle}
                  className="shadow-none"
                />
              )}
            </Form.Group>

            {/* Location, Quantity, Price */}
            <Row className="mb-3 g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>District / Location</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    style={fieldStyle}
                    className="shadow-none fw-medium"
                  >
                    {SRI_LANKA_DISTRICTS.map((district, idx) => (
                      <option key={idx} value={district}>
                        📍 {district}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Quantity (Kg / Units)</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="E.g. 500"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    style={fieldStyle}
                    className="shadow-none"
                  />
                </Form.Group>
              </Col>

              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Price per Unit (LKR)</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <div
                    className="d-flex align-items-center px-3"
                    style={{
                      backgroundColor: '#f1f3f2',
                      border: '1px solid #e2e8f0',
                      borderRadius: '10px'
                    }}
                  >
                    <span className="text-muted fw-semibold small me-2">LKR</span>
                    <Form.Control
                      type="number"
                      name="startingPrice"
                      placeholder="E.g. 350"
                      value={formData.startingPrice}
                      onChange={handleChange}
                      required
                      min="0"
                      className="border-0 bg-transparent shadow-none px-0"
                      style={{ padding: '0.68rem 0', fontSize: '0.93rem' }}
                    />
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Expiry Date & Drag & Drop Image Upload */}
            <Row className="g-3">
              <Col md={4}>
                <Form.Group className="h-100">
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Valid Until (Expiry Date)</span>
                    <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="biddingEndTime"
                    value={formData.biddingEndTime}
                    onChange={handleChange}
                    required
                    style={fieldStyle}
                    className="shadow-none"
                  />
                </Form.Group>
              </Col>

              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-bold small text-dark d-flex justify-content-between">
                    <span>Upload Product Image</span>
                    <span className="text-danger">*</span>
                  </Form.Label>

                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {!imagePreview ? (
                    <div
                      role="button"
                      onClick={triggerFileInput}
                      onDragOver={(e) => {
                        e.preventDefault();
                        setIsDragging(true);
                      }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={handleDrop}
                      className="rounded-4 p-4 d-flex align-items-center justify-content-center"
                      style={{
                        minHeight: '132px',
                        border: isDragging ? '2px dashed #16a34a' : '1.5px dashed #86efac',
                        background: isDragging
                          ? '#dcfce7'
                          : 'linear-gradient(135deg, #f3faf5 0%, #fcf6ec 100%)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3 text-start">
                        <div
                          className="bg-white rounded-3 shadow-sm d-flex align-items-center justify-content-center fs-4 flex-shrink-0"
                          style={{ width: '48px', height: '48px' }}
                        >
                          📷
                        </div>
                        <div>
                          <p className="mb-0 text-dark fw-bold small">
                            Drag &amp; drop an image here, or{' '}
                            <span className="text-decoration-underline" style={{ color: '#15803d' }}>
                              click to browse
                            </span>
                          </p>
                          <small className="text-muted" style={{ fontSize: '0.76rem' }}>
                            Max size: 2MB. Supported formats: JPG, PNG, WEBP.
                          </small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      className="rounded-4 p-3 d-flex align-items-center justify-content-between"
                      style={{
                        border: '1.5px dashed #16a34a',
                        backgroundColor: '#f3faf5'
                      }}
                    >
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={imagePreview}
                          alt="Selected preview"
                          className="rounded-3 shadow-sm border border-2 border-white"
                          style={{ width: '82px', height: '68px', objectFit: 'cover' }}
                        />
                        <div>
                          <span className="text-success fw-bold small d-block">
                            Image attached successfully ✅
                          </span>
                          <small className="text-muted">Click Remove to change file</small>
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline-danger"
                        size="sm"
                        className="rounded-pill px-3 fw-semibold"
                        onClick={handleRemoveImage}
                      >
                        Remove
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section 3: Description & Quality Notes Card (Blue Top Accent) */}
        <Card
          className="border-0 rounded-4 bg-white mb-4 overflow-hidden"
          style={{
            borderTop: '4px solid #2563eb',
            boxShadow: '0 6px 22px rgba(0, 0, 0, 0.06)'
          }}
        >
          <Card.Body className="p-4">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div
                className="rounded-3 d-flex align-items-center justify-content-center fs-5"
                style={{ width: '38px', height: '38px', backgroundColor: '#dbeafe' }}
              >
                📄
              </div>
              <h5 className="fw-bold text-dark mb-0">Description &amp; Quality Notes</h5>
            </div>

            <Form.Group>
              <Form.Control
                as="textarea"
                rows={4}
                name="description"
                placeholder="Provide details about grade, packaging size, transport availability, etc."
                value={formData.description}
                onChange={handleChange}
                required
                style={fieldStyle}
                className="shadow-none p-3"
              />
            </Form.Group>
          </Card.Body>
        </Card>

        {/* Bottom Action Buttons */}
        <div className="d-flex justify-content-end align-items-center gap-3 pt-1">
          <Button
            type="button"
            variant="light"
            className="px-4 py-2 fw-bold bg-white border shadow-sm"
            style={{ borderRadius: '10px', color: '#334155', minWidth: '105px' }}
            onClick={() => navigate('/')}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="px-4 py-2 fw-bold text-white border-0"
            style={{
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #fb923c 0%, #f97316 100%)',
              boxShadow: '0 6px 18px rgba(249, 115, 22, 0.35)',
              minWidth: '185px'
            }}
          >
            Post Advertisement
          </Button>
        </div>
      </Form>
    </Container>
  );
};

export default AddRequest;