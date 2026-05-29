const Stripe = require('stripe');
const { sequelize, Product, Order, OrderItem } = require('../../../models');
const AppError = require('../../errors/AppError');
const cartService = require('../cart/cart.service');

require('dotenv').config();

let stripe = null;

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_SECRET_KEY.trim() !== '') {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    console.log('Stripe initialized successfully.');
} else {
    console.warn('WARNING: STRIPE_SECRET_KEY is empty or not defined in .env. Checkout functionality will return mock success endpoints.');
}

function toNumber(value) {
  return Number(parseFloat(value || 0).toFixed(2));
}

function toStripeUnitAmount(amount) {
  return Math.round(toNumber(amount) * 100);
}

function getClientUrl() {
  return process.env.CLIENT_URL || 'http://localhost:5173';
}

async function createCheckoutSession(userId) {
    const cartPreview = await cartService.getPreview(userId);

    if (!cartPreview.items || cartPreview.items.length === 0) {
        throw new AppError('El carrito está vacío', 400, 'EMPTY_CART');
    }

    const transaction = await sequelize.transaction();

    try {
        const order = await Order.create(
            {
                userId,
                status: 'pending',
                totalAmount: cartPreview.summary.totalAmount,
            },
            { transaction }
        );

        const orderItemsPayload = [];

        for (const item of cartPreview.items) {
            const product = await Product.findOne({
                where: {
                    id: item.productId,
                },
                transaction,
                lock: transaction.LOCK.UPDATE,
            });

            if (!product) {
                throw new AppError(`Producto con ID ${item.productId} no encontrado`,404,'PRODUCT_NOT_FOUND');
            }

            const unitPrice = toNumber(product.price);
            const subtotal = toNumber(unitPrice * item.quantity);

            orderItemsPayload.push({
                orderId: order.id,
                productId: product.id,
                productName: product.name,
                unitPrice,
                quantity: item.quantity,
                subtotal,
            });
        }

        await OrderItem.bulkCreate(orderItemsPayload, { transaction });

        let checkoutUrl = null;
        let stripeSessionId = null;
        let isMock = false;

        if (!stripe) {
            isMock = true;
            stripeSessionId = `mock_session_${order.id}`;

            await order.update(
                {
                    paymentReference: stripeSessionId,
                },
                { transaction }
            );

            checkoutUrl = `${getClientUrl()}/success?mock=true&order_id=${order.id}`;
        } else {
            const lineItems = orderItemsPayload.map((item) => ({
                price_data: {
                    currency: process.env.STRIPE_CURRENCY || 'pen',
                    product_data: {
                        name: item.productName,
                    },
                    unit_amount: toStripeUnitAmount(item.unitPrice),
                },
                quantity: item.quantity,
            }));

            const session = await stripe.checkout.sessions.create({
                payment_method_types: ['card'],
                line_items: lineItems,
                mode: 'payment',
                client_reference_id: String(order.id),
                metadata: {
                    orderId: String(order.id),
                    userId: String(userId),
                },
                success_url: `${getClientUrl()}/success?session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${getClientUrl()}/cancel?order_id=${order.id}`,
            });

            stripeSessionId = session.id;
            checkoutUrl = session.url;

            await order.update(
                {
                    paymentReference: stripeSessionId,
                },
                { transaction }
            );
        }

        await transaction.commit();

        return {
            orderId: order.id,
            checkoutUrl,
            stripeSessionId,
            isMock,
        };

    } catch (error) {
        await transaction.rollback();

        throw new AppError(error.message || 'Error creando sesión de checkout', 500, 'CHECKOUT_SESSION_ERROR');
    }
}

async function verifyCheckoutSession(userId, sessionId) {
    if (!sessionId) {
        throw new AppError('El sessionId es obligatorio', 400, 'SESSION_ID_REQUIRED');
    }

    if (!stripe) {
        throw new AppError('Stripe no está configurado. No se puede verificar una sesión real.',400,'STRIPE_NOT_CONFIGURED');
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const orderId = session.metadata?.orderId || session.client_reference_id;

    if (!orderId) {
        throw new AppError('La sesión no tiene una orden asociada', 400, 'ORDER_REFERENCE_NOT_FOUND');
    }

    const transaction = await sequelize.transaction();

    try {
        const order = await Order.findOne({
            where: {
                id: orderId,
                userId,
            },
            include: [
                {
                model: OrderItem,
                as: 'items',
                },
            ],
            transaction,
            lock: transaction.LOCK.UPDATE,
        });

        if (!order) {
            throw new AppError('Orden no encontrada', 404, 'ORDER_NOT_FOUND');
        }

        if (order.status === 'paid') {
            await transaction.commit();

            return {
                orderId: order.id,
                status: order.status,
                paymentStatus: session.payment_status,
                message: 'La orden ya estaba pagada',
            };
        }

        if (session.payment_status !== 'paid') {
            await transaction.commit();

            return {
                orderId: order.id,
                status: order.status,
                paymentStatus: session.payment_status,
                message: 'El pago aún no está confirmado',
            };
        }

        await order.update(
            {
                status: 'paid',
                paidAt: new Date(),
            },
            { transaction }
        );

        await cartService.clearCart(userId, transaction);

        await transaction.commit();

        return {
            orderId: order.id,
            status: 'paid',
            paymentStatus: session.payment_status,
            message: 'Pago confirmado correctamente',
        };

    } catch (error) {
        await transaction.rollback();

        throw new AppError('Error creando sesión de checkout',500,'CHECKOUT_SESSION_ERROR');
    }
}

async function markOrderAsCancelled(userId, orderId) {
    const order = await Order.findOne({
        where: {
            id: orderId,
            userId,
            status: 'pending',
        },
    });

    if (!order) {
        throw new AppError('Orden pendiente no encontrada', 404, 'ORDER_NOT_FOUND');
    }

    order.status = 'cancelled';
    await order.save();

    return order;
}

module.exports = {
    createCheckoutSession,
    verifyCheckoutSession,
    markOrderAsCancelled,
};
