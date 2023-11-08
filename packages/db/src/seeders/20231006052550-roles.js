'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {})
    await queryInterface.sequelize.query(
      'ALTER SEQUENCE "roles_id_seq" RESTART WITH 1',
    )
    await queryInterface.bulkInsert(
      'roles',
      [
        {
          name: 'admin',
          description: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'dietician',
          description: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          name: 'patient',
          description: '',
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('roles', null, {})
  },
}
