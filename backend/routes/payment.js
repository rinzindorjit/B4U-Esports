const express = require('express');
const router = express.Router();
const { sendPaymentEmails } = require('./email');

// Mock payment database (replace with real database in production)
const payments = new Map();

// Process payment approval
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
    
    // Store payment
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
    
    // Send email notifications
    const emailResults = await sendPaymentEmails(payment, user, 'approval');
    
    res.json({
      success: true,
      message: 'Payment approved successfully',
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        product: payment.product
      },
      emailResults
    });
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

// Get payment history for user
router.get('/history/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    const userPayments = Array.from(payments.values())
      .filter(payment => payment.userEmail === email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    res.json({
      success: true,
      payments: userPayments.map(payment => ({
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        product: payment.product,
        type: payment.type,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt
      }))
    });
  } catch (error) {
    console.error('Payment history error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get payment by ID
router.get('/:paymentId', (req, res) => {
  try {
    const { paymentId } = req.params;
    
    if (!payments.has(paymentId)) {
      return res.status(404).json({
        success: false,
        error: 'Payment not found'
      });
    }
    
    const payment = payments.get(paymentId);
    
    res.json({
      success: true,
      payment: {
        id: payment.id,
        status: payment.status,
        amount: payment.amount,
        product: payment.product,
        type: payment.type,
        userEmail: payment.userEmail,
        piUsername: payment.piUsername,
        createdAt: payment.createdAt,
        completedAt: payment.completedAt,
        txid: payment.txid
      }
    });
  } catch (error) {
    console.error('Get payment error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
