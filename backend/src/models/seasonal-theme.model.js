import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const THEME_DECORATIONS = [
  'none',
  'snow',
  'christmas',
  'hearts',
  'petals',
  'sunshine',
  'leaves',
  'confetti',
  'papel_picado',
  'dia_de_muertos',
  'fireworks',
  'mothers_day',
];

export const SeasonalTheme = sequelize.define(
  'SeasonalTheme',
  {
    id: { type: DataTypes.UUID, primaryKey: true, defaultValue: DataTypes.UUIDV4 },
    key: { type: DataTypes.STRING(60), allowNull: false, unique: true },
    name: { type: DataTypes.STRING(120), allowNull: false },
    startMonth: { type: DataTypes.SMALLINT, allowNull: false },
    startDay: { type: DataTypes.SMALLINT, allowNull: false },
    endMonth: { type: DataTypes.SMALLINT, allowNull: false },
    endDay: { type: DataTypes.SMALLINT, allowNull: false },
    autoEnabled: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    priority: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    decoration: { type: DataTypes.ENUM(...THEME_DECORATIONS), allowNull: false, defaultValue: 'none' },
    tokenOverrides: { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
    heroMediaId: DataTypes.UUID,
    navbarBadge: DataTypes.STRING(60),
    isActive: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
  },
  { tableName: 'seasonal_themes' },
);
