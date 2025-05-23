// backend/config/config.js
module.exports = {
  piTestnetApiKey: process.env.PI_TESTNET_API_KEY,
  piTestnetWalletAddress: process.env.PI_TESTNET_WALLET_ADDRESS,
  piApiEndpoint: 'https://api.testnet.minepi.com',
  port: process.env.PORT || 3000,
};