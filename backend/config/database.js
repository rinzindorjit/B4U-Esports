// Database configuration file
// This can be expanded to use a real database like MongoDB, PostgreSQL, etc.

// In-memory storage for development (replace with real database in production)
const users = new Map();
const payments = new Map();
const sessions = new Map();

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
    users.set(userData.email, user); // Also index by email
    return user;
  },
  
  findByEmail: (email) => {
    return users.get(email);
  },
  
  findById: (id) => {
    return users.get(id);
  },
  
  update: (id, updates) => {
    const user = users.get(id);
    if (!user) return null;
    
    Object.assign(user, updates);
    user.updatedAt = new Date().toISOString();
    users.set(id, user);
    users.set(user.email, user);
    
    return user;
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
  
  findByUserEmail: (email) => {
    return Array.from(payments.values())
      .filter(payment => payment.userEmail === email)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },
  
  update: (id, updates) => {
    const payment = payments.get(id);
    if (!payment) return null;
    
    Object.assign(payment, updates);
    payments.set(id, payment);
    
    return payment;
  }
};

// Session functions (for future authentication)
const sessionDB = {
  create: (sessionData) => {
    sessions.set(sessionData.token, sessionData);
    return sessionData;
  },
  
  findByToken: (token) => {
    return sessions.get(token);
  },
  
  delete: (token) => {
    return sessions.delete(token);
  }
};

module.exports = {
  userDB,
  paymentDB,
  sessionDB
};
