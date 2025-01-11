const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const { updateUserSchema, formatUserResponse } = require('../utils/authUtils');

const router = express.Router();

// @route   GET /api/customer/profile
// @desc    Get customer profile
// @access  Private (Customer)
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    console.error('Get customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/customer/profile
// @desc    Update customer profile
// @access  Private (Customer)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

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
    console.error('Update customer profile error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Mock data storage for customer features
let customerData = {};
let customerReviews = {};
let customerAddresses = {};
let customerNotifications = {};

// @route   GET /api/customer/dashboard
// @desc    Get customer dashboard data
// @access  Private (Customer)
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const userId = req.user._id.toString();

    // Mock dashboard data
    const dashboardData = {
      user: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        email: req.user.email,
        memberSince: req.user.createdAt,
        avatar: req.user.avatar || null
      },
      stats: {
        totalOrders: 12,
        totalSpent: 1250.50,
        loyaltyPoints: 850,
        wishlistCount: 8,
        cartCount: 3,
        reviewsWritten: 5
      },
      recentOrders: [
        {
          id: 'ORD-001',
          date: '2024-01-15',
          status: 'delivered',
          total: 299.99,
          items: 3,
          trackingNumber: 'TRK123456789'
        },
        {
          id: 'ORD-002',
          date: '2024-01-10',
          status: 'shipped',
          total: 149.99,
          items: 1,
          trackingNumber: 'TRK987654321'
        }
      ],
      recommendations: [
        {
          id: 1,
          name: 'Wireless Headphones',
          price: 199.99,
          originalPrice: 249.99,
          image: '/images/headphones.jpg',
          rating: 4.5,
          discount: 20
        },
        {
          id: 2,
          name: 'Smart Watch',
          price: 299.99,
          originalPrice: 399.99,
          image: '/images/smartwatch.jpg',
          rating: 4.7,
          discount: 25
        }
      ],
      notifications: customerNotifications[userId] || []
    };

    res.json({
      success: true,
      data: dashboardData,
      message: 'Customer dashboard data retrieved successfully'
    });
  } catch (error) {
    console.error('Customer dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data'
    });
  }
});

// @route   GET /api/customer/orders
// @desc    Get customer orders
// @access  Private (Customer)
router.get('/orders', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const { status, limit = 10, page = 1 } = req.query;

    // Mock orders data
    let orders = [
      {
        id: 'ORD-2024-001',
        date: '2024-01-15',
        status: 'delivered',
        total: 299.99,
        items: [
          {
            id: 1,
            name: 'Wireless Headphones',
            price: 199.99,
            quantity: 1,
            image: '/images/headphones.jpg'
          },
          {
            id: 2,
            name: 'Phone Case',
            price: 29.99,
            quantity: 2,
            image: '/images/phone-case.jpg'
          }
        ],
        shipping: {
          address: '123 Main St, New York, NY 10001',
          method: 'Standard Shipping',
          trackingNumber: 'TRK123456789'
        }
      },
      {
        id: 'ORD-2024-002',
        date: '2024-01-10',
        status: 'shipped',
        total: 149.99,
        items: [
          {
            id: 3,
            name: 'Bluetooth Speaker',
            price: 149.99,
            quantity: 1,
            image: '/images/speaker.jpg'
          }
        ],
        shipping: {
          address: '123 Main St, New York, NY 10001',
          method: 'Express Shipping',
          trackingNumber: 'TRK987654321'
        }
      }
    ];

    if (status) {
      orders = orders.filter(order => order.status === status);
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
      message: 'Customer orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/customer/recommendations
// @desc    Get personalized product recommendations
// @access  Private (Customer)
router.get('/recommendations', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const { limit = 10, category } = req.query;

    let recommendations = [
      {
        id: 1,
        name: 'Wireless Headphones',
        price: 199.99,
        originalPrice: 249.99,
        image: '/images/headphones.jpg',
        rating: 4.5,
        discount: 20,
        category: 'electronics',
        reason: 'Based on your recent purchases'
      },
      {
        id: 2,
        name: 'Smart Watch',
        price: 299.99,
        originalPrice: 399.99,
        image: '/images/smartwatch.jpg',
        rating: 4.7,
        discount: 25,
        category: 'electronics',
        reason: 'Frequently bought together'
      },
      {
        id: 3,
        name: 'Running Shoes',
        price: 129.99,
        originalPrice: 159.99,
        image: '/images/running-shoes.jpg',
        rating: 4.6,
        discount: 19,
        category: 'fashion',
        reason: 'Popular in your area'
      }
    ];

    if (category) {
      recommendations = recommendations.filter(item => item.category === category);
    }

    recommendations = recommendations.slice(0, parseInt(limit));

    res.json({
      success: true,
      data: recommendations,
      message: 'Recommendations retrieved successfully'
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching recommendations'
    });
  }
});

