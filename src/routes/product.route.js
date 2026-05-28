const express = require('express');
const productController = require('../controllers/products/product.controller');

const router = express.Router();

router.get('/', productController.listProducts);
router.get('/:slug', productController.getProductBySlug);

module.exports = router;
