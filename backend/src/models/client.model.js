import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Client = sequelize.define(
  'Client',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING(160), allowNull: false },
    phone: DataTypes.STRING(40),
    email: DataTypes.STRING(160),
    notes: DataTypes.TEXT,
  },
  { tableName: 'clients' },
);
