import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const REVIEW_STATUSES = ['pending', 'published', 'hidden'];

export const Review = sequelize.define(
  'Review',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    authorName: { type: DataTypes.STRING(60), allowNull: false },
    eventLabel: { type: DataTypes.STRING(80), allowNull: false },
    rating: { type: DataTypes.SMALLINT, allowNull: false },
    comment: { type: DataTypes.TEXT, allowNull: false },
    photoMediaId: DataTypes.UUID,
    status: { type: DataTypes.STRING(12), allowNull: false, defaultValue: 'pending' },
    reply: DataTypes.TEXT,
    repliedAt: DataTypes.DATE,
    publishedAt: DataTypes.DATE,
  },
  { tableName: 'reviews' },
);
