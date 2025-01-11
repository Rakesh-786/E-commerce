const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:4200',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(morgan('combined'));

// Static files for upload
app.use('/uploads', express.static('uploads'));

// Database connection
const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/emarket';
console.log('Attempting to connect to MongoDB at:', mongoUri);

mongoose.connect(mongoUri)
  .then(() => {
    console.log('Connected to MongoDB successfully');
    console.log('Database name:', mongoose.connection.db.databaseName);

    // List all collections
    mongoose.connection.db.listCollections().toArray()
      .then(collections => {
        console.log('Collections in database:', collections.map(c => c.name));

        // Check if users collection exists and count documents
        if (collections.some(c => c.name === 'users')) {
          mongoose.connection.db.collection('users').countDocuments()
            .then(count => {
              console.log('Number of users in the database:', count);

              // List all users
              mongoose.connection.db.collection('users').find({}).toArray()
                .then(users => {
                  console.log('Users in the database:');
                  users.forEach(user => {
                    console.log(`- ${user.firstName} ${user.lastName} (${user.email})`);
                  });
                })
                .catch(err => console.error('Error listing users:', err));
            })
            .catch(err => console.error('Error counting users:', err));
        }
      })
      .catch(err => console.error('Error listing collections:', err));
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    console.error('MongoDB connection error details:', JSON.stringify(err, null, 2));
  });

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users')); // Keep for backward compatibility
app.use('/api/products', require('./routes/products'));
app.use('/api/merchants', require('./routes/merchants')); // Public merchant routes
app.use('/api/banners', require('./routes/banners'));
app.use('/api/upload', require('./routes/upload'));

// E-commerce core routes
app.use('/api/categories', require('./routes/categories'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/compare', require('./routes/compare'));
app.use('/api/deals', require('./routes/deals'));
app.use('/api/brands', require('./routes/brands'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/profile', require('./routes/profile'));
app.use('/api/content', require('./routes/content'));

// Role-specific routes
app.use('/api/customer', require('./routes/customer'));
app.use('/api/merchant', require('./routes/merchant'));
app.use('/api/admin', require('./routes/admin'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the E-commerce API!'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 4005;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

