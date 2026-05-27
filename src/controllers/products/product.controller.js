const { Product } = require('../../../models');
const productService = require('../../services/products/product.service');

async function getAllProducts(req, res) {
    try {
        const products = await productService.getAllProducts();

        return res.status(200).json({
            message: 'Products obtenidos correctamente.',
            data: products,
        });

    } catch (error) {
        console.error('Error fetching products:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message,
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

module.exports = {
    getAllProducts,
};
