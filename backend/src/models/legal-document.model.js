import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const LEGAL_TYPES = ['contract', 'terms', 'privacy'];

export const LegalDocument = sequelize.define(
  'LegalDocument',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    type: { type: DataTypes.ENUM(...LEGAL_TYPES), allowNull: false, unique: true },
    title: { type: DataTypes.STRING(160), allowNull: false },
    version: { type: DataTypes.STRING(40), allowNull: false, defaultValue: '0.1' },
    intro: DataTypes.TEXT,
    sections: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
    isProvisional: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'legal_documents' },
);
