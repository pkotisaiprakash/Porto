# Payment Gateway Integration Guide

This document outlines how to integrate payment gateways (Razorpay/Stripe) into the Porto application for handling premium subscriptions.

## Overview

The application currently supports a demo payment flow. To enable real payments, you need to integrate with a payment provider.

## Supported Payment Gateways

### 1. Razorpay (Recommended for India)

Razorpay is the recommended payment gateway for Indian Rupee (INR) transactions.

#### Setup Steps

1. **Create Razorpay Account**
   - Visit https://razorpay.com
   - Complete KYC and verify your account
   - Get your Key ID and Key Secret

2. **Environment Variables**
   Add to `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=your_key_id
   RAZORPAY_KEY_SECRET=your_key_secret
   ```

3. **Install Razorpay SDK**
   ```bash
   npm install razorpay
   ```

4. **Backend Implementation**

   Create `backend/utils/payment.js`:
   ```javascript
   const Razorpay = require('razorpay');

   const razorpay = new Razorpay({
     key_id: process.env.RAZORPAY_KEY_ID,
     key_secret: process.env.RAZORPAY_KEY_SECRET
   });

   // Create payment order
   const createPaymentOrder = async (amount, currency = 'INR') => {
     const options = {
       amount: amount * 100, // Razorpay expects amount in paise
       currency,
       receipt: `receipt_${Date.now()}`
     };
     return await razorpay.orders.create(options);
   };

   // Verify payment signature
   const verifyPaymentSignature = (options) => {
     const crypto = require('crypto');
     const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = options;
     
     const generatedSignature = crypto
       .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
       .update(razorpay_order_id + '_' + razorpay_payment_id)
       .digest('hex');

     return generatedSignature === razorpay_signature;
   };

   module.exports = {
     razorpay,
     createPaymentOrder,
     verifyPaymentSignature
   };
   ```

5. **Frontend Integration**

   Update the Premium page to use Razorpay checkout:
   ```javascript
   // In frontend/src/pages/Premium.jsx
   
   const loadRazorpay = () => {
     return new Promise((resolve) => {
       const script = document.createElement('script');
       script.src = 'https://checkout.razorpay.com/v1/checkout.js';
       script.onload = () => resolve(true);
       document.body.appendChild(script);
     });
   };

   const handlePurchase = async () => {
     // 1. Create order on backend
     const orderResponse = await api.post('/payment/create-order', { amount: 9 });
     
     // 2. Open Razorpay checkout
     const razorpay = new window.Razorpay({
       key: 'YOUR_RAZORPAY_KEY_ID',
       order_id: orderResponse.data.orderId,
       handler: async (response) => {
         // 3. Verify payment on backend
         await authAPI.verifyPayment({
           razorpay_order_id: response.razorpay_order_id,
           razorpay_payment_id: response.razorpay_payment_id,
           razorpay_signature: response.razorpay_signature
         });
       }
     });
     razorpay.open();
   };
   ```

---

### 2. Stripe (Recommended for Global Payments)

Stripe is recommended for USD and other international currencies.

#### Setup Steps

1. **Create Stripe Account**
   - Visit https://stripe.com
   - Complete account verification
   - Get your Publishable Key and Secret Key

2. **Environment Variables**
   Add to `backend/.env`:
   ```env
   STRIPE_SECRET_KEY=sk_test_your_secret_key
   STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   ```

3. **Install Stripe SDK**
   ```bash
   npm install stripe
   ```

4. **Backend Implementation**

   Create `backend/utils/payment.js`:
   ```javascript
   const Stripe = require('stripe');
   
   const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

   // Create payment intent
   const createPaymentIntent = async (amount, currency = 'usd') => {
     return await stripe.paymentIntents.create({
       amount: amount * 100, // Stripe expects amount in cents
       currency,
       automatic_payment_methods: { enabled: true }
     });
   };

   // Verify webhook signature
   const verifyWebhook = (payload, signature) => {
     return stripe.webhooks.constructEvent(
       payload,
       signature,
       process.env.STRIPE_WEBHOOK_SECRET
     );
   };

   module.exports = {
     stripe,
     createPaymentIntent,
     verifyWebhook
   };
   ```

