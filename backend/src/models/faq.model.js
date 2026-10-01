import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Faq = sequelize.define(
  'Faq',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    question: { type: DataTypes.STRING(300), allowNull: false },
    answer: { type: DataTypes.TEXT, allowNull: false },
    serviceId: DataTypes.UUID,
    sortOrder: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'faqs' },
);
