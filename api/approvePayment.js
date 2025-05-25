const axios = require('axios');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId } = req.body;

  try {
    // 1. Approve the Pi payment
    const approveResponse = await axios.post(
      `https://api.minepi.com/v2/payments/${paymentId}/approve`,
      {},
      {
        headers: {
          Authorization: `Key ${process.env.PI_SECRET_KEY}`,
        },
      }
    );

    // 2. If approved, complete the payment
    if (approveResponse.data.status === 'approved') {
      const completeResponse = await axios.post(
        `https://api.minepi.com/v2/payments/${paymentId}/complete`,
        { txid: 'YOUR_BLOCKCHAIN_TXID' }, // Replace with a real Pi TXID
        {
          headers: {
            Authorization: `Key ${process.env.PI_SECRET_KEY}`,
          },
        }
      );

      return res.status(200).json({ success: true, data: completeResponse.data });
    }
  } catch (error) {
    console.error('Pi API error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Payment failed' });
  }
};
