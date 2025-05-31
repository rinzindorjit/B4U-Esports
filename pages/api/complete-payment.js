export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, txid, paymentData } = req.body;
    const authToken = req.headers.authorization?.split('Bearer ')[1];

    if (!paymentId || !txid || !authToken) {
      return res.status(400).json({ error: 'Missing paymentId, txid, or authorization token' });
    }

    // Verify transaction with Pi Network API
    const response = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    if (!response.ok) {
      throw new Error('Failed to complete payment with Pi Network');
    }

    // Update your database with the completed payment status
    // For example, mark the order as fulfilled, send confirmation email, etc.

    res.status(200).json({ success: true, message: 'Payment completed successfully' });
  } catch (error) {
    console.error('Error completing payment:', error);
    res.status(500).json({ error: 'Failed to complete payment: ' + error.message });
  }
}
