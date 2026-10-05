/** Ningún tema muestra ya el copo junto al logotipo (faltaba quitarlo en Invierno). */

export async function up({ context: sequelize }) {
  await sequelize.query(`UPDATE seasonal_themes SET navbar_badge = NULL`);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`UPDATE seasonal_themes SET navbar_badge = '❄' WHERE key = 'winter'`);
}
