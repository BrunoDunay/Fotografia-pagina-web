import { Media } from './common.model';

export interface PackageFeature {
  id?: string;
  label: string;
  value: string | null;
  sortOrder?: number;
}

export interface StudioPackage {
  id: string;
  name: string;
  subtitle: string | null;
  price: number | null;
  currency: string;
  isPriceProvisional: boolean;
  isFeatured: boolean;
  isActive: boolean;
  sortOrder: number;
  features: PackageFeature[];
  serviceIds?: string[];
}

export interface ServiceSummary {
  id: string;
  slug: string;
  name: string;
  shortDescription: string | null;
  cover: Media | null;
  sortOrder: number;
  isVisible: boolean;
  isProvisional: boolean;
}

export interface ServiceDetail extends ServiceSummary {
  description: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroDescription: string | null;
  hero: Media | null;
  videoUrl: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
}

/** Respuesta pública de GET /services/:slug */
export interface ServicePage extends ServiceDetail {
  packages: StudioPackage[];
  faqs: Faq[];
  gallery: { imageCount: number };
}

export interface AdminService extends ServiceDetail {
  packageIds: string[];
  galleryId?: string | null;
}

export interface GalleryImage extends Media {
  mediaId: string;
  sortOrder: number;
}

export interface Faq {
  id: string;
  question: string;
  answer: string;
  serviceId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export type ThemeDecoration =
  | 'none'
  | 'snow'
  | 'christmas'
  | 'hearts'
  | 'petals'
  | 'sunshine'
  | 'leaves'
  | 'confetti'
  | 'papel_picado'
  | 'dia_de_muertos';

export interface ActiveTheme {
  key: string;
  name: string;
  decoration: ThemeDecoration;
  tokenOverrides: Record<string, string>;
  heroImage: Media | null;
  navbarBadge: string | null;
}

export type LegalType = 'contract' | 'terms' | 'privacy';

export interface LegalDocument {
  type: LegalType;
  title: string;
  version: string;
  intro: string | null;
  sections: { number: number; title: string; body: string }[];
  isProvisional: boolean;
  updatedAt: string;
}
