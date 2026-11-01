import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../src/app.js';

// Ninguna de estas pruebas llega a la BD: la sesión, la trampa para bots, la validación o los límites responden antes.
const app = createApp();
const ID = '00000000-0000-0000-0000-000000000000';

const valid = {
  authorName: 'Ana López',
  eventLabel: 'Boda',
  rating: '5',
  comment: 'Nos encantaron las fotos, gracias por todo.',
  elapsedMs: '20000',
};

const post = (fields, file) => {
  const req = request(app).post('/api/reviews');
  for (const [k, v] of Object.entries(fields)) req.field(k, v);
  if (file) req.attach('photo', file.buffer, { filename: file.name, contentType: file.type });
  return req;
};

describe('reseñas: el panel exige sesión', () => {
  it.each([
    ['get', '/api/reviews/admin'],
    ['patch', `/api/reviews/${ID}`],
    ['delete', `/api/reviews/${ID}`],
    ['delete', `/api/reviews/${ID}/photo`],
  ])('%s %s → 401', async (method, url) => {
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
  });
});

describe('reseñas: formulario público', () => {
  it('a un bot que llena la trampa se le responde "recibida" sin guardar nada', async () => {
    const res = await post({ ...valid, website: 'http://spam.example' });
    expect(res.status).toBe(201);
    expect(res.body.status).toBe('pending');
  });

  it('rechaza enlaces en el comentario', async () => {
    const res = await post({ ...valid, comment: 'Visita www.mi-tienda.com para ofertas increíbles' });
    expect(res.status).toBe(400);
    expect(res.body.error.fields).toHaveProperty('comment');
  });

  it('rechaza archivos que no son imagen', async () => {
    const res = await post(valid, { buffer: Buffer.from('<script>alert(1)</script>'), name: 'x.html', type: 'text/html' });
    expect(res.status).toBe(415);
  });

  it('limita los envíos por persona', async () => {
    const statuses = [];
    for (let i = 0; i < 4; i++) statuses.push((await post({ ...valid, website: 'bot' })).status);
    expect(statuses).toContain(429);
  });
});
