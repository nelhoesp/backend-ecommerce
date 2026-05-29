const express = require('express');
const paymentController = require('../controllers/payment/payment.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/stripe/create-checkout-session', paymentController.createCheckoutSession);
router.get('/stripe/verify-session/:sessionId', paymentController.verifyCheckoutSession);
router.patch('/orders/:orderId/cancel', paymentController.cancelOrder);

module.exports = router;
