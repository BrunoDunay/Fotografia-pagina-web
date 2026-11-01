import { Media, Paginated } from './common.model';

export type ReviewStatus = 'pending' | 'published' | 'hidden';

/** Reseña tal como se ve en el sitio (solo las publicadas). */
export interface Review {
  id: string;
  authorName: string;
  eventLabel: string;
  rating: number;
  comment: string;
  photo: Media | null;
  reply: string | null;
  repliedAt: string | null;
  createdAt: string;
}

export interface ReviewPage extends Paginated<Review> {
  /** Promedio de estrellas de las publicadas (null si todavía no hay). */
  average: number | null;
}

export interface AdminReview extends Review {
  status: ReviewStatus;
  publishedAt: string | null;
  updatedAt: string;
}

export interface AdminReviewList {
  items: AdminReview[];
  counts: Record<ReviewStatus, number>;
}

export interface ReviewSubmission {
  authorName: string;
  eventLabel: string;
  rating: number;
  comment: string;
  photo: File | null;
  /** Trampa para bots (siempre vacía cuando escribe una persona). */
  website: string;
  elapsedMs: number;
}

/** Lo único que el fotógrafo puede cambiar: el estado y su respuesta (lo que escribió el cliente no se toca). */
export type ReviewUpdate = Partial<Pick<AdminReview, 'reply' | 'status'>>;
