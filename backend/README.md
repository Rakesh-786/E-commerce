# E-Commerce Backend API

A comprehensive Node.js backend for an e-commerce platform with MongoDB, featuring merchant product management, admin banner uploads, and image handling.

## Features

- **User Management**: Customer, Merchant, and Admin roles
- **Product Management**: CRUD operations with multiple images per product
- **Merchant System**: Business verification and product ownership
- **Image Upload**: Multiple product images with automatic processing
- **Banner Management**: Admin-controlled banners with targeting
- **Authentication**: JWT-based authentication with role-based access
- **File Processing**: Automatic image resizing and optimization

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Installation

1. **Clone and navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` file with your configuration:
   - MongoDB connection string
   - JWT secret
   - Admin credentials
   - File upload settings

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Initialize admin user**
   ```bash
   npm run init-admin
   ```

6. **Start the server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh JWT token

### Products
- `GET /api/products` - Get all products (with filtering)
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Merchant/Admin)
- `PUT /api/products/:id` - Update product (Owner/Admin)
- `DELETE /api/products/:id` - Delete product (Owner/Admin)

### File Upload
- `POST /api/upload/product/:id/images` - Upload product images
- `PUT /api/upload/product/:id/images/:index/primary` - Set primary image
- `DELETE /api/upload/product/:id/images/:index` - Delete product image
- `POST /api/upload/banner` - Upload banner (Admin)
- `POST /api/upload/avatar` - Upload user avatar

### Merchants
- `GET /api/merchants` - Get all verified merchants
- `GET /api/merchants/:id` - Get merchant details
- `GET /api/merchants/:id/products` - Get merchant products
- `GET /api/merchants/dashboard/stats` - Merchant dashboard stats
- `GET /api/merchants/my-products` - Current merchant's products

### Banners (Admin)
- `GET /api/banners` - Get banners
- `POST /api/banners` - Create banner
- `PUT /api/banners/:id` - Update banner
- `DELETE /api/banners/:id` - Delete banner
- `POST /api/banners/:id/click` - Track banner click
- `POST /api/banners/:id/impression` - Track banner impression

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/merchant-info` - Update merchant info
- `GET /api/users` - Get all users (Admin)
- `PUT /api/users/:id/status` - Update user status (Admin)
- `PUT /api/users/:id/verify-merchant` - Verify merchant (Admin)

## File Structure

```
backend/
├── models/           # MongoDB models
│   ├── User.js
│   ├── Product.js
│   └── Banner.js
├── routes/           # API routes
│   ├── auth.js
│   ├── products.js
│   ├── merchants.js
│   ├── banners.js
│   ├── users.js
│   └── upload.js
├── middleware/       # Custom middleware
│   ├── auth.js
│   └── upload.js
├── scripts/          # Utility scripts
│   └── init-admin.js
├── uploads/          # File storage (created automatically)
│   ├── products/
│   ├── banners/
│   └── avatars/
├── server.js         # Main server file
├── package.json
└── .env
```

## Environment Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/ecommerce

# Client Configuration
CLIENT_URL=http://localhost:4200

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# File Upload Configuration
MAX_FILE_SIZE=5242880
ALLOWED_FILE_TYPES=image/jpeg,image/jpg,image/png,image/webp

# Admin Configuration
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## Usage Examples

### Register a Merchant
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "email": "merchant@example.com",
    "password": "password123",
    "role": "merchant",
    "businessName": "John's Electronics"
  }'
```

### Upload Product Images
```bash
curl -X POST http://localhost:3000/api/upload/product/PRODUCT_ID/images \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "images=@image1.jpg" \
  -F "images=@image2.jpg"
```

### Create a Banner (Admin)
```bash
curl -X POST http://localhost:3000/api/banners \
  -H "Authorization: Bearer ADMIN_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Summer Sale",
    "description": "Up to 50% off on electronics",
    "image": {"url": "/uploads/banners/banner.jpg"},
    "position": "hero",
    "link": {"url": "/products?category=Electronics", "text": "Shop Now"}
  }'
```

## Default Admin Account

After running `npm run init-admin`, you can login with:
- **Email**: admin@example.com (or value from ADMIN_EMAIL)
- **Password**: admin123 (or value from ADMIN_PASSWORD)

## Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- Rate limiting
- CORS protection
- Helmet security headers
- File type validation
- File size limits

## Development

1. **Install nodemon for development**
   ```bash
   npm install -g nodemon
   ```

2. **Run in development mode**
   ```bash
   npm run dev
   ```

3. **Test API endpoints**
   Use tools like Postman or curl to test the API endpoints

## Production Deployment

1. Set `NODE_ENV=production` in environment variables
2. Use a process manager like PM2
3. Set up proper MongoDB instance
4. Configure reverse proxy (nginx)
5. Set up SSL certificates
6. Configure file storage (consider cloud storage for production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request
