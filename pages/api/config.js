// config.js - Configuration for Pi Network payments

module.exports = {
  // Pi Network API credentials
  pi: {
    apiKey: "9f5hgo2zonuxxjbteqbldd6getgsykewge603yu63thkeuh4uopgjlo6t6eo0mdl",
    walletPrivateSeed: "SB4UESPORTSSECRETSEED", // Replace with your wallet's private seed
    appId: "b4u-esports",
    sandbox: process.env.NODE_ENV !== 'production' // Use sandbox in development
  },

  // Payment configuration
  payments: {
    defaultMemo: "B4U Esports Payment",
    // List of valid payment types and their min/max amounts
    validTypes: {
      marketplace: { min: 1, max: 1000 },
      pubg: { min: 2, max: 500 },
      mlbb: { min: 2, max: 500 },
      social: { min: 5, max: 1000 },
      tournament: { min: 3, max: 100 }
    },
    // Webhook URL for payment notifications (optional)
    webhookUrl: process.env.PAYMENT_WEBHOOK_URL || "https://b4uesports.com/api/payment-webhook"
  },

  // Database configuration (example - adjust to your DB)
  database: {
    url: process.env.DATABASE_URL || "mongodb://localhost:27017/b4uesports",
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true
    }
  },

  // Server configuration
  server: {
    port: process.env.PORT || 3000,
    corsOptions: {
      origin: [
        "https://b4uesports.com",
        "https://www.b4uesports.com",
        "http://localhost:3000"
      ],
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    }
  },

  // Security configuration
  security: {
    jwtSecret: process.env.JWT_SECRET || "b4u-esports-secret-key",
    tokenExpiry: "24h"
  }
};
