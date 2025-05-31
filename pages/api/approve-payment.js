export default async function handler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(200).end();
    const { action, paymentId, txid, paymentData } = req.body;
    if (action === 'approve') {
        console.log('Approving payment:', paymentId, paymentData);
        res.status(200).json({ success: true });
    } else if (action === 'complete') {
        console.log('Completing payment:', paymentId, txid, paymentData);
        res.status(200).json({ success: true });
    } else {
        res.status(400).json({ error: 'Invalid action' });
    }
}
