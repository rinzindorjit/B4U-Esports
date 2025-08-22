const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// Mock database for demo purposes
let payments = {};
let users = {};

// API Routes
app.get('/api', (req, res) => {
    res.json({ 
        message: 'B4U Esports API is working!',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// Get user info
app.get('/api/user/:uid', (req, res) => {
    const { uid } = req.params;
    const user = users[uid];
    
    if (user) {
        res.json({ success: true, user });
    } else {
        res.status(404).json({ success: false, error: 'User not found' });
    }
});

// Approve payment
app.post('/api/payments/approve', (req, res) => {
    try {
        const { paymentId, paymentData, user } = req.body;
        
        console.log(`Approving payment ${paymentId} for user ${user.username}`);
        
        // Store payment information
        payments[paymentId] = {
            ...paymentData,
            status: 'approved',
            userId: user.uid,
            timestamp: new Date().toISOString()
        };
        
        // Store user if not exists
        if (!users[user.uid]) {
            users[user.uid] = user;
        }
        
        res.json({ success: true, paymentId });
    } catch (error) {
        console.error('Error approving payment:', error);
        res.status(500).json({ success: false, error: 'Failed to approve payment' });
    }
});

// Complete payment
app.post('/api/payments/complete', (req, res) => {
    try {
        const { paymentId, txid, paymentData, user } = req.body;
        
        console.log(`Completing payment ${paymentId} with txid ${txid}`);
        
        // Update payment status
        if (payments[paymentId]) {
            payments[paymentId] = {
                ...payments[paymentId],
                status: 'completed',
                txid: txid,
                completedAt: new Date().toISOString()
            };
            
            res.json({ success: true, paymentId, txid });
        } else {
            res.status(404).json({ success: false, error: 'Payment not found' });
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

// Serve frontend for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`B4U Esports server running on port ${PORT}`);
    console.log(`API available at: http://localhost:${PORT}/api`);
    console.log(`Frontend available at: http://localhost:${PORT}`);
});

module.exports = app;
