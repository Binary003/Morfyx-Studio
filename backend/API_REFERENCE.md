# API Documentation

Base URL: `https://api.morfyx.com` (production) or `http://localhost:5000` (dev)

## Authentication

### Register User
```
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "phone": "+91-9876543210"
}

Response: 201 Created
{
  "success": true,
  "message": "Registered successfully",
  "data": {
    "user": {
      "id": "...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### Login
```
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: 200 OK (sets httpOnly access_token & refresh_token cookies)
```

### Refresh Token
```
POST /api/auth/refresh
(no body required - uses refresh_token cookie)

Response: 200 OK (sets new access_token cookie)
```

### Logout
```
POST /api/auth/logout
Authorization: Bearer <access_token>

Response: 200 OK
```

### Admin Login
```
POST /api/auth/admin/login
{
  "email": "admin@example.com",
  "password": "AdminPass123"
}
```

## Products

### List Products
```
GET /api/products?page=1&limit=20&category=naruto&sort=-price
- page: page number (default 1)
- limit: items per page (default 20)
- category: filter by category slug
- sort: sort by field (prefix - for descending)

Response: 200 OK
{
  "success": true,
  "data": {
    "products": [...],
    "total": 100,
    "page": 1,
    "pages": 5
  }
}
```

### Search Products
```
GET /api/products/search?q=naruto&limit=10

Response: 200 OK
```

### Get Single Product
```
GET /api/products/:id

Response: 200 OK
{
  "success": true,
  "data": {
    "product": {
      "id": "...",
      "name": "Naruto Figure",
      "price": 1299,
      "description": "...",
      "images": ["url1", "url2"],
      "category": "naruto",
      "stock": 50,
      "rating": 4.5,
      "reviews": 25
    }
  }
}
```

### Create Product (Admin only)
```
POST /api/products
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

{
  "name": "New Figure",
  "price": 1299,
  "description": "...",
  "category": "naruto",
  "stock": 50,
  "images": [file1, file2, ...]
}

Response: 201 Created
```

### Update Product (Admin only)
```
PUT /api/products/:id
Authorization: Bearer <access_token>
```

### Delete Product (Admin only)
```
DELETE /api/products/:id
Authorization: Bearer <access_token>

Response: 200 OK
```

## Categories

### List Categories
```
GET /api/categories

Response: 200 OK
{
  "success": true,
  "data": {
    "categories": [
      { "id": "...", "name": "Naruto", "slug": "naruto" },
      ...
    ]
  }
}
```

### Create Category (Admin only)
```
POST /api/categories
Authorization: Bearer <access_token>

{
  "name": "New Anime"
}
```

## Orders

### Create Order
```
POST /api/orders
Authorization: Bearer <access_token>

{
  "items": [
    { "productId": "...", "quantity": 2, "price": 1299 }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "Mumbai",
    "state": "MH",
    "zip": "400001",
    "country": "India"
  },
  "paymentMethod": "razorpay"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "order": {
      "id": "...",
      "status": "pending",
      "total": 2598,
      "items": [...]
    }
  }
}
```

### Get Orders
```
GET /api/orders?page=1&limit=10&status=pending
Authorization: Bearer <access_token>

Response: 200 OK
```

### Get Order by ID
```
GET /api/orders/:id
Authorization: Bearer <access_token>
```

## Payments

### Create Razorpay Order
```
POST /api/payments/razorpay/order
Authorization: Bearer <access_token>

{
  "orderId": "...",
  "amount": 2598
}

Response: 200 OK
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_...",
    "amount": 259800,
    "currency": "INR"
  }
}
```

### Verify Payment
```
POST /api/payments/razorpay/verify
Authorization: Bearer <access_token>

{
  "razorpayPaymentId": "pay_...",
  "razorpayOrderId": "order_...",
  "razorpaySignature": "signature..."
}

Response: 200 OK
{
  "success": true,
  "message": "Payment verified"
}
```

## Reviews

### Get Product Reviews
```
GET /api/reviews?productId=...&page=1&limit=10

Response: 200 OK
```

### Create Review
```
POST /api/reviews
Authorization: Bearer <access_token>

{
  "productId": "...",
  "rating": 5,
  "comment": "Amazing figure!"
}

Response: 201 Created
```

## Wishlist

### Get Wishlist
```
GET /api/wishlist
Authorization: Bearer <access_token>

Response: 200 OK
```

### Add to Wishlist
```
POST /api/wishlist
Authorization: Bearer <access_token>

{ "productId": "..." }
```

### Remove from Wishlist
```
DELETE /api/wishlist/:productId
Authorization: Bearer <access_token>
```

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "message": "Error description"
}
```

### Common Status Codes
- 200 OK - Success
- 201 Created - Resource created
- 400 Bad Request - Invalid input
- 401 Unauthorized - Missing/invalid token
- 403 Forbidden - Insufficient permissions
- 404 Not Found - Resource not found
- 429 Too Many Requests - Rate limited
- 500 Internal Server Error - Server error

## Rate Limiting
- **Limit**: 300 requests per 15 minutes
- **Header**: `RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`

## CORS
- Allowed origins: Configured via `FRONTEND_URL` env var
- Allowed credentials: true
- Allowed headers: All

## Notes
- All timestamps in ISO 8601 format (UTC)
- All amounts in INR (Indian Rupees)
- IDs are MongoDB ObjectIds
- Pagination default: page=1, limit=20
