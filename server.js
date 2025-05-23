require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Environment variables
const PI_API_BASE_URL = 'https://api.testnet.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;
const APP_WALLET_ADDRESS = process.env.APP_WALLET_ADDRESS;
const PORT = process.env.PORT || 3000;

// Approve payment
app.post('/payment/approve', async (req, res) => {
    const { paymentId, accessToken } = req.body;

    try {
        // Verify access token
        const authResponse = await axios.get(`${PI_API_BASE_URL}/v2/me`, {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        // Approve payment on Pi Testnet
        const approveResponse = await axios.post(
            `${PI_API_BASE_URL}/v2/payments/${paymentId}/approve`,
            {},
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Payment approved:', approveResponse.data);
        res.status(200).json({ status: 'success', message: 'Payment approved' });
    } catch (error) {
        console.error('Approval error:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Complete payment
app.post('/payment/complete', async (req, res) => {
    const { paymentId, txid, debug } = req.body;

    try {
        // Complete payment on Pi Testnet
        const completeResponse = await axios.post(
            `${PI_API_BASE_URL}/v2/payments/${paymentId}/complete`,
            { txid },
            {
                headers: {
                    Authorization: `Key ${PI_API_KEY}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        console.log('Payment completed:', completeResponse.data);
        res.status(200).json({ status: 'success', message: 'Payment completed' });
    } catch (error) {
        console.error('Completion error:', error.response?.data || error.message);
        res.status(500).json({ status: 'error', message: error.message });
    }
});

// Handle payment errors
app.post('/payment/error', (req, res) => {
    const { paymentId, error, debug } = req.body;
    console.error('Payment error:', error, 'Payment ID:', paymentId);
    res.status(200).json({ status: 'error', message: 'Error logged' });
});

// Handle payment cancellations
app.post('/payment/cancel', (req, res) => {
    const { paymentId, debug } = req.body;
    console.log('Payment cancelled:', paymentId);
    res.status(200).json({ status: 'cancelled', message: 'Payment cancelled' });
});

// Start server (for local development; ignored in Vercel)
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless functions
module.exports = app;
