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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Set maximum file size limit (2MB = 2 * 1024 * 1024 bytes)
      const maxSize = 2 * 1024 * 1024; 
      if (file.size > maxSize) {
        if (showToast) {
          showToast('Image size exceeds 2MB limit. Please choose a smaller image or compress it.', 'danger');
        } else {
          alert('Image size exceeds 2MB limit. Please choose a smaller image.');
        }
        e.target.value = null; // Clear file input
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Explicit Frontend Validation
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
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
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

  return (
    <Container fluid className="px-0 mb-5">
      
      {/* Hero Banner Section */}
      <div className="position-relative overflow-hidden mb-4 rounded-4 bg-white shadow-sm border-0">
        {/* Layer 1: Farm Background on Right */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'url("/farm-banner.png")',
            backgroundSize: 'cover',
            backgroundPosition: 'right center',
            zIndex: 0,
            top: 0,
            left: 0
          }}
        />
        
        {/* Layer 2: White Fade Overlay */}
        <div 
          className="position-absolute w-100 h-100"
          style={{
            background: 'linear-gradient(90deg, rgb(224, 235, 242) 0%, rgba(255,255,255,0) 100%)',
            zIndex: 1,
            top: 0,
            left: 0
          }}
        />

        {/* Layer 3: Title Content */}
        <div className="p-5 position-relative z-2" style={{ minHeight: '200px' }}>
          <span className="text-success fw-bold small text-uppercase mb-2 d-inline-block">
            ⚡ ADD POST
          </span>
          <h1 className="fw-bold display-6 text-dark" style={{ letterSpacing: '-0.5px' }}>
            Create New Post
          </h1>
          <p className="text-secondary mb-0 fw-medium">
            Share your produce, requirement, or supply with the Agri-Bridge community.
          </p>
        </div>
      </div>

      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="p-5">
          
          {/* Stepper / Progress Indicator */}
          <Row className="mb-5 text-center g-2">
            <Col>
              <div className="p-3 rounded-4 d-flex align-items-center justify-content-center gap-3" style={{ backgroundColor: '#eefcf1' }}>
                <span className="fs-3">✏️</span>
                <div className="text-start">
                  <strong className="d-block text-dark">Post Details</strong>
                  <small className="text-muted">Basic information about your post</small>
                </div>
              </div>
            </Col>
            <Col className="d-none d-md-flex align-items-center justify-content-center text-muted fs-4">›</Col>
            <Col>
              <div className="bg-light p-3 rounded-4 d-flex align-items-center justify-content-center gap-3 border">
                <span className="fs-3">📦</span>
                <div className="text-start">
                  <strong className="d-block text-dark">Product Information</strong>
                  <small className="text-muted">Quantity, price and description</small>
                </div>
              </div>
            </Col>
            <Col className="d-none d-md-flex align-items-center justify-content-center text-muted fs-4">›</Col>
            <Col>
              <div className="bg-light p-3 rounded-4 d-flex align-items-center justify-content-center gap-3 border">
                <span className="fs-3">🖼️</span>
                <div className="text-start">
                  <strong className="d-block text-dark">Media & Review</strong>
                  <small className="text-muted">Upload image and publish</small>
                </div>
              </div>
            </Col>
          </Row>

          <Form onSubmit={handleSubmit}>
            
            {/* Section 1: Post Details */}
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <span>📝</span> Post Details
            </h5>
            <Row className="mb-4">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Post Role Type <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                    className="shadow-sm py-2"
                  >
                    <option value="Buyer">🛒 Buyer (Looking to Buy)</option>
                    <option value="Seller">🚜 Seller (Have Stock Available)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Category <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="shadow-sm py-2 text-success fw-semibold"
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

            <hr className="text-muted mb-4 opacity-25" />

            {/* Section 2: Product Information */}
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <span>📦</span> Product Information
            </h5>
            
            <Form.Group className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="fw-semibold small mb-0">Product / Crop Name <span className="text-danger">*</span></Form.Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-success p-0 text-decoration-none fw-semibold"
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
                  className="shadow-sm py-2"
                >
                  {currentProducts.map((prod, idx) => (
                    <option key={idx} value={prod}>{prod}</option>
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
                  className="shadow-sm py-2"
                />
              )}
            </Form.Group>

            <Row className="mb-4 g-4">
              {/* Location */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">District / Location <span className="text-danger">*</span></Form.Label>
                  <Form.Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    className="shadow-sm py-2"
                  >
                    {SRI_LANKA_DISTRICTS.map((district, idx) => (
                      <option key={idx} value={district}>📍 {district}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Quantity */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Quantity (Kg / Units) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="E.g. 500"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                    min="1"
                    className="shadow-sm py-2"
                  />
                </Form.Group>
              </Col>

              {/* Price */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Price per Unit (LKR) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="number"
                    name="startingPrice"
                    placeholder="E.g. 350"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    required
                    min="0"
                    className="shadow-sm py-2"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-4 g-4">
              {/* Expiry Date */}
              <Col md={4}>
                <Form.Group className="h-100">
                  <Form.Label className="fw-semibold small">Valid Until (Expiry Date) <span className="text-danger">*</span></Form.Label>
                  <Form.Control
                    type="date"
                    name="biddingEndTime"
                    value={formData.biddingEndTime}
                    onChange={handleChange}
                    required
                    className="shadow-sm py-2"
                  />
                </Form.Group>
              </Col>

              {/* Custom Drag & Drop Image Upload */}
              <Col md={8}>
                <Form.Group>
                  <Form.Label className="fw-semibold small">Upload Product Image <span className="text-danger">*</span></Form.Label>
                  
                  {/* Hidden file input */}
                  <input
                    type="file"
                    accept="image/*"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />

                  {/* Drag and Drop Zone */}
                  {!imagePreview ? (
                    <div 
                      className="border border-2 rounded-3 text-center position-relative shadow-sm"
                      style={{ 
                        borderStyle: 'dashed !important', 
                        borderColor: '#28a745 !important', 
                        backgroundColor: '#f8fcf9', 
                        padding: '1.5rem',
                        cursor: 'pointer',
                        transition: 'background-color 0.2s'
                      }}
                      onClick={triggerFileInput}
                      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#eefcf1'}
                      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f8fcf9'}
                    >
                      <div className="d-flex align-items-center justify-content-center gap-3">
                        <span className="fs-1 text-success opacity-75">📷</span>
                        <div className="text-start">
                          <p className="mb-0 text-dark fw-medium">Drag & drop an image here, or <span className="text-success text-decoration-underline">click to browse</span></p>
                          <small className="text-muted">Max size: 2MB. Supported formats: JPG, PNG, WEBP.</small>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="position-relative border rounded-3 p-2 bg-light shadow-sm d-flex align-items-center justify-content-between">
                      <div className="d-flex align-items-center gap-3">
                        <img 
                          src={imagePreview} 
                          alt="Selected preview" 
                          className="rounded border"
                          style={{ width: '80px', height: '60px', objectFit: 'cover' }} 
                        />
                        <span className="text-success fw-semibold small">Image attached successfully ✅</span>
                      </div>
                      <Button variant="outline-danger" size="sm" onClick={() => setImagePreview(null)}>
                        Remove
                      </Button>
                    </div>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <hr className="text-muted mb-4 opacity-25" />

            {/* Section 3: Description */}
            <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
              <span>📄</span> Description & Quality Notes
            </h5>
            <Form.Group className="mb-4">
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Provide details about grade, packaging size, transport availability, etc."
                value={formData.description}
                onChange={handleChange}
                required
                className="shadow-sm p-3"
              />
            </Form.Group>

            {/* Action Buttons */}
            <div className="d-flex justify-content-end gap-3 mt-5 pt-3 border-top">
              <Button variant="outline-secondary" className="px-4 py-2 fw-semibold rounded-3" onClick={() => navigate('/')}>
                ✕ Cancel
              </Button>
              <Button variant="success" type="submit" className="px-4 py-2 fw-bold rounded-3 shadow-sm d-flex align-items-center gap-2">
                Publish Post
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddRequest;