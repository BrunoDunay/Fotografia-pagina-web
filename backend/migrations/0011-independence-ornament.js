/**
 * Día de la Independencia: ya no lleva banderines de papel picado sobre la foto de portada;
 * su adorno es el arreglo con banderas que cuelga bajo el logotipo.
 */

export async function up({ context: sequelize }) {
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'none' WHERE key = 'independence'`);
}

export async function down({ context: sequelize }) {
  await sequelize.query(`UPDATE seasonal_themes SET decoration = 'papel_picado' WHERE key = 'independence'`);
}
