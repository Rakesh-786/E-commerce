const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Mock compare storage (in production, use database)
let userCompares = {};

// @route   GET /api/compare
// @desc    Get user's compare list
// @access  Private
router.get('/', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const compareList = userCompares[userId] || { items: [], count: 0 };
    
    res.json({
      success: true,
      data: compareList,
      message: 'Compare list retrieved successfully'
    });
  } catch (error) {
    console.error('Get compare list error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching compare list'
    });
  }
});

// @route   POST /api/compare/add
// @desc    Add item to compare list
// @access  Private
router.post('/add', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId, name, price, image, category, specifications } = req.body;

    if (!productId || !name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Product ID, name, and price are required'
      });
    }

    if (!userCompares[userId]) {
      userCompares[userId] = { items: [], count: 0 };
    }

    const compareList = userCompares[userId];
    
    // Limit compare list to 4 items
    if (compareList.items.length >= 4) {
      return res.status(400).json({
        success: false,
        message: 'Compare list is full. Maximum 4 items allowed.'
      });
    }

    const existingItem = compareList.items.find(item => item.productId === productId);

    if (existingItem) {
      return res.status(400).json({
        success: false,
        message: 'Item already in compare list'
      });
    }

    compareList.items.push({
      productId,
      name,
      price,
      image,
      category,
      specifications: specifications || {},
      addedAt: new Date()
    });

    compareList.count = compareList.items.length;

    res.json({
      success: true,
      data: compareList,
      message: 'Item added to compare list successfully'
    });
  } catch (error) {
    console.error('Add to compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while adding to compare list'
    });
  }
});

// @route   DELETE /api/compare/remove/:productId
// @desc    Remove item from compare list
// @access  Private
router.delete('/remove/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;

    if (!userCompares[userId]) {
      return res.status(404).json({
        success: false,
        message: 'Compare list not found'
      });
    }

    const compareList = userCompares[userId];
    const itemIndex = compareList.items.findIndex(item => item.productId === productId);

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Item not found in compare list'
      });
    }

    compareList.items.splice(itemIndex, 1);
    compareList.count = compareList.items.length;

    res.json({
      success: true,
      data: compareList,
      message: 'Item removed from compare list successfully'
    });
  } catch (error) {
    console.error('Remove from compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while removing from compare list'
    });
  }
});

// @route   POST /api/compare/toggle/:productId
// @desc    Toggle item in compare list
// @access  Private
router.post('/toggle/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;
    const { name, price, image, category, specifications } = req.body;

    if (!userCompares[userId]) {
      userCompares[userId] = { items: [], count: 0 };
    }

    const compareList = userCompares[userId];
    const itemIndex = compareList.items.findIndex(item => item.productId === productId);

    if (itemIndex > -1) {
      // Remove item
      compareList.items.splice(itemIndex, 1);
      compareList.count = compareList.items.length;
      
      res.json({
        success: true,
        data: compareList,
        action: 'removed',
        message: 'Item removed from compare list'
      });
    } else {
      // Add item
      if (compareList.items.length >= 4) {
        return res.status(400).json({
          success: false,
          message: 'Compare list is full. Maximum 4 items allowed.'
        });
      }

      if (!name || !price) {
        return res.status(400).json({
          success: false,
          message: 'Product name and price are required'
        });
      }

      compareList.items.push({
        productId,
        name,
        price,
        image,
        category,
        specifications: specifications || {},
        addedAt: new Date()
      });

      compareList.count = compareList.items.length;

      res.json({
        success: true,
        data: compareList,
        action: 'added',
        message: 'Item added to compare list'
      });
    }
  } catch (error) {
    console.error('Toggle compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while toggling compare item'
    });
  }
});

// @route   DELETE /api/compare/clear
// @desc    Clear entire compare list
// @access  Private
router.delete('/clear', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    
    userCompares[userId] = { items: [], count: 0 };

    res.json({
      success: true,
      data: userCompares[userId],
      message: 'Compare list cleared successfully'
    });
  } catch (error) {
    console.error('Clear compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while clearing compare list'
    });
  }
});

// @route   GET /api/compare/check/:productId
// @desc    Check if item is in compare list
// @access  Private
router.get('/check/:productId', authenticateToken, (req, res) => {
  try {
    const userId = req.user._id.toString();
    const { productId } = req.params;

    const compareList = userCompares[userId] || { items: [], count: 0 };
    const isInCompare = compareList.items.some(item => item.productId === productId);

    res.json({
      success: true,
      data: { isInCompare, productId, canAdd: compareList.items.length < 4 },
      message: 'Compare status checked successfully'
    });
  } catch (error) {
    console.error('Check compare error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking compare list'
    });
  }
});

module.exports = router;
