# API Reference: Partial Payment + Shiprocket

## Payment Verification API

### Endpoint
```
POST /api/payments/razorpay/verify
```

### Request
```json
{
  "razorpayOrderId": "order_XXXXX",
  "razorpayPaymentId": "pay_XXXXX",
  "razorpaySignature": "signature_XXXXX",
  "orderId": "mongodb_order_id"
}
```

### Response (Success)
```json
{
  "success": true,
  "message": "Payment verified and shipment created",
  "data": {
    "order": {
      "_id": "order_id",
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
      "orderId": "SR12345",
      "courierPartnerName": "Shiprocket Assured",
      "trackingId": "RK001234567"
    }
  }
}
```

### Response (Shiprocket Failure - Order Still Paid)
```json
{
  "success": true,
  "message": "Payment verified successfully. Shipment will be created shortly.",
  "data": {
    "order": {
      "_id": "order_id",
      "totalAmount": 2000,
      "advanceAmount": 600,
      "remainingCOD": 1400,
      "orderStatus": "processing",
      "shipmentStatus": "not_created"
    }
  }
}
```

---

## Shipment Cancellation API

### Endpoint
```
POST /api/shipping/cancel/:shipmentId
```

### Request
```
Authentication: Bearer {user_token}
```

### Response (Success - Not Picked)
```json
{
  "success": true,
  "message": "Your order has been cancelled successfully. Please note that the 30% advance payment (₹600) is non-refundable due to shipping and operational charges. For further assistance, contact us on WhatsApp: +919876543210",
  "data": {
    "order": {
      "_id": "order_id",
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

## Shipment Tracking API

### Endpoint
```
GET /api/shipping/track/:shipmentId
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
pending     - Order created, not assigned to courier
picked      - Picked up by courier
shipped     - In transit
delivered   - Delivered to customer
cancelled   - Shipment cancelled
```

---

## Get Shipment Details API

### Endpoint
```
GET /api/shipping/:shipmentId
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
      "shipment_status": "shipped",
      "tracking_number": "RK001234567",
      "courier_name": "Shiprocket Assured",
      "payment_method": "COD",
      "cod_amount": 1400,
      "customer_name": "John Doe",
      "delivery_address": "123 Main St, City",
      "created_at": "2024-05-19T10:00:00Z"
    }
  }
}
```

---

## Manual Shipment Creation API

### Endpoint
```
POST /api/shipping/create
```

### Request (Admin Only)
```json
{
  "orderId": "mongodb_order_id"
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
      "_id": "order_id",
      "shipmentStatus": "pending",
      "orderStatus": "processing"
    }
  }
}
```

---

## Admin API: Get All Orders

### Endpoint
```
GET /api/orders
```

### Query Parameters
```
page=1&limit=20&status=all
```

### Response
```json
{
  "success": true,
  "message": "Orders fetched",
  "data": {
    "items": [
      {
        "_id": "order_id",
        "customer": "John Doe",
        "customerEmail": "john@example.com",
        "orderStatus": "processing",
        "paymentStatus": "paid",
        "total": 2000,
        "advanceAmount": 600,
        "remainingCOD": 1400,
        "shipmentStatus": "pending",
        "trackingId": "RK001234567",
        "itemCount": 3,
        "createdAt": "2024-05-19T10:00:00Z"
      }
    ]
  }
}
```

---

## Payment Calculation Example

### Scenario: Order of ₹2000

```
BEFORE PAYMENT:
Total Amount:        ₹2000
Advance (30%):       ₹600   (RAZORPAY)
Remaining (70%):     ₹1400  (COD)

AFTER RAZORPAY PAYMENT VERIFICATION:
✓ Advance Recorded:  ₹600   (Non-Refundable)
✓ Shiprocket Order Created with:
  - payment_method: "COD"
  - cod_amount: ₹1400
  - total_amount: ₹2000

CANCELLATION POLICIES:
- Before Pickup:    Order Cancelled ✓ | Advance NOT Refunded ✗
- After Pickup:     Cancellation BLOCKED ✗ | Contact Support
- After Delivery:   Return/Refund Policy Applies
```

---

## Error Codes

```json
400: "Order ID required"
400: "Invalid payment signature"
400: "Shipment has already been picked up. Cancellation not allowed."
400: "Shipment ID is required"
403: "Unauthorized to cancel this shipment"
404: "Order not found"
404: "Shipment not found"
500: "Failed to create Razorpay order"
500: "Failed to create Shiprocket shipment"
500: "Shiprocket authentication failed"
```

---

## Frontend Integration Example

```typescript
// 1. Display Payment Breakdown
const totalAmount = 2000;
const advanceAmount = Math.round(totalAmount * 0.30);
const codAmount = totalAmount - advanceAmount;

console.log(`Total: ₹${totalAmount}`);
console.log(`Pay Now (30%): ₹${advanceAmount}`);  // ₹600
console.log(`COD (70%): ₹${codAmount}`);          // ₹1400

// 2. Create Razorpay Order
const razorpayResponse = await api.createRazorpayOrder({
  orderId: orderId,
  amount: Math.round(advanceAmount * 100)  // Convert to paise
});

// 3. Open Razorpay Modal
const options = {
  key: import.meta.env.VITE_RAZORPAY_KEY,
  amount: Math.round(advanceAmount * 100),
  currency: "INR",
  order_id: razorpayResponse.data.razorpayOrderId,
  handler: async (response) => {
    await api.verifyPayment({
      razorpayPaymentId: response.razorpay_payment_id,
      razorpayOrderId: response.razorpay_order_id,
      razorpaySignature: response.razorpay_signature,
      orderId: orderId
    });
    // Success!
  }
};

const razorpay = new window.Razorpay(options);
razorpay.open();

// 4. Handle Cancellation
const handleCancel = async (shipmentId) => {
  try {
    const response = await api.cancelShipment(shipmentId);
    // Show success message with WhatsApp link
    console.log(response.message);
  } catch (error) {
    // Show error message
    console.error(error.message);
  }
};
```

---

## Shiprocket Payload Structure

### When Creating Shipment

```json
{
  "order_id": "mongodb_order_id",
  "order_date": "2024-05-19T10:00:00Z",
  "channel_id": 17107,
  "pickup_location_id": 270249,
  "billing_customer_name": "John Doe",
  "billing_email": "john@example.com",
  "billing_phone": "9876543210",
  "billing_address": "123 Main Street",
  "billing_city": "New York",
  "billing_state": "NY",
  "billing_country": "India",
  "billing_pincode": "110001",
  "shipping_customer_name": "John Doe",
  "shipping_email": "john@example.com",
  "shipping_phone": "9876543210",
  "shipping_address": "123 Main Street",
  "shipping_city": "New York",
  "shipping_state": "NY",
  "shipping_country": "India",
  "shipping_pincode": "110001",
  "order_items": [
    {
      "name": "Product Name",
      "quantity": 1,
      "price": 2000
    }
  ],
  "payment_method": "COD",
  "sub_total": 2000,
  "cod_amount": 1400,
  "length": 10,
  "breadth": 10,
  "height": 10,
  "weight": 1,
  "is_insured": false
}
```

**Key Points:**
- `payment_method`: Always "COD"
- `cod_amount`: Only remaining 70% (₹1400)
- `sub_total`: Full order amount (₹2000)
- Advance payment is NOT included in COD amount
