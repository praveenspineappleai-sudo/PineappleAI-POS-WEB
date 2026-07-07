'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('sizes', [
      {
        size: 'S',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        size: 'M',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        size: 'L',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        size: 'XL',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        size: 'XXL',
        created_at: new Date(),
        updated_at: new Date(),
      }
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('sizes', null, {});
  }
};
