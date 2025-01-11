const express = require('express');
const router = express.Router();

// Mock brands data
const brands = [
  {
    id: 1,
    name: 'Apple',
    slug: 'apple',
    logo: '/images/brands/apple-logo.png',
    description: 'Innovation that changes everything',
    website: 'https://apple.com',
    category: 'electronics',
    isActive: true,
    productCount: 45,
    rating: 4.8,
    founded: 1976,
    headquarters: 'Cupertino, CA'
  },
  {
    id: 2,
    name: 'Samsung',
    slug: 'samsung',
    logo: '/images/brands/samsung-logo.png',
    description: 'Inspire the world, create the future',
    website: 'https://samsung.com',
    category: 'electronics',
    isActive: true,
    productCount: 38,
    rating: 4.6,
    founded: 1938,
    headquarters: 'Seoul, South Korea'
  },
  {
    id: 3,
    name: 'Nike',
    slug: 'nike',
    logo: '/images/brands/nike-logo.png',
    description: 'Just Do It',
    website: 'https://nike.com',
    category: 'fashion',
    isActive: true,
    productCount: 67,
    rating: 4.7,
    founded: 1964,
    headquarters: 'Beaverton, OR'
  },
  {
    id: 4,
    name: 'Adidas',
    slug: 'adidas',
    logo: '/images/brands/adidas-logo.png',
    description: 'Impossible is Nothing',
    website: 'https://adidas.com',
    category: 'fashion',
    isActive: true,
    productCount: 52,
    rating: 4.5,
    founded: 1949,
    headquarters: 'Herzogenaurach, Germany'
  },
  {
    id: 5,
    name: 'IKEA',
    slug: 'ikea',
    logo: '/images/brands/ikea-logo.png',
    description: 'Create a better everyday life',
    website: 'https://ikea.com',
    category: 'home-kitchen',
    isActive: true,
    productCount: 89,
    rating: 4.4,
    founded: 1943,
    headquarters: 'Delft, Netherlands'
  },
  {
    id: 6,
    name: 'L\'Oréal',
    slug: 'loreal',
    logo: '/images/brands/loreal-logo.png',
    description: 'Because you\'re worth it',
    website: 'https://loreal.com',
    category: 'beauty',
    isActive: true,
    productCount: 34,
    rating: 4.3,
    founded: 1909,
    headquarters: 'Clichy, France'
  },
  {
    id: 7,
    name: 'Sony',
    slug: 'sony',
    logo: '/images/brands/sony-logo.png',
    description: 'Be Moved',
    website: 'https://sony.com',
    category: 'electronics',
    isActive: true,
    productCount: 41,
    rating: 4.6,
    founded: 1946,
    headquarters: 'Tokyo, Japan'
  },
  {
    id: 8,
    name: 'Zara',
    slug: 'zara',
    logo: '/images/brands/zara-logo.png',
    description: 'Love Your Curves',
    website: 'https://zara.com',
    category: 'fashion',
    isActive: true,
    productCount: 78,
    rating: 4.2,
    founded: 1975,
    headquarters: 'Arteixo, Spain'
  }
];

// @route   GET /api/brands
// @desc    Get all brands
// @access  Public
router.get('/', (req, res) => {
  try {
    const { category, limit = 20, page = 1, search } = req.query;
    
    let filteredBrands = brands.filter(brand => brand.isActive);
    
    if (category) {
      filteredBrands = filteredBrands.filter(brand => brand.category === category);
    }

    if (search) {
      const searchTerm = search.toLowerCase();
      filteredBrands = filteredBrands.filter(brand => 
        brand.name.toLowerCase().includes(searchTerm) ||
        brand.description.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by name
    filteredBrands.sort((a, b) => a.name.localeCompare(b.name));

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBrands = filteredBrands.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        brands: paginatedBrands,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(filteredBrands.length / limit),
          totalBrands: filteredBrands.length,
          hasNext: endIndex < filteredBrands.length,
          hasPrev: page > 1
        }
      },
      message: 'Brands retrieved successfully'
    });
  } catch (error) {
    console.error('Get brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching brands'
    });
  }
});

// @route   GET /api/brands/:slug
// @desc    Get brand by slug
// @access  Public
router.get('/:slug', (req, res) => {
  try {
    const { slug } = req.params;
    const brand = brands.find(b => b.slug === slug && b.isActive);
    
    if (!brand) {
      return res.status(404).json({
        success: false,
        message: 'Brand not found'
      });
    }

    res.json({
      success: true,
      data: brand,
      message: 'Brand retrieved successfully'
    });
  } catch (error) {
    console.error('Get brand error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching brand'
    });
  }
});

// @route   GET /api/brands/category/:category
// @desc    Get brands by category
// @access  Public
router.get('/category/:category', (req, res) => {
  try {
    const { category } = req.params;
    const { limit = 20, page = 1 } = req.query;
    
    const categoryBrands = brands.filter(brand => 
      brand.isActive && brand.category === category
    );

    // Sort by product count (most popular first)
    categoryBrands.sort((a, b) => b.productCount - a.productCount);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedBrands = categoryBrands.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        brands: paginatedBrands,
        category,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(categoryBrands.length / limit),
          totalBrands: categoryBrands.length,
          hasNext: endIndex < categoryBrands.length,
          hasPrev: page > 1
        }
      },
      message: `${category} brands retrieved successfully`
    });
  } catch (error) {
    console.error('Get category brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching category brands'
    });
  }
});

// @route   GET /api/brands/featured/popular
// @desc    Get popular/featured brands
// @access  Public
router.get('/featured/popular', (req, res) => {
  try {
    const { limit = 8 } = req.query;
    
    const popularBrands = brands
      .filter(brand => brand.isActive)
      .sort((a, b) => b.rating - a.rating || b.productCount - a.productCount)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: popularBrands,
      message: 'Popular brands retrieved successfully'
    });
  } catch (error) {
    console.error('Get popular brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching popular brands'
    });
  }
});

// @route   GET /api/brands/search/:query
// @desc    Search brands
// @access  Public
router.get('/search/:query', (req, res) => {
  try {
    const { query } = req.params;
    const { limit = 10 } = req.query;
    
    const searchTerm = query.toLowerCase();
    const searchResults = brands
      .filter(brand => 
        brand.isActive && (
          brand.name.toLowerCase().includes(searchTerm) ||
          brand.description.toLowerCase().includes(searchTerm)
        )
      )
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        brands: searchResults,
        query,
        totalResults: searchResults.length
      },
      message: 'Brand search completed successfully'
    });
  } catch (error) {
    console.error('Search brands error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while searching brands'
    });
  }
});

module.exports = router;
