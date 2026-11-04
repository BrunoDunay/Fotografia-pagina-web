# Armando Ovalle Wedding Studio (cliente real, en producción)

Sitio público y panel administrativo del fotógrafo Jorge Armando Ovalle (bodas, eventos, sesiones).
Instalación y producción: `README.md`. El brief original está en `promt_maestro.md`.

## Dónde vive

- Frontend: https://armandoovalle.netlify.app (Netlify, SSR como Edge Function desde `frontend/src/server.ts`).
- API: https://armando-ovalle-api.onrender.com (Render). Imágenes y videos en Cloudinary.
- Repo: `BrunoDunay/Fotografia-pagina-web` (el remoto local usa el nombre viejo `Fotograf-a-p-gina-web` y funciona por redirección).
  Push a `main` publica frontend y API solos.

## Estructura

- `frontend/`: Angular 22 + SSR (sitio y panel en `/login`, `/panel`).
- `backend/`: Node + Express 5 + PostgreSQL. Migraciones en `backend/migrations/`, contenido inicial en `backend/seeders/initial-content.js`.
- `ideas/`: referencias visuales. `Correcciones/`: capturas de errores que reportó Bruno.
- `demo/`: videos demo del sitio. `video-promo/`: proyecto HyperFrames del promocional.

## Reglas

- **Cambios nuevos van primero a una rama `pruebas/...`**, no a `main`, hasta que Bruno los apruebe.
  Ramas actuales: `pruebas/animacion-entrada`, `pruebas/salida-fundido`, `prueba-graphify`.
- Textos comerciales en la base de datos; lo provisional se marca "Pendiente de confirmar".
- Paleta del cliente: marfil / espresso / moca. No reutilizarla en otras demos de fotografía.

## Estado (4 nov 2026)

- 1 nov 2026 en producción: reseñas activas (`/reviews`, enlace para clientes `/reviews#escribir`,
  moderación en Panel → Reseñas), entrada con el logo AO, cortina entre páginas y logo animado al pasar el cursor.
- Último cambio: la entrada sale con un fundido corto en vez de la cortina.
- Para apagar reseñas: `reviewsEnabled: false` en `frontend/src/environments/environment.ts` y `REVIEWS_ENABLED=false` en Render.
- 4 nov 2026 en producción (pedido directo a `main`): servicio **Sesiones navideñas 2026** (`/events/christmas-sessions`,
  migración `0015`), primero en la lista, con paquete Christmas de $2,500 (precio visible; el resto de paquetes lo oculta).
  Pendiente: Armando sube sus fotos desde el panel (mientras, se ven las genéricas).
- 4 nov 2026: `Correcciones/`, `demo/` y `video-promo/` ya están en el repo (sin `.hyperframes/` ni `renders/`). El repo es **público**: el video de referencia de terceros de `ideas/` queda fuera a propósito.
