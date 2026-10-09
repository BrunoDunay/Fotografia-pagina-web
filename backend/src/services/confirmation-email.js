/**
 * Correo de confirmación del evento para el cliente: resumen de lo contratado (incluye paquete,
 * precio, pagos y saldo) y el ticket digital para compartir.
 * Función pura: recibe los datos ya cargados y devuelve asunto, HTML y texto plano.
 */

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const money = (amount) => new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN', maximumFractionDigits: 2 }).format(Number(amount) || 0);

/** "2026-10-24" → "sábado 24 de octubre de 2026" */
export function longDate(iso) {
  return new Intl.DateTimeFormat('es-MX', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

const shortDate = (iso) => new Intl.DateTimeFormat('es-MX', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
const hhmm = (time) => (time ? String(time).slice(0, 5) : null);

const CONCEPT = { apartado: 'Apartado', abono: 'Abono', liquidacion: 'Liquidación', otro: 'Pago' };
const METHOD = { efectivo: 'efectivo', transferencia: 'transferencia', tarjeta: 'tarjeta', otro: 'otro medio' };

/**
 * Copia oculta del correo de confirmación para el fotógrafo (el correo de contacto del sitio), para que
 * lo vea llegar a su propia bandeja: el envío sale de la cuenta del estudio, no de la suya.
 * No se manda copia si ese correo es el del cliente o el de la misma cuenta que envía.
 */
export function confirmationCopyAddress(contactEmail, clientEmail, senderEmail) {
  const same = (a, b) => String(a ?? '').trim().toLowerCase() === String(b ?? '').trim().toLowerCase();
  const copy = String(contactEmail ?? '').trim();
  return copy && !same(copy, clientEmail) && !same(copy, senderEmail) ? copy : null;
}

/**
 * @param {object} data
 * @param {object} data.event        Evento con cliente, servicio, paquete (con features) y pagos.
 * @param {{total:number, paid:number, balance:number}} data.payment
 * @param {string|null} data.ticketUrl   Enlace público del ticket digital.
 * @param {boolean} data.hasTicketImage  Si el ticket va adjunto (se muestra dentro del correo con cid:ticket).
 * @param {object} data.studio       { name, photographer, phone, email, instagram, siteUrl }
 */
export function buildConfirmationEmail({ event, payment, ticketUrl, hasTicketImage, studio }) {
  const firstName = (event.client?.name ?? '').trim().split(/\s+/)[0] || 'Hola';
  const schedule = hhmm(event.startTime) ? (hhmm(event.endTime) ? `${hhmm(event.startTime)} a ${hhmm(event.endTime)} hrs` : `${hhmm(event.startTime)} hrs`) : null;
  const place = [event.venue, event.city].filter(Boolean).join(', ') || null;
  const features = (event.package?.features ?? []).slice().sort((a, b) => a.sortOrder - b.sortOrder);

  const details = [
    ['Evento', event.title],
    ['Tipo de evento', event.service?.name],
    ['Fecha', longDate(event.eventDate)],
    ['Horario', schedule],
    ['Lugar', place],
    ['Paquete', event.package?.name],
  ].filter(([, value]) => value);

  const subject = `Confirmación de tu evento · ${event.title} · ${shortDate(event.eventDate)}`;

  // ---------- Texto plano ----------
  const text = [
    `${firstName}, tu fecha quedó reservada.`,
    '',
    'DETALLES DEL EVENTO',
    ...details.map(([label, value]) => `${label}: ${value}`),
    ...(features.length ? ['', 'TU PAQUETE INCLUYE', ...features.map((f) => `- ${f.label}${f.value ? `: ${f.value}` : ''}`)] : []),
    '',
    'RESUMEN DE PAGO',
    `Total: ${money(payment.total)}`,
    ...event.payments.map((p) => `${CONCEPT[p.concept] ?? 'Pago'} · ${shortDate(p.paidAt)} · ${METHOD[p.method] ?? ''}: ${money(p.amount)}`),
    `Pagado: ${money(payment.paid)}`,
    `Saldo pendiente: ${money(payment.balance)}`,
    ...(ticketUrl ? ['', `Tu ticket digital: ${ticketUrl}`] : []),
    '',
    'Si algún dato no es correcto, responde a este correo o escríbenos por WhatsApp.',
    '',
    studio.photographer ? `${studio.photographer} · ${studio.name}` : studio.name,
    [studio.phone, studio.email].filter(Boolean).join(' · '),
  ].join('\n');

  // ---------- HTML (tablas y estilos en línea: es lo que entienden los clientes de correo) ----------
  const ink = '#2a2421';
  const muted = '#7a6f68';
  const accent = '#8c6b55';
  const line = '#e4dcd3';
  const serif = "Georgia, 'Times New Roman', serif";
  const sans = "'Helvetica Neue', Helvetica, Arial, sans-serif";
  const label = `font-family:${sans};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${muted};`;
  const row = (left, right, strong = false) =>
    `<tr><td style="padding:9px 0;border-bottom:1px solid ${line};font-family:${sans};font-size:14px;color:${muted};">${left}</td>` +
    `<td align="right" style="padding:9px 0;border-bottom:1px solid ${line};font-family:${strong ? serif : sans};font-size:${strong ? 18 : 14}px;color:${ink};">${right}</td></tr>`;

  const html = `<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:#f1ebe4;">
<div style="display:none;max-height:0;overflow:hidden;">Tu fecha quedó reservada: ${esc(longDate(event.eventDate))}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f1ebe4;">
<tr><td align="center" style="padding:28px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#faf7f3;">
  <tr><td align="center" style="padding:34px 32px 26px;background:${ink};">
    <p style="margin:0;font-family:${serif};font-size:22px;letter-spacing:5px;text-transform:uppercase;color:#faf7f3;">${esc(studio.name)}</p>
    <p style="margin:10px 0 0;${label}color:#d9b994;">Confirmación de evento</p>
  </td></tr>

  <tr><td style="padding:36px 36px 8px;">
    <p style="margin:0;font-family:${serif};font-size:26px;line-height:1.3;color:${ink};">${esc(firstName)}, tu fecha quedó reservada.</p>
    <p style="margin:14px 0 0;font-family:${sans};font-size:15px;line-height:1.7;color:${muted};">Gracias por tu confianza. Este correo es la confirmación de lo que acordamos; consérvalo como referencia.</p>
  </td></tr>

  <tr><td style="padding:24px 36px 4px;">
    <p style="margin:0 0 6px;${label}">Detalles del evento</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${details.map(([l, v]) => row(esc(l), esc(v))).join('\n      ')}
    </table>
  </td></tr>
${
  features.length
    ? `
  <tr><td style="padding:24px 36px 4px;">
    <p style="margin:0 0 10px;${label}">Tu paquete incluye</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${features
        .map(
          (f) =>
            `<tr><td style="padding:5px 0;font-family:${sans};font-size:14px;line-height:1.5;color:${ink};"><span style="color:${accent};">—</span>&nbsp; ${esc(f.label)}${f.value ? `: <span style="color:${muted};">${esc(f.value)}</span>` : ''}</td></tr>`,
        )
        .join('\n      ')}
    </table>
  </td></tr>`
    : ''
}
  <tr><td style="padding:24px 36px 4px;">
    <p style="margin:0 0 6px;${label}">Resumen de pago</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      ${row('Total del evento', esc(money(payment.total)), true)}
      ${event.payments.map((p) => row(`${esc(CONCEPT[p.concept] ?? 'Pago')} · ${esc(shortDate(p.paidAt))} · ${esc(METHOD[p.method] ?? '')}`, `− ${esc(money(p.amount))}`)).join('\n      ')}
      <tr><td style="padding:14px 0 0;font-family:${sans};font-size:14px;color:${ink};">${payment.balance > 0 ? 'Saldo pendiente' : 'Saldo'}</td>
      <td align="right" style="padding:14px 0 0;font-family:${serif};font-size:22px;color:${payment.balance > 0 ? accent : ink};">${payment.balance > 0 ? esc(money(payment.balance)) : 'Liquidado'}</td></tr>
    </table>
  </td></tr>
${
  ticketUrl || hasTicketImage
    ? `
  <tr><td align="center" style="padding:36px 36px 8px;">
    <p style="margin:0;${label}">Tu ticket digital</p>
    <p style="margin:10px 0 0;font-family:${serif};font-size:20px;color:${ink};">Para compartir con quien tú quieras</p>
    <p style="margin:10px 0 0;font-family:${sans};font-size:14px;line-height:1.7;color:${muted};">Es una invitación digital con la cuenta regresiva de tu evento. No muestra precios ni datos de contacto.</p>
    ${hasTicketImage ? `<img src="cid:ticket" width="270" alt="Ticket digital de ${esc(event.title)}" style="display:block;width:270px;max-width:100%;height:auto;margin:22px auto 0;border:0;">` : ''}
    ${ticketUrl ? `<p style="margin:24px 0 0;"><a href="${esc(ticketUrl)}" style="display:inline-block;padding:13px 30px;background:${ink};font-family:${sans};font-size:12px;letter-spacing:2px;text-transform:uppercase;text-decoration:none;color:#faf7f3;">Ver mi ticket</a></p>` : ''}
  </td></tr>`
    : ''
}
  <tr><td style="padding:34px 36px 36px;">
    <p style="margin:0;padding-top:22px;border-top:1px solid ${line};font-family:${sans};font-size:13px;line-height:1.7;color:${muted};">Si algún dato no es correcto, responde a este correo o escríbenos por WhatsApp.</p>
    <p style="margin:14px 0 0;font-family:${serif};font-size:16px;color:${ink};">${esc(studio.photographer || studio.name)}</p>
    <p style="margin:4px 0 0;font-family:${sans};font-size:13px;line-height:1.7;color:${muted};">${[studio.phone, studio.email, studio.instagram ? `@${studio.instagram}` : null].filter(Boolean).map(esc).join(' &nbsp;·&nbsp; ')}</p>
    ${studio.siteUrl ? `<p style="margin:4px 0 0;font-family:${sans};font-size:13px;"><a href="${esc(studio.siteUrl)}" style="color:${accent};">${esc(studio.siteUrl.replace(/^https?:\/\//, ''))}</a></p>` : ''}
  </td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html, text };
}
