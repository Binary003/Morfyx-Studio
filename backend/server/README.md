# Morfyx Studio Backend API

Production-ready Node.js + Express + TypeScript backend for Morfyx Studio Anime 3D Collectibles e-commerce platform.

## Quick Start

### Development
```bash
npm install
npm run dev
```

### Production Build
```bash
npm install --production
npm run build
npm start
```

## Environment Setup

### Development (.env)
```bash
cp .env.example .env
# Fill in your development credentials
```

### Production (.env)
All variables are **required** in production:

- `NODE_ENV=production`
- `PORT=5000` (or your deployment port)
- `MONGODB_URI` - MongoDB Atlas connection string
- `JWT_SECRET` - Strong random string (min 32 chars)
- `JWT_REFRESH_SECRET` - Strong random string (min 32 chars)
- `FRONTEND_URL` - Production frontend URL (comma-separated for multiple)
- `CLOUDINARY_*` - Cloudinary API credentials
- `RAZORPAY_*` - Razorpay payment credentials
- `SHIPMOZO_API_KEY` - Shipment API key
- `EMAIL_API_KEY` - Resend API key
- `EMAIL_FROM` - Verified sender address for transactional mail
- `COOKIE_DOMAIN` - Production domain for cookies

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token

### Products
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product by ID
- `POST /api/products` - Create product (admin)
- `PUT /api/products/:id` - Update product (admin)
- `DELETE /api/products/:id` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories
- `POST /api/categories` - Create category (admin)

### Orders
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order details

### Payments
- `POST /api/payments/razorpay/order` - Create payment order
- `POST /api/payments/razorpay/verify` - Verify payment

## Features

✓ Express.js with TypeScript  
✓ MongoDB + Mongoose  
✓ JWT authentication with refresh tokens  
✓ Role-based access control (RBAC)  
✓ Rate limiting  
✓ CORS enabled  
✓ Security headers (Helmet)  
✓ Error handling middleware  
✓ Async handler wrapper  
✓ Payment integration (Razorpay)  
✓ Email notifications (Nodemailer)  
✓ File uploads (Multer + Cloudinary)  
✓ Graceful shutdown handling  

## Security

- All environment variables are validated at startup
- JWT tokens with 15m access, 7d refresh expiry
- Secure HTTP-only cookies in production
- CORS configured per deployment
- Rate limiting on all endpoints
- Helmet.js security headers
- Input validation on all routes
- Error details hidden in production

## Database

MongoDB with auto-indexing in development (disabled in production for performance).

### Models
- User
- Product
- Category
- Order
- Payment
- Review
- Inventory
- Notification

## Deployment

### On Heroku/Railway/Render
1. Set all production environment variables
2. Ensure MongoDB URI is accessible from deployment platform
3. Build: `npm run build`
4. Start: `npm start`

### Health Check
```bash
curl http://localhost:5000/health
```

Expected response:
```json
{
  "success": true,
  "message": "API healthy"
}
```

## Logging

- **Development**: Verbose logging (Morgan dev format)
- **Production**: Combined logging with timestamps
- All errors logged with context

## Notes

- Cookie domain should match your frontend domain in production
- FRONTEND_URL must be exact - includes protocol and port if needed
- All payment and email credentials must be valid for those services to work
- Email delivery uses Resend in production

