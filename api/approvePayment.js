const fetch = require('node-fetch');

module.exports = async function handler(req, res) {
  // Restrict to POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { action, paymentId, txid, paymentData } = req.body;
  const apiKey = process.env.PI_API_KEY; // Store in Vercel environment variables
  const piApiUrl = 'https://api.testnet.minepi.com';

  // Validate API key
  if (!apiKey) {
    console.error('Pi API key not configured');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    if (action === 'approve') {
      // Validate paymentId
      if (!paymentId) {
        return res.status(400).json({ error: 'Payment ID is required' });
      }

      // Validate payment data
      if (!paymentData || !paymentData.amount || !paymentData.metadata || !paymentData.metadata.product) {
        return res.status(400).json({ error: 'Invalid payment data' });
      }

      // Validate amount is a positive number
      if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
        return res.status(400).json({ error: 'Invalid payment amount' });
      }

      // Make API call to approve payment
      const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        console.error('Approval error:', errorData);
        return res.status(response.status).json({ error: `Failed to approve payment: ${errorData.message || 'Unknown error'}` });
      }

      return res.status(200).json({ success: true, message: 'Payment approved' });

    } else if (action === 'complete') {
      // Validate paymentId and txid
      if (!paymentId || !txid) {
        return res.status(400).json({ error: 'Payment ID and transaction ID are required' });
      }

      // Validate payment data
      if (!paymentData || !paymentData.metadata) {
        return res.status(400).json({ error: 'Invalid payment data' });
      }

      // Make API call to complete payment
      const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      });

      if (response.status !== 200) {
        const errorData = await response.json();
        console.error('Completion error:', errorData);
        return res.status(response.status).json({ error: `Failed to complete payment: ${errorData.message || 'Unknown error'}` });
      }

      // Optionally, log payment details to your database or notify your system
      console.log('Payment completed:', { paymentId, txid, metadata: paymentData.metadata });

      return res.status(200).json({ success: true, message: 'Payment completed' });

    } else {
      return res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
