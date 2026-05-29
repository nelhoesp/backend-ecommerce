const { Op } = require('sequelize');
const { Order, OrderItem, Product, sequelize } = require('../../../models');
const AppError = require('../../errors/AppError');

const ALLOWED_STATUSES = ['pending', 'paid', 'failed', 'cancelled'];

function parsePositiveInteger(value, defaultValue, maxValue = null) {
  const number = parseInt(value, 10);

  if (Number.isNaN(number) || number <= 0) {
    return defaultValue;
  }

  if (maxValue && number > maxValue) {
    return maxValue;
  }

  return number;
}

function toNumber(value) {
  return Number(parseFloat(value || 0).toFixed(2));
}

function mapOrder(order) {
  return {
    id: order.id,
    status: order.status,
    totalAmount: toNumber(order.totalAmount),
    currency: 'PEN',
    paymentReference: order.paymentReference,
    paidAt: order.paidAt,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    items: order.items?.map((item) => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName,
        unitPrice: toNumber(item.unitPrice),
        quantity: item.quantity,
        subtotal: toNumber(item.subtotal),
        product: item.product
            ? {
                id: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                category: item.product.category,
            }
            : null,
    })) || [],
  };
}

async function listMyPurchases(userId, queryParams) {
    const { status, page, limit } = queryParams;

    const currentPage = parsePositiveInteger(page, 1);
    const perPage = parsePositiveInteger(limit, 10, 50);
    const offset = (currentPage - 1) * perPage;

    const where = {
        userId,
    };

    if (status) {
        if (!ALLOWED_STATUSES.includes(status)) {
            throw new AppError(
                'Estado de compra inválido',
                400,
                'INVALID_ORDER_STATUS',
                {
                allowedStatuses: ALLOWED_STATUSES,
                }
            );
        }

        where.status = status;
    }

    const { rows, count } = await Order.findAndCountAll({
        where,
        include: [
        {
            model: OrderItem,
            as: 'items',
            include: [
                {
                    model: Product,
                    as: 'product',
                    attributes: ['id', 'name', 'slug', 'category'],
                },
            ],
        },
        ],
        order: [['createdAt', 'DESC']],
        limit: perPage,
        offset,
        distinct: true,
    });

    return {
        purchases: rows.map(mapOrder),
        pagination: {
            totalItems: count,
            totalPages: Math.ceil(count / perPage),
            currentPage,
            perPage,
        },
        filters: {
            status: status || null,
        },
    };
}

module.exports = {
    listMyPurchases,
};