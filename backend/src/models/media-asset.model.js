import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const MediaAsset = sequelize.define(
  'MediaAsset',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    cloudinaryPublicId: { type: DataTypes.STRING(255), allowNull: false, unique: true },
    secureUrl: { type: DataTypes.TEXT, allowNull: false },
    width: DataTypes.INTEGER,
    height: DataTypes.INTEGER,
    format: DataTypes.STRING(16),
    bytes: DataTypes.INTEGER,
    altText: DataTypes.STRING(255),
    folder: DataTypes.STRING(160),
    resourceType: { type: DataTypes.STRING(10), allowNull: false, defaultValue: 'image' },
  },
  { tableName: 'media_assets' },
);
