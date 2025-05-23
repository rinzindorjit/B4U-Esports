const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PI_API_BASE_URL = 'https://api.testnet.minepi.com';
const PI_API_KEY = '9f5hgo2zonuxxjbteqbldd6getgsykewge603yu63thkeuh4uopgjlo6t6eo0mdl';
const APP_WALLET_ADDRESS = 'GCJZEOVAODSADUFWNEYFBYFASNUFASPZOLR53CIU54SQZIJT6WF62SPE';
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
        // TODO: Update your database (e.g., credit UC, Diamonds, or tournament entry)
        // TODO: Send confirmation email to the user
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
    // Log error to your database or monitoring system
    res.status(200).json({ status: 'error', message: 'Error logged' });
});

// Handle payment cancellations
app.post('/payment/cancel', (req, res) => {
    const { paymentId, debug } = req.body;
    console.log('Payment cancelled:', paymentId);
    // Handle cancellation (e.g., log to database)
    res.status(200).json({ status: 'cancelled', message: 'Payment cancelled' });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
