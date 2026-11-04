/**
 * Arreglo de Sesiones navideñas (0015):
 * - La migración 0015 creó el servicio sin su galería (la API la crea sola al dar de alta un servicio, la migración no).
 *   Sin galería, el panel no mostraba el gestor para subir fotos en la pestaña "Galería". Aquí se crea para
 *   cualquier servicio que no la tenga (idempotente: no toca las que ya existen).
 * - Título del encabezado más corto: "Sesiones navideñas" (el anterior era tan largo que la letra tapaba la foto).
 *   Solo se cambia si todavía tiene el texto original; si Armando ya lo editó desde el panel, no se toca.
 */

const SLUG = 'christmas-sessions';
const OLD_TITLE = '¡La magia de la Navidad llega a nuestro estudio!';
const NEW_TITLE = 'Sesiones navideñas';

export async function up({ context: sequelize }) {
  await sequelize.query(
    `INSERT INTO galleries (service_id, title)
     SELECT s.id, s.name FROM services s
     WHERE NOT EXISTS (SELECT 1 FROM galleries g WHERE g.service_id = s.id)`,
  );
  await sequelize.query(`UPDATE services SET hero_title = :newTitle WHERE slug = :slug AND hero_title = :oldTitle`, {
    replacements: { slug: SLUG, newTitle: NEW_TITLE, oldTitle: OLD_TITLE },
  });
}

export async function down({ context: sequelize }) {
  await sequelize.query(`UPDATE services SET hero_title = :oldTitle WHERE slug = :slug AND hero_title = :newTitle`, {
    replacements: { slug: SLUG, newTitle: NEW_TITLE, oldTitle: OLD_TITLE },
  });
  // La galería creada se deja: está vacía y es inofensiva.
}
