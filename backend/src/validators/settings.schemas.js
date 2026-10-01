import { z } from 'zod';
import { mediaRef, optionalText, optionalUrl, requiredText, uuid } from './common.schemas.js';

const stat = z.object({ value: requiredText(20, 'El valor'), label: requiredText(60, 'La etiqueta') });

/** Un esquema por sección editable. Las claves son las de la tabla site_settings. */
export const settingsSchemas = {
  brand: z.object({
    studioName: requiredText(120, 'El nombre del estudio'),
    photographerName: requiredText(120, 'El nombre del fotógrafo'),
    tagline: optionalText(200),
    logoLight: mediaRef,
    logoDark: mediaRef,
  }),

  home: z.object({
    hero: z.object({
      title: requiredText(120, 'El título'),
      subtitle: optionalText(200),
      ctaLabel: optionalText(40),
      ctaLink: optionalText(200),
      image: mediaRef,
    }),
    valueProposition: z.object({
      title: requiredText(160, 'El título'),
      text: optionalText(600),
      isProvisional: z.boolean().default(false),
    }),
    aboutTeaser: z.object({
      eyebrow: optionalText(40),
      title: requiredText(120, 'El título'),
      subtitle: optionalText(120),
      text: optionalText(800),
      ctaLabel: optionalText(40),
      image: mediaRef,
    }),
  }),

  about: z.object({
    name: requiredText(120, 'El nombre'),
    headline: optionalText(160),
    intro: optionalText(1200),
    story: optionalText(4000),
    philosophy: optionalText(2000),
    education: z.object({ degree: optionalText(160), institution: optionalText(160) }),
    stats: z.array(stat).max(6),
    specialties: z.array(z.string().trim().min(1).max(80)).max(30),
    travel: z.object({ national: optionalText(600), international: optionalText(600) }),
    images: z.array(mediaRef.unwrap().unwrap()).max(6).default([]),
    isProvisional: z.boolean().default(false),
  }),

  contact: z.object({
    photographerName: requiredText(120, 'El nombre'),
    studioName: requiredText(120, 'El nombre del estudio'),
    phone: optionalText(40),
    whatsapp: z.string().regex(/^\d{10,15}$/, 'WhatsApp: solo dígitos con lada, ej. 524499995998'),
    email: z.email('Email inválido').nullable().optional(),
    instagram: z.object({ handle: optionalText(60), url: optionalUrl }),
    facebook: z.object({ name: optionalText(120), url: optionalUrl }),
  }),

  whatsapp: z.object({
    message: requiredText(500, 'El mensaje'),
  }),

  seo: z.object({
    defaultTitle: requiredText(160, 'El título'),
    defaultDescription: requiredText(300, 'La descripción'),
    ogImage: mediaRef,
  }),

  availability: z.object({
    maxEventsPerDay: z.coerce.number().int().min(1).max(10),
    publicNote: optionalText(300),
  }),

  theme: z.object({
    mode: z.enum(['off', 'manual', 'auto']),
    manualThemeId: uuid.nullable().optional(),
  }),

  uploads: z.object({
    maxImagesPerGallery: z.coerce.number().int().min(1).max(500),
  }),
};

export const SETTINGS_SECTIONS = Object.keys(settingsSchemas);

/** Secciones visibles para el público (sin límites internos). */
export const PUBLIC_SETTINGS_SECTIONS = ['brand', 'home', 'about', 'contact', 'whatsapp', 'seo', 'availability'];