// @route   POST /api/customer/reviews
// @desc    Submit product review
// @access  Private (Customer)
router.post('/reviews', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const userId = req.user._id.toString();
    const { productId, rating, title, comment, images } = req.body;

    if (!productId || !rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, rating, title, and comment are required'
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      });
    }

    if (!customerReviews[userId]) {
      customerReviews[userId] = [];
    }

    const review = {
      id: Date.now(),
      productId,
      rating,
      title,
      comment,
      images: images || [],
      date: new Date(),
      verified: true, // Assuming customer has purchased the product
      helpful: 0,
      reported: false
    };

    customerReviews[userId].push(review);

    res.status(201).json({
      success: true,
      data: review,
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting review'
    });
  }
});

// @route   GET /api/customer/reviews
// @desc    Get customer's reviews
// @access  Private (Customer)
router.get('/reviews', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const userId = req.user._id.toString();
    const reviews = customerReviews[userId] || [];

    res.json({
      success: true,
      data: reviews,
      message: 'Customer reviews retrieved successfully'
    });
  } catch (error) {
    console.error('Get customer reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

// @route   GET /api/customer/addresses
// @desc    Get customer addresses
// @access  Private (Customer)
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const userId = req.user._id.toString();
    const addresses = customerAddresses[userId] || [];

    res.json({
      success: true,
      data: addresses,
      message: 'Customer addresses retrieved successfully'
    });
  } catch (error) {
    console.error('Get customer addresses error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching addresses'
    });
  }
});

// @route   POST /api/customer/addresses
// @desc    Add new address
// @access  Private (Customer)
router.post('/addresses', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const userId = req.user._id.toString();
    const { name, street, city, state, zipCode, country, isDefault } = req.body;

    if (!name || !street || !city || !state || !zipCode || !country) {
      return res.status(400).json({
        success: false,
        message: 'All address fields are required'
      });
    }

    if (!customerAddresses[userId]) {
      customerAddresses[userId] = [];
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      customerAddresses[userId].forEach(addr => addr.isDefault = false);
    }

    const newAddress = {
      id: Date.now(),
      name,
      street,
      city,
      state,
      zipCode,
      country,
      isDefault: isDefault || customerAddresses[userId].length === 0,
      createdAt: new Date()
    };

    customerAddresses[userId].push(newAddress);

    res.status(201).json({
      success: true,
      data: newAddress,
      message: 'Address added successfully'
    });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding address'
    });
  }
});

// @route   GET /api/customer/loyalty
// @desc    Get customer loyalty points and rewards
// @access  Private (Customer)
router.get('/loyalty', authenticateToken, async (req, res) => {
  try {
    // Ensure user is a customer
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Access denied. Customer role required.' });
    }

    const loyaltyData = {
      currentPoints: 850,
      totalEarned: 1250,
      totalRedeemed: 400,
      tier: 'Gold',
      nextTier: 'Platinum',
      pointsToNextTier: 150,
      recentTransactions: [
        {
          id: 1,
          type: 'earned',
          points: 50,
          description: 'Purchase reward',
          date: '2024-01-15'
        },
        {
          id: 2,
          type: 'redeemed',
          points: -100,
          description: 'Discount applied',
          date: '2024-01-10'
        }
      ],
      availableRewards: [
        {
          id: 1,
          name: '$10 Off Next Purchase',
          pointsCost: 100,
          description: 'Get $10 off your next order',
          expiresAt: '2024-12-31'
        },
        {
          id: 2,
          name: 'Free Shipping',
          pointsCost: 50,
          description: 'Free shipping on your next order',
          expiresAt: '2024-12-31'
        }
      ]
    };

    res.json({
      success: true,
      data: loyaltyData,
      message: 'Loyalty information retrieved successfully'
    });
  } catch (error) {
    console.error('Get loyalty info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching loyalty information'
    });
  }
});

module.exports = router;
