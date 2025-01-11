const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Mock cart storage (in production, use database)
let userCarts = {};

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const cart = userCarts[userId] || { items: [], total: 0, itemCount: 0 };
    
    res.json({
      success: true,
      data: cart,
      message: 'Cart retrieved successfully'
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching cart'
    });
  }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId, quantity = 1, price, name, image } = req.body;

    if (!productId || !price || !name) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, price, and name are required'
      });
    }

    if (!userCarts[userId]) {
      userCarts[userId] = { items: [], total: 0, itemCount: 0 };
    }

    const cart = userCarts[userId];
    const existingItemIndex = cart.items.findIndex(item => item.productId === productId);

    if (existingItemIndex > -1) {
      // Update existing item
      cart.items[existingItemIndex].quantity += quantity;
    } else {
      // Add new item
      cart.items.push({
        productId,
        name,
        price,
        image,
        quantity,
        addedAt: new Date()
      });
    }

    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: cart,
      message: 'Item added to cart successfully'
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to cart'
    });
  }
});

// @route   PUT /api/cart/update/:productId
// @desc    Update cart item quantity
// @access  Private
router.put('/update/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid quantity is required'
      });
    }

    if (!userCarts[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const cart = userCarts[userId];
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    if (quantity === 0) {
      // Remove item if quantity is 0
      cart.items.splice(itemIndex, 1);
    } else {
      // Update quantity
      cart.items[itemIndex].quantity = quantity;
    }

    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: cart,
      message: 'Cart updated successfully'
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating cart'
    });
  }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;

    if (!userCarts[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Cart not found'
      });
    }

    const cart = userCarts[userId];
    const itemIndex = cart.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in cart'
      });
    }

    cart.items.splice(itemIndex, 1);

    // Recalculate totals
    cart.total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cart.itemCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);

    res.json({
      success: true,
      data: cart,
      message: 'Item removed from cart successfully'
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from cart'
    });
  }
});

// @route   DELETE /api/cart/clear
// @desc    Clear entire cart
// @access  Private
router.delete('/clear', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    userCarts[userId] = { items: [], total: 0, itemCount: 0 };

    res.json({
      success: true,
      data: userCarts[userId],
      message: 'Cart cleared successfully'
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing cart'
    });
  }
});

module.exports = router;
