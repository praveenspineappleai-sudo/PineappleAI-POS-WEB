'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('customers', [
      {
        customer_name: 'John Doe',
        customer_phoneno: '0771234456',
        customer_email: 'john.doe@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        customer_name: 'Nivethiga',
        customer_phoneno: '077123456',
        customer_email: 'nivethiga@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        customer_name: 'Thiviya',
        customer_phoneno: '0771253456',
        customer_email: 'thiviya@example.com',
        created_at: new Date(),
        updated_at: new Date(),
      },
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('customers', null, {});
  }
};