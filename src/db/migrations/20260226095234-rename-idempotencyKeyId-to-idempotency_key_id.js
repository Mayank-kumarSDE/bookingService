export default {
  async up(queryInterface, Sequelize) {
    // Step 1: Drop the foreign key constraint
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      DROP FOREIGN KEY fk_bookings_idempotencyKeyId
    `);
    
    // Step 2: Rename the column
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      CHANGE COLUMN idempotencyKeyId idempotency_key_id INT NULL UNIQUE
    `);
    
    // Step 3: Recreate the foreign key with new column name
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT fk_bookings_idempotency_key_id 
        FOREIGN KEY (idempotency_key_id) 
        REFERENCES idempotency_keys(id) 
        ON DELETE SET NULL
    `);
  },

  async down(queryInterface, Sequelize) {
    // Step 1: Drop the new foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      DROP FOREIGN KEY fk_bookings_idempotency_key_id
    `);
    
    // Step 2: Rename column back
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      CHANGE COLUMN idempotency_key_id idempotencyKeyId INT NULL UNIQUE
    `);
    
    // Step 3: Recreate original foreign key
    await queryInterface.sequelize.query(`
      ALTER TABLE bookings 
      ADD CONSTRAINT fk_bookings_idempotencyKeyId 
        FOREIGN KEY (idempotencyKeyId) 
        REFERENCES idempotency_keys(id) 
        ON DELETE SET NULL
    `);
  }
};