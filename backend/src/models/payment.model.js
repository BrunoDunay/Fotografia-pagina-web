import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const PAYMENT_CONCEPTS = ['apartado', 'abono', 'liquidacion', 'otro'];
export const PAYMENT_METHODS = ['efectivo', 'transferencia', 'tarjeta', 'otro'];

export const Payment = sequelize.define(
  'Payment',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    eventId: { type: DataTypes.UUID, allowNull: false },
    amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    paidAt: { type: DataTypes.DATEONLY, allowNull: false },
    concept: { type: DataTypes.ENUM(...PAYMENT_CONCEPTS), allowNull: false, defaultValue: 'abono' },
    method: { type: DataTypes.ENUM(...PAYMENT_METHODS), allowNull: false, defaultValue: 'efectivo' },
    notes: DataTypes.TEXT,
  },
  { tableName: 'payments' },
);
