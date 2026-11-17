import axios from 'axios';

const SHIPMENTS_API = 'http://localhost:5000/api/shipments';
const SEARCH_API = 'http://localhost:5000/api/search';

export const getAllShipments = async (params = {}) => {
  const res = await axios.get(SHIPMENTS_API, { params });
  return res.data;
};

export const getShipmentById = async (id) => {
  const res = await axios.get(`${SHIPMENTS_API}/${id}`);
  return res.data;
};

export const trackShipment = async (trackingNumber) => {
  const res = await axios.get(`${SHIPMENTS_API}/track/${trackingNumber}`);
  return res.data;
};

export const createShipment = async (shipmentData) => {
  const res = await axios.post(SHIPMENTS_API, shipmentData);
  return res.data;
};

export const assignDriver = async (shipmentId, driverId) => {
  const res = await axios.post(`${SHIPMENTS_API}/${shipmentId}/assign-driver`, { driverId });
  return res.data;
};

export const autoAssignDriver = async (shipmentId) => {
  const res = await axios.post(`${SHIPMENTS_API}/${shipmentId}/auto-assign`);
  return res.data;
};

export const updateShipmentStatus = async (shipmentId, statusData) => {
  const res = await axios.put(`${SHIPMENTS_API}/${shipmentId}/status`, statusData);
  return res.data;
};

export const verifyProofOfDelivery = async (shipmentId, proofData) => {
  const res = await axios.post(`${SHIPMENTS_API}/${shipmentId}/verify-delivery`, proofData);
  return res.data;
};

export const getLogisticsAnalytics = async () => {
  const res = await axios.get(`${SHIPMENTS_API}/reports/analytics`);
  return res.data;
};

export const unifiedSearch = async (query) => {
  const res = await axios.get(SEARCH_API, { params: { q: query } });
  return res.data;
};
