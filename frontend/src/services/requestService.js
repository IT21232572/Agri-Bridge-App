import axios from 'axios';

const API_URL = 'http://localhost:5000/api/requests';
const DEALS_URL = 'http://localhost:5000/api/deals';

// Get all requests
export const getAllRequests = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Error fetching requests:', error);
    throw error;
  }
};

// Get a single request by its custom ID
export const getRequestById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching request ${id}:`, error);
    throw error;
  }
};

// Create a new request
export const createRequest = async (requestData) => {
  try {
    const response = await axios.post(API_URL, requestData);
    return response.data;
  } catch (error) {
    console.error('Error creating request:', error);
    throw error;
  }
};

// Update an existing request
export const updateRequest = async (id, requestData) => {
  try {
    const response = await axios.put(`${API_URL}/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error('Error updating request:', error);
    throw error;
  }
};

// Delete a request
export const deleteRequest = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting request:', error);
    throw error;
  }
};

// Add an offer to a request (Best Offer recommendation system)
export const addOfferToRequest = async (id, offerData) => {
  try {
    const response = await axios.post(`${API_URL}/${id}/offers`, offerData);
    return response.data;
  } catch (error) {
    console.error('Error adding offer:', error);
    throw error;
  }
};

export const getAllDeals = async () => {
  const response = await axios.get(DEALS_URL);
  return response.data;
};

export const createDeal = async (dealData) => {
  const response = await axios.post(DEALS_URL, dealData);
  return response.data;
};