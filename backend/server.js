require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const app = express();
app.use(express.json());
app.use(cors());
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



const PORT = process.env.PORT || 5000;

// Since we might not have a MongoDB URI right away, we'll just log
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('No MONGO_URI in .env file. Running without DB connection.');
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
