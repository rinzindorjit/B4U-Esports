const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./lib/db');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Import API routes
const approvePayment = require('./api/approve-payment');
const completePayment = require('./api/complete-payment');

// API Routes
app.post('/api/approve-payment', approvePayment);
app.post('/api/complete-payment', completePayment);

// Payment status endpoint
app.get('/api/payment-status', async (req, res) => {
  try {
    const { paymentId, piPaymentId } = req.query;

    if (!paymentId && !piPaymentId) {
      return res.status(400).json({ error: 'Payment ID or Pi Payment ID is required' });
    }

    let payment;
    if (paymentId) {
      payment = db.getPayment(paymentId);
    } else if (piPaymentId) {
      payment = db.findPaymentByPiId(piPaymentId);
    }

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    // Get related orders
    const orders = db.findOrdersByPaymentId(payment.id);

    res.status(200).json({
      success: true,
      payment,
      orders
    });
  } catch (error) {
    console.error('Error getting payment status:', error);

    res.status(500).json({
      error: 'Failed to get payment status',
      message: error.message
    });
  }
});

// Admin endpoint to view all data (for debugging)
app.get('/api/admin/data', (req, res) => {
  if (process.env.NODE_ENV !== 'development') {
    return res.status(403).json({ error: 'Access denied' });
  }
  
  res.status(200).json(db.getAllData());
});

// Serve the main page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`B4U Esports server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to view the application`);
  console.log('API endpoints available at:');
  console.log(`  POST /api/approve-payment`);
  console.log(`  POST /api/complete-payment`);
  console.log(`  GET  /api/payment-status`);
  console.log(`  GET  /api/admin/data (development only)`);
});