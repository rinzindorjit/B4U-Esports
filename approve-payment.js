const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/approve-payment', (req, res) => {
  const { paymentId, metadata } = req.body;
  if (!paymentId || !metadata) {
    return res.status(400).json({ error: 'Missing paymentId or metadata' });
  }

  console.log(`Approving payment ${paymentId} for ${metadata.product}`);
  res.status(200).json({ status: 'approved', paymentId });
});

module.exports.handler = serverless(app);