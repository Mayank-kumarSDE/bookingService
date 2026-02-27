export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      CHANGE COLUMN bookingAmount booking_amount DECIMAL(10,2) NOT NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      CHANGE COLUMN booking_amount bookingAmount DECIMAL(10,2) NOT NULL;
    `);
  }
};