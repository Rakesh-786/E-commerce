const express = require('express');
const Joi = require('joi');
const Product = require('../models/Product');
const { authenticateToken, requireMerchant, requireProductOwnership, optionalAuth } = require('../middleware/auth');
const { uploadMultiple } = require('../middleware/upload');

const router = express.Router();

// Validation schemas
const productSchema = Joi.object({
  name: Joi.string().trim().min(2).max(200).required(),
  description: Joi.string().trim().min(10).max(2000).required(),
  price: Joi.number().min(0).required(),
  discountPrice: Joi.number().min(0).optional(),
  category: Joi.string().valid('Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Beauty', 'Accessories', 'Other').required(),
  subcategory: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional(),
  sku: Joi.string().trim().optional(),
  specifications: Joi.array().items(
    Joi.object({
      name: Joi.string().required(),
      value: Joi.string().required()
    })
  ).optional(),
  inventory: Joi.object({
    quantity: Joi.number().min(0).required(),
    lowStockThreshold: Joi.number().min(0).default(10),
    trackInventory: Joi.boolean().default(true)
  }).required(),
  tags: Joi.array().items(Joi.string().trim()).optional(),
  weight: Joi.object({
    value: Joi.number().min(0),
    unit: Joi.string().valid('kg', 'g', 'lb', 'oz').default('kg')
  }).optional(),
  dimensions: Joi.object({
    length: Joi.number().min(0),
    width: Joi.number().min(0),
    height: Joi.number().min(0),
    unit: Joi.string().valid('cm', 'in', 'm').default('cm')
  }).optional()
});

// @route   GET /api/products
// @desc    Get all products with filtering and pagination
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      search,
      minPrice,
      maxPrice,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      featured,
      inStock
    } = req.query;

    // Build filter object
    const filter = { isActive: true };

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$text = { $search: search };
    }

    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = parseFloat(minPrice);
      if (maxPrice) filter.price.$lte = parseFloat(maxPrice);
    }

    if (featured === 'true') {
      filter.featured = true;
    }

    if (inStock === 'true') {
      filter['inventory.quantity'] = { $gt: 0 };
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    // Execute query with pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate('merchant', 'firstName lastName merchantInfo.businessName')
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
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/products/:id
// @desc    Get single product by ID
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({ 
      _id: req.params.id, 
      isActive: true 
    }).populate('merchant', 'firstName lastName merchantInfo.businessName')
      .populate('reviews.user', 'firstName lastName');

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ message: 'Invalid product ID' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/products
// @desc    Create a new product
// @access  Private (Merchant/Admin)
router.post('/', authenticateToken, requireMerchant, async (req, res) => {
  try {
    // Validate input
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    // Create product
    const productData = {
      ...value,
      merchant: req.user._id
    };

    const product = new Product(productData);
    await product.save();

    // Populate merchant info
    await product.populate('merchant', 'firstName lastName merchantInfo.businessName');

    res.status(201).json({
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/products/:id
// @desc    Update product
// @access  Private (Product Owner/Admin)
router.put('/:id', authenticateToken, requireProductOwnership, async (req, res) => {
  try {
    // Validate input
    const { error, value } = productSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        message: 'Validation error', 
        details: error.details[0].message 
      });
    }

    // Update product
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      value,
      { new: true, runValidators: true }
    ).populate('merchant', 'firstName lastName merchantInfo.businessName');

    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    console.error('Update product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (soft delete)
// @access  Private (Product Owner/Admin)
router.delete('/:id', authenticateToken, requireProductOwnership, async (req, res) => {
  try {
    await Product.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
