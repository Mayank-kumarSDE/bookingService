export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE idempotency_keys 
      CHANGE COLUMN expiresAt expires_at TIMESTAMP NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE idempotency_keys 
      CHANGE COLUMN expires_at expiresAt TIMESTAMP NULL
    `);
  }
};