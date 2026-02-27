import { Model } from 'sequelize';

export default (sequelize, DataTypes) => {
  class IdempotencyKey extends Model {
    static associate(models) {
      // Define association with Booking
      IdempotencyKey.hasOne(models.Booking, {
        foreignKey: 'idempotencyKeyId',
        as: 'booking',
        onDelete: 'SET NULL'
      });
    }
  }

  IdempotencyKey.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
      },
      key: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
      },
      is_processed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false  // Default is FALSE
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
      }
    },
    {
      sequelize,
      modelName: 'IdempotencyKey',
      tableName: 'idempotency_keys',
      timestamps: false, // We handle created_at and updated_at manually
      underscored: true, 
      freezeTableName: true 
    }
  );

  return IdempotencyKey;
};