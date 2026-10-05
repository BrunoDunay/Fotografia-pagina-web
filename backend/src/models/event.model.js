import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const EVENT_STATUSES = ['tentative', 'confirmed', 'completed', 'cancelled'];

export const Event = sequelize.define(
  'Event',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    clientId: { type: DataTypes.UUID, allowNull: false },
    serviceId: DataTypes.UUID,
    packageId: DataTypes.UUID,
    title: { type: DataTypes.STRING(160), allowNull: false },
    eventDate: { type: DataTypes.DATEONLY, allowNull: false },
    startTime: DataTypes.TIME,
    endTime: DataTypes.TIME,
    venue: DataTypes.STRING(200),
    city: DataTypes.STRING(120),
    totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false, defaultValue: 0 },
    status: { type: DataTypes.ENUM(...EVENT_STATUSES), allowNull: false, defaultValue: 'confirmed' },
    blocksAvailability: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
    notes: DataTypes.TEXT,
    confirmationSentAt: DataTypes.DATE,
  },
  { tableName: 'events' },
);