5. **Frontend Integration**

   Use Stripe Elements:
   ```javascript
   // In frontend/src/pages/Premium.jsx
   
   import { loadStripe } from '@stripe/stripe-js';
   
   const stripePromise = loadStripe('pk_test_your_publishable_key');
   
   const handlePurchase = async () => {
     const stripe = await stripePromise;
     
     // 1. Create payment intent on backend
     const { clientSecret } = await api.post('/payment/create-intent', { amount: 9 });
     
     // 2. Confirm payment with Stripe Elements
     const result = await stripe.confirmCardPayment(clientSecret, {
       payment_method: {
         card: cardElement
       }
     });
     
     if (result.error) {
       // Handle error
     } else {
       // Payment successful
     }
   };
   ```

---

## Backend API Routes

Add these routes to `backend/routes/paymentRoutes.js`:

```javascript
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Create payment order (Razorpay)
router.post('/create-order', protect, async (req, res) => {
  const { amount } = req.body;
  const order = await createPaymentOrder(amount);
  res.json({ orderId: order.id });
});

// Verify payment
router.post('/verify-payment', protect, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  
  if (verifyPaymentSignature({ razorpay_order_id, razorpay_payment_id, razorpay_signature })) {
    // Activate premium
    const user = await User.findById(req.user.id);
    user.isPremium = true;
    user.premiumExpiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();
    
    res.json({ success: true });
  } else {
    res.status(400).json({ success: false, message: 'Invalid signature' });
  }
});

// Stripe: Create payment intent
router.post('/create-intent', protect, async (req, res) => {
  const { amount } = req.body;
  const paymentIntent = await createPaymentIntent(amount);
  res.json({ clientSecret: paymentIntent.client_secret });
});

module.exports = router;
```

---

## Frontend API Updates

Update `frontend/src/services/api.js`:

```javascript
export const paymentAPI = {
  createOrder: (amount) => api.post('/payment/create-order', { amount }),
  verifyPayment: (data) => api.post('/payment/verify-payment', data),
  createPaymentIntent: (amount) => api.post('/payment/create-intent', { amount })
};
```

---

## Webhook Handling

Set up webhooks to handle payment events:

```javascript
// backend/routes/webhookRoutes.js
router.post('/razorpay-webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const event = req.body;
  
  switch (event.event) {
    case 'payment.captured':
      // Update user premium status
      const payment = event.payload.payment.entity;
      // Find user by payment metadata and update
      break;
    case 'payment.failed':
      // Handle failed payment
      break;
  }
  
  res.json({ received: true });
});
```

---

## Security Best Practices

1. **Never store payment details** - Use tokenization
2. **Verify all payments server-side** - Never trust client-side validation
3. **Use webhooks** - For reliable payment confirmation
4. **Implement idempotency** - Prevent duplicate charges
5. **Keep secrets secure** - Use environment variables

---

## Testing

### Test Cards

**Razorpay Test Card:**
- Card Number: 4111 1111 1111 1111
- Expiry: Any future date
- CVV: Any 3 digits
- OTP: 123456

**Stripe Test Card:**
- Card Number: 4242 4242 4242 4242
- Expiry: Any future date
- CVC: Any 3 digits

---

## Current Implementation

The current implementation uses a demo mode for testing. To go live:

1. Choose a payment gateway (Razorpay for INR, Stripe for USD)
2. Complete the setup steps above
3. Replace demo payment flow with real integration
4. Test thoroughly in sandbox mode
5. Go live and monitor transactions

---

## Support

- Razorpay Documentation: https://razorpay.com/docs
- Stripe Documentation: https://stripe.com/docs
