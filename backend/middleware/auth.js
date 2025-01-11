const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ message: 'Access token required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token - user not found' });
    }

    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    console.error('Auth middleware error:', error);
    res.status(500).json({ message: 'Authentication error' });
  }
};

// Check if user is admin
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }
  next();
};

// Check if user is merchant or admin
const requireMerchant = (req, res, next) => {
  if (req.user.role !== 'merchant' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Merchant access required' });
  }
  next();
};

// Check if user is the owner of the resource or admin
const requireOwnershipOrAdmin = (resourceUserField = 'user') => {
  return (req, res, next) => {
    const resourceUserId = req.body[resourceUserField] || req.params.userId;
    
    if (req.user.role === 'admin' || req.user._id.toString() === resourceUserId) {
      return next();
    }
    
    return res.status(403).json({ message: 'Access denied - insufficient permissions' });
  };
};

// Check if user is merchant owner of product or admin
const requireProductOwnership = async (req, res, next) => {
  try {
    const Product = require('../models/Product');
    const productId = req.params.id || req.params.productId;
    
    if (!productId) {
      return res.status(400).json({ message: 'Product ID required' });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    if (req.user.role === 'admin' || product.merchant.toString() === req.user._id.toString()) {
      req.product = product;
      return next();
    }

    return res.status(403).json({ message: 'Access denied - not product owner' });
  } catch (error) {
    console.error('Product ownership check error:', error);
    res.status(500).json({ message: 'Authorization error' });
  }
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (user && user.isActive) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // Ignore auth errors for optional auth
    next();
  }
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requireMerchant,
  requireOwnershipOrAdmin,
  requireProductOwnership,
  optionalAuth
};
