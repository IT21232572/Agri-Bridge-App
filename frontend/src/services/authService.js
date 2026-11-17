import axios from 'axios';

const API_BASE = 'http://localhost:5000/api/users';

const getAuthHeaders = () => {
  const token = localStorage.getItem('agri_auth_token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const loginUser = async (credentials) => {
  const res = await axios.post(`${API_BASE}/login`, credentials);
  if (res.data.token) {
    localStorage.setItem('agri_auth_token', res.data.token);
    localStorage.setItem('agri_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const registerUser = async (userData) => {
  const res = await axios.post(`${API_BASE}/register`, userData);
  if (res.data.token) {
    localStorage.setItem('agri_auth_token', res.data.token);
    localStorage.setItem('agri_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const logoutUser = () => {
  localStorage.removeItem('agri_auth_token');
  localStorage.removeItem('agri_user');
};

export const getCurrentUserProfile = async () => {
  const res = await axios.get(`${API_BASE}/me`, getAuthHeaders());
  return res.data;
};

export const updateUserProfile = async (profileData) => {
  const res = await axios.put(`${API_BASE}/profile`, profileData, getAuthHeaders());
  if (res.data.user) {
    localStorage.setItem('agri_user', JSON.stringify(res.data.user));
  }
  return res.data;
};

export const getAllUsers = async (params = {}) => {
  const res = await axios.get(API_BASE, { params });
  return res.data;
};

export const updateUserRole = async (userId, data) => {
  const res = await axios.put(`${API_BASE}/${userId}/role`, data, getAuthHeaders());
  return res.data;
};

export const getAllDrivers = async (params = {}) => {
  const res = await axios.get(`${API_BASE}/drivers/list`, { params });
  return res.data;
};

export const updateDriverAvailability = async (driverId, data) => {
  const res = await axios.put(`${API_BASE}/drivers/${driverId}/availability`, data, getAuthHeaders());
  return res.data;
};

export const deleteUser = async (userId) => {
  const res = await axios.delete(`${API_BASE}/${userId}`, getAuthHeaders());
  return res.data;
};
