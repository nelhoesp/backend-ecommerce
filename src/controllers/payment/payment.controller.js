const stripeService = require('../../services/payment/stripe.service');

async function createCheckoutSession(req, res) {
    try {
        const userId = req.user.id;

        const result = await stripeService.createCheckoutSession(userId);

        return res.json({
            message: 'Sesión de checkout creada correctamente',
            data: result,
        });

    } catch (error) {
        console.error('Error creando sesión de checkout:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function verifyCheckoutSession(req, res) {
    try {
        const userId = req.user.id;
        const { sessionId } = req.params;

        const result = await stripeService.verifyCheckoutSession(userId, sessionId);

        return res.json({
            message: result.message,
            data: result,
        });
    } catch (error) {
        console.error('Error verificando sesión de checkout:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function cancelOrder(req, res) {
    try {
        const userId = req.user.id;
        const { orderId } = req.params;

        const order = await stripeService.markOrderAsCancelled(userId, orderId);

        return res.json({
            message: 'Orden cancelada correctamente',
            data: {
                orderId: order.id,
                status: order.status,
            },
        });
    } catch (error) {
        console.error('Error cancelando orden:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

module.exports = {
    createCheckoutSession,
    verifyCheckoutSession,
    cancelOrder,
};
