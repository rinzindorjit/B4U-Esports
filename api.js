// backend/routes/api.js
const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('../config/config');

// Approve payment
router.post('/payments/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    const response = await axios.post(
      `${config.piApiEndpoint}/payments/approve`,
      { paymentId },
      {
        headers: {
          Authorization: `Key ${config.piTestnetApiKey}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment' });
  }
});

// Complete payment
router.post('/payments/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    const response = await axios.post(
      `${config.piApiEndpoint}/payments/complete`,
      { paymentId, txid },
      {
        headers: {
          Authorization: `Key ${config.piTestnetApiKey}`,
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ error: 'Failed to complete payment' });
  }
});

module.exports = router;