import express from "express";
import authMiddleware from "../middleware/auth.js";
import { optionalAdminAuth } from "../middleware/adminAuth.js";
import { createGuestStripeCheckout, getLastOrder, listOrders, placeOrder, trackGuestOrder, updateStatus, userOrders, verifyOrder } from "../controllers/orderController.js";
import sendEmail from '../utils/sendEmail.js';

const orderRouter = express.Router();

orderRouter.post("/place",authMiddleware,placeOrder);
orderRouter.post("/verify",verifyOrder);
orderRouter.post("/userorders", authMiddleware, userOrders);
orderRouter.get('/list', optionalAdminAuth, listOrders);
orderRouter.post('/status',updateStatus);
orderRouter.post("/guest/checkout", createGuestStripeCheckout)
orderRouter.get("/track/:token", trackGuestOrder)
orderRouter.get("/last/:userId", getLastOrder)

orderRouter.get('/test-email', async (req, res) => {
  try {
    const to = process.env.TEST_EMAIL || process.env.EMAIL_USER;
    if (!to) return res.status(500).send('No email configured');
    await sendEmail(to, 'Test Email', 'Hello from the restaurant app!');
    res.send('Email sent!');
  } catch (err) {
    res.status(500).send('Email failed');
  }
});

export default orderRouter;