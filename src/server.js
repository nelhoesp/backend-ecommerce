const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');
const authRoutes = require('./routes/auth.routes');

require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.get('/', (req, res) => {
    res.json({
        message: 'API is running'
    });
});

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('Conexión a la base de datos MySQL exitosa');

        app.listen(PORT, () => {
            console.log(`El servidor está corriendo en el puerto ${PORT}`);
        });
    } catch (error) {
        console.error('Error conectando a la base de datos:', error);
    }
}

startServer();