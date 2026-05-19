# Partial Payment + Shiprocket Integration Guide

## Overview

This e-commerce platform now supports a **30% advance payment via Razorpay + 70% COD (Cash on Delivery)** model integrated with **Shiprocket** for shipment management.

### Key Features

✅ **Partial Payment System**
- Customers pay 30% online (non-refundable)
- Remaining 70% collected as COD
- Advance payment is strictly non-refundable

✅ **Shiprocket Integration**
- Automatic shipment creation after payment
- Real-time tracking
- COD amount management
- Shipment cancellation (before pickup)

✅ **Admin Dashboard**
- View payment breakdown (Advance + COD)
- Shipment status tracking
- Order status management
- Customer information

---

## Backend Setup

### 1. Environment Configuration

Add these variables to `backend/server/.env`:

```env
# Shiprocket Configuration
SHIPROCKET_EMAIL=your_email@shiprocket.in
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_API_KEY=your_api_key
SHIPROCKET_CHANNEL_ID=17107
SHIPROCKET_PICKUP_ID=270249

# Payment Configuration
ADVANCE_PAYMENT_PERCENT=30  # Can be customized

# Support Configuration
WHATSAPP_SUPPORT_NUMBER=+919876543210
```

### 2. Database Fields

The Order schema now includes:

```typescript
advanceAmount        // 30% of total (automatically calculated)
remainingCOD         // 70% of total (automatically calculated)
paymentInfo: {
  advancePaid: boolean  // Track if 30% is paid
  // ... existing fields
}
shipmentStatus       // not_created | pending | picked | shipped | delivered | cancelled
shiprocketOrderId    // Shiprocket order reference
shipmentId          // Shiprocket shipment ID
trackingId          // Shiprocket tracking number
cancellationReason  // Reason if cancelled
cancellationDate    // Timestamp of cancellation
refundStatus        // none (default for non-refundable advance)
```

### 3. API Endpoints

**Payment Verification** (Existing - Modified)
```
POST /api/payments/razorpay/verify
Body: {
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  orderId
}
```
**Response:**
- Calculates 30% advance and 70% COD automatically
- Creates Shiprocket shipment with COD amount
- Returns order with shipment details

**Shipping Endpoints** (New)
```
GET /api/shipping/track/:shipmentId
- Track shipment in real-time

POST /api/shipping/cancel/:shipmentId
- Cancel shipment (only if not picked up)
- Non-refundable advance policy applies

GET /api/shipping/:shipmentId
- Get detailed shipment information

POST /api/shipping/create (Admin Only)
- Manual shipment creation if automatic fails
```

---

## Frontend Implementation

### 1. Checkout Flow

**Step 1: Display Payment Breakdown**
```typescript
// Before payment gateway opens, show:
const advanceAmount = Math.round(totalAmount * 0.30);  // 30%
const codAmount = totalAmount - advanceAmount;        // 70%

// Display:
// Total: ₹2000
// Pay Now (30%): ₹600
// COD (70%): ₹1400
```

**Step 2: Razorpay Integration**
```typescript
// Only amount should be 30% of total (in paise)
const razorpayAmount = Math.round(advanceAmount * 100);

const options = {
  key: VITE_RAZORPAY_KEY,
  amount: razorpayAmount,     // 30% in paise
  currency: "INR",
  // ... other options
};
```

**Step 3: Payment Verification**
```typescript
await api.verifyPayment({
  razorpayPaymentId,
  razorpayOrderId,
  razorpaySignature,
  orderId
});
```

### 2. Order Cancellation

**Customer Initiates Cancellation**
```typescript
await api.cancelShipment(shipmentId);
```

**Response Messages:**

If cancellation succeeds:
```
"Your order has been cancelled successfully. Please note that the 
30% advance payment (₹600) is non-refundable due to shipping and 
operational charges. For further assistance, contact us on 
WhatsApp: +919876543210"
```

If already shipped:
```
"Order cancellation is no longer available because the shipment 
has already been processed/shipped. For support, contact us on 
WhatsApp."
```

---

## Admin Dashboard Updates

### Orders Page

The admin orders page now displays:

| Column | Information |
|--------|-------------|
| Order ID | 8-digit order ID |
| Customer | Name + Email |
| Date | Order creation date |
| Payment Breakdown | Total + Advance (green) + COD (blue) + Payment Status |
| Shipment | Tracking ID + Shipment Status |
| Status | Order status + Dropdown to update |

### Key Displays

**Payment Breakdown Example:**
```
₹2000 Total
Advance: ₹600 (green badge)
COD: ₹1400 (blue badge)
Status: Paid (green badge)
```

**Shipment Status:**
```
Tracking: RK001234567
Status: pending | picked | shipped | delivered | cancelled
```

---

## Business Logic

### Payment Flow

