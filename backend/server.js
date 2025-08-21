const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('../frontend'));

// Pi Network API configuration
const PI_API_URL = process.env.PI_API_URL || 'https://api.minepi.com';
const PI_API_KEY = process.env.PI_API_KEY;

// In-memory storage for demo purposes (use a database in production)
let payments = {};
let users = {};

// Routes
app.get('/', (req, res) => {
    res.sendFile('index.html', { root: '../frontend' });
});

// Get user info from Pi Network
app.get('/api/user/:uid', async (req, res) => {
    try {
        const { uid } = req.params;
        const response = await axios.get(`${PI_API_URL}/v2/accounts/${uid}`, {
            headers: {
                'Authorization': `Key ${PI_API_KEY}`
            }
        });
        
        res.json({ success: true, user: response.data });
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch user information' });
    }
});

// Approve payment
app.post('/api/payments/approve', async (req, res) => {
    try {
        const { paymentId, paymentData, user } = req.body;
        
        // In a real application, you would:
        // 1. Validate the payment data
        // 2. Check if the user has sufficient balance
        // 3. Create a record in your database
        // 4. Potentially reserve the product/service
        
        // Store payment information
        payments[paymentId] = {
            ...paymentData,
            status: 'approved',
            userId: user.uid,
            timestamp: new Date().toISOString()
        };
        
        console.log(`Payment ${paymentId} approved for user ${user.username}`);
        
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ success: false, error: 'Failed to approve payment' });
    }
});

// Complete payment
app.post('/api/payments/complete', async (req, res) => {
    try {
        const { paymentId, txid, paymentData, user } = req.body;
        
        // Verify the transaction with Pi Network
        const response = await axios.get(`${PI_API_URL}/v2/payments/${paymentId}`, {
            headers: {
                'Authorization': `Key ${PI_API_KEY}`
            }
        });
        
        const paymentInfo = response.data;
        
        // Check if payment was successful
        if (paymentInfo.status.transaction_verified && paymentInfo.status.developer_approved) {
            // Update payment status
            payments[paymentId] = {
                ...payments[paymentId],
                status: 'completed',
                txid: txid,
                completedAt: new Date().toISOString()
            };
            
            // In a real application, you would:
            // 1. Fulfill the order (deliver product/service)
            // 2. Send confirmation email
            // 3. Update user account
            
            console.log(`Payment ${paymentId} completed with txid ${txid}`);
            
            // Send confirmation email
            try {
                await sendConfirmationEmail(paymentData.metadata.userEmail, paymentData);
            } catch (emailError) {
                console.error('Failed to send confirmation email:', emailError);
            }
            
            res.json({ success: true, paymentId, txid });
        } else {
            res.status(400).json({ success: false, error: 'Payment not verified' });
        }
    } catch (error) {
        console.error('Error completing payment:', error);
        res.status(500).json({ success: false, error: 'Failed to complete payment' });
    }
});

// Get payment status
app.get('/api/payments/:paymentId', (req, res) => {
    const { paymentId } = req.params;
    const payment = payments[paymentId];
    
    if (payment) {
        res.json({ success: true, payment });
    } else {
        res.status(404).json({ success: false, error: 'Payment not found' });
    }
});

// Get user payments
app.get('/api/users/:userId/payments', (req, res) => {
    const { userId } = req.params;
    const userPayments = Object.values(payments).filter(p => p.userId === userId);
    
    res.json({ success: true, payments: userPayments });
});

// Email confirmation function
async function sendConfirmationEmail(email, paymentData) {
    // In a real application, you would use a service like SendGrid, Mailgun, etc.
    console.log(`Sending confirmation email to ${email} for payment ${paymentData.memo}`);
    
    // This is a mock implementation
    const emailService = require('./config/email');
    return emailService.sendConfirmation(email, paymentData);
}

// Start server
app.listen(PORT, () => {
    console.log(`B4U Esports server running on port ${PORT}`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
});

module.exports = app;
