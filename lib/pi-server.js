import axios from 'axios';

export default class PiServer {
  constructor() {
    this.apiKey = process.env.PI_API_KEY;
    this.baseURL = process.env.PI_NETWORK_API_URL || 'https://api.minepi.com/v2';
  }

  // Helper: headers for Pi API
  getHeaders() {
    return {
      'Authorization': `Key ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  // ✅ Approve a payment
  async approvePayment(paymentId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments/${paymentId}/approve`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Payment approval failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to approve payment');
    }
  }

  // ✅ Complete a payment
  async completePayment(paymentId) {
    try {
      const response = await axios.post(
        `${this.baseURL}/payments/${paymentId}/complete`,
        {},
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Payment completion failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to complete payment');
    }
  }

  // ✅ Get payment details
  async getPayment(paymentId) {
    try {
      const response = await axios.get(
        `${this.baseURL}/payments/${paymentId}`,
        { headers: this.getHeaders() }
      );
      return response.data;
    } catch (error) {
      console.error('Get payment failed:', error.response?.data || error.message);
      throw new Error(error.response?.data?.error || 'Failed to get payment details');
    }
  }
}