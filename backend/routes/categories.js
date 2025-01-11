const express = require('express');
const router = express.Router();

// Mock categories data matching frontend
const categories = [
  {
    id: 1,
    name: 'Electronics',
    slug: 'electronics',
    icon: 'electronics',
    description: 'Latest electronic devices and gadgets',
    subcategories: [
      { id: 11, name: 'Smartphones', slug: 'smartphones', parentId: 1 },
      { id: 12, name: 'Laptops', slug: 'laptops', parentId: 1 },
      { id: 13, name: 'Tablets', slug: 'tablets', parentId: 1 },
      { id: 14, name: 'Accessories', slug: 'electronics-accessories', parentId: 1 }
    ]
  },
  {
    id: 2,
    name: 'Fashion',
    slug: 'fashion',
    icon: 'fashion',
    description: 'Trendy clothing and fashion accessories',
    subcategories: [
      { id: 21, name: 'Men\'s Clothing', slug: 'mens-clothing', parentId: 2 },
      { id: 22, name: 'Women\'s Clothing', slug: 'womens-clothing', parentId: 2 },
      { id: 23, name: 'Shoes', slug: 'shoes', parentId: 2 },
      { id: 24, name: 'Accessories', slug: 'fashion-accessories', parentId: 2 }
    ]
  },
  {
    id: 3,
    name: 'Home & Kitchen',
    slug: 'home-kitchen',
    icon: 'home-kitchen',
    description: 'Home essentials and kitchen appliances',
    subcategories: [
      { id: 31, name: 'Furniture', slug: 'furniture', parentId: 3 },
      { id: 32, name: 'Kitchen', slug: 'kitchen', parentId: 3 },
      { id: 33, name: 'Decor', slug: 'decor', parentId: 3 },
      { id: 34, name: 'Appliances', slug: 'appliances', parentId: 3 }
    ]
  },
  {
    id: 4,
    name: 'Beauty',
    slug: 'beauty',
    icon: 'beauty',
    description: 'Beauty and personal care products',
    subcategories: [
      { id: 41, name: 'Skincare', slug: 'skincare', parentId: 4 },
      { id: 42, name: 'Makeup', slug: 'makeup', parentId: 4 },
      { id: 43, name: 'Hair Care', slug: 'hair-care', parentId: 4 },
      { id: 44, name: 'Fragrances', slug: 'fragrances', parentId: 4 }
    ]
  },
  {
    id: 5,
    name: 'Sports',
    slug: 'sports',
    icon: 'sports',
    description: 'Sports equipment and fitness gear',
    subcategories: [
      { id: 51, name: 'Fitness', slug: 'fitness', parentId: 5 },
      { id: 52, name: 'Outdoor', slug: 'outdoor', parentId: 5 },
      { id: 53, name: 'Team Sports', slug: 'team-sports', parentId: 5 },
      { id: 54, name: 'Equipment', slug: 'sports-equipment', parentId: 5 }
    ]
  },
  {
    id: 6,
    name: 'Books',
    slug: 'books',
    icon: 'books',
    description: 'Books and educational materials',
    subcategories: [
      { id: 61, name: 'Fiction', slug: 'fiction', parentId: 6 },
      { id: 62, name: 'Non-Fiction', slug: 'non-fiction', parentId: 6 },
      { id: 63, name: 'Educational', slug: 'educational', parentId: 6 },
      { id: 64, name: 'Comics', slug: 'comics', parentId: 6 }
    ]
  }
];

// @route   GET /api/categories
// @desc    Get all categories
// @access  Public
router.get('/', (req, res) => {
  try {
    res.json({
      success: true,
      data: categories,
      message: 'Categories retrieved successfully'
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching categories'
    });
  }
});

// @route   GET /api/categories/:slug
// @desc    Get category by slug
// @access  Public
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const category = categories.find(cat => cat.slug === slug);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category,
      message: 'Category retrieved successfully'
    });
  } catch (error) {
    console.error('Get category error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category'
    });
  }
});

// @route   GET /api/categories/:categoryId/subcategories
// @desc    Get subcategories for a category
// @access  Public
router.get('/:categoryId/subcategories', (req, res) => {
  try {
    const { categoryId } = req.params;
    const category = categories.find(cat => cat.id === parseInt(categoryId));
    
    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.json({
      success: true,
      data: category.subcategories,
      message: 'Subcategories retrieved successfully'
    });
  } catch (error) {
    console.error('Get subcategories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching subcategories'
    });
  }
});

module.exports = router;
