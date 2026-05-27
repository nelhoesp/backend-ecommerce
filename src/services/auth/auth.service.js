const bcrypt = require('bcrypt');
const { User } = require('../../../models');
const AppError = require('../../errors/AppError');

require('dotenv').config();

const generateToken = require('../../utils/generateToken');

async function createUser(name, email, password) {
    const existingUser = await User.findOne({ where: { email } });

    if (existingUser) {
        throw new AppError('El email ya está registrado', 409, 'EMAIL_ALREADY_EXISTS');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        name,
        email,
        password: hashedPassword
    });

    return user;
}

async function authenticateUser(email, password) {
    const user = await User.findOne({ where: { email } });

    if (!user) {
        throw new AppError('El email o la contraseña son incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        throw new AppError('El email o la contraseña son incorrectos', 401, 'INVALID_CREDENTIALS');
    }

    const token = generateToken(user);

    return token;
}

module.exports = {
    createUser,
    authenticateUser,
};