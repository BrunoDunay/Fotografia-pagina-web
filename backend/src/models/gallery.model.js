import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Gallery = sequelize.define(
  'Gallery',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    serviceId: { type: DataTypes.UUID, unique: true },
    title: { type: DataTypes.STRING(160), allowNull: false },
    coverMediaId: DataTypes.UUID,
    maxImages: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 60 },
  },
  { tableName: 'galleries' },
);
