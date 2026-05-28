const { CartItem, Product } = require('../../../models');
const AppError = require('../../errors/AppError');

function toNumber(value) {
    return Number(parseFloat(value || 0).toFixed(2));
}

async function getCartItems(userId) {
    return CartItem.findAll({
        where: { userId },
        include: [
            {
                model: Product,
                as: 'product',
                attributes: [
                    'id',
                    'name',
                    'slug',
                    'description',
                    'category',
                    'price',
                ],
            },
        ],
        order: [['createdAt', 'DESC']],
    });
}

async function addItem(userId, productId, quantity = 1) {
    const parsedQuantity = parseInt(quantity, 10);

    if (!productId) {
        throw new AppError('Product ID is required', 400, 'INVALID_INPUT');
    }

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new AppError('La cantidad debe ser mayor a 0', 400, 'INVALID_QUANTITY');
    }

    const product = await Product.findOne({
        where: {
            id: productId
        },
    });

    if (!product) {
        throw new AppError('Producto no encontrado', 404, 'PRODUCT_NOT_FOUND');
    }

    const existingItem = await CartItem.findOne({
        where: {
            userId,
            productId,
        },
    });

    if (existingItem) {
        const newQuantity = existingItem.quantity + parsedQuantity;

        existingItem.quantity = newQuantity;
        await existingItem.save();

        return existingItem;
    }

    return CartItem.create({
        userId,
        productId,
        quantity: parsedQuantity,
    });
}

async function updateItem(userId, productId, quantity) {
    const parsedQuantity = parseInt(quantity, 10);

    if (Number.isNaN(parsedQuantity) || parsedQuantity <= 0) {
        throw new AppError('La cantidad debe ser mayor a 0', 400, 'INVALID_QUANTITY');
    }

    const item = await CartItem.findOne({
        where: {
            userId,
            productId,
        },
        include: [
            {
                model: Product,
                as: 'product',
            },
        ],
    });

    if (!item) {
        throw new AppError('Producto no encontrado en el carrito', 404, 'CART_ITEM_NOT_FOUND');
    }

    if (!item.product) {
        throw new AppError('Producto no disponible', 400, 'PRODUCT_NOT_AVAILABLE');
    }

    item.quantity = parsedQuantity;
    await item.save();

    return item;
}

async function removeItem(userId, productId) {
    const deleted = await CartItem.destroy({
        where: {
            userId,
            productId,
        }
    });

    if (!deleted) {
        throw new AppError('Producto no encontrado en el carrito', 404, 'CART_ITEM_NOT_FOUND');
    }

    return true;
}

async function clearCart(userId) {
    return CartItem.destroy({
        where: {
            userId,
        }
    });
}

async function getPreview(userId) {
    const cartItems = await getCartItems(userId);

    const items = cartItems
        .filter((item) => item.product)
        .map((item) => {
            const unitPrice = toNumber(item.product.price);
            const quantity = item.quantity;
            const subtotal = toNumber(unitPrice * quantity);

            return {
                productId: item.product.id,
                name: item.product.name,
                slug: item.product.slug,
                description: item.product.description,
                category: item.product.category,
                unitPrice: unitPrice,
                quantity,
                subtotal,
            };
        });
    
    const totalAmount = toNumber(items.reduce((sum, item) => sum + item.subtotal, 0));

    return {
        items,
        summary: {
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
            totalAmount,
        }
    };
}

module.exports = {
    addItem,
    updateItem,
    removeItem,
    clearCart,
    getPreview,
    getCartItems,
};