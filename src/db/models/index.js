import Sequelize from 'sequelize';
import Booking from './booking.js';
import { sequelize } from './sequelize.js';
import IdempotencyKey from './idempotencyKeys.js';

// Initialize models
const BookingModel = Booking(sequelize, Sequelize.DataTypes);
const IdempotencyKeyModel = IdempotencyKey(sequelize, Sequelize.DataTypes);

// Create models object for associations
const models = {
  Booking: BookingModel,
  IdempotencyKey: IdempotencyKeyModel
};

// Setup associations
Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

// Export the INITIALIZED models (not the functions!)
export { sequelize };
export { BookingModel as Booking };
export { IdempotencyKeyModel as IdempotencyKey };
export default models;