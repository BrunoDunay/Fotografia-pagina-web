import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Service = sequelize.define(
  'Service',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    slug: { type: DataTypes.STRING(80), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    shortDescription: DataTypes.STRING(300),
    description: DataTypes.TEXT,
    heroTitle: DataTypes.STRING(160),
    heroSubtitle: DataTypes.STRING(200),
    heroDescription: DataTypes.TEXT,
    heroMediaId: DataTypes.UUID,
    coverMediaId: DataTypes.UUID,
    videoUrl: DataTypes.TEXT,
    seoTitle: DataTypes.STRING(160),
    seoDescription: DataTypes.STRING(300),
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isVisible: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    isProvisional: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'services' },
);
