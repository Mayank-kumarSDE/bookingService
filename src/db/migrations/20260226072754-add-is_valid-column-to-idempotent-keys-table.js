export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE idempotency_keys 
      ADD COLUMN is_processed BOOLEAN NOT NULL DEFAULT FALSE;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE idempotency_keys 
      DROP COLUMN is_processed;
    `);
  }
};