const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Mock wishlist storage (in production, use database)
let userWishlists = {};

// @route   GET /api/wishlist
// @desc    Get user's wishlist
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const wishlist = userWishlists[userId] || { items: [], count: 0 };
    
    res.json({
      success: true,
      data: wishlist,
      message: 'Wishlist retrieved successfully'
    });
  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching wishlist'
    });
  }
});

// @route   POST /api/wishlist/add
// @desc    Add item to wishlist
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId, name, price, image, category } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, and price are required'
      });
    }

    if (!userWishlists[userId]) {
      userWishlists[userId] = { items: [], count: 0 };
    }

    const wishlist = userWishlists[userId];
    const existingItem = wishlist.items.find(item => item.productId === productId);

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in wishlist'
      });
    }

    wishlist.items.push({
      productId,
      name,
      price,
      image,
      category,
      addedAt: new Date()
    });

    wishlist.count = wishlist.items.length;

    res.json({
      success: true,
      data: wishlist,
      message: 'Item added to wishlist successfully'
    });
  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to wishlist'
    });
  }
});

// @route   DELETE /api/wishlist/remove/:productId
// @desc    Remove item from wishlist
// @access  Private
router.delete('/remove/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;

    if (!userWishlists[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Wishlist not found'
      });
    }

    const wishlist = userWishlists[userId];
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in wishlist'
      });
    }

    wishlist.items.splice(itemIndex, 1);
    wishlist.count = wishlist.items.length;

    res.json({
      success: true,
      data: wishlist,
      message: 'Item removed from wishlist successfully'
    });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from wishlist'
    });
  }
});

// @route   POST /api/wishlist/toggle/:productId
// @desc    Toggle item in wishlist (add if not exists, remove if exists)
// @access  Private
router.post('/toggle/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;
    const { name, price, image, category } = req.body;

    if (!userWishlists[userId]) {
      userWishlists[userId] = { items: [], count: 0 };
    }

    const wishlist = userWishlists[userId];
    const itemIndex = wishlist.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      // Remove item
      wishlist.items.splice(itemIndex, 1);
      wishlist.count = wishlist.items.length;
      
      res.json({
        success: true,
        data: wishlist,
        action: 'removed',
        message: 'Item removed from wishlist'
      });
    } else {
      // Add item
      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Product name and price are required to add to wishlist'
        });
      }

      wishlist.items.push({
        productId,
        name,
        price,
        image,
        category,
        addedAt: new Date()
      });

      wishlist.count = wishlist.items.length;

      res.json({
        success: true,
        data: wishlist,
        action: 'added',
        message: 'Item added to wishlist'
      });
    }
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling wishlist item'
    });
  }
});

// @route   DELETE /api/wishlist/clear
// @desc    Clear entire wishlist
// @access  Private
router.delete('/clear', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    userWishlists[userId] = { items: [], count: 0 };

    res.json({
      success: true,
      data: userWishlists[userId],
      message: 'Wishlist cleared successfully'
    });
  } catch (error) {
    console.error('Clear wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing wishlist'
    });
  }
});

// @route   GET /api/wishlist/check/:productId
// @desc    Check if item is in wishlist
// @access  Private
router.get('/check/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;

    const wishlist = userWishlists[userId] || { items: [], count: 0 };
    const isInWishlist = wishlist.items.some(item => item.productId === productId);

    res.json({
      success: true,
      data: { isInWishlist, productId },
      message: 'Wishlist status checked successfully'
    });
  } catch (error) {
    console.error('Check wishlist error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking wishlist'
    });
  }
});

module.exports = router;
