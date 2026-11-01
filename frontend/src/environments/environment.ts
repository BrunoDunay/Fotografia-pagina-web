/** Producción. */
export const environment = {
  production: true,
  /** URL absoluta de la API (Render): el render en servidor (SSR) también la usa. */
  apiUrl: 'https://armando-ovalle-api.onrender.com/api',
  /** Vacío = se usa el dominio con el que se visita el sitio (sirve igual con el dominio propio). */
  siteUrl: '',
  cloudinaryCloudName: '',
  /**
   * Reseñas de clientes (aprobadas el 1 nov 2026). Con false, el inicio muestra "Reseñas, muy pronto" y el panel
   * tiene la sección deshabilitada; para apagarlas también en la API: REVIEWS_ENABLED=false en Render.
   */
  reviewsEnabled: true,
};
