import { Media } from './common.model';

export interface BrandSettings {
  studioName: string;
  photographerName: string;
  tagline: string | null;
  logoLight: Media | null;
  logoDark: Media | null;
}

export interface HomeSettings {
  hero: { title: string; subtitle: string | null; ctaLabel: string | null; ctaLink: string | null; image: Media | null };
  valueProposition: { title: string; text: string | null; isProvisional: boolean };
  aboutTeaser: {
    eyebrow: string | null;
    title: string;
    subtitle: string | null;
    text: string | null;
    ctaLabel: string | null;
    image: Media | null;
  };
}

export interface AboutSettings {
  name: string;
  headline: string | null;
  intro: string | null;
  story: string | null;
  philosophy: string | null;
  education: { degree: string | null; institution: string | null };
  stats: { value: string; label: string }[];
  specialties: string[];
  travel: { national: string | null; international: string | null };
  images: Media[];
  isProvisional: boolean;
}

export interface ContactSettings {
  photographerName: string;
  studioName: string;
  phone: string | null;
  whatsapp: string;
  email: string | null;
  instagram: { handle: string | null; url: string | null };
  facebook: { name: string | null; url: string | null };
}

export interface SeoSettings {
  defaultTitle: string;
  defaultDescription: string;
  ogImage: Media | null;
}

export interface AvailabilitySettings {
  maxEventsPerDay: number;
  publicNote: string | null;
}

export interface PublicSettings {
  brand: BrandSettings;
  home: HomeSettings;
  about: AboutSettings;
  contact: ContactSettings;
  whatsapp: { message: string };
  seo: SeoSettings;
  availability: AvailabilitySettings;
}

export interface AllSettings extends PublicSettings {
  theme: { mode: 'off' | 'manual' | 'auto'; manualThemeId: string | null };
  uploads: { maxImagesPerGallery: number };
}

export type SettingsSection = keyof AllSettings;
