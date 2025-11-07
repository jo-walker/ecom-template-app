// routes/authRoutes.js

const express = require('express');
const bcrypt = require('bcryptjs');//password hashing
const jwt = require('jsonwebtoken'); //token creation
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Login route
router.post(  '/login',
  [body('username').isLength({ min: 3 }), body('password').isLength({ min: 5 })],
  async (req, res) => {
    const { username, password } = req.body;

    const user = users.find((u) => u.username === username);
    if (!user) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  }
);

// Route that requires authentication
router.get('/profile', (req, res) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  // Verify the token
  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token invalid' });
    }
    res.json({ message: `Welcome, ${decoded.username}!` });
  });
});

module.exports = router;
