/**
 * Inserta transformaciones de Cloudinary en una URL de entrega.
 * Ej.: .../image/upload/v123/aows/x.jpg → .../image/upload/f_auto,q_auto,w_800/v123/aows/x.jpg
 * Si la URL no es de Cloudinary, se devuelve tal cual.
 */
export function cloudinaryUrl(url: string | null | undefined, options: { width?: number; height?: number; crop?: 'fill' | 'limit'; blur?: boolean } = {}): string {
  if (!url) return '';
  const marker = '/image/upload/';
  const index = url.indexOf(marker);
  if (index === -1) return url;

  const parts = ['f_auto', 'q_auto'];
  if (options.width) parts.push(`w_${options.width}`);
  if (options.height) parts.push(`h_${options.height}`);
  if (options.width || options.height) parts.push(`c_${options.crop ?? 'limit'}`);
  if (options.blur) parts.push('e_blur:1000');

  const head = url.slice(0, index + marker.length);
  const tail = url.slice(index + marker.length);
  return `${head}${parts.join(',')}/${tail}`;
}

/** Anchos intermedios: el navegador elige el más cercano a lo que realmente ocupa la foto. */
export const RESPONSIVE_WIDTHS = [320, 480, 640, 800, 1080, 1280, 1600, 2000, 2400];

/** srcset con varios anchos para imágenes responsivas. */
export function cloudinarySrcset(url: string | null | undefined, widths = RESPONSIVE_WIDTHS): string {
  if (!url || !url.includes('/image/upload/')) return '';
  return widths.map((w) => `${cloudinaryUrl(url, { width: w })} ${w}w`).join(', ');
}
