# API Testing Guide - cURL Commands

> Use these commands to test your partial payment and Shiprocket integration in the terminal.

---

## Prerequisites

```bash
# Backend running on port 5000
curl http://localhost:5000/api/health

# MongoDB connection working
# Razorpay test credentials set
# JWT token for testing (from login endpoint)
```

---

## 1. Create Razorpay Order (Frontend/Postman)

### Request
```bash
POST http://localhost:5000/api/payments/razorpay/create-order
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011",
  "amount": 2000
}
```

### Response
```json
{
  "success": true,
  "data": {
    "razorpayOrderId": "order_XXXXX",
    "amount": 600,
    "currency": "INR"
  }
}
```

**Note**: Amount returned should be 30% of original (₹600 for ₹2000 order).

---

## 2. Verify Payment (Full Flow)

### Request
```bash
POST http://localhost:5000/api/payments/razorpay/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "signature_XXXXX",
  "orderId": "507f1f77bcf86cd799439011"
}
```

### Expected Response
```json
{
  "success": true,
  "message": "Payment verified and shipment created",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "totalAmount": 2000,
      "advanceAmount": 600,
      "remainingCOD": 1400,
      "orderStatus": "processing",
      "paymentInfo": {
        "status": "paid",
        "advancePaid": true
      },
      "shipmentStatus": "pending",
      "shiprocketOrderId": "SR12345",
      "shipmentId": "SHIP12345",
      "trackingId": "RK001234567"
    },
    "shipment": {
      "shipmentId": "SHIP12345",
      "trackingId": "RK001234567",
      "courierPartnerName": "Shiprocket Assured"
    }
  }
}
```

### What to Verify
- ✓ advanceAmount = 600 (30% of 2000)
- ✓ remainingCOD = 1400 (70% of 2000)
- ✓ paymentInfo.advancePaid = true
- ✓ shipmentStatus = "pending"
- ✓ trackingId is assigned

---

## 3. Test Payment Verification (With Test Data)

### Create Test Order First
```bash
POST http://localhost:5000/api/orders
Content-Type: application/json
Authorization: Bearer YOUR_JWT_TOKEN

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439001",
      "quantity": 1,
      "price": 2000
    }
  ],
  "totalAmount": 2000,
  "shippingAddress": "123 Main St, City, 110001"
}
```

### Create Test Razorpay Order
```bash
POST http://localhost:5000/api/payments/razorpay/create-order
Content-Type: application/json

{
  "orderId": "RETURNED_ORDER_ID",
  "amount": 2000
}
```

### Verify with Test Signature
```bash
POST http://localhost:5000/api/payments/razorpay/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "valid_signature_here",
  "orderId": "RETURNED_ORDER_ID"
}
```

---

## 4. Track Shipment

### Request
```bash
GET http://localhost:5000/api/shipping/track/SHIP12345
```

### Response
```json
{
  "success": true,
  "message": "Shipment tracking retrieved",
  "data": {
    "tracking": {
      "status": "shipped",
      "trackingNumber": "RK001234567",
      "courierPartner": "Shiprocket Assured",
      "lastUpdate": "2024-05-19T14:30:00Z"
    }
  }
}
```

### Possible Statuses
```
pending   - Order created, awaiting pickup
picked    - Picked by courier
shipped   - In transit
delivered - Delivered
cancelled - Cancelled
```

---

## 5. Cancel Shipment

