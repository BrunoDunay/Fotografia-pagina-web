import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const ServicePackage = sequelize.define(
  'ServicePackage',
  {
    serviceId: { type: DataTypes.UUID, primaryKey: true },
    packageId: { type: DataTypes.UUID, primaryKey: true },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'service_packages' },
);
