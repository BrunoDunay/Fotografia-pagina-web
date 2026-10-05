/**
 * Feria de San Marcos: en lugar de confeti, fuegos artificiales en verde, blanco y rojo
 * (uno dibuja "AGS" y otros estallan en forma de flor).
 *
 * `ALTER TYPE … ADD VALUE` no puede usarse en la misma transacción que lo agrega (autocommit).
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`ALTER TYPE theme_decoration ADD VALUE IF NOT EXISTS 'fireworks_feria'`);
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'fireworks_feria' WHERE key = 'san-marcos'`);
}

export async function down({ context: sequelize }) {
  // Los valores de un ENUM no se pueden quitar en PostgreSQL; se revierte el dato.
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'confetti' WHERE key = 'san-marcos'`);
}
