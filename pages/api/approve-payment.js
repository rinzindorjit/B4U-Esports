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
  console[type](`[${new Date().toISOString()}] /api/approve-payment: ${message}`);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    log(`Invalid method: ${req.method}`, 'warn');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { paymentId, paymentData } = req.body;
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    log('Missing or invalid Authorization header', 'error');
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  if (!paymentId || !paymentData) {
    log('Missing paymentId or paymentData', 'error');
    return res.status(400).json({ error: 'Missing required fields: paymentId and paymentData' });
  }

  const {
    amount,
    memo,
    metadata: {
      product,
      piUsername,
      userEmail,
      type,
      socialUrl,
      pubgId,
      ucAmount,
      mlbbUserId,
      mlbbZoneId,
      diasAmount
    }
  } = paymentData;

  if (!amount || amount <= 0 || !product || !piUsername || !userEmail || !type) {
    log('Invalid payment data: missing required fields', 'error');
    return res.status(400).json({ error: 'Invalid payment data: missing required fields' });
  }

  if (!['marketplace', 'social', 'pubg', 'mlbb', 'tournament'].includes(type)) {
    log(`Invalid payment type: ${type}`, 'error');
    return res.status(400).json({ error: 'Invalid payment type' });
  }

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

    const existingPayment = await Payment.findOne({ paymentId });
    if (existingPayment) {
      log(`Payment already exists: ${paymentId}`, 'warn');
      return res.status(400).json({ error: 'Payment already processed' });
    }

    const payment = new Payment({
      paymentId,
      userId: user.uid,
      username: piUsername,
      amount,
      memo,
      product,
      type,
      userEmail,
      socialUrl,
      pubgId,
      ucAmount,
      mlbbUserId,
      mlbbZoneId,
      diasAmount,
      status: 'approved'
    });

    await payment.save();
    log(`Payment saved: ${paymentId}`);

    const piApiResponse = await fetch(`https://api.minepi.com/v2/payments/${paymentId}/approve`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${process.env.PI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    if (!piApiResponse.ok) {
      const errorText = await piApiResponse.text();
      log(`Pi API approval failed: ${piApiResponse.status} - ${errorText}`, 'error');
      await Payment.updateOne({ paymentId }, { status: 'failed' });
      return res.status(500).json({ error: 'Failed to approve payment with Pi Network' });
    }

    log(`Payment approved successfully: ${paymentId}`);
    return res.status(200).json({ success: true, paymentId });
  } catch (error) {
    log(`Error: ${error.message}`, 'error');
    return res.status(500).json({ error: 'Internal server error' });
  }
}
