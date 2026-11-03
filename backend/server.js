const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dns = require('dns'); // 1. Require DNS module
require('dotenv').config();

// 2. Set DNS servers to Google's Public DNS to bypass local ISP DNS blocking
dns.setServers(['8.8.8.8', '8.8.4.4']);

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

mongoose.connect(MONGO_URI, {
  family: 4
})
.then(() => console.log('✅ MongoDB Connected Successfully'))
.catch((err) => console.error('❌ MongoDB Connection Error:', err));

app.get('/', (req, res) => {
  res.send('Agri-Bridge Backend API is running...');
});

const requestRoutes = require('./routes/requestRoutes');
app.use('/api/requests', requestRoutes);

const dealRoutes = require('./routes/dealRoutes');
app.use('/api/deals', dealRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});