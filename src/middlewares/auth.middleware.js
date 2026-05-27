const jwt = require('jsonwebtoken');
const { User } = require('../../models');

async function authMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: 'Token no proporcionado',
        code: 'TOKEN_NOT_PROVIDED',
      });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return res.status(401).json({
        message: 'Formato de token inválido',
        code: 'INVALID_TOKEN_FORMAT',
      });
    }

    const token = parts[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id, {
      attributes: {
        exclude: ['password'],
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'Usuario no encontrado',
        code: 'USER_NOT_FOUND',
      });
    }

    req.user = user;

    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Token inválido o expirado',
      code: 'INVALID_OR_EXPIRED_TOKEN',
    });
  }
}

module.exports = authMiddleware;