### Request (User Initiated)
```bash
POST http://localhost:5000/api/shipping/cancel/SHIP12345
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

### Response (Success - Before Pickup)
```json
{
  "success": true,
  "message": "Your order has been cancelled successfully. Please note that the 30% advance payment (₹600) is non-refundable due to shipping and operational charges. For further assistance, contact us on WhatsApp: +919876543210",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "orderStatus": "cancelled",
      "shipmentStatus": "cancelled",
      "refundStatus": "none",
      "cancellationReason": "Customer requested cancellation",
      "cancellationDate": "2024-05-19T10:30:00Z"
    }
  }
}
```

### Response (Failed - Already Shipped)
```json
{
  "success": false,
  "message": "Order cancellation is no longer available because the shipment has already been processed/shipped. For support, contact us on WhatsApp.",
  "statusCode": 400
}
```

---

## 6. Get Shipment Details

### Request
```bash
GET http://localhost:5000/api/shipping/SHIP12345
Authorization: Bearer YOUR_JWT_TOKEN
```

### Response
```json
{
  "success": true,
  "message": "Shipment details retrieved",
  "data": {
    "shipment": {
      "shipment_id": "SHIP12345",
      "order_id": "SR12345",
      "shipment_status": "pending",
      "tracking_number": "RK001234567",
      "courier_name": "Shiprocket Assured",
      "payment_method": "COD",
      "cod_amount": 1400,
      "customer_name": "John Doe",
      "delivery_address": "123 Main Street, New York, NY 110001",
      "created_at": "2024-05-19T10:00:00Z"
    }
  }
}
```

### Key Fields to Verify
- ✓ payment_method = "COD"
- ✓ cod_amount = 1400 (70% only)
- ✓ shipment_status tracking

---

## 7. Manual Shipment Creation (Admin Only)

### Request
```bash
POST http://localhost:5000/api/shipping/create
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "orderId": "507f1f77bcf86cd799439011"
}
```

### Response
```json
{
  "success": true,
  "message": "Shipment created successfully",
  "data": {
    "shipment": {
      "shipmentId": "SHIP12345",
      "trackingId": "RK001234567",
      "courierPartner": "Shiprocket Assured"
    },
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "shipmentStatus": "pending",
      "orderStatus": "processing"
    }
  }
}
```

---

## 8. Fetch All Orders (Admin)

### Request
```bash
GET http://localhost:5000/api/orders?page=1&limit=20&status=all
Authorization: Bearer ADMIN_JWT_TOKEN
```

### Response
```json
{
  "success": true,
  "message": "Orders fetched",
  "data": {
    "items": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "customer": "John Doe",
        "customerEmail": "john@example.com",
        "orderStatus": "processing",
        "paymentStatus": "paid",
        "total": 2000,
        "advanceAmount": 600,
        "remainingCOD": 1400,
        "shipmentStatus": "pending",
        "trackingId": "RK001234567",
        "itemCount": 1,
        "createdAt": "2024-05-19T10:00:00Z"
      }
    ],
    "pagination": {
      "total": 10,
      "page": 1,
      "pages": 1,
      "limit": 20
    }
  }
}
```

### Verify Fields
- ✓ advanceAmount = 600
- ✓ remainingCOD = 1400
- ✓ trackingId populated
- ✓ shipmentStatus set

---

## 9. Update Order Status (Admin)

### Request
```bash
PUT http://localhost:5000/api/orders/507f1f77bcf86cd799439011/status
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}
```

### Response
```json
{
  "success": true,
  "message": "Order status updated successfully",
  "data": {
    "order": {
      "_id": "507f1f77bcf86cd799439011",
      "orderStatus": "shipped",
      "updatedAt": "2024-05-19T14:00:00Z"
    }
  }
}
```

---

## Complete Test Flow

### Step 1: Create Order
```bash
POST http://localhost:5000/api/orders
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json

{
  "items": [
    {
      "productId": "507f1f77bcf86cd799439001",
      "quantity": 1,
      "price": 2000
    }
  ],
  "totalAmount": 2000,
  "shippingAddress": "123 Main St, New York, NY 110001"
}

# Save the returned orderId
```

### Step 2: Create Razorpay Order
```bash
POST http://localhost:5000/api/payments/razorpay/create-order
Content-Type: application/json

{
  "orderId": "SAVED_ORDER_ID",
  "amount": 2000
}

# Save razorpayOrderId, verify amount is 600 (30%)
```

### Step 3: Verify Payment
```bash
POST http://localhost:5000/api/payments/razorpay/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "signature_XXXXX",
  "orderId": "SAVED_ORDER_ID"
}

# Verify shipment created automatically
# Save shipmentId and trackingId
```

### Step 4: Track Shipment
```bash
GET http://localhost:5000/api/shipping/track/SAVED_SHIPMENT_ID

# Verify status and tracking number
```

### Step 5: Admin Views Order
```bash
GET http://localhost:5000/api/orders?status=all
Authorization: Bearer ADMIN_JWT_TOKEN

# Verify order shows with:
# - advanceAmount: 600
# - remainingCOD: 1400
# - trackingId: RK001234567
# - orderStatus: processing
# - shipmentStatus: pending
```

### Step 6: Admin Updates Status
```bash
PUT http://localhost:5000/api/orders/SAVED_ORDER_ID/status
Authorization: Bearer ADMIN_JWT_TOKEN
Content-Type: application/json

{
  "status": "shipped"
}

# Verify order status changes
```

### Step 7: Cancel Shipment (Optional)
```bash
POST http://localhost:5000/api/shipping/cancel/SAVED_SHIPMENT_ID
Authorization: Bearer YOUR_JWT_TOKEN

