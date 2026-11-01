/** Producción. */
export const environment = {
  production: true,
  /** URL absoluta de la API (Render): el render en servidor (SSR) también la usa. */
  apiUrl: 'https://armando-ovalle-api.onrender.com/api',
  /** Vacío = se usa el dominio con el que se visita el sitio (sirve igual con el dominio propio). */
  siteUrl: '',
  cloudinaryCloudName: '',
  /**
   * Reseñas de clientes: apagadas hasta que se aprueben. Mientras tanto, el inicio muestra "Reseñas, muy pronto"
   * y el panel tiene la sección deshabilitada. Para activarlas: true aquí y REVIEWS_ENABLED=true en la API.
   */
  reviewsEnabled: false,
};
