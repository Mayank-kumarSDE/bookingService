export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      ADD COLUMN total_guests INT NOT NULL DEFAULT 1 AFTER hotel_id;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      DROP COLUMN total_guests;
    `);
  }
};