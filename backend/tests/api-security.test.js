import { describe, expect, it } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { createApp } from '../src/app.js';

// Estas pruebas no tocan la BD: el middleware de auth/validación responde antes.
const app = createApp();

describe('rutas privadas sin sesión → 401', () => {
  const privateRoutes = [
    ['get', '/api/events'],
    ['post', '/api/events'],
    ['post', '/api/events/00000000-0000-0000-0000-000000000000/send-confirmation'],
    ['get', '/api/clients'],
    ['get', '/api/payments'],
    ['get', '/api/dashboard'],
    ['get', '/api/reservations'],
    ['get', '/api/settings'],
    ['put', '/api/settings/home'],
    ['post', '/api/media'],
    ['get', '/api/services/admin'],
    ['post', '/api/services'],
    ['put', '/api/themes/mode'],
    ['get', '/api/auth/me'],
  ];

  it.each(privateRoutes)('%s %s', async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHENTICATED');
  });
});

describe('tokens inválidos', () => {
  it('rechaza un token firmado con otro secreto', async () => {
    const token = jwt.sign({ sub: 'x' }, 'otro-secreto-otro-secreto-otro-secreto');
    const res = await request(app).get('/api/events').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('INVALID_TOKEN');
  });

  it('distingue un token expirado', async () => {
    const token = jwt.sign({ sub: 'x', exp: Math.floor(Date.now() / 1000) - 10 }, process.env.JWT_SECRET);
    const res = await request(app).get('/api/events').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('TOKEN_EXPIRED');
  });
});

describe('validación y errores', () => {
  it('login con email inválido → 400 con mensajes por campo', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'no-es-email', password: '' });
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('email');
    expect(res.body.error.fields).toHaveProperty('password');
  });

  it('disponibilidad exige rango válido', async () => {
    const res = await request(app).get('/api/availability?from=hoy&to=2026-13-40');
    expect(res.status).toBe(400);
  });

  it('JSON mal formado → 400 claro', async () => {
    const res = await request(app).post('/api/auth/login').set('Content-Type', 'application/json').send('{malo');
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BAD_JSON');
  });

  it('ruta inexistente → 404 en español', async () => {
    const res = await request(app).get('/api/no-existe');
    expect(res.status).toBe(404);
    expect(res.body.error.message).toMatch(/no existe/);
  });

  it('health check', async () => {
    const res = await request(app).get('/api/health');
    expect(res.body).toEqual({ status: 'ok' });
  });
});
