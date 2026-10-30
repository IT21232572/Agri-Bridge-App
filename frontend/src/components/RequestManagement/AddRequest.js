import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';

const AddRequest = ({ onAddRequest }) => {
  const [formData, setFormData] = useState({
    requestType: 'Buyer', // Buyer or Seller
    title: '',
    category: 'Vegetables',
    location: '',
    startingPrice: '',
    biddingEndTime: '',
    description: '',
    buyerName: 'My Profile',
    contact: '+94 77 123 4567',
    image: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Create a temporary local URL for preview and storage
      setFormData({ ...formData, image: URL.createObjectURL(file) });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newReq = {
      ...formData,
      id: `REQ-${Math.floor(100 + Math.random() * 900)}`,
      status: 'Pending Match'
    };
    onAddRequest(newReq);
  };

  return (
    <Container className="mt-4 mb-5">
      <Card className="shadow-sm border-0">
        <Card.Header as="h5" className="bg-success text-white py-3">
          📄 Create New Post
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
                    <option value="Buyer">🛒 Buyer</option>
                    <option value="Seller">🚜 Seller</option>
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

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Title</Form.Label>
              <Form.Control
                type="text"
                name="title"
                placeholder="E.g. Need 100kg Big Onions / 500kg Bananas Available"
                value={formData.title}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    placeholder="E.g. Dambulla"
                    value={formData.location}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Price (LKR)</Form.Label>
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
              <Col md={4}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Valid Until</Form.Label>
                  <Form.Control
                    type="text"
                    name="biddingEndTime"
                    placeholder="2026-10-25 18:00"
                    value={formData.biddingEndTime}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={12}>
                <Form.Group>
                  <Form.Label className="fw-semibold">Upload Crop / Product Image</Form.Label>
                  <Form.Control
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                  />
                  <Form.Text className="text-muted">
                    Upload a clear photo of your crop or requirement item.
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label className="fw-semibold">Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                placeholder="Provide detailed description about quality, packaging, etc."
                value={formData.description}
                onChange={handleChange}
                required
              />
            </Form.Group>

            <div className="d-flex justify-content-end gap-2 mt-4">
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