import React, { useState } from 'react';
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

const AddRequest = ({ onAddSuccess }) => {
  const navigate = useNavigate();

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
      const reader = new FileReader();
      reader.onloadend = () => {
        // reader.result is a Base64 data string representing the actual image file
        setImagePreview(reader.result);
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
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
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm border-0">
        <Card.Header as="h5" className="bg-success text-white py-3">
          📄 Create New Post with Photo Upload & Specifications
        </Card.Header>
        <Card.Body className="p-4">
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Post Role Type</Form.Label>
                  <Form.Select
                    name="requestType"
                    value={formData.requestType}
                    onChange={handleChange}
                  >
                    <option value="Buyer">🛒 Buyer (Looking to Buy)</option>
                    <option value="Seller">🚜 Seller (Have Stock Available)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
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

            {/* Product Name Selection */}
            <Form.Group className="mb-3">
              <div className="d-flex justify-content-between align-items-center mb-1">
                <Form.Label className="fw-semibold mb-0">Product / Crop Name</Form.Label>
                <Button 
                  variant="link" 
                  size="sm" 
                  className="text-success p-0 text-decoration-none"
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
                />
              )}
            </Form.Group>

            <Row className="mb-3">
              {/* Districts Dropdown */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">District / Location</Form.Label>
                  <Form.Select
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  >
                    {SRI_LANKA_DISTRICTS.map((district, idx) => (
                      <option key={idx} value={district}>{district}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Quantity */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Quantity (Kg / Units)</Form.Label>
                  <Form.Control
                    type="number"
                    name="quantity"
                    placeholder="E.g. 500"
                    value={formData.quantity}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Price */}
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Price per Unit (LKR)</Form.Label>
                  <Form.Control
                    type="number"
                    name="startingPrice"
                    placeholder="E.g. 350"
                    value={formData.startingPrice}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              {/* Date Picker */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Valid Until (Expiry Date)</Form.Label>
                  <Form.Control
                    type="date"
                    name="biddingEndTime"
                    value={formData.biddingEndTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>

              {/* Image Upload Field */}
              <Col md={6}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Upload Product Image 📸</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Image Preview Thumbnail */}
            {imagePreview && (
              <div className="mb-3 text-center bg-light p-3 rounded">
                <span className="d-block text-muted small mb-2">Image Preview:</span>
                <img 
                  src={imagePreview} 
                  alt="Crop preview" 
                  style={{ maxHeight: '150px', objectFit: 'contain' }} 
                  className="rounded border shadow-sm"
                />
              </div>
            )}

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description & Quality Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Provide details about grade, packaging size, transport availability, etc."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
              <Button variant="secondary" onClick={() => navigate('/')}>
                Cancel
              </Button>
              <Button variant="success" type="submit" className="px-4 fw-bold">
                Publish Post 🚀
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default AddRequest;