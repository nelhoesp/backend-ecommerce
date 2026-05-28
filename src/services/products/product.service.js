const { Op } = require('sequelize');
const { Product, sequelize } = require('../../../models');
const AppError = require('../../errors/AppError');

const {
    parsePositiveInteger,
    parsePrice
} = require('../../utils/parsers');


function buildOrder(sort) {
    const allowedSorts = {
        newest: [['createdAt', 'DESC']],
        oldest: [['createdAt', 'ASC']],
        price_asc: [['price', 'ASC']],
        price_desc: [['price', 'DESC']],
        name_asc: [['name', 'ASC']],
        name_desc: [['name', 'DESC']],
    };

    return allowedSorts[sort] || allowedSorts.newest;
}

async function listProducts(queryParams) {
    try {
        const {
            q,
            category,
            minPrice,
            maxPrice,
            sort,
            page,
            limit,
        } = queryParams;

        const currentPage = parsePositiveInteger(page, 1);
        const perPage = parsePositiveInteger(limit, 12, 50);
        const offset = (currentPage - 1) * perPage;

        const where = {};

        if (q && q.trim() !== '') {
            const search = q.trim();

            where[Op.or] = [
                {
                    name: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    description: {
                        [Op.like]: `%${search}%`,
                    },
                },
                {
                    category: {
                        [Op.like]: `%${search}%`,
                    },
                },
            ];
        }

        if (category && category.trim() !== '') {
            where.category = category.trim();
        }

        const parsedMinPrice = parsePrice(minPrice);
        const parsedMaxPrice = parsePrice(maxPrice);

        if (parsedMinPrice !== null || parsedMaxPrice !== null) {
            where.price = {};
            if (parsedMinPrice !== null) {
                where.price[Op.gte] = parsedMinPrice;
            }
            if (parsedMaxPrice !== null) {
                where.price[Op.lte] = parsedMaxPrice;
            }
        }

        const { rows, count } = await Product.findAndCountAll({
            where,
            order: buildOrder(sort),
            limit: perPage,
            offset,
            attributes: [
                'id',
                'name',
                'slug',
                'description',
                'category',
                'price',
                'createdAt',
            ],
        });

        return {
            products: rows,
            pagination: {
                totalItems: count,
                totalPages: Math.ceil(count / perPage),
                currentPage,
                perPage,
            },
            filters: {
                q: q || null,
                category: category || null,
                minPrice: parsedMinPrice,
                maxPrice: parsedMaxPrice,
                sort: sort || 'newest',
            },
        };

    } catch (error) {
        console.error('Error fetching products:', error);

        throw new AppError('Error fetching products', 500, 'INTERNAL_SERVER_ERROR');
    }
}

async function getProductBySlug(slug) {
    const product = await Product.findOne({
        where: {
            slug,
        },
        attributes: [
            'id',
            'name',
            'slug',
            'description',
            'category',
            'price',
            'createdAt',
        ],
    });

    if (!product) {
        throw new AppError('Producto no encontrado',404,'PRODUCT_NOT_FOUND');
    }

    return product;
}

module.exports = {
    listProducts,
    getProductBySlug,
};