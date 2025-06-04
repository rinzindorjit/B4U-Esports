import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { connectDB } from '../../lib/db';

const Payment = mongoose.models.Payment || mongoose.model('Payment', new mongoose.Schema({
  paymentId: { type: String, required: true, unique: true },
  userId: { type: String, required: true },
  username: { type: String, required: true },
  amount: { type: Number, required: true },
  memo: { type: String },
  product: { type: String, required: true },
  type: { type: String, enum: ['marketplace', 'social', 'pubg', 'mlbb', 'tournament'], required: true },
  userEmail: { type: String, required: true },
  socialUrl: { type: String },
  pubgId: { type: Number },
  ucAmount: { type: Number },
  mlbbUserId: { type: Number },
  mlbbZoneId: { type: Number },
  diasAmount: { type: Number },
  status: { type: String, enum: ['pending', 'approved', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}));

function log(message, type = 'info') {
  console[type](`[${new Date().toISOString()}] /api/complete-payment: ${message}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    log(`Invalid method: ${req.method}`, 'warn');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, txid, paymentData } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log('Missing or invalid Authorization header', 'error');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  if (!paymentId || !txid || !paymentData) {
    log('Missing paymentId, txid, or paymentData', 'error');
    return res.status(400).json({ error: 'Missing required fields: paymentId, txid, and paymentData' });
  }

  const { metadata: { piUsername } } = paymentData;

  try {
    await connectDB();

    const accessToken = authHeader.split(' ')[1];
    const userResponse = await fetch('https://api.minepi.com/v2/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      log(`Failed to verify user: ${userResponse.status} - ${errorText}`, 'error');
      return res.status(401).json({ error: 'Unauthorized: Invalid user token' });
    }

    const user = await userResponse.json();
    if (user.username !== piUsername) {
      log(`Username mismatch: ${user.username} vs ${piUsername}`, 'error');
      return res.status(400).json({ error: 'Username mismatch' });
    }

    const payment = await Payment.findOne({ paymentId });
    if (!payment) {
      log(`Payment not found: ${paymentId}`, 'error');
      return res.status(404).json({ error: 'Payment not found' });
    }

    if (payment.status !== 'approved') {
      log(`Invalid payment status: ${payment.status} for ${paymentId}`, 'error');
      return res.status(400).json({ error: 'Payment not in approved state' });
    }

    const piApiResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/complete`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ txid })
    });

    if (!piApiResponse.ok) {
      const errorText = await piApiResponse.text();
      log(`Pi API completion failed: ${piApiResponse.status} - ${errorText}`, 'error');
      await Payment.updateOne({ paymentId }, { status: 'failed', updatedAt: Date.now() });
      return res.status(500).json({ error: 'Failed to complete payment with Pi Network' });
    }

    await Payment.updateOne(
      { paymentId },
      { status: 'completed', updatedAt: Date.now() }
    );

    log(`Payment completed successfully: ${paymentId}, txid: ${txid}`);
    return res.status(200).json({ success: true, paymentId, txid });
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
