const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Mock orders storage (in production, use database)
let userOrders = {};

// Mock order data generator
const generateMockOrders = (userId) => {
  return [
    {
      id: 'ORD-2024-001',
      userId,
      status: 'delivered',
      orderDate: new Date('2024-01-15'),
      deliveryDate: new Date('2024-01-18'),
      items: [
        {
          productId: '101',
          name: 'iPhone 15 Pro',
          price: 999,
          quantity: 1,
          image: '/images/iphone15pro.jpg'
        }
      ],
      subtotal: 999,
      shipping: 0,
      tax: 79.92,
      total: 1078.92,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      trackingNumber: 'TRK123456789'
    },
    {
      id: 'ORD-2024-002',
      userId,
      status: 'shipped',
      orderDate: new Date('2024-01-20'),
      estimatedDelivery: new Date('2024-01-25'),
      items: [
        {
          productId: '201',
          name: 'Designer Jacket',
          price: 179,
          quantity: 1,
          image: '/images/designer-jacket.jpg'
        },
        {
          productId: '202',
          name: 'Premium Sneakers',
          price: 119,
          quantity: 1,
          image: '/images/premium-sneakers.jpg'
        }
      ],
      subtotal: 298,
      shipping: 15,
      tax: 23.84,
      total: 336.84,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'PayPal',
      trackingNumber: 'TRK987654321'
    },
    {
      id: 'ORD-2024-003',
      userId,
      status: 'processing',
      orderDate: new Date('2024-01-22'),
      estimatedDelivery: new Date('2024-01-28'),
      items: [
        {
          productId: '301',
          name: 'Smart Coffee Maker',
          price: 162,
          quantity: 1,
          image: '/images/coffee-maker.jpg'
        }
      ],
      subtotal: 162,
      shipping: 10,
      tax: 12.96,
      total: 184.96,
      shippingAddress: {
        street: '123 Main St',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      paymentMethod: 'Credit Card',
      trackingNumber: null
    }
  ];
};

// @route   GET /api/orders
// @desc    Get user's orders
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { status, limit = 10, page = 1 } = req.query;
    
    if (!userOrders[userId]) {
      userOrders[userId] = generateMockOrders(userId);
    }

    let orders = userOrders[userId];
    
    if (status) {
      orders = orders.filter(order => order.status === status);
    }

    // Sort by order date (newest first)
    orders.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));

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
      message: 'Orders retrieved successfully'
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching orders'
    });
  }
});

// @route   GET /api/orders/:orderId
// @desc    Get specific order details
// @access  Private
router.get('/:orderId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { orderId } = req.params;
    
    if (!userOrders[userId]) {
      userOrders[userId] = generateMockOrders(userId);
    }

    const order = userOrders[userId].find(o => o.id === orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      data: order,
      message: 'Order details retrieved successfully'
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching order details'
    });
  }
});

// @route   POST /api/orders
// @desc    Create new order
// @access  Private
router.post('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { items, shippingAddress, paymentMethod } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Order items are required'
      });
    }

    if (!shippingAddress || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Shipping address and payment method are required'
      });
    }

    // Calculate totals
    const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shipping = subtotal > 50 ? 0 : 15; // Free shipping over $50
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;

    // Generate order ID
    const orderCount = userOrders[userId] ? userOrders[userId].length : 0;
    const orderId = `ORD-2024-${String(orderCount + 1).padStart(3, '0')}`;

    const newOrder = {
      id: orderId,
      userId,
      status: 'processing',
      orderDate: new Date(),
      estimatedDelivery: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      items,
      subtotal,
      shipping,
      tax,
      total,
      shippingAddress,
      paymentMethod,
      trackingNumber: null
    };

    if (!userOrders[userId]) {
      userOrders[userId] = [];
    }

    userOrders[userId].unshift(newOrder); // Add to beginning

    res.status(201).json({
      success: true,
      data: newOrder,
      message: 'Order created successfully'
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating order'
    });
  }
});

// @route   PUT /api/orders/:orderId/cancel
// @desc    Cancel an order
// @access  Private
router.put('/:orderId/cancel', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { orderId } = req.params;
    
    if (!userOrders[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const orderIndex = userOrders[userId].findIndex(o => o.id === orderId);
    
    if (orderIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const order = userOrders[userId][orderIndex];

    if (order.status === 'delivered' || order.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel this order'
      });
    }

    order.status = 'cancelled';
    order.cancelledAt = new Date();

    res.json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling order'
    });
  }
});

// @route   GET /api/orders/track/:trackingNumber
// @desc    Track order by tracking number
// @access  Public
router.get('/track/:trackingNumber', (req, res) => {
  try {
    const { trackingNumber } = req.params;
    
    // Search through all user orders for the tracking number
    let foundOrder = null;
    for (const userId in userOrders) {
      const order = userOrders[userId].find(o => o.trackingNumber === trackingNumber);
      if (order) {
        foundOrder = order;
        break;
      }
    }

    if (!foundOrder) {
      return res.status(404).json({
        success: false,
        message: 'Tracking number not found'
      });
    }

    // Return limited tracking info (no sensitive data)
    const trackingInfo = {
      orderId: foundOrder.id,
      status: foundOrder.status,
      orderDate: foundOrder.orderDate,
      estimatedDelivery: foundOrder.estimatedDelivery,
      deliveryDate: foundOrder.deliveryDate,
      trackingNumber: foundOrder.trackingNumber
    };

    res.json({
      success: true,
      data: trackingInfo,
      message: 'Order tracking information retrieved successfully'
    });
  } catch (error) {
    console.error('Track order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while tracking order'
    });
  }
});

module.exports = router;
