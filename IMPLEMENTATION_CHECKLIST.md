# Implementation Checklist - Partial Payment + Shiprocket

## Quick Start Guide

> This checklist helps you complete the partial payment + Shiprocket integration step-by-step.

---

## ✅ Backend Setup

### Phase 1: Environment Configuration
- [ ] Add Shiprocket credentials to `backend/server/.env`:
  ```
  SHIPROCKET_EMAIL=your_shiprocket_email@example.com
  SHIPROCKET_PASSWORD=your_shiprocket_password
  SHIPROCKET_API_KEY=your_api_key
  SHIPROCKET_CHANNEL_ID=17107
  SHIPROCKET_PICKUP_ID=270249
  ADVANCE_PAYMENT_PERCENT=30
  WHATSAPP_SUPPORT_NUMBER=+919876543210
  ```
- [ ] Verify all required env variables are set
- [ ] Test env variable access in `config/env.ts`

### Phase 2: Database Migration
- [ ] Update Order model with new fields:
  - [ ] `advanceAmount` (30% of total)
  - [ ] `remainingCOD` (70% of total)
  - [ ] `paymentInfo.advancePaid` (boolean)
  - [ ] `shipmentStatus` (enum)
  - [ ] `shiprocketOrderId`
  - [ ] `shipmentId`
  - [ ] `cancellationReason`
  - [ ] `cancellationDate`
  - [ ] `refundStatus`
- [ ] Run MongoDB schema update (optional - Mongoose handles flexible schema)
- [ ] Verify Order model compiles without errors

### Phase 3: Service Implementation
- [ ] Create `services/shiprocketService.ts`
  - [ ] Shiprocket authentication with token caching
  - [ ] Shipment creation with COD support
  - [ ] Shipment cancellation
  - [ ] Shipment tracking
  - [ ] Error handling with retry logic
- [ ] Test Shiprocket service independently
- [ ] Verify all methods export correctly

### Phase 4: Controller Updates
- [ ] Update `controllers/paymentController.ts`
  - [ ] Calculate advanceAmount = 30% of total
  - [ ] Calculate remainingCOD = 70% of total
  - [ ] Verify Razorpay signature
  - [ ] Create Shiprocket shipment automatically
  - [ ] Mark `advancePaid = true`
  - [ ] Handle Shiprocket failures gracefully
- [ ] Create `controllers/shippingController.ts`
  - [ ] `trackShipment()` - GET tracking
  - [ ] `cancelShipment()` - POST cancellation with policy
  - [ ] `getShipmentDetails()` - GET details
  - [ ] `createShipment()` - POST manual creation (admin)
- [ ] Test all controller endpoints

### Phase 5: Routes Setup
- [ ] Create `routes/shipping.routes.ts`
  - [ ] GET /api/shipping/track/:shipmentId
  - [ ] POST /api/shipping/cancel/:shipmentId (user)
  - [ ] GET /api/shipping/:shipmentId (user)
  - [ ] POST /api/shipping/create (admin)
- [ ] Add import to `app.ts`
- [ ] Register routes in `app.ts`: `app.use("/api/shipping", shippingRoutes)`

### Phase 6: Testing
- [ ] Test payment verification flow:
  - [ ] Create order with ₹2000 total
  - [ ] Verify advance = ₹600, COD = ₹1400
  - [ ] Complete Razorpay payment
  - [ ] Verify shipment created in Shiprocket
  - [ ] Check MongoDB for updated fields
- [ ] Test shipment cancellation:
  - [ ] Cancel before pickup → Success
  - [ ] Verify order status = "cancelled"
  - [ ] Verify refundStatus = "none" (non-refundable)
- [ ] Test tracking:
  - [ ] Fetch tracking for shipmentId
  - [ ] Verify status updates from Shiprocket
- [ ] Test error scenarios:
  - [ ] Missing orderId in payment verify
  - [ ] Invalid Razorpay signature
  - [ ] Shiprocket auth failure
  - [ ] Shipment already picked up

---

## ✅ Admin Frontend Setup

### Phase 1: Orders Page Update
- [ ] Update Order interface:
  - [ ] Add `orderStatus` (replace `status`)
  - [ ] Add `advanceAmount`
  - [ ] Add `remainingCOD`
  - [ ] Add `shipmentStatus`
  - [ ] Add `trackingId`
  - [ ] Add `itemCount`
- [ ] Add status maps:
  - [ ] `statusMap` for order statuses
  - [ ] `paymentMap` for payment statuses
  - [ ] `shipmentMap` for shipment statuses

### Phase 2: Table Headers
- [ ] Update 6 columns:
  1. Order ID (8-digit, monospace)
  2. Customer (name + email)
  3. Date (formatted MM/DD/YYYY)
  4. Payment Breakdown (total + advance + COD + status)
  5. Shipment (tracking + status)
  6. Status (badge + dropdown)

### Phase 3: Status Display
- [ ] Implement color-coded badges:
  - [ ] Order status colors
  - [ ] Payment status colors (green for advance paid)
  - [ ] Shipment status colors
