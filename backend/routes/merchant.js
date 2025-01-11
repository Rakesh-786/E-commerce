const express = require('express');
const User = require('../models/User');
const Product = require('../models/Product');
const { authenticateToken, requireMerchant } = require('../middleware/auth');
const { updateUserSchema, updateMerchantInfoSchema, formatUserResponse } = require('../utils/authUtils');

const router = express.Router();

// @route   GET /api/merchant/profile
// @desc    Get merchant profile
// @access  Private (Merchant)
router.get('/profile', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get merchant profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/merchant/profile
// @desc    Update merchant profile
// @access  Private (Merchant)
router.put('/profile', authenticateToken, requireMerchant, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      value,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Profile updated successfully',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    console.error('Update merchant profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/merchant/business-info
// @desc    Update merchant business information
// @access  Private (Merchant)
router.put('/business-info', authenticateToken, requireMerchant, async (req, res) => {
  try {
    // Validate input
    const { error, value } = updateMerchantInfoSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          'merchantInfo.businessName': value.businessName,
          'merchantInfo.businessDescription': value.businessDescription,
          'merchantInfo.businessLicense': value.businessLicense
        }
      },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      message: 'Business information updated successfully',
      user: formatUserResponse(updatedUser)
    });
  } catch (error) {
    console.error('Update business info error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/merchant/dashboard/stats
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

// @route   GET /api/merchant/products
// @desc    Get merchant's products
// @access  Private (Merchant)
router.get('/products', authenticateToken, requireMerchant, async (req, res) => {
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
    console.error('Get merchant products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock data storage for merchant features
let merchantOrders = {};
let merchantAnalytics = {};
let merchantInventory = {};

// @route   GET /api/merchant/dashboard
// @desc    Get comprehensive merchant dashboard
// @access  Private (Merchant)
router.get('/dashboard', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const merchantId = req.user._id.toString();

    // Mock comprehensive dashboard data
    const dashboardData = {
      overview: {
        totalRevenue: 15750.50,
        monthlyRevenue: 3250.75,
        totalOrders: 89,
        pendingOrders: 12,
        totalProducts: 45,
        activeProducts: 42,
        totalCustomers: 156,
        averageRating: 4.6
      },
      recentOrders: [
        {
          id: 'ORD-2024-001',
          customer: 'John Doe',
          date: '2024-01-15',
          status: 'pending',
          total: 299.99,
          items: 2
        },
        {
          id: 'ORD-2024-002',
          customer: 'Jane Smith',
          date: '2024-01-14',
          status: 'shipped',
          total: 149.99,
          items: 1
        }
      ],
      topProducts: [
        {
          id: 1,
          name: 'Wireless Headphones',
          sales: 45,
          revenue: 8999.55,
          stock: 23
        },
        {
          id: 2,
          name: 'Smart Watch',
          sales: 32,
          revenue: 9599.68,
          stock: 15
        }
      ],
      lowStockAlerts: [
        {
          id: 3,
          name: 'Bluetooth Speaker',
          currentStock: 3,
          threshold: 5,
          status: 'critical'
        }
      ],
      salesChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [2500, 3200, 2800, 3500, 4100, 3250]
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Merchant dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Merchant dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/merchant/orders
// @desc    Get merchant orders
// @access  Private (Merchant)
router.get('/orders', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const merchantId = req.user._id.toString();
    const { status, limit = 10, page = 1, search } = req.query;

    // Mock orders data
    let orders = [
      {
        id: 'ORD-2024-001',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        date: '2024-01-15',
        status: 'pending',
        total: 299.99,
        items: [
          {
            id: 1,
            name: 'Wireless Headphones',
            price: 199.99,
            quantity: 1,
            sku: 'WH-001'
          },
          {
            id: 2,
            name: 'Phone Case',
            price: 29.99,
            quantity: 2,
            sku: 'PC-001'
          }
        ],
        shipping: {
          address: '123 Main St, New York, NY 10001',
          method: 'Standard Shipping',
          cost: 15.00
        },
        payment: {
          method: 'Credit Card',
          status: 'paid',
          transactionId: 'TXN123456'
        }
      },
      {
        id: 'ORD-2024-002',
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891'
        },
        date: '2024-01-14',
        status: 'shipped',
        total: 149.99,
        items: [
          {
            id: 3,
            name: 'Bluetooth Speaker',
            price: 149.99,
            quantity: 1,
            sku: 'BS-001'
          }
        ],
        shipping: {
          address: '456 Oak Ave, Los Angeles, CA 90210',
          method: 'Express Shipping',
          cost: 25.00,
          trackingNumber: 'TRK987654321'
        },
        payment: {
          method: 'PayPal',
          status: 'paid',
          transactionId: 'TXN789012'
        }
      }
    ];

    // Filter by status
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Search functionality
    if (search) {
      const searchTerm = search.toLowerCase();
      orders = orders.filter(order =>
        order.id.toLowerCase().includes(searchTerm) ||
        order.customer.name.toLowerCase().includes(searchTerm) ||
        order.customer.email.toLowerCase().includes(searchTerm)
      );
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedOrders = orders.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        orders: paginatedOrders,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(orders.length / limit),
          totalOrders: orders.length,
          hasNext: endIndex < orders.length,
          hasPrev: page > 1
        }
      },
      message: 'Merchant orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get merchant orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   PUT /api/merchant/orders/:orderId/status
// @desc    Update order status
// @access  Private (Merchant)
router.put('/orders/:orderId/status', authenticateToken, requireMerchant, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, notes } = req.body;

    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid order status'
      });
    }

    // Mock order update
    const updatedOrder = {
      id: orderId,
      status,
      trackingNumber: trackingNumber || null,
      notes: notes || null,
      updatedAt: new Date(),
      statusHistory: [
        {
          status,
          date: new Date(),
          notes
        }
      ]
    };

    res.json({
      success: true,
      data: updatedOrder,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating order status'
    });
  }
});

module.exports = router;
