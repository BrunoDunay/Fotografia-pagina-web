import nodemailer from 'nodemailer';
import { env } from '../config/env.js';
import { AppError } from '../utils/app-error.js';

let transporter = null;

/** Conexión SMTP (se crea la primera vez que se envía un correo). */
function getTransporter() {
  if (!env.mailEnabled) {
    throw new AppError(
      503,
      'El envío de correos todavía no está configurado. Agrega los datos SMTP_* en backend/.env y reinicia el servidor.',
      'MAIL_NOT_CONFIGURED',
    );
  }
  transporter ??= nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: env.SMTP_PORT,
    // 465 = conexión cifrada desde el inicio; 587/25 = STARTTLS.
    secure: env.SMTP_PORT === 465,
    auth: { user: env.SMTP_USER, pass: env.SMTP_PASS },
  });
  return transporter;
}

/** Envía un correo desde la cuenta del estudio. */
export async function sendMail({ to, subject, html, text, attachments = [], replyTo, bcc }) {
  const from = env.MAIL_FROM || env.SMTP_USER;
  try {
    return await getTransporter().sendMail({ from, to, subject, html, text, attachments, replyTo: replyTo || undefined, bcc: bcc || undefined });
  } catch (error) {
    if (error instanceof AppError) throw error;
    // No se reenvía el detalle técnico (puede incluir datos de la cuenta); queda en el log del servidor.
    console.error('No se pudo enviar el correo:', error.message);
    throw new AppError(502, 'No se pudo enviar el correo. Revisa los datos SMTP_* de backend/.env o intenta de nuevo en unos minutos.', 'MAIL_SEND_FAILED');
  }
}
