import axios from 'axios';

// Pi Network API base URL
const PI_API_BASE = 'https://api.minepi.com/v2';

// Create axios instance with default config
const piApi = axios.create({
  baseURL: PI_API_BASE,
  timeout: 10000,
});

// Add authentication header to requests
piApi.interceptors.request.use((config) => {
  if (process.env.PI_API_KEY) {
    config.headers.Authorization = `Key ${process.env.PI_API_KEY}`;
  }
  return config;
});

// Payment-related functions
export const piNetwork = {
  // Get payment information
  getPayment: async (paymentId) => {
    try {
      const response = await piApi.get(`/payments/${paymentId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  },

  // Approve payment
  approvePayment: async (paymentId) => {
    try {
      const response = await piApi.post(`/payments/${paymentId}/approve`);
      return response.data;
    } catch (error) {
      console.error('Error approving payment:', error);
      throw error;
    }
  },

  // Complete payment
  completePayment: async (paymentId, txid) => {
    try {
      const response = await piApi.post(`/payments/${paymentId}/complete`, {
        txid: txid
      });
      return response.data;
    } catch (error) {
      console.error('Error completing payment:', error);
      throw error;
    }
  },

  // Verify transaction on Pi Blockchain
  verifyTransaction: async (txid) => {
    try {
      // Use the appropriate Pi Network Horizon URL based on environment
      const horizonUrl = process.env.NODE_ENV === 'production' 
        ? 'https://api.mainnet.minepi.com' 
        : 'https://api.testnet.minepi.com';
      
      const response = await axios.get(`${horizonUrl}/transactions/${txid}`);
      return response.data;
    } catch (error) {
      console.error('Error verifying transaction:', error);
      throw error;
    }
  },

  // Get incomplete payments
  getIncompletePayments: async () => {
    try {
      const response = await piApi.get('/payments/incomplete_server_payments');
      return response.data.incomplete_server_payments;
    } catch (error) {
      console.error('Error fetching incomplete payments:', error);
      throw error;
    }
  }
};

export default piNetwork;
