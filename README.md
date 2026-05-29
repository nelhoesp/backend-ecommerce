# Sistema Backend para un Ecommerce con NodeJS

Backend desarrollado con Express.js y Sequelize para gestionar un ecommerce. Incluye autenticación, catálogo de productos, carrito de compras, procesamiento de pagos con Stripe e historial de compras.

## Requisitos

- Node.js v18 o superior
- npm o yarn
- Docker y Docker Compose (opcional, para la base de datos)
- MySQL 8.0

## Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd <project-name>
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crear un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
PORT=3000
NODE_ENV=development

# Base de datos
DB_HOST=localhost
DB_PORT=3306
DB_USER=ecommerce_user
DB_PASSWORD=tu_password
DB_NAME=ecommerce_db
DB_ROOT_PASSWORD=root_password

# JWT
JWT_SECRET=tu_jwt_secret_key

# Stripe
STRIPE_SECRET_KEY=tu_stripe_secret_key
STRIPE_PUBLIC_KEY=tu_stripe_public_key
```

### 4. Iniciar la base de datos

Con Docker Compose:

```bash
docker-compose up -d
```

Sin Docker (asegúrate de tener MySQL corriendo localmente):

```bash
mysql -u root -p
CREATE DATABASE ecommerce_db;
CREATE USER 'ecommerce_user'@'localhost' IDENTIFIED BY 'password';
GRANT ALL PRIVILEGES ON ecommerce_db.* TO 'ecommerce_user'@'localhost';
FLUSH PRIVILEGES;
```

### 5. Ejecutar migraciones

```bash
npx sequelize-cli db:migrate
```

### 6. Cargar datos iniciales (opcional)

```bash
npx sequelize-cli db:seed:all
```

### 7. Iniciar el servidor

En desarrollo con recarga automática:

```bash
npm run dev
```

En producción:

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`.

## Estructura del Proyecto

```
src/
├── server.js                 # Punto de entrada de la aplicación
├── config/
│   └── database.js          # Configuración de la base de datos
├── controllers/             # Lógica de negocio
│   ├── auth/
│   ├── cart/
│   ├── payment/
│   ├── products/
│   └── purchase/
├── services/                # Servicios auxiliares
│   ├── auth/
│   ├── cart/
│   ├── payment/
│   ├── products/
│   └── purchase/
├── routes/                  # Definición de rutas
│   ├── auth.routes.js
│   ├── cart.routes.js
│   ├── payment.routes.js
│   ├── product.route.js
│   └── purchase.routes.js
├── middlewares/             # Middleware de Express
│   └── auth.middleware.js
├── errors/                  # Manejo de errores personalizado
│   └── AppError.js
└── utils/                   # Funciones de utilidad
    ├── generateToken.js
    └── parsers.js

models/                      # Modelos de Sequelize
├── user.js
├── product.js
├── cart-item.js
├── order.js
├── order-item.js
└── index.js

migrations/                  # Migraciones de base de datos
seeders/                     # Datos iniciales para la BD
config/                      # Configuración general
```

## Endpoints

### Autenticación (`/api/auth`)

| Método | Ruta | Descripción | Requiere Token |
|--------|------|-------------|---|
| POST | `/register` | Registrar nuevo usuario | No |
| POST | `/login` | Iniciar sesión | No |
| GET | `/profile` | Obtener perfil del usuario | Sí |

### Productos (`/api/products`)

| Método | Ruta | Descripción | Requiere Token |
|--------|------|-------------|---|
| GET | `/` | Listar todos los productos | No |
| GET | `/:slug` | Obtener producto por slug | No |

### Carrito (`/api/cart`)

| Método | Ruta | Descripción | Requiere Token |
|--------|------|-------------|---|
| GET | `/preview` | Ver contenido del carrito | Sí |
| POST | `/items` | Añadir producto al carrito | Sí |
| PATCH | `/items/:productId` | Actualizar cantidad de producto | Sí |
| DELETE | `/items/:productId` | Eliminar producto del carrito | Sí |
| DELETE | `/clear` | Vaciar carrito | Sí |

### Pagos (`/api/payments`)

| Método | Ruta | Descripción | Requiere Token |
|--------|------|-------------|---|
| POST | `/stripe/create-checkout-session` | Crear sesión de pago Stripe | Sí |
| GET | `/stripe/verify-session/:sessionId` | Verificar estado de sesión de pago | Sí |
| PATCH | `/orders/:orderId/cancel` | Cancelar una orden | Sí |

### Compras (`/api/my-purchases`)

| Método | Ruta | Descripción | Requiere Token |
|--------|------|-------------|---|
| GET | `/` | Obtener historial de compras del usuario | Sí |

## Flujo de Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. El token debe enviarse en el header `Authorization` con el formato:

```
Authorization: Bearer <token>
```

El token se obtiene mediante el login y debe incluirse en todas las rutas que requieran autenticación.

## Base de Datos

La base de datos contiene las siguientes tablas:

- **users**: Información de usuarios registrados
- **products**: Catálogo de productos
- **cart_items**: Items en el carrito de cada usuario
- **orders**: Órdenes de compra
- **order_items**: Detalle de productos en cada orden

Las migraciones se ejecutan automáticamente y crean la estructura necesaria.

## Tecnologías Utilizadas

- **Express.js**: Framework web
- **Sequelize**: ORM para Node.js
- **MySQL**: Base de datos
- **JWT**: Autenticación
- **Bcrypt**: Hash de contraseñas
- **Stripe**: Procesamiento de pagos
- **Dotenv**: Gestión de variables de entorno
- **CORS**: Control de acceso entre dominios

## Scripts Disponibles

- `npm run dev`: Inicia el servidor en modo desarrollo con recarga automática
- `npm start`: Inicia el servidor en producción
- `npm test`: Ejecuta pruebas (no configurado)