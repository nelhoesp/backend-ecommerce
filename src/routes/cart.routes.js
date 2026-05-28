const express = require('express');
const cartController = require('../controllers/cart/cart.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/preview', cartController.preview);
router.post('/items', cartController.addItem);
router.patch('/items/:productId', cartController.updateItem);
router.delete('/items/:productId', cartController.removeItem);
router.delete('/clear', cartController.clearCart);

module.exports = router;
