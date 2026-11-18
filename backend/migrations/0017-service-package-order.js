/**
 * Desde la v1.8.0, cada servicio ordena sus propios paquetes (service_packages.sort_order) y la página del
 * servicio usa ese orden. Antes la página usaba el orden general de Paquetes, y el sort_order de cada servicio
 * guardaba solo el orden en que se habían marcado las casillas. Para que las páginas se vean igual que antes,
 * cada servicio arranca con el orden general (0, 1, 2… dentro del servicio). Después Armando lo cambia
 * arrastrando las tarjetas.
 */
export async function up({ context: sequelize }) {
  await sequelize.query(`
    UPDATE service_packages sp
    SET sort_order = r.rn
    FROM (
      SELECT sp2.service_id, sp2.package_id,
             ROW_NUMBER() OVER (PARTITION BY sp2.service_id ORDER BY p.sort_order, p.name) - 1 AS rn
      FROM service_packages sp2
      JOIN packages p ON p.id = sp2.package_id
    ) r
    WHERE sp.service_id = r.service_id AND sp.package_id = r.package_id
  `);
}

export async function down() {
  // El orden anterior (el de las casillas) no se usaba en ninguna parte: no hay nada que restaurar.
}
