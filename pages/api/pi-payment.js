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
      // Log request for debugging
      console.log('Approval request:', { paymentId, paymentData });

      // Validate inputs
      if (!paymentId) {
        console.error('Missing paymentId');
        return res.status(400).json({ error: 'Payment ID is required' });
      }

      if (!paymentData || !paymentData.amount || !paymentData.metadata || !paymentData.metadata.product) {
        console.error('Invalid paymentData:', paymentData);
        return res.status(400).json({ error: 'Invalid payment data' });
      }

      if (typeof paymentData.amount !== 'number' || paymentData.amount <= 0) {
        console.error('Invalid amount:', paymentData.amount);
        return res.status(400).json({ error: 'Invalid payment amount' });
      }

      // Call Pi testnet API to approve payment
      const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const responseBody = await response.json();
      if (response.status !== 200) {
        console.error('Pi API approval error:', responseBody);
        return res.status(response.status).json({ error: `Failed to approve payment: ${responseBody.message || 'Unknown error'}` });
      }

      console.log('Payment approved:', paymentId);
      return res.status(200).json({ success: true, message: 'Payment approved' });

    } else if (action === 'complete') {
      // Log request for debugging
      console.log('Completion request:', { paymentId, txid });

      // Validate inputs
      if (!paymentId || !txid) {
        console.error('Missing paymentId or txid');
        return res.status(400).json({ error: 'Payment ID and transaction ID are required' });
      }

      if (!paymentData || !paymentData.metadata) {
        console.error('Invalid paymentData for completion:', paymentData);
        return res.status(400).json({ error: 'Invalid payment data' });
      }

      // Call Pi testnet API to complete payment
      const response = await fetch(`${piApiUrl}/v2/payments/${paymentId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Key ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ txid })
      });

      const responseBody = await response.json();
      if (response.status !== 200) {
        console.error('Pi API completion error:', responseBody);
        return res.status(response.status).json({ error: `Failed to complete payment: ${responseBody.message || 'Unknown error'}` });
      }

      console.log('Payment completed:', { paymentId, txid });
      return res.status(200).json({
        success: true,
        status: 'completed',
        message: 'Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.'
      });

    } else {
      console.error('Invalid action:', action);
      return res.status(400).json({ error: 'Invalid action specified' });
    }
  } catch (error) {
    console.error('Serverless function error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