- [ ] Display payment breakdown:
  - [ ] ₹{total} Total (bold)
  - [ ] Advance: ₹{advanceAmount} (green badge)
  - [ ] COD: ₹{remainingCOD} (blue badge)
  - [ ] Status: {paymentStatus} (colored badge)

### Phase 4: Search & Filter
- [ ] Update filter dropdown:
  - [ ] Replace "pending" with "pending" + "paid"
  - [ ] Update all status options to match new enum
  - [ ] Add "all statuses" option
- [ ] Update filter logic:
  - [ ] Search by customer name (case-insensitive)
  - [ ] Search by order ID (partial)
  - [ ] Filter by orderStatus

### Phase 5: API Integration
- [ ] Update admin API client:
  - [ ] Fix `updateOrder` endpoint from `/orders/:id` → `/orders/:id/status`
- [ ] Verify getOrders returns correct fields
- [ ] Test API calls from admin page

### Phase 6: Testing
- [ ] Place test order with ₹2000
- [ ] Complete 30% payment (₹600)
- [ ] View in admin Orders page:
  - [ ] Payment breakdown shows correctly
  - [ ] Advance: ₹600 (green), COD: ₹1400 (blue)
  - [ ] Shipment tracking displays
  - [ ] Status update dropdown works
- [ ] Update order status → Verify in DB
- [ ] Search by customer name → Works
- [ ] Filter by status → Works

---

## ✅ Frontend Checkout Update (Optional)

### Phase 1: Display Payment Breakdown
- [ ] In checkout page, calculate:
  ```typescript
  advanceAmount = Math.round(total * 0.30);
  codAmount = total - advanceAmount;
  ```
- [ ] Display before payment gateway:
  ```
  Total: ₹2000
  Pay Now (30%): ₹600
  Will Pay as COD (70%): ₹1400
  ```

### Phase 2: Update Razorpay Configuration
- [ ] Change amount to 30% only:
  ```typescript
  amount: Math.round(advanceAmount * 100)  // in paise
  ```
- [ ] Update order summary to show "30% Due Now"

### Phase 3: Update Cancellation Flow
- [ ] Add cancel button on order page
- [ ] Show message about non-refundable advance
- [ ] Link to WhatsApp support

---

## ✅ Testing Checklist

### Unit Tests
- [ ] Shiprocket service tests
  - [ ] Token caching works
  - [ ] Retry logic works
  - [ ] Error handling works
- [ ] Payment controller tests
  - [ ] Advance/COD calculation correct
  - [ ] Shipment creation triggered
  - [ ] Email notifications sent
- [ ] Shipping controller tests
  - [ ] Cancellation policy enforced
  - [ ] Tracking retrieval works

### Integration Tests
- [ ] Full payment flow:
  - [ ] Order created → ✓
  - [ ] Advance calculated → ✓
  - [ ] Razorpay payment → ✓
  - [ ] Shipment created → ✓
  - [ ] Email sent → ✓
  - [ ] Admin sees order → ✓
- [ ] Cancellation flow:
  - [ ] Before pickup → ✓ Cancelled, no refund
  - [ ] After pickup → ✗ Error shown
- [ ] Admin dashboard:
  - [ ] Orders load → ✓
  - [ ] Payment breakdown displays → ✓
  - [ ] Status update works → ✓
  - [ ] Search works → ✓
  - [ ] Filter works → ✓

### E2E Tests (Manual)
- [ ] Create test order with ₹2000
- [ ] Use Razorpay test card: `4111 1111 1111 1111`
  - Expiry: Any future date
  - CVV: Any 3 digits
- [ ] Verify in admin:
  - [ ] Order appears
  - [ ] Payment breakdown shows ₹600 + ₹1400
  - [ ] Shipment tracking visible
- [ ] Request cancellation:
  - [ ] See non-refundable message
  - [ ] WhatsApp link works
  - [ ] Order status updates to "cancelled"

---

## ✅ Deployment Checklist

### Pre-Production
- [ ] Review all code for security
- [ ] Test with real Shiprocket credentials
- [ ] Verify WhatsApp number is correct
- [ ] Check email templates display correctly
- [ ] Verify ADVANCE_PAYMENT_PERCENT is configurable
- [ ] Test error scenarios:
  - [ ] Shiprocket API down
  - [ ] Email service unavailable
  - [ ] Razorpay auth failure

### Production
- [ ] Deploy backend:
  - [ ] Update .env with production credentials
  - [ ] Deploy to server
  - [ ] Restart Node.js process
  - [ ] Monitor logs for errors
- [ ] Deploy admin frontend:
  - [ ] Build: `npm run build`
  - [ ] Deploy to hosting
  - [ ] Test admin dashboard
- [ ] Monitor:
  - [ ] API response times
  - [ ] Shiprocket API calls
  - [ ] Email delivery
  - [ ] Customer complaints

### Post-Deployment
- [ ] Verify live payment flow works
- [ ] Check first few orders processed correctly
- [ ] Monitor Shiprocket shipment creation
- [ ] Verify customers receive confirmation emails
- [ ] Monitor admin page performance
- [ ] Setup alerts for API failures

