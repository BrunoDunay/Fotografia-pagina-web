import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Package = sequelize.define(
  'Package',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    name: { type: DataTypes.STRING(120), allowNull: false },
    subtitle: DataTypes.STRING(200),
    price: DataTypes.DECIMAL(10, 2),
    currency: { type: DataTypes.CHAR(3), allowNull: false, defaultValue: 'MXN' },
    isPriceProvisional: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isFeatured: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'packages' },
);
