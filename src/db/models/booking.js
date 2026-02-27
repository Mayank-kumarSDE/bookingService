// src/db/models/booking.js
import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.IdempotencyKey, {
        foreignKey: 'idempotency_key_id',
        as: 'idempotencyKey',
        onDelete: 'SET NULL'
      });
    }
  }
  
  Booking.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    hotel_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    total_guests: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1
    },
    booking_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'pending'
    },
    idempotency_key_id: {
      type: DataTypes.INTEGER,
      allowNull: true,  // Allow NULL for existing bookings
      unique: true,     // One booking per idempotency key
      references: {
        model: 'idempotency_keys',
        key: 'id'
      }
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: DataTypes.NOW
    }
  }, {
    sequelize,
    modelName: 'Booking',
    tableName: 'bookings',
    timestamps: false, // Using manual created_at and updated_at
    underscored: true,
  });
  
  return Booking;
};