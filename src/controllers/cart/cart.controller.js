const cartService = require('../../controllers/cart/cart.controller');

async function addItem(req, res) {
    try {
        const userId = req.user.id;
        const { productId, quantity } = req.body;

        await cartService.addItem(userId, productId, quantity);

        const preview = await cartService.getPreview(userId);

        return res.status(200).json({
            message: 'Producto agregado al carrito exitosamente',
            data: preview,
        });

    } catch (error) {
        console.error('Error adding item to cart:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function updateItem(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.params;
        const { quantity } = req.body;

        await cartService.updateItem(userId, productId, quantity);

        const preview = await cartService.getPreview(userId);

        return res.json({
            message: 'Cantidad actualizada correctamente',
            data: preview,
        });

    } catch (error) {
        console.error('Error actualizando item en el carrito:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function removeItem(req, res) {
    try {
        const userId = req.user.id;
        const { productId } = req.params;

        await cartService.removeItem(userId, productId);

        const preview = await cartService.getPreview(userId);

        return res.json({
            message: 'Producto eliminado del carrito',
            data: preview,
        });

    } catch (error) {
        console.error('Error eliminando item del carrito:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function clearCart(req, res) {
    try {
        const userId = req.user.id;

        await cartService.clearCart(userId);

        return res.json({
            message: 'Carrito limpiado correctamente',
            data: {
                items: [],
                summary: {
                    totalItems: 0,
                    totalAmount: 0,
                },
            },
        });

    } catch (error) {
        console.error('Error limpiando el carrito:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

async function preview(req, res) {
    try {
        const userId = req.user.id;

        const cartPreview = await cartService.getPreview(userId);

        return res.json({
            message: 'Preview del carrito obtenido correctamente',
            data: cartPreview,
        });

    } catch (error) {
        console.error('Error obteniendo preview del carrito:', error);

        res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
        });
    }
}

module.exports = {
    addItem,
    updateItem,
    removeItem,
    clearCart,
    preview,
};
