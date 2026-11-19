/**
 * Convierte el ticket (el mismo que ve el cliente) en una imagen JPG de 1080×1920.
 *
 * Safari (y todos los navegadores de iPhone/iPad, que usan su motor) arma la imagen antes de terminar de
 * pintar fotos y letras dentro de la copia: el primer intento sale solo con el fondo, o vacío (transparente,
 * que en la galería del teléfono se ve negro). Por eso:
 * - se espera a que carguen las fuentes y las fotos del ticket;
 * - en ese motor se arma varias veces y se usa la última;
 * - se guarda en JPG con fondo sólido, así nunca queda transparente.
 */
export const TICKET_WIDTH = 1080;
export const TICKET_HEIGHT = 1920;

/** iPhone, iPad (también el que se presenta como Mac) y Safari de escritorio. */
function usesWebKitRenderer(): boolean {
  const ua = navigator.userAgent;
  const ios = /iPad|iPhone|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  const desktopSafari = /Safari/.test(ua) && !/Chrome|Chromium|Edg|OPR|Firefox|Android/.test(ua);
  return ios || desktopSafari;
}

/** Espera a que cada foto del ticket esté descargada y decodificada. */
async function imagesReady(root: HTMLElement): Promise<void> {
  const images = [...root.querySelectorAll('img')];
  await Promise.all(
    images.map(async (img) => {
      if (!img.complete) {
        await new Promise<void>((resolve) => {
          img.addEventListener('load', () => resolve(), { once: true });
          img.addEventListener('error', () => resolve(), { once: true });
        });
      }
      await img.decode?.().catch(() => undefined);
    }),
  );
}

export async function renderTicketJpeg(element: HTMLElement, background = '#ffffff', quality = 0.92): Promise<Blob> {
  const { toCanvas } = await import('html-to-image');
  await document.fonts.ready;
  await imagesReady(element);

  const options = {
    pixelRatio: 1,
    canvasWidth: TICKET_WIDTH,
    canvasHeight: TICKET_HEIGHT,
    backgroundColor: background,
    // La sombra del ticket es para la pantalla, no para la imagen.
    style: { boxShadow: 'none' },
  };

  const passes = usesWebKitRenderer() ? 3 : 1;
  let canvas = await toCanvas(element, options);
  for (let i = 1; i < passes; i++) canvas = await toCanvas(element, options);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('No se pudo generar la imagen del ticket.');
  return blob;
}

/** Descarga un archivo directo (sin el menú de compartir del teléfono). */
export function downloadBlob(blob: Blob, fileName: string): void {
  const url = URL.createObjectURL(blob);
  const link = Object.assign(document.createElement('a'), { href: url, download: fileName, rel: 'noopener' });
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
