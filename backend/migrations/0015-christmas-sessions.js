/**
 * Servicio de temporada: Sesiones navideñas 2026, con su paquete "Christmas" ($2,500, precio visible).
 * Textos del fotógrafo (mensajes corto y largo). Título de portada y SEO completados a partir de ellos.
 * Sin fotos por ahora: el fotógrafo las sube desde el panel.
 * Solo se crea si el servicio no existe; nunca sobrescribe lo editado desde el panel.
 */

const SLUG = 'christmas-sessions';

const SHORT =
  '🎄✨ ¡La magia de la Navidad ya llegó! Reserva tu sesión navideña y captura momentos únicos e inolvidables junto a tus seres queridos. ❤️📸';

const LONG = `🎄✨ ¡LA MAGIA DE LA NAVIDAD LLEGA A NUESTRO ESTUDIO! ✨🎅🏻

La época más bonita del año está por llegar, y queremos ser parte de tus recuerdos más especiales. ❤️

Te invitamos a vivir la experiencia de nuestras SESIONES NAVIDEÑAS 2026, un espacio lleno de magia, luces, alegría y detalles especiales, donde podrás disfrutar junto a tu familia, pareja o personas favoritas.

Porque la Navidad no solo se trata de regalos, sino de compartir momentos, sonrisas y crear recuerdos que permanezcan para siempre. 📸❄️`;

const FEATURES = [
  'Hasta 4 personas (persona extra: $200)',
  '30 minutos de sesión',
  '30 fotografías editadas y digitales',
  '2 cambios de vestuario',
  'Pet friendly: tu mascota también sale en la foto',
  'Set navideño con luces y decoración en el estudio',
];

export async function up({ context: sequelize }) {
  // En una base nueva (sin servicios) no se hace nada: el contenido inicial se carga solo si las tablas están vacías.
  const [[{ count }]] = await sequelize.query(`SELECT count(*)::int AS count FROM services`);
  if (!count) return;

  const [rows] = await sequelize.query(
    `INSERT INTO services
       (slug, name, short_description, description, hero_title, hero_subtitle, hero_description,
        seo_title, seo_description, sort_order, is_visible, is_provisional)
     VALUES
       (:slug, 'Sesiones navideñas', :short, :long, 'Sesiones navideñas',
        'Sesiones navideñas 2026', :short,
        'Sesiones navideñas 2026 en Aguascalientes | Armando Ovalle',
        'Sesión de fotos navideña en estudio para familia, pareja o amigos: hasta 4 personas, 30 fotos editadas y pet friendly. Reserva tu fecha.',
        (SELECT COALESCE(MIN(sort_order), 0) - 1 FROM services), true, false)
     ON CONFLICT (slug) DO NOTHING
     RETURNING id`,
    { replacements: { slug: SLUG, short: SHORT, long: LONG } },
  );
  const serviceId = rows[0]?.id;
  if (!serviceId) return; // ya existía: no se toca

  // Galería vacía: sin ella el panel no muestra dónde subir las fotos (la API la crea al dar de alta un servicio).
  await sequelize.query(`INSERT INTO galleries (service_id, title) VALUES (:serviceId, 'Sesiones navideñas')`, {
    replacements: { serviceId },
  });

  const [[pkg]] = await sequelize.query(
    `INSERT INTO packages (name, subtitle, price, currency, is_price_provisional, is_featured, is_active, sort_order)
     VALUES ('Christmas', 'Sesión navideña 2026', 2500, 'MXN', false, true, true, 0)
     RETURNING id`,
  );
  for (const [i, label] of FEATURES.entries()) {
    await sequelize.query(`INSERT INTO package_features (package_id, label, sort_order) VALUES (:pkg, :label, :i)`, {
      replacements: { pkg: pkg.id, label, i },
    });
  }
  await sequelize.query(`INSERT INTO service_packages (service_id, package_id, sort_order) VALUES (:serviceId, :pkg, 0)`, {
    replacements: { serviceId, pkg: pkg.id },
  });
}

export async function down({ context: sequelize }) {
  await sequelize.query(
    `DELETE FROM packages WHERE id IN (
       SELECT sp.package_id FROM service_packages sp JOIN services s ON s.id = sp.service_id WHERE s.slug = :slug)`,
    { replacements: { slug: SLUG } },
  );
  await sequelize.query(`DELETE FROM services WHERE slug = :slug`, { replacements: { slug: SLUG } });
}
