require('dotenv').config();

module.exports = {
  piApiEndpoint: process.env.PI_API_ENDPOINT || 'https://api.testnet.minepi.com',
  piTestnetApiKey: process.env.PI_TESTNET_API_KEY || 'your_testnet_api_key_here',
  piWalletAddress: process.env.PI_WALLET_ADDRESS || 'your_wallet_address_here'
};
