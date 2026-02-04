const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authenticate, verifySEBI, verifyStartup } = require('../middleware/auth');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET || 'your-secret-key-change-in-production', {
    expiresIn: '7d'
  });
};

// Register Investment Banker
router.post('/register/investment-banker', async (req, res) => {
  try {
    const { email, password, name, companyName, sebiRegistrationNumber, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !sebiRegistrationNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if SEBI number already registered
    const existingSEBI = await User.findOne({ sebiRegistrationNumber });
    if (existingSEBI) {
      return res.status(400).json({ error: 'SEBI Registration Number already registered' });
    }

    // Validate SEBI registration number format (example: IN-SEBI-XXXXX)
    const sebiPattern = /^IN-SEBI-[A-Z0-9]{5,10}$/i;
    if (!sebiPattern.test(sebiRegistrationNumber)) {
      return res.status(400).json({ 
        error: 'Invalid SEBI Registration Number format. Expected format: IN-SEBI-XXXXX' 
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      companyName,
      sebiRegistrationNumber: sebiRegistrationNumber.toUpperCase(),
      phone,
      userType: 'investment_banker',
      sebiVerified: false // Will be verified through admin/automated process
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Investment banker registered successfully. SEBI verification pending.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        sebiRegistrationNumber: user.sebiRegistrationNumber,
        sebiVerified: user.sebiVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Register Startup
router.post('/register/startup', async (req, res) => {
  try {
    const { email, password, name, companyName, startupUniqueId, phone } = req.body;

    // Validate required fields
    if (!email || !password || !name || !startupUniqueId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Check if Startup ID already registered
    const existingStartup = await User.findOne({ startupUniqueId });
    if (existingStartup) {
      return res.status(400).json({ error: 'Startup Unique ID already registered' });
    }

    // Validate Startup Unique ID format (accepts multiple formats)
    // Examples: DIPP212512, DIPP/STARTUP/123456, DIPP-STARTUP-123456, STARTUP123456, GOV123456
    // Pattern: Starts with DIPP/STARTUP/GOV, optionally followed by separator(s) and text, ends with 6+ alphanumeric chars
    const startupIdPattern = /^(DIPP|STARTUP|GOV)([\/\-][A-Z0-9]+)*([\/\-]?[A-Z0-9]{6,})$/i;
    if (!startupIdPattern.test(startupUniqueId)) {
      return res.status(400).json({ 
        error: 'Invalid Startup Unique ID format. Accepted formats: DIPP212512, DIPP/STARTUP/XXXXXX, DIPP-STARTUP-XXXXXX, STARTUP123456, or GOV123456' 
      });
    }

    // Create user
    const user = new User({
      email,
      password,
      name,
      companyName,
      startupUniqueId: startupUniqueId.toUpperCase(),
      phone,
      userType: 'startup',
      startupVerified: false // Will be verified through admin/automated process
    });

    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Startup registered successfully. Startup ID verification pending.',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        startupUniqueId: user.startupUniqueId,
        startupVerified: user.startupVerified
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        userType: user.userType,
        companyName: user.companyName,
        sebiRegistrationNumber: user.sebiRegistrationNumber,
        sebiVerified: user.sebiVerified,
        startupUniqueId: user.startupUniqueId,
        startupVerified: user.startupVerified
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

// Get current user profile
router.get('/me', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ user });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify SEBI registration (admin endpoint - in production, integrate with SEBI API)
router.post('/verify/sebi/:userId', authenticate, async (req, res) => {
  try {
    // In production, this should be an admin-only endpoint
    // For now, we'll allow users to verify their own SEBI registration
    const user = await User.findById(req.params.userId);
    
    if (!user || user.userType !== 'investment_banker') {
      return res.status(404).json({ error: 'Investment banker not found' });
    }

    // In production, integrate with SEBI API to verify registration
    // For now, we'll set it as verified (this should be replaced with actual SEBI API call)
    user.sebiVerified = true;
    await user.save();

    res.json({ 
      message: 'SEBI registration verified successfully',
      user: {
        id: user._id,
        sebiRegistrationNumber: user.sebiRegistrationNumber,
        sebiVerified: user.sebiVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Verify Startup ID (admin endpoint - in production, integrate with Indian gov platform API)
router.post('/verify/startup/:userId', authenticate, async (req, res) => {
  try {
    // In production, this should be an admin-only endpoint
    // For now, we'll allow users to verify their own startup ID
    const user = await User.findById(req.params.userId);
    
    if (!user || user.userType !== 'startup') {
      return res.status(404).json({ error: 'Startup not found' });
    }

    // In production, integrate with Indian government platform API to verify startup ID
    // For now, we'll set it as verified (this should be replaced with actual API call)
    user.startupVerified = true;
    await user.save();

    res.json({ 
      message: 'Startup ID verified successfully',
      user: {
        id: user._id,
        startupUniqueId: user.startupUniqueId,
        startupVerified: user.startupVerified
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
