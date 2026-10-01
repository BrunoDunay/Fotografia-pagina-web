import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PackageFeature = sequelize.define(
  'PackageFeature',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    packageId: { type: DataTypes.UUID, allowNull: false },
    label: { type: DataTypes.STRING(160), allowNull: false },
    value: DataTypes.STRING(160),
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'package_features' },
);
