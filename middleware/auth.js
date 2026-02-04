const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Authentication middleware - verifies JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key-change-in-production');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired.' });
    }
    res.status(500).json({ error: 'Authentication error.' });
  }
};

// Authorization middleware - checks user type
const authorize = (...userTypes) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    if (!userTypes.includes(req.user.userType)) {
      return res.status(403).json({ error: 'Access denied. Insufficient permissions.' });
    }

    next();
  };
};

// Verify SEBI registration for investment bankers
const verifySEBI = async (req, res, next) => {
  if (req.user.userType !== 'investment_banker') {
    return res.status(403).json({ error: 'This endpoint is only for investment bankers.' });
  }

  if (!req.user.sebiVerified) {
    return res.status(403).json({ 
      error: 'SEBI registration not verified. Please verify your SEBI registration number.' 
    });
  }

  next();
};

// Verify Startup ID for startups
const verifyStartup = async (req, res, next) => {
  if (req.user.userType !== 'startup') {
    return res.status(403).json({ error: 'This endpoint is only for startups.' });
  }

  if (!req.user.startupVerified) {
    return res.status(403).json({ 
      error: 'Startup ID not verified. Please verify your Indian government platform ID.' 
    });
  }

  next();
};

module.exports = {
  authenticate,
  authorize,
  verifySEBI,
  verifyStartup
};
