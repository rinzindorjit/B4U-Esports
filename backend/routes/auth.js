const express = require('express');
const router = express.Router();

// Mock user database
const users = new Map();

// User registration
router.post('/register', (req, res) => {
  try {
    const { username, email, walletAddress } = req.body;
    
    if (!username || !email || !walletAddress) {
      return res.status(400).json({
        success: false,
        error: 'Username, email, and wallet address are required'
      });
    }
    
    // Check if user already exists
    if (users.has(email)) {
      return res.status(409).json({
        success: false,
        error: 'User already exists'
      });
    }
    
    // Create new user
    const newUser = {
      id: Date.now().toString(),
      username,
      email,
      walletAddress,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.set(email, newUser);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        walletAddress: newUser.walletAddress
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Get user profile
router.get('/profile/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    if (!users.has(email)) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }
    
    const user = users.get(email);
    
    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        walletAddress: user.walletAddress,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

module.exports = router;
