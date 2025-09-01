const axios = require('axios');

class PiServerSDK {
  constructor(apiKey, secret) {
    this.apiKey = apiKey || process.env.PI_API_KEY;
    this.secret = secret || process.env.PI_SECRET;
    this.baseURL = process.env.PI_API_URL || 'https://api.minepi.com/v2';
    
    // For testing without real API keys
    this.testMode = !this.apiKey || !this.secret;
  }

  async createPayment(amount, memo, metadata = {}) {
    try {
      // If in test mode, simulate API response
      if (this.testMode) {
        console.log('Test mode: Simulating payment creation');
        return {
          identifier: `test_payment_${Date.now()}`,
          user_uid: 'test_user',
          amount: amount,
          memo: memo,
          metadata: metadata,
          from_address: 'test_wallet_address',
          to_address: 'merchant_wallet_address',
          direction: 'user_to_app',
          created_at: new Date().toISOString(),
          status: {
            developer_approved: false,
            transaction_verified: false,
            developer_completed: false,
            cancelled: false,
            user_cancelled: false
          },
          transaction: null
        };
      }

      const response = await axios.post(`${this.baseURL}/payments`, {
        amount,
        memo,
        metadata,
        order_id: `order_${Date.now()}`
      }, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error creating payment:', error.response?.data || error.message);
      throw error;
    }
  }

  async approvePayment(paymentId) {
    try {
      // If in test mode, simulate API response
      if (this.testMode) {
        console.log('Test mode: Simulating payment approval');
        return {
          identifier: paymentId,
          status: {
            developer_approved: true,
            transaction_verified: false,
            developer_completed: false,
            cancelled: false,
            user_cancelled: false
          }
        };
      }

      const response = await axios.post(`${this.baseURL}/payments/${paymentId}/approve`, {}, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error approving payment:', error.response?.data || error.message);
      throw error;
    }
  }

  async completePayment(paymentId, txid) {
    try {
      // If in test mode, simulate API response
      if (this.testMode) {
        console.log('Test mode: Simulating payment completion');
        return {
          identifier: paymentId,
          status: {
            developer_approved: true,
            transaction_verified: true,
            developer_completed: true,
            cancelled: false,
            user_cancelled: false
          },
          transaction: {
            txid: txid,
            verified: true,
            _link: `https://testnet.minepi.com/blockchain/transactions/${txid}`
          }
        };
      }

      const response = await axios.post(`${this.baseURL}/payments/${paymentId}/complete`, {
        txid
      }, {
        headers: {
          'Authorization': `Key ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error completing payment:', error.response?.data || error.message);
      throw error;
    }
  }

  async getPayment(paymentId) {
    try {
      // If in test mode, simulate API response
      if (this.testMode) {
        console.log('Test mode: Simulating payment retrieval');
        return {
          identifier: paymentId,
          user_uid: 'test_user',
          amount: 5,
          memo: 'Test payment',
          metadata: { product: 'Test Product' },
          from_address: 'test_wallet_address',
          to_address: 'merchant_wallet_address',
          direction: 'user_to_app',
          created_at: new Date().toISOString(),
          status: {
            developer_approved: true,
            transaction_verified: true,
            developer_completed: true,
            cancelled: false,
            user_cancelled: false
          },
          transaction: {
            txid: `test_tx_${Date.now()}`,
            verified: true,
            _link: `https://testnet.minepi.com/blockchain/transactions/test_tx_${Date.now()}`
          }
        };
      }

      const response = await axios.get(`${this.baseURL}/payments/${paymentId}`, {
        headers: {
          'Authorization': `Key ${this.apiKey}`
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error getting payment:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = PiServerSDK;