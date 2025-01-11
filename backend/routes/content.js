const express = require('express');
const router = express.Router();

// Mock FAQ data
const faqs = [
  {
    id: 1,
    category: 'Orders',
    question: 'How can I track my order?',
    answer: 'You can track your order by visiting the "My Orders" section in your account or using the tracking number provided in your order confirmation email.'
  },
  {
    id: 2,
    category: 'Shipping',
    question: 'What are your shipping options?',
    answer: 'We offer standard shipping (5-7 business days) and express shipping (2-3 business days). Free shipping is available on orders over $50.'
  },
  {
    id: 3,
    category: 'Returns',
    question: 'What is your return policy?',
    answer: 'We accept returns within 30 days of purchase. Items must be in original condition with tags attached. Return shipping is free for defective items.'
  },
  {
    id: 4,
    category: 'Payment',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and Apple Pay.'
  },
  {
    id: 5,
    category: 'Account',
    question: 'How do I reset my password?',
    answer: 'Click on "Forgot Password" on the login page and enter your email address. We\'ll send you a link to reset your password.'
  }
];

// Mock contact submissions storage
let contactSubmissions = [];

// @route   GET /api/content/faq
// @desc    Get frequently asked questions
// @access  Public
router.get('/faq', (req, res) => {
  try {
    const { category } = req.query;
    
    let filteredFaqs = faqs;
    if (category) {
      filteredFaqs = faqs.filter(faq => 
        faq.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Group FAQs by category
    const groupedFaqs = filteredFaqs.reduce((acc, faq) => {
      if (!acc[faq.category]) {
        acc[faq.category] = [];
      }
      acc[faq.category].push(faq);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        faqs: filteredFaqs,
        grouped: groupedFaqs,
        categories: [...new Set(faqs.map(faq => faq.category))]
      },
      message: 'FAQs retrieved successfully'
    });
  } catch (error) {
    console.error('Get FAQs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching FAQs'
    });
  }
});

// @route   POST /api/content/contact
// @desc    Submit contact form
// @access  Public
router.post('/contact', (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, subject, and message are required'
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address'
      });
    }

    const submission = {
      id: contactSubmissions.length + 1,
      name,
      email,
      phone: phone || null,
      subject,
      message,
      submittedAt: new Date(),
      status: 'pending'
    };

    contactSubmissions.push(submission);

    // In production, you would:
    // 1. Save to database
    // 2. Send email notification to support team
    // 3. Send confirmation email to user

    res.status(201).json({
      success: true,
      data: {
        submissionId: submission.id,
        message: 'Thank you for contacting us. We will get back to you within 24 hours.'
      },
      message: 'Contact form submitted successfully'
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting contact form'
    });
  }
});

// @route   GET /api/content/shipping
// @desc    Get shipping information
// @access  Public
router.get('/shipping', (req, res) => {
  try {
    const shippingInfo = {
      methods: [
        {
          name: 'Standard Shipping',
          cost: 'Free on orders over $50, otherwise $15',
          duration: '5-7 business days',
          description: 'Reliable delivery for most orders'
        },
        {
          name: 'Express Shipping',
          cost: '$25',
          duration: '2-3 business days',
          description: 'Faster delivery for urgent orders'
        },
        {
          name: 'Overnight Shipping',
          cost: '$45',
          duration: '1 business day',
          description: 'Next day delivery for time-sensitive orders'
        }
      ],
      policies: [
        'Orders placed before 2 PM EST ship the same day',
        'Free shipping applies to orders over $50 within the continental US',
        'International shipping available to select countries',
        'Shipping costs calculated at checkout based on destination',
        'Tracking information provided for all shipments'
      ],
      restrictions: [
        'Some items may have shipping restrictions',
        'Hazardous materials cannot be shipped',
        'Large items may require special handling',
        'International orders may be subject to customs fees'
      ]
    };

    res.json({
      success: true,
      data: shippingInfo,
      message: 'Shipping information retrieved successfully'
    });
  } catch (error) {
    console.error('Get shipping info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching shipping information'
    });
  }
});

// @route   GET /api/content/returns
// @desc    Get returns and refunds information
// @access  Public
router.get('/returns', (req, res) => {
  try {
    const returnsInfo = {
      policy: {
        timeLimit: '30 days from purchase date',
        condition: 'Items must be in original condition with tags attached',
        exceptions: ['Personalized items', 'Perishable goods', 'Digital downloads']
      },
      process: [
        'Log into your account and go to "My Orders"',
        'Select the order and click "Return Items"',
        'Choose the items you want to return and reason',
        'Print the prepaid return label',
        'Package items securely and attach the label',
        'Drop off at any authorized shipping location'
      ],
      refunds: {
        processing: '3-5 business days after we receive your return',
        method: 'Original payment method',
        shippingCosts: 'Return shipping is free for defective items'
      },
      exchanges: {
        available: true,
        process: 'Same as returns, but select "Exchange" option',
        sizeDifference: 'Price differences will be charged or refunded'
      }
    };

    res.json({
      success: true,
      data: returnsInfo,
      message: 'Returns information retrieved successfully'
    });
  } catch (error) {
    console.error('Get returns info error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching returns information'
    });
  }
});

// @route   GET /api/content/terms
// @desc    Get terms and conditions
// @access  Public
router.get('/terms', (req, res) => {
  try {
    const terms = {
      lastUpdated: '2024-01-01',
      sections: [
        {
          title: 'Acceptance of Terms',
          content: 'By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement.'
        },
        {
          title: 'Use License',
          content: 'Permission is granted to temporarily download one copy of the materials on MarketMingle\'s website for personal, non-commercial transitory viewing only.'
        },
        {
          title: 'Disclaimer',
          content: 'The materials on MarketMingle\'s website are provided on an \'as is\' basis. MarketMingle makes no warranties, expressed or implied.'
        },
        {
          title: 'Limitations',
          content: 'In no event shall MarketMingle or its suppliers be liable for any damages arising out of the use or inability to use the materials on MarketMingle\'s website.'
        },
        {
          title: 'Privacy Policy',
          content: 'Your privacy is important to us. Please review our Privacy Policy, which also governs your use of the website.'
        }
      ]
    };

    res.json({
      success: true,
      data: terms,
      message: 'Terms and conditions retrieved successfully'
    });
  } catch (error) {
    console.error('Get terms error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching terms and conditions'
    });
  }
});

module.exports = router;
