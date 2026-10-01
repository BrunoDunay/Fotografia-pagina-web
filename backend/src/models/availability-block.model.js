import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const AvailabilityBlock = sequelize.define(
  'AvailabilityBlock',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    date: { type: DataTypes.DATEONLY, allowNull: false, unique: true },
    privateReason: DataTypes.STRING(200),
  },
  { tableName: 'availability_blocks' },
);
