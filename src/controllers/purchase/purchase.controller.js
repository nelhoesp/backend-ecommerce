const purchaseService = require('../../services/purchase/purchase.service');

async function listMyPurchases(req, res) {
  try {
    const userId = req.user.id;

    const result = await purchaseService.listMyPurchases(userId, req.query);

    return res.json({
        message: 'Compras obtenidas correctamente',
        data: result.purchases,
        pagination: result.pagination,
        filters: result.filters,
    });
  } catch (error) {
    console.error('Error obteniendo compras del usuario:', error);

    return res.status(error.statusCode || 500).json({
      message: error.message || 'Error interno del servidor',
      code: error.code || 'INTERNAL_ERROR',
    });
  }
}

module.exports = {
    listMyPurchases,
};