1. **Order Created**
   - Order status: `pending`
   - advanceAmount = 30% of total
   - remainingCOD = 70% of total

2. **Razorpay Payment**
   - Customer pays only 30% (advanceAmount)
   - Payment verified by backend

3. **Shiprocket Shipment**
   - Automatically created after verification
   - payment_method: "COD"
   - cod_amount: 70% (remainingCOD)
   - Order status: `processing`
   - Shipment status: `pending`

4. **Shipment Updates**
   - `pending` → `picked` → `shipped` → `delivered`

### Cancellation Policy

**If Not Picked Up:**
- Shipment cancelled in Shiprocket ✓
- Order status: `cancelled`
- **Advance payment: NOT REFUNDED** (non-refundable)
- COD amount: Not applicable

**If Already Picked/Shipped:**
- Cancellation PREVENTED ✗
- Error message returned to customer
- Customer must contact support

---

## Error Handling

### Shipment Creation Failure

If Shiprocket shipment creation fails:
1. Order remains in `processing` state
2. Admin receives email alert
3. Admin can manually create shipment using `/api/shipping/create`

```typescript
// Retry mechanism built-in
// Automatic retry with exponential backoff: 1s, 2s, 4s
```

### Token Management

Shiprocket auth token is cached in memory:
- Reused within validity period (default 1 hour)
- Automatically refreshed when expired
- Reduces unnecessary API calls

---

## Environment Variables Reference

```env
# Backend (.env)

# Shiprocket API Credentials
SHIPROCKET_EMAIL=your_shiprocket_email@example.com
SHIPROCKET_PASSWORD=your_shiprocket_password
SHIPROCKET_API_KEY=your_api_key_from_shiprocket

# Shiprocket Channel & Pickup
# Get these from Shiprocket dashboard
SHIPROCKET_CHANNEL_ID=17107        # Your channel ID
SHIPROCKET_PICKUP_ID=270249        # Your pickup location ID

# Payment Configuration
ADVANCE_PAYMENT_PERCENT=30         # Adjustable if needed

# Support Configuration
WHATSAPP_SUPPORT_NUMBER=+919876543210
```

---

## Testing

### Test Scenarios

**Scenario 1: Complete Payment Flow**
1. Create order with ₹2000 total
2. Pay ₹600 (30%) via Razorpay using test card: `4111 1111 1111 1111`
3. Verify shipment is created automatically
4. Check order status: `processing`
5. Admin dashboard shows Advance: ₹600, COD: ₹1400

**Scenario 2: Cancellation (Before Pickup)**
1. Order in `processing` state with `shipped` status
2. Call cancel endpoint
3. Verify Shiprocket shipment is cancelled
4. Order status: `cancelled`
5. Admin shows `refundStatus: none`

**Scenario 3: Cancellation (After Pickup)**
1. Manually update shipment status to `picked` in DB
2. Try to cancel
3. Verify error: "shipment has already been processed"

---

## Files Modified/Created

### New Files
- `/backend/server/src/services/shiprocketService.ts` - Shiprocket API integration
- `/backend/server/src/controllers/shippingController.ts` - Shipping endpoints
- `/backend/server/src/routes/shipping.routes.ts` - Shipping routes

### Modified Files
- `/backend/server/src/models/Order.ts` - Added new fields
- `/backend/server/src/config/env.ts` - Added Shiprocket config
- `/backend/server/src/controllers/paymentController.ts` - Integrated partial payments
- `/backend/server/src/app.ts` - Added shipping routes
- `/backend/server/.env` - Added Shiprocket credentials
- `/admin/src/pages/Orders.tsx` - Updated admin dashboard

---

## Support & Troubleshooting

### Common Issues

**1. Shiprocket Authentication Fails**
- Verify email/password in .env
- Check API key validity
- Token auto-refresh should handle this

**2. Shipment Creation Fails**
- Check Shiprocket account balance
- Verify channel ID and pickup ID
- Admin can manually create shipment

**3. Advance Amount Calculation**
- Always 30% for our model (configurable via env)
- Rounded to nearest rupee
- Non-refundable by business rule

---

## Production Checklist

- [ ] Add Shiprocket credentials to production .env
- [ ] Configure WhatsApp support number
- [ ] Test payment flow end-to-end
- [ ] Verify Shiprocket shipment creation
- [ ] Configure email templates for customers
- [ ] Setup admin alerts for shipment failures
- [ ] Document cancellation policy for customers
- [ ] Train support team on new system
- [ ] Monitor Shiprocket API rate limits
- [ ] Setup monitoring/logging for Razorpay + Shiprocket integration

---

## Support

For issues or questions:
- Check logs: `backend/server/src/controllers/shippingController.ts`
- Review Shiprocket API docs: https://apidocs.shiprocket.in/
- Check Razorpay test dashboard for payment status
