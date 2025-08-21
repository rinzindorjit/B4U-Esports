const express = require('express');
const router = express.Router();
const { sendPaymentEmails } = require('./email');

// Mock payment database (replace with real database in production)
const payments = new Map();

// Process payment approval - FAST RESPONSE REQUIRED FOR PI WALLET
router.post('/approve', async (req, res) => {
    try {
        const { paymentId, paymentData, user } = req.body;
        
        if (!paymentId || !paymentData || !user) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID, payment data, and user information are required'
            });
        }
        
        // Validate payment data
        if (!paymentData.amount || !paymentData.metadata || !paymentData.metadata.userEmail) {
            return res.status(400).json({
                success: false,
                error: 'Invalid payment data'
            });
        }
        
        // Store payment immediately (fast response for Pi Wallet)
        const payment = {
            id: paymentId,
            status: 'approved',
            amount: paymentData.amount,
            product: paymentData.metadata.product,
            userEmail: paymentData.metadata.userEmail,
            piUsername: paymentData.metadata.piUsername,
            type: paymentData.metadata.type,
            createdAt: new Date().toISOString(),
            metadata: paymentData.metadata
        };
        
        payments.set(paymentId, payment);
        
        // Send immediate response to Pi Wallet (within 2-3 seconds)
        res.json({
            success: true,
            message: 'Payment approved successfully',
            payment: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                product: payment.product
            }
        });
        
        // Send email notifications in background (don't wait for this)
        setTimeout(async () => {
            try {
                await sendPaymentEmails(payment, user, 'approval');
            } catch (emailError) {
                console.error('Email sending error:', emailError);
                // Don't fail the payment if email fails
            }
        }, 0);
        
    } catch (error) {
        console.error('Payment approval error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

// Process payment completion
router.post('/complete', async (req, res) => {
    try {
        const { paymentId, txid, paymentData, user } = req.body;
        
        if (!paymentId || !txid || !paymentData || !user) {
            return res.status(400).json({
                success: false,
                error: 'Payment ID, transaction ID, payment data, and user information are required'
            });
        }
        
        // Check if payment exists
        if (!payments.has(paymentId)) {
            return res.status(404).json({
                success: false,
                error: 'Payment not found'
            });
        }
        
        // Update payment
        const payment = payments.get(paymentId);
        payment.status = 'completed';
        payment.txid = txid;
        payment.completedAt = new Date().toISOString();
        
        payments.set(paymentId, payment);
        
        // Send email notifications
        const emailResults = await sendPaymentEmails(payment, user, 'completion', txid);
        
        res.json({
            success: true,
            message: 'Payment completed successfully',
            payment: {
                id: payment.id,
                status: payment.status,
                amount: payment.amount,
                product: payment.product,
                txid: payment.txid
            },
            emailResults
        });
    } catch (error) {
        console.error('Payment completion error:', error);
        res.status(500).json({
            success: false,
            error: 'Internal server error'
        });
    }
});

module.exports = router;
