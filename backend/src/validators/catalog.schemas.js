import { z } from 'zod';
import { optionalText, requiredText, uuid } from './common.schemas.js';
import { THEME_DECORATIONS } from '../models/seasonal-theme.model.js';
import { LEGAL_TYPES } from '../models/legal-document.model.js';

const slug = z
  .string()
  .trim()
  .max(80)
  .regex(/^([a-z0-9]+(-[a-z0-9]+)*)?$/, 'El slug solo puede tener minúsculas, números y guiones');

/** Solo YouTube y Vimeo (se incrustan con iframe). */
export const videoUrl = z
  .union([
    z
      .url('URL inválida')
      .refine(
        (url) => /^https:\/\/(www\.)?(youtube\.com|youtu\.be|m\.youtube\.com|vimeo\.com|player\.vimeo\.com)\//.test(url),
        'Solo se aceptan enlaces de YouTube o Vimeo',
      ),
    z.literal(''),
    z.null(),
  ])
  .optional()
  .transform((v) => (v ? v : null));

// ---------- Servicios ----------
const serviceFields = {
  name: requiredText(120, 'El nombre'),
  slug: slug.optional(),
  shortDescription: optionalText(300),
  description: optionalText(5000),
  heroTitle: optionalText(160),
  heroSubtitle: optionalText(200),
  heroDescription: optionalText(2000),
  heroMediaId: uuid.nullable().optional(),
  coverMediaId: uuid.nullable().optional(),
  videoUrl,
  seoTitle: optionalText(160),
  seoDescription: optionalText(300),
  isVisible: z.boolean().optional(),
  isProvisional: z.boolean().optional(),
  packageIds: z.array(uuid).optional(),
};
export const serviceCreateBody = z.object(serviceFields);
export const serviceUpdateBody = z.object(serviceFields).partial();
export const visibilityBody = z.object({ isVisible: z.boolean() });
export const slugParams = z.object({ slug });

// ---------- Paquetes ----------
const feature = z.object({ label: requiredText(160, 'La característica'), value: optionalText(160) });
const packageFields = {
  name: requiredText(120, 'El nombre'),
  subtitle: optionalText(200),
  price: z.coerce.number().min(0).max(99_999_999).nullable().optional(),
  currency: z.string().length(3).default('MXN'),
  isPriceProvisional: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  isActive: z.boolean().optional(),
  features: z.array(feature).max(30).optional(),
  serviceIds: z.array(uuid).optional(),
};
export const packageCreateBody = z.object(packageFields);
export const packageUpdateBody = z.object(packageFields).partial();
export const activeBody = z.object({ isActive: z.boolean() });
export const byServiceQuery = z.object({ service: slug.optional() });

// ---------- Galerías / media ----------
export const galleryImageParams = z.object({ id: uuid, imageId: uuid });
export const gallerySettingsBody = z
  .object({ title: requiredText(160, 'El título'), maxImages: z.coerce.number().int().min(1).max(500) })
  .partial();
export const setCoverBody = z.object({ imageId: uuid });
export const mediaUploadBody = z.object({
  folder: z.enum(['site', 'services', 'themes', 'reservations', 'about']).default('site'),
  alt: optionalText(255),
});
export const mediaAltBody = z.object({ alt: optionalText(255) });

// ---------- FAQ ----------
const faqFields = {
  question: requiredText(300, 'La pregunta'),
  answer: requiredText(3000, 'La respuesta'),
  serviceId: uuid.nullable().optional(),
  isActive: z.boolean().optional(),
};
export const faqCreateBody = z.object(faqFields);
export const faqUpdateBody = z.object(faqFields).partial();

// ---------- Temas ----------
const month = z.coerce.number().int().min(1).max(12);
const day = z.coerce.number().int().min(1).max(31);
const cssColor = z.string().regex(/^(#[0-9a-fA-F]{3,8}|rgba?\([\d\s.,%]+\))$/, 'Color inválido');
const themeFields = {
  key: slug.min(1, 'La clave es obligatoria'),
  name: requiredText(120, 'El nombre'),
  startMonth: month,
  startDay: day,
  endMonth: month,
  endDay: day,
  autoEnabled: z.boolean().optional(),
  priority: z.coerce.number().int().min(0).max(100).optional(),
  decoration: z.enum(THEME_DECORATIONS).optional(),
  // Solo variables de color --color-*; evita inyectar CSS arbitrario.
  tokenOverrides: z.record(z.string().regex(/^--color-[a-z-]+$/, 'Variable no permitida'), cssColor).optional(),
  heroMediaId: uuid.nullable().optional(),
  navbarBadge: optionalText(60),
  isActive: z.boolean().optional(),
};
export const themeCreateBody = z.object(themeFields);
export const themeUpdateBody = z.object(themeFields).partial();
export const themeModeBody = z.object({ mode: z.enum(['off', 'manual', 'auto']), manualThemeId: uuid.nullable().optional() });

// ---------- Legales ----------
export const legalParams = z.object({ type: z.enum(LEGAL_TYPES) });
export const legalUpdateBody = z
  .object({
    title: requiredText(160, 'El título'),
    version: requiredText(40, 'La versión'),
    intro: optionalText(5000),
    sections: z
      .array(z.object({ number: z.coerce.number().int().min(1), title: requiredText(200, 'El título'), body: requiredText(10000, 'El contenido') }))
      .max(60),
    isProvisional: z.boolean(),
  })
  .partial();
