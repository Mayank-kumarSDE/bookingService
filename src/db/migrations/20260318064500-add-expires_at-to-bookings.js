export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('bookings', 'expires_at', {
      type: Sequelize.DATE,
      allowNull: true,
      defaultValue: null,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('bookings', 'expires_at');
  }
};
