export default async function handler(req, res) {
  try {
    const config = {
      appId: process.env.PI_APP_ID || 'b4u-esports',
      network: process.env.PI_NETWORK || 'testnet',
      apiKey: process.env.PI_API_KEY || '9f5hgo2zonuxxjbteqbldd6getgsykewge603yu63thkeuh4uopgjlo6t6eo0mdl',
      sandbox: process.env.PI_SANDBOX === 'true'
    };
    res.status(200).json(config);
  } catch (error) {
    console.error('Error fetching config:', error);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
}
