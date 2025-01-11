const express = require('express');
const User = require('../models/User');
const { authenticateToken } = require('../middleware/auth');
const {
  registerSchema,
  loginSchema,
  generateToken,
  formatUserResponse
} = require('../utils/authUtils');

const router = express.Router();

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
  try {
    // Validate input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { firstName, lastName, email, password, role, phone, businessName, businessDescription } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    // Create user object
    const userData = {
      firstName,
      lastName,
      email,
      password,
      role,
      phone
    };

    // Add merchant info if role is merchant
    if (role === 'merchant') {
      userData.merchantInfo = {
        businessName,
        businessDescription,
        isVerified: false
      };
    }

    // Create user
    console.log('Creating new user with data:', JSON.stringify(userData, null, 2));
    const user = new User(userData);
    const savedUser = await user.save();
    console.log('User saved successfully with ID:', savedUser._id);
    console.log('User data in database:', JSON.stringify(savedUser, null, 2));

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'User registered successfully',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    // Validate input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: 'Validation error',
        details: error.details[0].message
      });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check if account is active
    if (!user.isActive) {
      return res.status(401).json({ message: 'Account is deactivated' });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate token
    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: formatUserResponse(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', authenticateToken, async (req, res) => {
  try {
    
    res.json({
      user: formatUserResponse(req.user)
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/refresh
// @desc    Refresh JWT token
// @access  Private
router.post('/refresh', authenticateToken, async (req, res) => {
  try {
    const token = generateToken(req.user._id);
    res.json({ token });
  } catch (error) {
    console.error('Token refresh error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', authenticateToken, async (req, res) => {
  try {
    // Since we're using stateless JWT tokens, we can't invalidate them server-side
    // without implementing a token blacklist. For now, we'll just acknowledge the logout
    // and let the client handle token removal.

    // Optional: Log the logout event for security/audit purposes
    console.log(`User ${req.user._id} (${req.user.email}) logged out at ${new Date().toISOString()}`);

    // In the future, you could:
    // 1. Add the token to a blacklist/redis cache
    // 2. Update user's lastLogoutAt timestamp
    // 3. Invalidate refresh tokens if using them

    res.json({
      message: 'Logout successful',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ message: 'Server error during logout' });
  }
});

module.exports = router;
