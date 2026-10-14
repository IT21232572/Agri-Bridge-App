import React, { useState } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';

const AddRequest = ({ onAddRequest }) => {
  const [formData, setFormData] = useState({
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
      title: formData.title,
      category: formData.category,
      location: formData.location,
      startingPrice: Number(formData.startingPrice),
      biddingEndTime: formData.biddingEndTime.replace('T', ' '),
      description: formData.description,
      buyerName: 'My Profile (Logged In Buyer)',
      contact: '+94 77 000 0000',
      status: 'Active',
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
              Add New Request / Bid
            </Card.Header>
            <Card.Body className="p-4">
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Request Title</Form.Label>
                  <Form.Control 
                    type="text" 
                    name="title" 
                    placeholder="E.g. Need 50kg of Carrots" 
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
                  <Form.Label className="fw-semibold">Description</Form.Label>
                  <Form.Control 
                    as="textarea" 
                    rows={3} 
                    name="description" 
                    placeholder="Describe your exact requirements..." 
                    value={formData.description} 
                    onChange={handleChange} 
                    required 
                  />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Location</Form.Label>
                      <Form.Control 
                        type="text" 
                        name="location" 
                        placeholder="E.g. Dambulla, Sri Lanka" 
                        value={formData.location} 
                        onChange={handleChange} 
                        required 
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Starting Price (LKR)</Form.Label>
                      <Form.Control 
                        type="number" 
                        name="startingPrice" 
                        placeholder="Enter amount" 
                        value={formData.startingPrice} 
                        onChange={handleChange} 
                        required 
                      />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">Bidding / Offer End Time</Form.Label>
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
                  Publish Request
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