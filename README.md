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

Sin las variables de Cloudinary, todo funciona excepto la subida de imágenes.

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
