require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());

// Request Logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Basic Route for testing
app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

// Import Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/agent', require('./routes/agent'));
app.use('/api/customer', require('./routes/customer'));
app.use('/api/commission', require('./routes/commission'));
app.use('/api/notification', require('./routes/notification'));
app.use('/api/allocation', require('./routes/allocation'));
app.use('/api/setting', require('./routes/setting'));

// DEBUG ROUTE for Cloudinary
app.get('/api/debug-cloudinary', (req, res) => {
    const cloudinary = require('cloudinary').v2;
    res.json({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY ? 'Present' : 'Missing',
        api_secret: process.env.CLOUDINARY_API_SECRET ? 'Present' : 'Missing',
        config: cloudinary.config()
    });
});



const PORT = process.env.PORT || 5000;

// Since we might not have a MongoDB URI right away, we'll just log
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI in .env file. Running without DB connection.');
}

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('SERVER ERROR:', err);
  res.status(500).json({ error: err.message || 'Internal Server Error' });
});

app.listen(PORT, () => {
  console.log('----------------------------------------------------');
  console.log(`🚀 STITCH BACKEND UPDATED AND RUNNING ON PORT ${PORT}`);
  console.log('----------------------------------------------------');
});
