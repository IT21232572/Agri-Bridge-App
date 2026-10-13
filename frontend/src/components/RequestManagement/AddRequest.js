import React, { useState } from 'react';
import { Form, Button, Container, Card, Row, Col } from 'react-bootstrap';

const AddRequest = () => {
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
    console.log("Form Submitted:", formData);
    alert("Request Details Logged to Console (Backend Integration Pending)");
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-md-center">
        <Col md={8}>
          <Card className="shadow">
            <Card.Header as="h4" className="bg-success text-white text-center">
              Add New Request / Bid
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Request Title</Form.Label>
                  <Form.Control type="text" name="title" placeholder="E.g. Need 50kg of Carrots" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Category</Form.Label>
                  <Form.Select name="category" onChange={handleChange} required>
                    <option value="">Select a category</option>
                    <option value="Vegetables">Vegetables</option>
                    <option value="Fruits">Fruits</option>
                    <option value="Seeds">Seeds</option>
                    <option value="Fertilizer">Fertilizer</option>
                    <option value="Equipment">Equipment</option>
                  </Form.Select>
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Description</Form.Label>
                  <Form.Control as="textarea" rows={3} name="description" placeholder="Describe your exact requirements..." onChange={handleChange} required />
                </Form.Group>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Location</Form.Label>
                      <Form.Control type="text" name="location" placeholder="E.g. Dambulla, Sri Lanka" onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Starting Price (LKR)</Form.Label>
                      <Form.Control type="number" name="startingPrice" placeholder="Enter amount" onChange={handleChange} required />
                    </Form.Group>
                  </Col>
                </Row>

                <Form.Group className="mb-3">
                  <Form.Label>Bidding / Offer End Time</Form.Label>
                  <Form.Control type="datetime-local" name="biddingEndTime" onChange={handleChange} required />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Upload Reference Image</Form.Label>
                  <Form.Control type="file" name="image" accept="image/*" onChange={handleImageChange} />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100 mt-3 fw-bold">
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