import Razorpay from 'razorpay';
import Stripe from 'stripe';

let razorpayInstance = null;
let stripeInstance = null;

export const getRazorpay = () => {
  if (!razorpayInstance && process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });
  }
  return razorpayInstance;
};

export const getStripe = () => {
  if (!stripeInstance && process.env.STRIPE_SECRET_KEY) {
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripeInstance;
};

export const createRazorpayOrder = async (amount, currency = 'INR', receipt) => {
  const razorpay = getRazorpay();
  if (!razorpay) {
    return {
      id: `order_dev_${Date.now()}`,
      amount: amount * 100,
      currency,
      receipt,
      dev: true,
    };
  }

  return razorpay.orders.create({
    amount: Math.round(amount * 100),
    currency,
    receipt,
  });
};

export const createStripePaymentIntent = async (amount, currency = 'usd') => {
  const stripe = getStripe();
  if (!stripe) {
    return {
      id: `pi_dev_${Date.now()}`,
      client_secret: `dev_secret_${Date.now()}`,
      amount: Math.round(amount * 100),
      dev: true,
    };
  }

  return stripe.paymentIntents.create({
    amount: Math.round(amount * 100),
    currency,
    automatic_payment_methods: { enabled: true },
  });
};

import crypto from 'crypto';

export const verifyRazorpayPayment = (orderId, paymentId, signature) => {
  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');
  return expectedSignature === signature;
};
