const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken, requireMerchant, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/merchants
// @desc    Get all verified merchants
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    // Build filter for verified merchants
    const filter = {
      role: 'merchant',
      isActive: true,
      'merchantInfo.isVerified': true
    };

    if (search) {
      filter.$or = [
        { 'merchantInfo.businessName': { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [merchants, total] = await Promise.all([
      User.find(filter)
        .select('firstName lastName email merchantInfo createdAt')
        .sort({ 'merchantInfo.verificationDate': -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    // Get product counts for each merchant
    const merchantsWithStats = await Promise.all(
      merchants.map(async (merchant) => {
        const productCount = await Product.countDocuments({
          merchant: merchant._id,
          isActive: true
        });

        return {
          ...merchant.toJSON(),
          stats: {
            totalProducts: productCount
          }
        };
      })
    );

    res.json({
      merchants: merchantsWithStats,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalMerchants: total,
        hasNext: skip + merchants.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get merchants error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/merchants/:id
// @desc    Get merchant by ID with their products
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const merchant = await User.findOne({
      _id: req.params.id,
      role: 'merchant',
      isActive: true,
      'merchantInfo.isVerified': true
    }).select('firstName lastName email merchantInfo createdAt');

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Get merchant's products
    const products = await Product.find({
      merchant: merchant._id,
      isActive: true
    }).select('name price discountPrice images category rating inventory.quantity featured createdAt');

    // Calculate merchant stats
    const stats = {
      totalProducts: products.length,
      featuredProducts: products.filter(p => p.featured).length,
      averageRating: products.length > 0 
        ? products.reduce((sum, p) => sum + p.rating.average, 0) / products.length 
        : 0,
      totalReviews: products.reduce((sum, p) => sum + p.rating.count, 0)
    };

    res.json({
      merchant: merchant.toJSON(),
      products,
      stats
    });
  } catch (error) {
    console.error('Get merchant error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid merchant ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/merchants/:id/products
// @desc    Get products by merchant with pagination
// @access  Public
router.get('/:id/products', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      inStock
    } = req.query;

    // Verify merchant exists and is verified
    const merchant = await User.findOne({
      _id: req.params.id,
      role: 'merchant',
      isActive: true,
      'merchantInfo.isVerified': true
    });

    if (!merchant) {
      return res.status(404).json({ message: 'Merchant not found' });
    }

    // Build filter
    const filter = {
      merchant: req.params.id,
      isActive: true
    };

    if (category) {
      filter.category = category;
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      merchant: {
        id: merchant._id,
        businessName: merchant.merchantInfo.businessName,
        firstName: merchant.firstName,
        lastName: merchant.lastName
      },
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get merchant products error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid merchant ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/merchants/dashboard/stats
// @desc    Get merchant dashboard statistics
// @access  Private (Merchant)
router.get('/dashboard/stats', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const merchantId = req.user._id;

    // Get product statistics
    const [
      totalProducts,
      activeProducts,
      featuredProducts,
      lowStockProducts,
      totalReviews,
      averageRating
    ] = await Promise.all([
      Product.countDocuments({ merchant: merchantId }),
      Product.countDocuments({ merchant: merchantId, isActive: true }),
      Product.countDocuments({ merchant: merchantId, featured: true, isActive: true }),
      Product.countDocuments({ 
        merchant: merchantId, 
        isActive: true,
        $expr: { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] }
      }),
      Product.aggregate([
        { $match: { merchant: merchantId } },
        { $group: { _id: null, total: { $sum: '$rating.count' } } }
      ]).then(result => result[0]?.total || 0),
      Product.aggregate([
        { $match: { merchant: merchantId, 'rating.count': { $gt: 0 } } },
        { $group: { _id: null, avg: { $avg: '$rating.average' } } }
      ]).then(result => Math.round((result[0]?.avg || 0) * 10) / 10)
    ]);

    // Get recent products
    const recentProducts = await Product.find({ 
      merchant: merchantId, 
      isActive: true 
    })
    .sort({ createdAt: -1 })
    .limit(5)
    .select('name price images createdAt inventory.quantity');

    res.json({
      stats: {
        totalProducts,
        activeProducts,
        featuredProducts,
        lowStockProducts,
        totalReviews,
        averageRating
      },
      recentProducts
    });
  } catch (error) {
    console.error('Get merchant stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/merchants/my-products
// @desc    Get current merchant's products
// @access  Private (Merchant)
router.get('/my-products', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      status = 'all' // all, active, inactive, lowStock
    } = req.query;

    // Build filter
    const filter = { merchant: req.user._id };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    if (status === 'active') {
      filter.isActive = true;
    } else if (status === 'inactive') {
      filter.isActive = false;
    } else if (status === 'lowStock') {
      filter.isActive = true;
      filter.$expr = { $lte: ['$inventory.quantity', '$inventory.lowStockThreshold'] };
    }

    // Build sort
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit)),
      Product.countDocuments(filter)
    ]);

    res.json({
      products,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalProducts: total,
        hasNext: skip + products.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get my products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
