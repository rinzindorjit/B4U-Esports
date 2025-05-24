const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/complete-payment', (req, res) => {
  const { paymentId, txid, metadata } = req.body;
  if (!paymentId || !txid || !metadata) {
    return res.status(400).json({ error: 'Missing paymentId, txid, or metadata' });
  }

  console.log(`Completing payment ${paymentId} with txid ${txid}`);
  res.status(200).json({
    status: 'completed',
    message: 'Payment successful! Please send the transaction screenshot to info@b4uesports.com or WhatsApp: +97517875099.'
  });
});

module.exports.handler = serverless(app);