// Database configuration file
// In-memory storage for development (replace with real database in production)

const users = new Map();
const payments = new Map();

// User functions
const userDB = {
  create: (userData) => {
    const id = Date.now().toString();
    const user = {
      id,
      ...userData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    users.set(id, user);
    users.set(userData.email, user);
    return user;
  },
  
  findByEmail: (email) => {
    return users.get(email);
  }
};

// Payment functions
const paymentDB = {
  create: (paymentData) => {
    const payment = {
      ...paymentData,
      createdAt: new Date().toISOString()
    };
    payments.set(paymentData.id, payment);
    return payment;
  },
  
  findById: (id) => {
    return payments.get(id);
  },
  
  update: (id, updates) => {
    const payment = payments.get(id);
    if (!payment) return null;
    
    Object.assign(payment, updates);
    payments.set(id, payment);
    
    return payment;
  }
};

module.exports = {
  userDB,
  paymentDB
};
