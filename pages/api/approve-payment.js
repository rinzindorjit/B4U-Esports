import Cors from 'cors';
import PiServer from '@/lib/pi-server';

const cors = Cors({
  methods: ['POST'],
  origin: '*',
});

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) return reject(result);
      return resolve(result);
    });
  });
}

const piServer = new PiServer();

export default async function handler(req, res) {
  await runMiddleware(req, res, cors);

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { paymentId } = req.body;

    if (!paymentId) {
      return res.status(400).json({ error: 'Payment ID is required' });
    }

    console.log('Approving payment:', paymentId);

    const result = await piServer.approvePayment(paymentId);

    res.status(200).json({
      success: true,
      paymentId,
      data: result,
      message: 'Payment approved successfully',
    });
  } catch (error) {
    console.error('Error approving payment:', error);
    res.status(500).json({ success: false, error: error.message });
  }
}