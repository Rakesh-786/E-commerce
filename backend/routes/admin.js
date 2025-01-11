const express = require('express');
const User = require('../models/User');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { formatUserResponse } = require('../utils/authUtils');

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private (Admin)
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      role,
      search,
      isActive
    } = req.query;

    // Build filter
    const filter = {};

    if (role) {
      filter.role = role;
    }

    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (isActive !== undefined) {
      filter.isActive = isActive === 'true';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [users, total] = await Promise.all([
      User.find(filter)
        .select('-password')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({
      users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalUsers: total,
        hasNext: skip + users.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/admin/users/:id
// @desc    Get user by ID (Admin only)
// @access  Private (Admin)
router.get('/users/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Get user error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status (activate/deactivate)
// @access  Private (Admin)
router.put('/users/:id/status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ message: 'isActive must be a boolean' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Update user status error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/admin/users/:id/verify-merchant
// @desc    Verify merchant account
// @access  Private (Admin)
router.put('/users/:id/verify-merchant', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'merchant') {
      return res.status(400).json({ message: 'User is not a merchant' });
    }

    user.merchantInfo.isVerified = true;
    user.merchantInfo.verificationDate = new Date();
    await user.save();

    res.json({
      message: 'Merchant verified successfully',
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Verify merchant error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid user ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock data storage for admin features
let platformAnalytics = {};
let systemSettings = {};
let adminReports = {};

// @route   GET /api/admin/dashboard
// @desc    Get comprehensive admin dashboard
// @access  Private (Admin)
router.get('/dashboard', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Mock comprehensive admin dashboard data
    const dashboardData = {
      overview: {
        totalUsers: 1250,
        totalCustomers: 1100,
        totalMerchants: 145,
        totalAdmins: 5,
        pendingMerchants: 12,
        totalProducts: 5670,
        totalOrders: 2340,
        totalRevenue: 125750.50,
        monthlyRevenue: 25500.75
      },
      userGrowth: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        customers: [850, 920, 980, 1020, 1080, 1100],
        merchants: [120, 125, 130, 138, 142, 145]
      },
      revenueChart: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        data: [18500, 22300, 19800, 24500, 27100, 25500]
      },
      topCategories: [
        { name: 'Electronics', products: 1250, revenue: 45600.50 },
        { name: 'Fashion', products: 980, revenue: 32400.75 },
        { name: 'Home & Kitchen', products: 750, revenue: 28900.25 }
      ],
      recentActivity: [
        {
          id: 1,
          type: 'user_registration',
          description: 'New customer registered',
          user: 'John Doe',
          timestamp: '2024-01-15T10:30:00Z'
        },
        {
          id: 2,
          type: 'merchant_verification',
          description: 'Merchant verification pending',
          user: 'Tech Store Inc.',
          timestamp: '2024-01-15T09:15:00Z'
        },
        {
          id: 3,
          type: 'order_placed',
          description: 'High-value order placed',
          amount: 1250.99,
          timestamp: '2024-01-15T08:45:00Z'
        }
      ],
      systemHealth: {
        serverStatus: 'healthy',
        databaseStatus: 'healthy',
        apiResponseTime: '120ms',
        uptime: '99.9%',
        activeUsers: 245
      }
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Admin dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Get admin dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/admin/analytics
// @desc    Get platform analytics
// @access  Private (Admin)
router.get('/analytics', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { period = '30d', metric = 'all' } = req.query;

    const analyticsData = {
      sales: {
        totalRevenue: 125750.50,
        totalOrders: 2340,
        averageOrderValue: 53.76,
        conversionRate: 3.2,
        topProducts: [
          { name: 'iPhone 15 Pro', sales: 145, revenue: 144550.00 },
          { name: 'Samsung Galaxy S24', sales: 120, revenue: 107880.00 }
        ]
      },
      users: {
        totalUsers: 1250,
        newUsers: 85,
        activeUsers: 890,
        retentionRate: 78.5,
        usersByRegion: [
          { region: 'North America', users: 650 },
          { region: 'Europe', users: 380 },
          { region: 'Asia', users: 220 }
        ]
      },
      merchants: {
        totalMerchants: 145,
        activeMerchants: 132,
        pendingVerification: 12,
        topMerchants: [
          { name: 'Tech World', revenue: 25600.50, orders: 340 },
          { name: 'Fashion Hub', revenue: 18900.75, orders: 280 }
        ]
      },
      products: {
        totalProducts: 5670,
        activeProducts: 5420,
        outOfStock: 125,
        lowStock: 89,
        categoryDistribution: [
          { category: 'Electronics', count: 1250 },
          { category: 'Fashion', count: 980 },
          { category: 'Home & Kitchen', count: 750 }
        ]
      }
    };

    res.json({
      success: true,
      data: analyticsData,
      message: 'Analytics data retrieved successfully'
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching analytics'
    });
  }
});

// @route   GET /api/admin/reports
// @desc    Generate platform reports
// @access  Private (Admin)
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { type = 'sales', startDate, endDate, format = 'json' } = req.query;

    const reportData = {
      reportId: `RPT-${Date.now()}`,
      type,
      generatedAt: new Date(),
      period: { startDate, endDate },
      data: {
        summary: {
          totalRevenue: 125750.50,
          totalOrders: 2340,
          totalProducts: 5670,
          totalUsers: 1250
        },
        details: [
          {
            date: '2024-01-15',
            revenue: 2500.75,
            orders: 45,
            newUsers: 12
          },
          {
            date: '2024-01-14',
            revenue: 1890.50,
            orders: 38,
            newUsers: 8
          }
        ]
      }
    };

    res.json({
      success: true,
      data: reportData,
      message: 'Report generated successfully'
    });
  } catch (error) {
    console.error('Generate report error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while generating report'
    });
  }
});

// @route   GET /api/admin/system/settings
// @desc    Get system settings
// @access  Private (Admin)
router.get('/system/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const settings = {
      general: {
        siteName: 'MarketMingle',
        siteDescription: 'Your one-stop e-commerce destination',
        contactEmail: 'admin@marketmingle.com',
        supportPhone: '+1-800-MARKET',
        timezone: 'UTC',
        currency: 'USD'
      },
      features: {
        userRegistration: true,
        merchantRegistration: true,
        guestCheckout: true,
        productReviews: true,
        wishlist: true,
        compare: true,
        loyaltyProgram: true
      },
      payments: {
        stripeEnabled: true,
        paypalEnabled: true,
        applePayEnabled: true,
        googlePayEnabled: false
      },
      shipping: {
        freeShippingThreshold: 50.00,
        standardShippingCost: 15.00,
        expressShippingCost: 25.00,
        overnightShippingCost: 45.00
      },
      security: {
        twoFactorAuth: false,
        passwordMinLength: 6,
        sessionTimeout: 24,
        maxLoginAttempts: 5
      }
    };

    res.json({
      success: true,
      data: settings,
      message: 'System settings retrieved successfully'
    });
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching system settings'
    });
  }
});

// @route   PUT /api/admin/system/settings
// @desc    Update system settings
// @access  Private (Admin)
router.put('/system/settings', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { category, settings } = req.body;

    if (!category || !settings) {
      return res.status(400).json({
        success: false,
        message: 'Category and settings are required'
      });
    }

    // Mock settings update
    const updatedSettings = {
      category,
      settings,
      updatedAt: new Date(),
      updatedBy: req.user.email
    };

    res.json({
      success: true,
      data: updatedSettings,
      message: 'System settings updated successfully'
    });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating system settings'
    });
  }
});

module.exports = router;
