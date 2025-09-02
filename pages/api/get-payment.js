import Cors from 'cors';
import PiServer from '@/lib/pi-server';

// ✅ Initialize CORS
const cors = Cors({
  methods: ['GET', 'POST', 'HEAD'],
  origin: '*',
});

// ✅ Middleware runner
function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });
}

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.query;

    if (!paymentId) {
      return res.status(400).json({ error: 'Missing paymentId' });
    }

    const pi = new PiServer();
    const payment = await pi.getPayment(paymentId);

    res.status(200).json({ success: true, payment });
  } catch (error) {
    console.error('Error fetching payment:', error.message);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
}