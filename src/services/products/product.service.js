const { Product } = require('../../../models');
const AppError = require('../../errors/AppError');

async function getAllProducts(req, res) {
    try {
        const products = await Product.findAll();

        return products;

    } catch (error) {
        console.error('Error fetching products:', error);

        throw new AppError('Error fetching products', 500, 'INTERNAL_SERVER_ERROR');
    }
}

module.exports = {
    getAllProducts,
};