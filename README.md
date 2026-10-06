# Armando Ovalle Wedding Studio

Sitio web público y panel administrativo del fotógrafo Jorge Armando Ovalle.

```
/
├── frontend/   Angular 22 + SSR (sitio público y panel)
├── backend/    Node.js + Express 5 + PostgreSQL (API REST)
└── ideas/      Referencias visuales del diseño
```

## Requisitos

- Node.js 22 o superior
- PostgreSQL 16 o superior (corriendo localmente)

## 1. Base de datos

Con `psql` (en Windows: `"C:\Program Files\PostgreSQL\18\bin\psql.exe" -U postgres`):

```sql
CREATE USER aows_app WITH PASSWORD 'tu-contraseña';
CREATE DATABASE aows OWNER aows_app;
```

## 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # y completa DATABASE_URL, JWT_SECRET y ADMIN_PASSWORD
npm run dev            # http://localhost:3000/api
```

Al arrancar, el servidor:

1. aplica las migraciones pendientes (`backend/migrations/`);
2. crea la cuenta administrativa con `ADMIN_EMAIL` / `ADMIN_PASSWORD` si todavía no existe;
3. carga el contenido inicial (servicios, paquetes provisionales, FAQ, temas, legales) **solo si las tablas están vacías**. Nunca sobrescribe lo editado desde el panel.

Otros comandos: `npm test` (pruebas), `npm run migrate`, `npm run migrate:down`.

Sin las variables de Cloudinary, en desarrollo las imágenes se guardan en `backend/uploads/` (excluida de git); en producción Cloudinary es obligatorio.

## 3. Frontend

```bash
cd frontend
npm install
npm start              # http://localhost:4200
```

- Panel: http://localhost:4200/login
- Build de producción con SSR: `npm run build` y luego `npm run serve:ssr:frontend`
- Pruebas: `npm test`

## Contenido provisional

Todo el texto comercial vive en la base de datos y se edita desde el panel. Lo que todavía es provisional (paquetes y precios, textos narrativos, contrato y legales) está marcado en BD y aparece en el dashboard del panel como **"Pendiente de confirmar"**. El contenido inicial está en `backend/seeders/initial-content.js`.

## Producción

**Backend** (`backend/.env`):
- `NODE_ENV=production` y `DATABASE_URL` de la base en la nube (`DATABASE_SSL=true` si el proveedor lo pide).
- `JWT_SECRET` nuevo y largo (48+ caracteres aleatorios) y las credenciales de Cloudinary.
- `CORS_ORIGINS` y `PUBLIC_SITE_URL` con el dominio real (sin localhost). Al arrancar, el backend avisa si algo quedó mal.
- Correo de confirmación de eventos (opcional): `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` y `MAIL_FROM`. Con Gmail se usa una "contraseña de aplicación" (ver `backend/.env.example`). Sin estos datos, el botón de enviar confirmación queda deshabilitado.
- `npm start`: aplica las migraciones pendientes y crea la cuenta inicial si no existe.

**Frontend en Netlify** (configuración actual):
- `netlify.toml` (raíz) define carpeta, comando y encabezados; el SSR corre como Edge Function desde `frontend/src/server.ts`.
- `frontend/src/environments/environment.ts`: `apiUrl` apunta a la API. `siteUrl` vacío = se usa el dominio con el que se visita el sitio.
- En el backend, `CORS_ORIGINS` y `PUBLIC_SITE_URL` deben llevar la dirección del sitio en Netlify (o el dominio propio).

**Frontend en un servidor Node propio** (alternativa):
- `npm run build:node` (usa `frontend/src/server.node.ts`) y ejecutar `node dist/frontend/server/server.mjs` con estas variables:
  - `NG_ALLOWED_HOSTS`: dominios permitidos, separados por coma (ej. `armandoovalle.com,www.armandoovalle.com`). Angular rechaza cualquier otro (protección SSRF).
  - `PORT` (por defecto 4000). Opcionales: `SITE_URL` y `API_URL` para el sitemap.
- El servidor comprime las respuestas, envía encabezados de seguridad y publica `/robots.txt` y `/sitemap.xml` (con los servicios visibles).
