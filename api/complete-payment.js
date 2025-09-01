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
    const { paymentId, txid, paymentData } = req.body;

    if (!paymentId || !txid) {
      return res.status(400).json({ error: 'Payment ID and TXID are required' });
    }

    // Find the payment in our database
    let paymentRecord = null;
    for (const payment of db.payments.values()) {
      if (payment.piPaymentId === paymentId) {
        paymentRecord = payment;
        break;
      }
    }

    if (!paymentRecord) {
      return res.status(404).json({ error: 'Payment record not found' });
    }

    // Update payment status in database
    db.updatePayment(paymentRecord.id, {
      status: 'completing',
      txid: txid,
      updatedAt: new Date()
    });

    // Initialize Pi Server SDK
    const piServer = new PiServerSDK();

    // For demo purposes, we'll simulate the completion process
    // In a real implementation, you would:
    // 1. Verify the transaction on the blockchain
    // 2. Update your database record
    // 3. Fulfill the order (deliver tokens, activate service, etc.)
    
    // Simulate some processing time
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    let result;
    if (piServer.testMode) {
      console.log('Test mode: Simulating payment completion');
      result = {
        identifier: paymentId,
        status: {
          developer_approved: true,
          transaction_verified: true,
          developer_completed: true,
          cancelled: false,
          user_cancelled: false
        },
        transaction: {
          txid: txid,
          verified: true,
          _link: `https://testnet.minepi.com/blockchain/transactions/${txid}`
        }
      };
    } else {
      // Real API call to Pi Server
      result = await piServer.completePayment(paymentId, txid);
    }

    // Update payment status in database
    db.updatePayment(paymentRecord.id, {
      status: 'completed',
      piCompletionData: result,
      completedAt: new Date()
    });

    console.log('Payment completed:', paymentId, txid);

    // Fulfill the order based on payment type
    await fulfillOrder(paymentRecord, paymentData);

    res.status(200).json({
      success: true,
      paymentId,
      txid,
      data: result,
      dbId: paymentRecord.id
    });
  } catch (error) {
    console.error('Error completing payment:', error);

    // Update payment status in database if it was found
    if (dbPayment) {
      db.updatePayment(dbPayment.id, {
        status: 'completion_failed',
        error: error.message,
        updatedAt: new Date()
      });
    }

    res.status(500).json({
      error: 'Failed to complete payment',
      message: error.response?.data?.message || error.message
    });
  }
};

// Function to fulfill the order based on payment type
async function fulfillOrder(paymentRecord, paymentData) {
  console.log('Fulfilling order for payment:', paymentRecord.id);
  
  const { type, metadata } = paymentRecord;
  
  try {
    // Simulate order fulfillment process
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    switch (type) {
      case 'pubg':
        console.log(`Delivering ${metadata.ucAmount} UC to PUBG ID: ${metadata.pubgId}`);
        // In a real implementation, you would call your UC delivery API here
        break;
        
      case 'mlbb':
        console.log(`Delivering ${metadata.diasAmount} Diamonds to MLBB User: ${metadata.mlbbUserId}, Zone: ${metadata.mlbbZoneId}`);
        // In a real implementation, you would call your Diamonds delivery API here
        break;
        
      case 'social':
        console.log(`Processing social boost for URL: ${metadata.socialUrl}`);
        // In a real implementation, you would call your social media boosting API here
        break;
        
      case 'tournament':
        console.log(`Registering user for tournament: ${paymentRecord.product}`);
        // In a real implementation, you would register the user for the tournament
        break;
        
      case 'marketplace':
        console.log(`Processing marketplace listing: ${paymentRecord.product}`);
        // In a real implementation, you would activate the marketplace listing
        break;
        
      default:
        console.log(`Processing general payment: ${paymentRecord.product}`);
    }
    
    // Update payment status to fulfilled
    db.updatePayment(paymentRecord.id, {
      status: 'fulfilled',
      fulfilledAt: new Date()
    });
    
    console.log('Order fulfilled successfully for payment:', paymentRecord.id);
    
  } catch (error) {
    console.error('Error fulfilling order:', error);
    
    // Update payment status to fulfillment failed
    db.updatePayment(paymentRecord.id, {
      status: 'fulfillment_failed',
      error: error.message,
      updatedAt: new Date()
    });
    
    throw error;
  }
}