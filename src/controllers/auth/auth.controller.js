const { User } = require('../../../models');
const authService = require('../../services/auth/auth.service');

async function register(req, res) {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: 'Nombre, email y contraseña son obligatorios',
                code: 'MISSING_CREDENTIALS',
            });
        }

        if (password.length < process.env.PASSWORD_MIN_LENGTH) {
            return res.status(400).json({
                message: `La contraseña debe tener al menos ${process.env.PASSWORD_MIN_LENGTH} caracteres`,
                code: 'WEAK_PASSWORD',
            });
        }

        const user = await authService.createUser(name, email, password);

        return res.status(201).json({
            message: 'Usuario registrado exitosamente',
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
            }
        });

    } catch (error) {
        console.error('Error durante el registro:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
            details: error.details || null,
        });
    }
}

async function login (req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: 'Email y contraseña son obligatorios',
                code: 'MISSING_CREDENTIALS',
            });
        }

        const token = await authService.authenticateUser(email, password);

        return res.status(200).json({
            message: 'Login exitoso',
            token,
        });

    } catch (error) {
        console.error('Error durante el login:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
            details: error.details || null,
        });
    }
}

async function getProfile(req, res) {
    try {
        return res.status(200).json({
            message: 'Perfil del usuario',
            user: {
                name: req.user.name,
                email: req.user.email,
            }
        });

    } catch (error) {
        console.error('Error al obtener el perfil:', error);

        return res.status(error.statusCode || 500).json({
            message: error.message || 'Error interno del servidor',
            code: error.code || 'INTERNAL_SERVER_ERROR',
            details: error.details || null,
        });
    }
}

module.exports = {
    register,
    login,
    getProfile,
}