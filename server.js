// backend/server.js
require('dotenv').config();
const express = require('express');
const apiRoutes = require('./routes/api');
const config = require('./config/config');

const app = express();

app.use(express.json());
app.use('/api', apiRoutes);

app.get('/', (req, res) => {
  res.send('Pi Testnet Backend is running');
});

app.listen(config.port, () => {
  console.log(`Backend server running on port ${config.port}`);
});