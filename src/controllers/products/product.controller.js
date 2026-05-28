const { Product } = require('../../../models');
const productService = require('../../services/products/product.service');

async function listProducts(req, res) {
    try {
        const result = await productService.listProducts(req.query);

        return res.status(200).json({
            message: 'Products obtenidos correctamente.',
            data: result.products,
            pagination: result.pagination,
            filters: result.filters,
        });

    } catch (error) {
        console.error('Error listando productos:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message,
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function getProductBySlug(req, res) {
    try {
        const { slug } = req.params;

        const product = await productService.getProductBySlug(slug);

        return res.status(200).json({
            message: 'Producto obtenido correctamente.',
            data: product,
        });

    } catch (error) {
        console.error('Error obteniendo producto por slug:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message,
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

module.exports = {
    listProducts,
    getProductBySlug,
};
