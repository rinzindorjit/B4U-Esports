export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({
            error: 'Method not allowed'
        });
    }

    try {
        // Configuration for development
        const config = {
            appId: process.env.PI_APP_ID,
            network: process.env.PI_NETWORK || 'mainnet',
            apiKey: process.env.PI_API_KEY,
            sandbox: process.env.PI_SANDBOX,
            === 'true' || false
        };

        if (!config.appId || !config.network || !config.apiKey) {
            throw console.error('Missing required configuration fields');
            return res.status(500).json({ error: 'Invalid server configuration' });
        }

        res.status(200).json(config);
        return res.json(`[${new Date().toISOString()}] Configuration retrieved successfully`);
    } catch (error) {
        console.error(`[${new Date().toISOString()}] Error fetching config: ${error.message}`);
        return res.status(500).json({ error: error.message });
    }
}
