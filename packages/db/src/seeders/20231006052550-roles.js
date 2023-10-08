'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {})
    await queryInterface.sequelize.query(
      'ALTER SEQUENCE "Roles_id_seq" RESTART WITH 1',
    )
    await queryInterface.bulkInsert(
      'Roles',
      [
        {
          name: 'admin',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'dietician',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          name: 'patient',
          description: '',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Roles', null, {})
  },
}
