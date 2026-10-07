import { buildWhatsAppLink } from './whatsapp-link';
import { countdownTo, dateParts, daysBetween, formatLongDate, ticketStage, todayInMexico } from './date-mx';
import { cloudinarySrcset, cloudinaryUrl, cloudinaryVideo } from './cloudinary-url';

describe('buildWhatsAppLink', () => {
  it('codifica el mensaje y limpia el número', () => {
    expect(buildWhatsAppLink('+52 449 999 5998', 'Hola, ¿qué tal?')).toBe(
      'https://wa.me/524499995998?text=Hola%2C%20%C2%BFqu%C3%A9%20tal%3F',
    );
  });
  it('sin mensaje no agrega ?text', () => {
    expect(buildWhatsAppLink('524499995998')).toBe('https://wa.me/524499995998');
  });
});

describe('ticketStage', () => {
  it('antes del evento: faltan X días', () => {
    expect(ticketStage('2026-10-24', '2026-10-01')).toEqual({ stage: 'upcoming', daysLeft: 23 });
  });
  it('el mismo día', () => {
    expect(ticketStage('2026-10-24', '2026-10-24')).toEqual({ stage: 'today', daysLeft: 0 });
  });
  it('después del evento', () => {
    expect(ticketStage('2026-10-24', '2026-11-02').stage).toBe('past');
  });
});

describe('fechas', () => {
  it('todayInMexico usa la zona del estudio', () => {
    expect(todayInMexico(new Date('2026-10-02T03:00:00Z'))).toBe('2026-10-01');
  });
  it('formatLongDate no se desfasa por zona horaria', () => {
    expect(formatLongDate('2026-10-24')).toBe('sábado, 24 de octubre de 2026');
  });
  it('daysBetween', () => {
    expect(daysBetween('2026-12-31', '2027-01-01')).toBe(1);
  });
});

describe('cloudinaryUrl', () => {
  const url = 'https://res.cloudinary.com/demo/image/upload/v1712/aows/foto.jpg';
  it('inserta transformaciones', () => {
    expect(cloudinaryUrl(url, { width: 800 })).toBe(
      'https://res.cloudinary.com/demo/image/upload/f_auto,q_auto,w_800,c_limit/v1712/aows/foto.jpg',
    );
  });
  it('deja intactas las URLs que no son de Cloudinary', () => {
    expect(cloudinaryUrl('/assets/placeholder.jpg', { width: 800 })).toBe('/assets/placeholder.jpg');
    expect(cloudinarySrcset('/assets/placeholder.jpg')).toBe('');
  });
  it('srcset con varios anchos', () => {
    expect(cloudinarySrcset(url, [400, 800])).toContain('w_400,c_limit/v1712/aows/foto.jpg 400w');
  });
});

describe('cloudinaryVideo', () => {
  it('pide el MP4 y la portada que el backend manda preparar al subir', () => {
    const video = cloudinaryVideo('https://res.cloudinary.com/demo/video/upload/v1712/aows/videos/boda.mov');
    expect(video.mp4).toBe('https://res.cloudinary.com/demo/video/upload/vc_h264,q_auto/v1712/aows/videos/boda.mp4');
    expect(video.poster).toBe('https://res.cloudinary.com/demo/video/upload/so_0,q_auto,w_1600,c_limit/v1712/aows/videos/boda.jpg');
    expect(video.original).toContain('/v1712/aows/videos/boda.mov');
  });
});

describe('countdownTo', () => {
  it('cuenta hasta la hora de inicio en hora de México (UTC−6)', () => {
    // 24 oct 2026 17:00 en México = 23:00 UTC
    const now = Date.parse('2026-10-22T22:59:30Z');
    expect(countdownTo('2026-10-24', '17:00:00', now)).toEqual({ days: 2, hours: 0, minutes: 0, seconds: 30 });
  });

  it('sin hora cuenta hasta las 00:00 del día del evento', () => {
    const now = Date.parse('2026-10-24T05:00:00Z'); // 23 oct 23:00 en México
    expect(countdownTo('2026-10-24', null, now)).toEqual({ days: 0, hours: 1, minutes: 0, seconds: 0 });
  });

  it('nunca es negativo', () => {
    expect(countdownTo('2020-01-01', null)).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  });
});

describe('dateParts', () => {
  it('separa la fecha sin desfase de zona horaria', () => {
    expect(dateParts('2026-10-24')).toEqual({ weekday: 'sábado', day: 24, month: 'octubre', year: 2026 });
  });
});

describe('ícono del día en el ticket', () => {
  it('corazón solo en eventos románticos; corona, birrete y biberón según el evento', async () => {
    const { ticketMarkFor } = await import('../../components/ticket/ticket-mark');
    expect(ticketMarkFor('weddings')).toBe('heart');
    expect(ticketMarkFor('beach-weddings')).toBe('heart');
    expect(ticketMarkFor('quinceanos')).toBe('crown');
    expect(ticketMarkFor('graduations')).toBe('cap');
    expect(ticketMarkFor('baby-showers')).toBe('bottle');
    expect(ticketMarkFor('concerts')).toBe('star');
    expect(ticketMarkFor(null)).toBe('star');
  });
});
