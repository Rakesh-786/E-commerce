# E-Commerce Platform

A full-stack e-commerce platform built with Angular frontend and Node.js backend, featuring merchant product management with image uploads and admin banner management.

## Features

### 🛍️ Core E-Commerce Features
- Product catalog with categories and search
- Shopping cart functionality
- User authentication (Customer, Merchant, Admin roles)
- Product reviews and ratings

### 🏪 Merchant Features
- Merchant registration and verification
- Product management (CRUD operations)
- Multiple product image uploads with automatic processing
- Inventory management
- Sales dashboard and analytics

### 👑 Admin Features
- User management and merchant verification
- Banner management with targeting options
- Product moderation
- System analytics

### 📱 Technical Features
- Responsive design
- Image optimization and processing
- JWT authentication with refresh tokens
- Role-based access control
- File upload with validation
- Real-time updates

## Tech Stack

### Frontend (Angular)
- **Framework**: Angular 19
- **Styling**: SCSS with custom design system
- **HTTP Client**: Angular HttpClient with interceptors
- **State Management**: RxJS with services
- **Authentication**: JWT with automatic token refresh

### Backend (Node.js)
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer with Sharp for image processing
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## Project Structure

```
E_Com_Web/
├── client/                 # Angular frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/       # Core services and guards
│   │   │   ├── shared/     # Shared components and models
│   │   │   ├── features/   # Feature modules
│   │   │   └── layout/     # Layout components
│   │   ├── assets/         # Static assets
│   │   └── environments/   # Environment configurations
│   ├── public/             # Public assets
│   └── package.json
├── backend/                # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── scripts/            # Utility scripts
│   ├── uploads/            # File storage
│   └── package.json
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
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
   Edit `.env` with your configuration

4. **Start MongoDB**
   Make sure MongoDB is running on your system

5. **Initialize admin user**
   ```bash
   npm run init-admin
   ```

6. **Start backend server**
   ```bash
   npm run dev
   ```
   Backend will run on http://localhost:3000

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm start
   ```
   Frontend will run on http://localhost:4200

## Usage

### Default Admin Account
- **Email**: admin@example.com
- **Password**: admin123

### User Roles

#### Customer
- Browse and search products
- Add products to cart
- Place orders
- Leave reviews

#### Merchant
- Register business
- Manage product catalog
- Upload product images
- View sales analytics
- Manage inventory

#### Admin
- Manage all users
- Verify merchants
- Upload and manage banners
- System administration

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - Get products with filtering
- `POST /api/products` - Create product (Merchant/Admin)
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Upload Endpoints
- `POST /api/upload/product/:id/images` - Upload product images
- `POST /api/upload/banner` - Upload banner (Admin)
- `POST /api/upload/avatar` - Upload user avatar

### Banner Endpoints
- `GET /api/banners` - Get banners
- `POST /api/banners` - Create banner (Admin)
- `PUT /api/banners/:id` - Update banner (Admin)

## Key Features Implementation

### Product Image Management
- Multiple images per product
- Automatic image resizing and optimization
- Primary image selection
- Drag-and-drop upload interface

### Merchant System
- Business verification process
- Product ownership validation
- Merchant dashboard with analytics
- Inventory tracking

### Admin Banner System
- Position-based banner placement
- Target audience selection
- Click and impression tracking
- Scheduled banner campaigns

### Security Features
- JWT authentication with refresh tokens
- Role-based access control
- File upload validation
- Rate limiting
- CORS protection

## Development

### Running in Development Mode

1. **Start backend**
   ```bash
   cd backend && npm run dev
   ```

2. **Start frontend**
   ```bash
   cd client && npm start
   ```

### Building for Production

1. **Build frontend**
   ```bash
   cd client && npm run build
   ```

2. **Start backend in production**
   ```bash
   cd backend && npm start
   ```

## Environment Variables

### Backend (.env)
```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your-secret-key
CLIENT_URL=http://localhost:4200
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

### Frontend (environment.ts)
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api'
};
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.