---

## ✅ Documentation Checklist

- [ ] Create/update README with new features
- [ ] Document API changes in API_REFERENCE_PARTIAL_PAYMENT.md
- [ ] Document admin changes in ADMIN_ORDERS_PAGE_SCHEMA.md
- [ ] Document setup in PARTIAL_PAYMENT_SHIPROCKET_GUIDE.md
- [ ] Update customer-facing cancellation policy
- [ ] Update support documentation
- [ ] Create FAQ for common questions
- [ ] Document Shiprocket channel/pickup setup

---

## ✅ Customer Communication

### Email Templates
- [ ] Order confirmation:
  - [ ] Show advance payment due
  - [ ] Show COD amount
  - [ ] Non-refundable notice
- [ ] Payment confirmation:
  - [ ] Advance amount paid
  - [ ] Remaining COD amount
  - [ ] Shipment processing
- [ ] Shipment notification:
  - [ ] Tracking number
  - [ ] Courier partner
  - [ ] Estimated delivery
- [ ] Cancellation confirmation:
  - [ ] Non-refundable advance message
  - [ ] WhatsApp support link

### Customer Education
- [ ] Website FAQs:
  - [ ] Why 30% advance?
  - [ ] Why non-refundable?
  - [ ] How does COD work?
  - [ ] Cancellation policy
- [ ] WhatsApp chatbot:
  - [ ] Order status
  - [ ] Cancellation requests
  - [ ] Payment issues
  - [ ] Shipping delays

---

## ✅ Troubleshooting Guide

### Common Issues

**Shiprocket Shipment Creation Fails**
- [ ] Check Shiprocket account balance
- [ ] Verify channel ID is correct
- [ ] Verify pickup location ID is correct
- [ ] Check Shiprocket API status
- [ ] Review error logs in payment controller

**Advance Amount Calculation Wrong**
- [ ] Verify ADVANCE_PAYMENT_PERCENT in .env
- [ ] Check calculation: `Math.round(total * 0.30)`
- [ ] Verify no rounding errors in frontend

**Email Not Sending**
- [ ] Check EMAIL_SERVICE config
- [ ] Verify email credentials in .env
- [ ] Check email logs
- [ ] Verify recipient email addresses

**Cancellation Not Working**
- [ ] Check shipment status in Shiprocket
- [ ] Verify shipment not already picked up
- [ ] Check user authentication
- [ ] Verify order belongs to user

**Admin Orders Page Not Loading**
- [ ] Check API endpoint: GET /api/orders
- [ ] Verify user is authenticated as admin
- [ ] Check network tab for errors
- [ ] Clear browser cache
- [ ] Check response format includes "items" array

---

## ✅ Success Criteria

Your implementation is complete when:

1. **Payment Flow** ✓
   - Customer pays 30% via Razorpay
   - Advance amount is calculated correctly
   - COD amount is calculated correctly
   - Remaining 70% is collected as COD

2. **Shipment Creation** ✓
   - Shiprocket shipment created automatically after payment
   - Tracking number assigned
   - COD amount sent to Shiprocket (70% only)

3. **Admin Dashboard** ✓
   - Orders page displays payment breakdown
   - Advance amount shown in green
   - COD amount shown in blue
   - Shipment tracking visible
   - Status updates work

4. **Cancellation Policy** ✓
   - 30% advance is non-refundable
   - No refund for cancellations
   - Clear message to customer with WhatsApp support link
   - Cancellation prevented after pickup

5. **Error Handling** ✓
   - Shiprocket failures don't crash system
   - Admin notified of failures
   - Errors logged for debugging
   - Graceful fallbacks in place

---

## ✅ Final Verification

Before going live:

- [ ] Create test order with ₹2000
- [ ] Complete ₹600 payment
- [ ] Verify ₹1400 COD in Shiprocket
- [ ] Check admin sees payment breakdown
- [ ] Request cancellation
- [ ] Verify no refund issued
- [ ] Check WhatsApp link works
- [ ] Verify shipment tracking updates
- [ ] Monitor logs for errors
- [ ] Get customer feedback

---

## 📞 Support

If you get stuck:

1. Check the detailed guides:
   - `PARTIAL_PAYMENT_SHIPROCKET_GUIDE.md` - Full setup guide
   - `API_REFERENCE_PARTIAL_PAYMENT.md` - API specifications
   - `ADMIN_ORDERS_PAGE_SCHEMA.md` - Admin page details

2. Review Shiprocket API docs:
   - https://apidocs.shiprocket.in/

3. Check error logs:
   - Backend: `backend/server/src/controllers/paymentController.ts`
   - Admin: Browser console in admin dashboard

4. Verify credentials:
   - Shiprocket email/password correct?
   - Razorpay keys correct?
   - WhatsApp number configured?

---

**Status**: Ready to implement
**Estimated Time**: 4-6 hours
**Difficulty**: Medium
**Prerequisites**: Shiprocket account + API credentials
