# Frontend & Admin - API Integration Setup

## Overview

Both **Frontend** and **Admin** are now fully integrated with the backend API. They will automatically fetch real data from MongoDB once the backend is connected.

## Setup Instructions

### Step 1: Copy Environment Files

**Frontend:**
```bash
cd frontend
cp .env.example .env
```

**Admin:**
```bash
cd admin
cp .env.example .env
```

### Step 2: Configure API URL

Both `.env` files have:
```
VITE_API_URL=http://localhost:5000/api
```

**For Development** (local backend on port 5000): ✅ Keep as is

**For Production**: Change to your deployed API URL
```
VITE_API_URL=https://api.morfyx.com/api
```

### Step 3: Install & Run

**Frontend:**
```bash
npm install
npm run dev
```

**Admin:**
```bash
npm install
npm run dev
```

## API Services

### Frontend API Client (`frontend/src/lib/api.ts`)
Handles:
- Product browsing, search
- Order creation & tracking
- Wishlist management
- Reviews
- User authentication

### Admin API Client (`admin/src/lib/api.ts`)
Handles:
- Full product CRUD (Create, Read, Update, Delete)
- Category management
- Order management
- Inventory tracking
- Analytics
- Customer management

## What's Connected

### Frontend
✅ **Products** - Fetches from API, falls back to mock data  
✅ **Orders** - Synced with backend  
✅ **Wishlist** - Real-time sync  
✅ **Reviews** - Live comments  
✅ **Auth** - Login/Register  

### Admin
✅ **Products** - Full CRUD operations  
✅ **Categories** - Add/Edit/Delete  
✅ **Orders** - View & manage  
✅ **Inventory** - Track stock  
✅ **Analytics** - Dashboard stats  
✅ **Customers** - Customer database  

## Data Synchronization

Both frontend and admin connect to the **same backend API**, so:

1. **Admin creates product** → Backend saves to MongoDB
2. **Frontend fetches products** → Gets from same MongoDB
3. **Customer adds to cart** → Real data, real prices
4. **Admin updates inventory** → Frontend sees updated stock

**Result**: ✅ Single source of truth (MongoDB)

## Error Handling

If the backend is unavailable:
- **Frontend**: Falls back to mock data (still functional)
- **Admin**: Shows "No products" until connected
- Both will auto-retry when backend comes online

## Testing Real Data Flow

### 1. Start Backend
```bash
cd backend/server
npm run dev
```
(Runs on http://localhost:5000)

### 2. Start Admin
```bash
cd admin
npm run dev
```
(Runs on http://localhost:5173)

### 3. Create a Product (Admin)
- Navigate to Products
- Click "Add Product"
- Fill form and submit

### 4. Verify in Frontend
```bash
cd frontend
npm run dev
```
(Runs on http://localhost:3000)

- The product should appear in the shop
- Same data, no lag

## Environment Variables Reference

### Frontend `.env`
```
# API endpoint (required)
VITE_API_URL=http://localhost:5000/api
```

### Admin `.env`
```
# API endpoint (required)
VITE_API_URL=http://localhost:5000/api
```

## Common Issues

### Products not loading in frontend
- ✓ Check backend is running: `http://localhost:5000/health`
- ✓ Check frontend `.env` has correct `VITE_API_URL`
- ✓ Verify MongoDB connection in backend

### Admin can't create products
- ✓ Ensure you're logged in as admin
- ✓ Check JWT_SECRET is set in backend `.env`
- ✓ Verify Cloudinary credentials for image upload

### CORS errors
- ✓ Check `FRONTEND_URL` in backend `.env`
- ✓ Must include http/https and port
- ✓ Example: `http://localhost:5173,http://localhost:3000`

## Production Deployment

### Frontend Production Build
```bash
npm run build
npm run preview  # Test production build locally
```

Deploy `dist/` folder to:
- Vercel, Netlify, AWS S3, Cloudflare Pages, etc.

### Admin Production Build
```bash
npm run build
npm run preview
```

Deploy `dist/` folder similarly.

### Update API URLs
Set environment variables in deployment platform:
```
VITE_API_URL=https://api.morfyx.com/api
```

## API Documentation

Detailed API endpoints: See [API_REFERENCE.md](../backend/API_REFERENCE.md) in backend folder.

## Architecture Diagram

```
┌─────────────────────────────────────────────┐
│           Frontend (React)                   │
│    http://localhost:3000                     │
│  ├── Products (browse & search)              │
│  ├── Orders (track & manage)                 │
│  ├── Wishlist (save items)                   │
│  └── Reviews (read & write)                  │
└────────────┬────────────────────────────────┘
             │ HTTP/CORS
             ↓
┌─────────────────────────────────────────────┐
│         Backend API (Express)                │
│    http://localhost:5000/api                 │
│  ├── /products (CRUD)                        │
│  ├── /orders (Create & Read)                 │
│  ├── /categories (CRUD)                      │
│  ├── /auth (Login/Register)                  │
│  └── /payments (Razorpay)                    │
└────────────┬────────────────────────────────┘
             │ Mongoose Driver
             ↓
┌─────────────────────────────────────────────┐
│        MongoDB Atlas (Cloud)                 │
│  ├── products collection                     │
│  ├── orders collection                       │
│  ├── categories collection                   │
│  └── users collection                        │
└─────────────────────────────────────────────┘

┌─────────────────────────────────────────────┐
│            Admin (React)                     │
│    http://localhost:5173                     │
│  ├── Products (full CRUD)                    │
│  ├── Orders (manage)                         │
│  ├── Inventory (track)                       │
│  ├── Analytics (dashboard)                   │
│  └── Categories (manage)                     │
└────────────┬────────────────────────────────┘
             │ HTTP/CORS (same as Frontend)
             ↓
        (Backend API above)
```

## Success Indicators

✅ Admin can create products  
✅ Frontend displays those products  
✅ Both show same prices/stock  
✅ Orders sync between both  
✅ Real-time updates (within seconds)  

Once MongoDB connects, everything is **production-ready**!
