import { env } from './config/env.js';
import { connectDatabase, sequelize } from './config/database.js';
import { runPendingMigrations } from './config/migrate.js';
import { initializeData } from './config/initialize-data.js';
import { createApp } from './app.js';

async function start() {
  try {
    await connectDatabase();
  } catch (error) {
    console.error(`No se pudo conectar a PostgreSQL: ${error.message}\nRevisa DATABASE_URL en backend/.env y que el servicio esté corriendo.`);
    process.exit(1);
  }

  const applied = await runPendingMigrations();
  if (applied.length) console.log('Migraciones aplicadas:', applied.join(', '));

  const init = await initializeData();
  if (init.adminCreated) console.log(`Cuenta administrativa creada: ${env.ADMIN_EMAIL}`);

  if (!env.cloudinaryEnabled) {
    console.warn('Cloudinary no está configurado: la subida de imágenes estará deshabilitada.');
  }

  const server = createApp().listen(env.PORT, () => {
    console.log(`API lista en http://localhost:${env.PORT}/api (${env.NODE_ENV})`);
  });

  const shutdown = async () => {
    server.close();
    await sequelize.close();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Error al iniciar el servidor:', error);
  process.exit(1);
});
