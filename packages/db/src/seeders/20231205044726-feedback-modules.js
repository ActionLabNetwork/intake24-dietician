'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
     */
    const date = new Date()
    await queryInterface.bulkInsert(
      'feedback_module',
      [
        {
          id: 1,
          name: 'Meal diary',
          created_at: date,
          updated_at: date,
        },
        {
          id: 2,
          name: 'Carbs exchange',
          created_at: date,
          updated_at: date,
        },
        {
          id: 3,
          name: 'Energy intake',
          created_at: date,
          updated_at: date,
        },
        {
          id: 4,
          name: 'Fibre intake',
          created_at: date,
          updated_at: date,
        },
        {
          id: 5,
          name: 'Water intake',
          created_at: date,
          updated_at: date,
        },
      ],
      {},
    )
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    await queryInterface.bulkDelete('feedback-modules', null, {})
    await queryInterface.sequelize.query(
      'ALTER SEQUENCE "feedback-modules_id_seq" RESTART WITH 1',
    )
  },
}
