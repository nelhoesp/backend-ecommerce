const express = require('express');
const purchaseController = require('../controllers/purchase/purchase.controller');
const authMiddleware = require('../middlewares/auth.middleware');

const router = express.Router();

router.use(authMiddleware);

router.get('/', purchaseController.listMyPurchases);

module.exports = router;