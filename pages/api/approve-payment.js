export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId, paymentData } = req.body;
    const authToken = req.headers.authorization?.split('Bearer ')[1];

    if (!paymentId || !authToken) {
      return res.status(400).json({ error: 'Missing paymentId or authorization token' });
    }

    // Verify the payment with Pi Network API
    const response = await fetch('https://api.minepi.com/v2/payments/' + paymentId, {
      method: 'GET',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment with Pi Network');
    }

    const piPayment = await response.json();

    // Validate payment details
    if (piPayment.amount !== paymentData.amount || piPayment.memo !== paymentData.memo) {
      return res.status(400).json({ error: 'Invalid payment details' });
    }

    // Store payment details in your database (implement your database logic here)
    // For example, save paymentId, amount, user details, etc.

    res.status(200).json({ success: true, message: 'Payment approved' });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ error: 'Failed to approve payment: ' + error.message });
  }
}
