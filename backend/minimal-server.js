require('dotenv').config();
const express = require('express');
const app = express();

app.get('/api/health', (req, res) => {
  res.json({ status: 'API is running' });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`);
});
