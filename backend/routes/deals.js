const express = require('express');
const router = express.Router();

// Mock deals data
const deals = [
  {
    id: 1,
    title: 'Flash Sale - Electronics',
    description: 'Up to 50% off on selected electronics',
    discountPercentage: 50,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    category: 'electronics',
    products: [
      {
        id: 101,
        name: 'iPhone 15 Pro',
        originalPrice: 999,
        salePrice: 799,
        image: '/images/iphone15pro.jpg',
        discount: 20
      },
      {
        id: 102,
        name: 'Samsung Galaxy S24',
        originalPrice: 899,
        salePrice: 699,
        image: '/images/galaxy-s24.jpg',
        discount: 22
      }
    ]
  },
  {
    id: 2,
    title: 'Fashion Week Special',
    description: 'Trendy fashion at unbeatable prices',
    discountPercentage: 40,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    category: 'fashion',
    products: [
      {
        id: 201,
        name: 'Designer Jacket',
        originalPrice: 299,
        salePrice: 179,
        image: '/images/designer-jacket.jpg',
        discount: 40
      },
      {
        id: 202,
        name: 'Premium Sneakers',
        originalPrice: 199,
        salePrice: 119,
        image: '/images/premium-sneakers.jpg',
        discount: 40
      }
    ]
  },
  {
    id: 3,
    title: 'Home & Kitchen Essentials',
    description: 'Transform your home with our deals',
    discountPercentage: 35,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    category: 'home-kitchen',
    products: [
      {
        id: 301,
        name: 'Smart Coffee Maker',
        originalPrice: 249,
        salePrice: 162,
        image: '/images/coffee-maker.jpg',
        discount: 35
      },
      {
        id: 302,
        name: 'Air Fryer Pro',
        originalPrice: 179,
        salePrice: 116,
        image: '/images/air-fryer.jpg',
        discount: 35
      }
    ]
  },
  {
    id: 4,
    title: 'Beauty Bonanza',
    description: 'Glow up with amazing beauty deals',
    discountPercentage: 45,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-12-31'),
    isActive: true,
    category: 'beauty',
    products: [
      {
        id: 401,
        name: 'Luxury Skincare Set',
        originalPrice: 199,
        salePrice: 109,
        image: '/images/skincare-set.jpg',
        discount: 45
      },
      {
        id: 402,
        name: 'Professional Makeup Kit',
        originalPrice: 149,
        salePrice: 82,
        image: '/images/makeup-kit.jpg',
        discount: 45
      }
    ]
  }
];

// @route   GET /api/deals
// @desc    Get all active deals
// @access  Public
router.get('/', (req, res) => {
  try {
    const { category, limit = 10, page = 1 } = req.query;
    
    let filteredDeals = deals.filter(deal => deal.isActive);
    
    if (category) {
      filteredDeals = filteredDeals.filter(deal => deal.category === category);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDeals = filteredDeals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        deals: paginatedDeals,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredDeals.length / limit),
          totalDeals: filteredDeals.length,
          hasNext: endIndex < filteredDeals.length,
          hasPrev: page > 1
        }
      },
      message: 'Deals retrieved successfully'
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deals'
    });
  }
});

// @route   GET /api/deals/:id
// @desc    Get deal by ID
// @access  Public
router.get('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const deal = deals.find(d => d.id === parseInt(id));
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!deal.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Deal is no longer active'
      });
    }

    res.json({
      success: true,
      data: deal,
      message: 'Deal retrieved successfully'
    });
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deal'
    });
  }
});

// @route   GET /api/deals/category/:category
// @desc    Get deals by category
// @access  Public
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 10, page = 1 } = req.query;
    
    const categoryDeals = deals.filter(deal => 
      deal.isActive && deal.category === category
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDeals = categoryDeals.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        deals: paginatedDeals,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(categoryDeals.length / limit),
          totalDeals: categoryDeals.length,
          hasNext: endIndex < categoryDeals.length,
          hasPrev: page > 1
        }
      },
      message: `${category} deals retrieved successfully`
    });
  } catch (error) {
    console.error('Get category deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category deals'
    });
  }
});

// @route   GET /api/deals/featured/today
// @desc    Get today's featured deals
// @access  Public
router.get('/featured/today', (req, res) => {
  try {
    const today = new Date();
    const featuredDeals = deals.filter(deal => 
      deal.isActive && 
      deal.startDate <= today && 
      deal.endDate >= today
    ).slice(0, 6); // Limit to 6 featured deals

    res.json({
      success: true,
      data: featuredDeals,
      message: 'Featured deals retrieved successfully'
    });
  } catch (error) {
    console.error('Get featured deals error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching featured deals'
    });
  }
});

// @route   GET /api/deals/products/:dealId
// @desc    Get products in a specific deal
// @access  Public
router.get('/products/:dealId', (req, res) => {
  try {
    const { dealId } = req.params;
    const deal = deals.find(d => d.id === parseInt(dealId));
    
    if (!deal) {
      return res.status(404).json({
        success: false,
        message: 'Deal not found'
      });
    }

    if (!deal.isActive) {
      return res.status(404).json({
        success: false,
        message: 'Deal is no longer active'
      });
    }

    res.json({
      success: true,
      data: {
        dealInfo: {
          id: deal.id,
          title: deal.title,
          description: deal.description,
          discountPercentage: deal.discountPercentage
        },
        products: deal.products
      },
      message: 'Deal products retrieved successfully'
    });
  } catch (error) {
    console.error('Get deal products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching deal products'
    });
  }
});

module.exports = router;
