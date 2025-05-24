const express = require('express');
const router = express.Router();
const axios = require('axios');
const config = require('./config');

// Approve payment: POST /api/payments/approve
router.post('/payments/approve', async (req, res) => {
  try {
    const { paymentId } = req.body;
    if (!paymentId) {
      return res.status(400).json({ error: 'paymentId is required' });
    }

    const response = await axios.post(
      `${config.piApiEndpoint}/payments/approve`,
      { paymentId },
      {
        headers: {
          Authorization: `Key ${config.piTestnetApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error approving payment:', error.message);
    res.status(500).json({ error: 'Failed to approve payment', details: error.message });
  }
});

// Complete payment: POST /api/payments/complete
router.post('/payments/complete', async (req, res) => {
  try {
    const { paymentId, txid } = req.body;
    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'paymentId and txid are required' });
    }

    const response = await axios.post(
      `${config.piApiEndpoint}/payments/complete`,
      { paymentId, txid },
      {
        headers: {
          Authorization: `Key ${config.piTestnetApiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error completing payment:', error.message);
    res.status(500).json({ error: 'Failed to complete payment', details: error.message });
  }
});

module.exports = router;