# Verify non-refundable message
# Verify refundStatus: "none"
# Verify order status: "cancelled"
```

---

## Environment Variables Verification

### Check Your .env File
```bash
echo "Shiprocket Email: $SHIPROCKET_EMAIL"
echo "Shiprocket Channel: $SHIPROCKET_CHANNEL_ID"
echo "Advance Percent: $ADVANCE_PAYMENT_PERCENT"
echo "WhatsApp Support: $WHATSAPP_SUPPORT_NUMBER"
```

### Verify in Code
```typescript
// backend/server/src/config/env.ts
console.log("Shiprocket Email:", env.shiprocketEmail);
console.log("Channel ID:", env.shiprocketChannelId);
console.log("Advance %:", env.advancePaymentPercent);
```

---

## Error Testing

### Test Missing OrderId
```bash
POST http://localhost:5000/api/payments/razorpay/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "signature_XXXXX"
}

# Expected: 400 "Order ID required"
```

### Test Invalid Signature
```bash
POST http://localhost:5000/api/payments/razorpay/verify
Content-Type: application/json

{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "invalid_signature",
  "orderId": "SAVED_ORDER_ID"
}

# Expected: 400 "Invalid payment signature"
```

### Test Cancellation After Pickup
```bash
# Manually update order in MongoDB:
db.orders.updateOne(
  { _id: ObjectId("SAVED_ORDER_ID") },
  { $set: { shipmentStatus: "picked" } }
)

# Then try to cancel:
POST http://localhost:5000/api/shipping/cancel/SAVED_SHIPMENT_ID
Authorization: Bearer YOUR_JWT_TOKEN

# Expected: 400 "shipment has already been processed/shipped"
```

---

## Debugging Tips

### Enable Logging
```bash
# Add to backend .env
DEBUG=morfyx:*

# Run server
npm run dev
```

### Check MongoDB
```javascript
// View order fields in MongoDB
db.orders.findOne({ _id: ObjectId("SAVED_ORDER_ID") })

// Expected output includes:
// - advanceAmount: 600
// - remainingCOD: 1400
// - shipmentStatus: "pending"
// - shiprocketOrderId: "SR12345"
// - trackingId: "RK001234567"
```

### Check Logs
```bash
# Backend logs
tail -f backend/server/logs/app.log

# Check for:
# - Payment verification success
# - Shiprocket shipment creation
# - Email sending
# - Error messages
```

---

## Success Checklist

After running all tests above:

- [ ] Step 1: Order created successfully
- [ ] Step 2: Razorpay order shows 600 (30% only)
- [ ] Step 3: Shipment created automatically with COD 1400
- [ ] Step 4: Tracking works, status is "pending"
- [ ] Step 5: Admin sees order with payment breakdown
- [ ] Step 6: Admin can update order status
- [ ] Step 7: Cancellation shows non-refundable message
- [ ] Error tests all return correct error messages
- [ ] No errors in backend logs
- [ ] Email confirmations sent

---

## Postman Collection

Save as `Morfyx_Partial_Payment.postman_collection.json`:

```json
{
  "info": {
    "name": "Morfyx Partial Payment",
    "version": "1.0.0"
  },
  "item": [
    {
      "name": "Create Order",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/orders",
        "header": [
          { "key": "Authorization", "value": "Bearer {{jwt_token}}" },
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"items\": [{\"productId\": \"507f1f77bcf86cd799439001\", \"quantity\": 1, \"price\": 2000}], \"totalAmount\": 2000, \"shippingAddress\": \"123 Main St\"}"
        }
      }
    },
    {
      "name": "Create Razorpay Order",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/payments/razorpay/create-order",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"orderId\": \"{{order_id}}\", \"amount\": 2000}"
        }
      }
    },
    {
      "name": "Verify Payment",
      "request": {
        "method": "POST",
        "url": "http://localhost:5000/api/payments/razorpay/verify",
        "header": [
          { "key": "Content-Type", "value": "application/json" }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\"razorpayOrderId\": \"{{razorpay_order_id}}\", \"razorpayPaymentId\": \"{{payment_id}}\", \"razorpaySignature\": \"{{signature}}\", \"orderId\": \"{{order_id}}\"}"
        }
      }
    }
  ]
}
```

---

## Quick Reference

| Endpoint | Method | Auth | Purpose |
|----------|--------|------|---------|
| /api/payments/razorpay/create-order | POST | No | Create 30% advance order |
| /api/payments/razorpay/verify | POST | No | Verify + create shipment |
| /api/shipping/track/{id} | GET | No | Track shipment |
| /api/shipping/cancel/{id} | POST | Yes | Cancel with non-refund |
| /api/shipping/{id} | GET | Yes | Get details |
| /api/shipping/create | POST | Admin | Manual shipment creation |
| /api/orders | GET | Admin | Fetch all orders |
| /api/orders/{id}/status | PUT | Admin | Update order status |

---

**Test Status**: Ready
**Last Updated**: 2024-05-19
