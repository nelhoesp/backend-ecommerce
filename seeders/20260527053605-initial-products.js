'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Products', [
      {
        name: 'Laptop Lenovo IdeaPad 3',
        slug: 'laptop-lenovo-ideapad-3',
        description: 'Laptop básica para estudio, oficina y navegación diaria.',
        category: 'Tecnología',
        price: 1899.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Mouse inalámbrico Logitech',
        slug: 'mouse-inalambrico-logitech',
        description: 'Mouse ergonómico inalámbrico para uso diario.',
        category: 'Accesorios',
        price: 79.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Teclado mecánico RGB',
        slug: 'teclado-mecanico-rgb',
        description: 'Teclado mecánico con iluminación RGB y switches táctiles.',
        category: 'Accesorios',
        price: 159.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Monitor Samsung 24 pulgadas',
        slug: 'monitor-samsung-24',
        description: 'Monitor Full HD de 24 pulgadas para oficina y gaming casual.',
        category: 'Tecnología',
        price: 649.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Audífonos Bluetooth',
        slug: 'audifonos-bluetooth',
        description: 'Audífonos inalámbricos con estuche de carga.',
        category: 'Audio',
        price: 129.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        name: 'Silla ergonómica de oficina',
        slug: 'silla-ergonomica-oficina',
        description: 'Silla cómoda con soporte lumbar para largas jornadas.',
        category: 'Oficina',
        price: 399.90,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Products', null, {});
  }
};
