const jwt = require('jsonwebtoken');
const Joi = require('joi');

// Validation schemas
const registerSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).required(),
  lastName: Joi.string().trim().min(2).max(50).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('customer', 'merchant', 'admin').default('customer'),
  phone: Joi.string().trim().optional(),
  businessName: Joi.string().trim().when('role', {
    is: 'merchant',
    then: Joi.required(),
    otherwise: Joi.optional()
  }),
  businessDescription: Joi.string().trim().optional()
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required()
});

const updateUserSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50).optional(),
  lastName: Joi.string().trim().min(2).max(50).optional(),
  phone: Joi.string().trim().optional(),
  address: Joi.object({
    street: Joi.string().trim().optional(),
    city: Joi.string().trim().optional(),
    state: Joi.string().trim().optional(),
    zipCode: Joi.string().trim().optional(),
    country: Joi.string().trim().optional()
  }).optional()
});

const updateMerchantInfoSchema = Joi.object({
  businessName: Joi.string().trim().min(2).max(100).optional(),
  businessDescription: Joi.string().trim().max(500).optional(),
  businessLicense: Joi.string().trim().optional()
});

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

// Format user response (remove sensitive data)
const formatUserResponse = (user) => {
  const formatted = {
    id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatar: user.avatar
  };
  if (user.role === 'merchant') {
    formatted.merchantInfo = user.merchantInfo;
    formatted.address = user.address;
  }

  return formatted;

};

module.exports = {
  registerSchema,
  loginSchema,
  updateUserSchema,
  updateMerchantInfoSchema,
  generateToken,
  formatUserResponse
};
