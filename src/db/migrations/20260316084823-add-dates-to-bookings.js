export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings
      ADD COLUMN start_date DATETIME NOT NULL AFTER hotel_id
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE bookings
      ADD COLUMN end_date DATETIME NOT NULL AFTER start_date
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_bookings_hotel_dates ON bookings(hotel_id, start_date, end_date)
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP INDEX idx_bookings_hotel_dates ON bookings
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE bookings
      DROP COLUMN end_date
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE bookings
      DROP COLUMN start_date
    `);
  }
};