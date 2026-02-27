export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      ADD COLUMN idempotencyKeyId INT NULL UNIQUE,
      ADD CONSTRAINT fk_bookings_idempotencyKeyId 
        FOREIGN KEY (idempotencyKeyId) 
        REFERENCES idempotency_keys(id) 
        ON DELETE SET NULL;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      DROP FOREIGN KEY fk_bookings_idempotencyKeyId,
      DROP COLUMN idempotencyKeyId;
    `);
  }
};