// Simple in-memory database simulation
// In production, use a real database like MongoDB, PostgreSQL, etc.

class Database {
  constructor() {
    this.payments = new Map();
    this.users = new Map();
    this.orders = new Map();
  }

  // Payment methods
  createPayment(paymentData) {
    const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const payment = {
      id: paymentId,
      ...paymentData,
      createdAt: new Date(),
      status: 'pending'
    };
    this.payments.set(paymentId, payment);
    
    // Also create an order record
    this.createOrder({
      paymentId: paymentId,
      product: paymentData.product,
      type: paymentData.type,
      amount: paymentData.amount,
      status: 'created',
      userEmail: paymentData.userEmail,
      piUsername: paymentData.piUsername
    });
    
    return payment;
  }

  getPayment(paymentId) {
    return this.payments.get(paymentId);
  }

  updatePayment(paymentId, updates) {
    const payment = this.payments.get(paymentId);
    if (payment) {
      Object.assign(payment, updates, { updatedAt: new Date() });
      return payment;
    }
    return null;
  }

  // Find payment by Pi payment ID
  findPaymentByPiId(piPaymentId) {
    for (const payment of this.payments.values()) {
      if (payment.piPaymentId === piPaymentId) {
        return payment;
      }
    }
    return null;
  }

  // Get all payments for a user
  getUserPayments(piUsername) {
    const userPayments = [];
    for (const payment of this.payments.values()) {
      if (payment.piUsername === piUsername) {
        userPayments.push(payment);
      }
    }
    return userPayments;
  }

  // Order methods
  createOrder(orderData) {
    const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const order = {
      id: orderId,
      ...orderData,
      createdAt: new Date(),
      status: 'created'
    };
    this.orders.set(orderId, order);
    return order;
  }

  getOrder(orderId) {
    return this.orders.get(orderId);
  }

  updateOrder(orderId, updates) {
    const order = this.orders.get(orderId);
    if (order) {
      Object.assign(order, updates, { updatedAt: new Date() });
      return order;
    }
    return null;
  }

  // Find orders by payment ID
  findOrdersByPaymentId(paymentId) {
    const orders = [];
    for (const order of this.orders.values()) {
      if (order.paymentId === paymentId) {
        orders.push(order);
      }
    }
    return orders;
  }

  // User methods
  createUser(userData) {
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const user = {
      id: userId,
      ...userData,
      createdAt: new Date(),
      orders: []
    };
    this.users.set(userId, user);
    return user;
  }

  getUser(userId) {
    return this.users.get(userId);
  }

  findUserByPiUsername(piUsername) {
    for (const user of this.users.values()) {
      if (user.piUsername === piUsername) {
        return user;
      }
    }
    return null;
  }

  // Get all data for debugging/administration
  getAllData() {
    return {
      payments: Array.from(this.payments.values()),
      orders: Array.from(this.orders.values()),
      users: Array.from(this.users.values())
    };
  }
}

module.exports = new Database();