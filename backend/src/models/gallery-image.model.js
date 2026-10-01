import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const GalleryImage = sequelize.define(
  'GalleryImage',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    galleryId: { type: DataTypes.UUID, allowNull: false },
    mediaId: { type: DataTypes.UUID, allowNull: false },
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
  },
  { tableName: 'gallery_images' },
);
