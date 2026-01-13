# E-Commerce Platform (Flipkart Clone)

A complete production-ready e-commerce platform built with React, Node.js, Express, and MongoDB.

## Tech Stack

**Frontend:**
- React 18 (JSX, functional components)
- React Router v6
- Redux Toolkit
- Tailwind CSS
- Axios

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- Bcrypt password hashing

## Setup Instructions

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Update .env with your MongoDB URI and JWT secret
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Environment Variables

Create `.env` in backend folder:
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

## Features

- User Authentication (JWT)
- Product Management
- Shopping Cart
- Wishlist
- Order Management
- Admin Dashboard
- Search & Filters
- Responsive Design

## API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/products` - Get all products
- `POST /api/cart` - Add to cart
- `POST /api/orders` - Create order
- And many more...

## Default Admin Credentials
- Email: admin@ecommerce.com
- Password: admin123