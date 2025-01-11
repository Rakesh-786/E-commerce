const express = require('express');
const Joi = require('joi');
const Banner = require('../models/Banner');
const { authenticateToken, requireAdmin, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// Validation schema
const bannerSchema = Joi.object({
  title: Joi.string().trim().min(2).max(100).required(),
  description: Joi.string().trim().max(500).optional(),
  image: Joi.object({
    url: Joi.string().required(),
    alt: Joi.string().default('')
  }).required(),
  link: Joi.object({
    url: Joi.string().uri().optional(),
    text: Joi.string().trim().max(50).optional(),
    openInNewTab: Joi.boolean().default(false)
  }).optional(),
  position: Joi.string().valid('hero', 'sidebar', 'footer', 'popup', 'category').required(),
  priority: Joi.number().min(0).default(0),
  isActive: Joi.boolean().default(true),
  startDate: Joi.date().optional(),
  endDate: Joi.date().greater(Joi.ref('startDate')).optional(),
  targetAudience: Joi.string().valid('all', 'customers', 'merchants', 'new-users').default('all')
});

// @route   GET /api/banners
// @desc    Get all banners (admin) or active banners (public)
// @access  Public/Private
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { position, targetAudience = 'all', includeInactive = false } = req.query;
    
    let filter = {};
    
    // If user is not admin, only show active banners
    if (!req.user || req.user.role !== 'admin') {
      const now = new Date();
      filter = {
        isActive: true,
        $or: [
          { startDate: { $exists: false } },
          { startDate: { $lte: now } }
        ],
        $and: [
          {
            $or: [
              { endDate: { $exists: false } },
              { endDate: { $gte: now } }
            ]
          }
        ]
      };
      
      // Filter by target audience
      if (req.user) {
        filter.$or = [
          { targetAudience: 'all' },
          { targetAudience: req.user.role === 'merchant' ? 'merchants' : 'customers' }
        ];
      } else {
        filter.targetAudience = { $in: ['all', 'new-users'] };
      }
    } else if (includeInactive !== 'true') {
      filter.isActive = true;
    }

    // Filter by position if specified
    if (position) {
      filter.position = position;
    }

    const banners = await Banner.find(filter)
      .populate('createdBy', 'firstName lastName')
      .sort({ priority: -1, createdAt: -1 });

    res.json(banners);
  } catch (error) {
    console.error('Get banners error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/banners/:id
// @desc    Get single banner
// @access  Public/Private
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id)
      .populate('createdBy', 'firstName lastName');

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    // If user is not admin, check if banner is active and within date range
    if (!req.user || req.user.role !== 'admin') {
      const now = new Date();
      const isActive = banner.isActive && 
                      (!banner.startDate || banner.startDate <= now) &&
                      (!banner.endDate || banner.endDate >= now);
      
      if (!isActive) {
        return res.status(404).json({ message: 'Banner not found' });
      }
    }

    res.json(banner);
  } catch (error) {
    console.error('Get banner error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/banners
// @desc    Create a new banner
// @access  Private (Admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = bannerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    // Create banner
    const banner = new Banner({
      ...value,
      createdBy: req.user._id
    });

    await banner.save();
    await banner.populate('createdBy', 'firstName lastName');

    res.status(201).json({
      message: 'Banner created successfully',
      banner
    });
  } catch (error) {
    console.error('Create banner error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/banners/:id
// @desc    Update banner
// @access  Private (Admin only)
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    // Validate input
    const { error, value } = bannerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    const banner = await Banner.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('createdBy', 'firstName lastName');

    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({
      message: 'Banner updated successfully',
      banner
    });
  } catch (error) {
    console.error('Update banner error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/banners/:id
// @desc    Delete banner
// @access  Private (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    console.error('Delete banner error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid banner ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/banners/:id/click
// @desc    Track banner click
// @access  Public
router.post('/:id/click', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.incrementClick();
    res.json({ message: 'Click tracked successfully' });
  } catch (error) {
    console.error('Track click error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/banners/:id/impression
// @desc    Track banner impression
// @access  Public
router.post('/:id/impression', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    
    if (!banner) {
      return res.status(404).json({ message: 'Banner not found' });
    }

    await banner.incrementImpression();
    res.json({ message: 'Impression tracked successfully' });
  } catch (error) {
    console.error('Track impression error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
