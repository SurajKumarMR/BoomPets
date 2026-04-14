const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { validateRequiredFields, sanitizeInput } = require('../middleware/validation');
const { authLimiter } = require('../middleware/security');

const validatePassword = (password) => {
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/[a-zA-Z]/.test(password)) {
    return 'Password must contain at least one letter';
  }
  if (!/[0-9]/.test(password)) {
    return 'Password must contain at least one number';
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character';
  }
  return null;
};

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return 'Invalid email format';
  }
  return null;
};

router.post('/register', authLimiter, sanitizeInput, validateRequiredFields(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    
    const emailError = validateEmail(email);
    if (emailError) {
      return res.status(400).json({ error: emailError });
    }
    
    const passwordError = validatePassword(password);
    if (passwordError) {
      return res.status(400).json({ error: passwordError });
    }
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ error: 'User already exists' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 12); // Increased salt rounds
    const user = new User({ 
      email: email.toLowerCase(), 
      password: hashedPassword, 
      name: name?.trim() 
    });
    await user.save();
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' } // Reduced from 30d for better security
    );
    
    res.status(201).json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      }, 
      token 
    });
  } catch (error) {
    next(error);
  }
});

router.post('/login', authLimiter, sanitizeInput, validateRequiredFields(['email', 'password']), async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email: email.toLowerCase() });
    
    // Use constant-time comparison to prevent timing attacks
    if (!user) {
      // Still hash to prevent timing attacks
      await bcrypt.hash(password, 12);
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ error: 'Server configuration error' });
    }
    
    const token = jwt.sign(
      { userId: user._id }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );
    
    res.json({ 
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name 
      }, 
      token 
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
