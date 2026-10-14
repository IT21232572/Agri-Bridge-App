import React, { useState } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';

const AddRequest = ({ onAddRequest }) => {
  const [formData, setFormData] = useState({
    requestType: 'Buyer Demand',
    title: '',
    category: '',
    description: '',
    location: '',
    startingPrice: '',
    biddingEndTime: '',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    setFormData({ ...formData, image: e.target.files[0] });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newRequest = {
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      requestType: formData.requestType,
      title: formData.title,
      category: formData.category,
      location: formData.location.trim(),
      startingPrice: Number(formData.startingPrice),
      biddingEndTime: formData.biddingEndTime.replace('T', ' '),
      description: formData.description,
      buyerName: formData.requestType === 'Buyer Demand' ? 'My Profile (Buyer)' : 'My Profile (Farmer/Seller)',
      contact: '+94 77 000 0000',
      status: 'Pending Match',
      offersCount: 0
    };

    onAddRequest(newRequest);
  };

  return (
    <Container className="mt-4 mb-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="shadow-sm border-0">
            <Card.Header as="h5" className="bg-success text-white text-center py-3">
              Post New Crop Request / Supply Offer
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                {/* Two-Way Request Type Selector */}
                <Form.Group className="mb-4 p-3 bg-light rounded border">
                  <Form.Label className="fw-bold text-dark d-block mb-2">Select Your Role / Post Type:</Form.Label>
                  <div className="d-flex gap-4">
                    <Form.Check
                      type="radio"
                      label="🛒 Buyer Demand (Looking to Buy Crops)"
                      name="requestType"
                      value="Buyer Demand"
                      checked={formData.requestType === 'Buyer Demand'}
                      onChange={handleChange}
                      className="fw-semibold text-primary"
                    />
                    <Form.Check
                      type="radio"
                      label="🚜 Seller Supply (Have Crops to Sell)"
                      name="requestType"
                      value="Seller Supply"
                      checked={formData.requestType === 'Seller Supply'}
                      onChange={handleChange}
                      className="fw-semibold text-success"
                    />
                  </div>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Post Title (Include Crop Name & Quantity)</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title" 
                    placeholder="E.g. 100kg Pumpkin or 50kg Carrots" 
                    value={formData.title} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Category</Form.Label>
                  <Form.Select 
                    name="category" 
                    value={formData.category} 
                    onChange={handleChange} 
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Equipment">Equipment</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Description & Quality Requirements</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="description" 
                    placeholder="Describe your exact requirements or harvest quality..." 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Location (District/City)</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="location" 
                        placeholder="E.g. Matara, Dambulla" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">
                        {formData.requestType === 'Buyer Demand' ? 'Target Buying Price (LKR)' : 'Expected Selling Price (LKR)'}
                      </Form.Label>
                      <Form.Control 
                        type="number" 
                        name="startingPrice" 
                        placeholder="Price per kg / unit" 
                        value={formData.startingPrice} 
                        onChange={handleChange} 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Offer / Request Valid Until</Form.Label>
                  <Form.Control 
                    type="datetime-local" 
                    name="biddingEndTime" 
                    value={formData.biddingEndTime} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Upload Reference Image</Form.Label>
                  <Form.Control 
                    type="file" 
                    name="image" 
                    accept="image/*" 
                    onChange={handleImageChange} 
                  />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 mt-3 fw-bold py-2 shadow-sm">
                  Publish & Run Auto-Match
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AddRequest;