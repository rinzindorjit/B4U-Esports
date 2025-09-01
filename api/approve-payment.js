const PiServerSDK = require('../lib/pi-server');
const db = require('../lib/db');

module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let dbPayment = null;

  try {
    const { paymentId, paymentData } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    // Validate payment data
    if (!paymentData || !paymentData.amount || !paymentData.memo) {
      return res.status(400).json({ error: 'Invalid payment data' });
    }

    // Store payment in database
    dbPayment = db.createPayment({
      piPaymentId: paymentId,
      amount: paymentData.amount,
      memo: paymentData.memo,
      product: paymentData.metadata?.product || 'Unknown',
      type: paymentData.metadata?.type || 'general',
      piUsername: paymentData.metadata?.piUsername || 'Unknown',
      userEmail: paymentData.metadata?.userEmail || '',
      status: 'approving',
      metadata: paymentData.metadata || {},
      createdAt: new Date()
    });

    console.log('Payment stored in database:', dbPayment.id);

    // Initialize Pi Server SDK
    const piServer = new PiServerSDK();
    
    // For demo purposes, we'll simulate the approval process
    // In a real implementation, you would:
    // 1. Validate business logic (user has sufficient balance, product is available, etc.)
    // 2. Check for fraud or duplicate payments
    // 3. Then approve the payment with Pi Server
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For test mode, we'll simulate approval
    let result;
    if (piServer.testMode) {
      console.log('Test mode: Simulating payment approval');
      result = {
        identifier: paymentId,
        status: {
          developer_approved: true,
          transaction_verified: false,
          developer_completed: false,
          cancelled: false,
          user_cancelled: false
        }
      };
    } else {
      // Real API call to Pi Server
      result = await piServer.approvePayment(paymentId);
    }

    // Update payment status in database
    db.updatePayment(dbPayment.id, {
      status: 'approved',
      piApprovalData: result,
      approvedAt: new Date()
    });

    console.log('Payment approved:', paymentId);

    res.status(200).json({
      success: true,
      paymentId,
      data: result,
      dbId: dbPayment.id
    });
  } catch (error) {
    console.error('Error approving payment:', error);

    // Update payment status in database if it was created
    if (dbPayment) {
      db.updatePayment(dbPayment.id, {
        status: 'approval_failed',
        error: error.message,
        updatedAt: new Date()
      });
    }

    res.status(500).json({
      error: 'Failed to approve payment',
      message: error.response?.data?.message || error.message
    });
  }
};