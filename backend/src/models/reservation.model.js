import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Reservation = sequelize.define(
  'Reservation',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    eventId: { type: DataTypes.UUID, allowNull: false, unique: true },
    publicCode: { type: DataTypes.STRING(16), allowNull: false, unique: true },
    displayTitle: { type: DataTypes.STRING(160), allowNull: false },
    monogram: DataTypes.STRING(12),
    message: DataTypes.TEXT,
    /** Diseño y color del ticket: combinaciones válidas en config/ticket-designs.js. */
    ticketDesign: { type: DataTypes.STRING(40), allowNull: false, defaultValue: 'envelope' },
    ticketPalette: { type: DataTypes.STRING(30), allowNull: false, defaultValue: 'mocha' },
    coverMediaId: DataTypes.UUID,
    showTime: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    showVenue: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'reservations' },
);
