import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import compression from 'compression';
import express from 'express';
import { join } from 'node:path';
import { environment } from './environments/environment';

/**
 * Servidor del sitio (SSR) para alojarlo en un servidor Node propio (VPS, Render, etc.).
 * En Netlify NO se usa: ahí corre `server.ts`. Se compila con `npm run build:node`.
 * Variables de entorno en producción:
 * - PORT: puerto (por defecto 4000).
 * - NG_ALLOWED_HOSTS: dominios permitidos, separados por coma (ej. "armandoovalle.com,www.armandoovalle.com").
 *   Angular rechaza cualquier otro Host para evitar SSRF.
 * - SITE_URL / API_URL: sobrescriben las URLs del build (sitemap y robots).
 */
const browserDistFolder = join(import.meta.dirname, '../browser');
/** URL pública: variable de entorno, la del build o, si no hay, el dominio de la petición. */
const siteUrlOf = (req: express.Request) => (process.env['SITE_URL'] || environment.siteUrl || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
const apiUrl = (process.env['API_URL'] || environment.apiUrl).replace(/\/$/, '');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.disable('x-powered-by');
app.use(compression());

/** Encabezados de seguridad básicos para todas las respuestas. */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (environment.production) res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

/** robots.txt: el panel, el login y los tickets privados no se indexan. */
app.get('/robots.txt', (req, res) => {
  const siteUrl = siteUrlOf(req);
  res.type('text/plain').set('Cache-Control', 'public, max-age=86400');
  res.send(['User-agent: *', 'Allow: /', 'Disallow: /panel', 'Disallow: /login', 'Disallow: /reservation/', '', `Sitemap: ${siteUrl}/sitemap.xml`, ''].join('\n'));
});

/** sitemap.xml: páginas fijas + cada servicio visible (se actualiza solo al publicar/ocultar servicios). */
const STATIC_PAGES = ['/', '/about', '/events', '/availability', '/faq', '/contact', '/contract', '/legal/terms', '/legal/privacy'];
app.get('/sitemap.xml', async (req, res) => {
  const siteUrl = siteUrlOf(req);
  let slugs: string[] = [];
  try {
    const response = await fetch(`${apiUrl}/services`);
    if (response.ok) slugs = ((await response.json()) as { slug: string }[]).map((s) => s.slug);
  } catch {
    // Sin API: se publican al menos las páginas fijas.
  }
  const paths = [...STATIC_PAGES, ...slugs.map((slug) => `/events/${encodeURIComponent(slug)}`)];
  const urls = paths.map((path) => `  <url><loc>${siteUrl}${path === '/' ? '/' : path}</loc></url>`).join('\n');
  res.type('application/xml').set('Cache-Control', 'public, max-age=3600');
  res.send(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`);
});

/**
 * Archivos estáticos. Los que llevan hash en el nombre (JS/CSS del build) se guardan un año;
 * el resto (logos, figuras, fotos provisionales) un día, para poder reemplazarlos.
 */
app.use(
  express.static(browserDistFolder, {
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      const hashed = /(^|[\\/])(main|chunk|polyfills|styles)-[\w-]{8}\.(js|css)$/.test(path) || /[\\/]media[\\/]/.test(path);
      res.setHeader('Cache-Control', hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=86400');
    },
  }),
);

/** Todo lo demás lo renderiza Angular. */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Arranca el servidor si este módulo es el punto de entrada (o corre con PM2).
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Manejador usado por el Angular CLI (servidor de desarrollo y build).
 */
export const reqHandler = createNodeRequestHandler(app);
