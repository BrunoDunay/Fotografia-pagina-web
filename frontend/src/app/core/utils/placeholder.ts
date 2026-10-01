import { Media } from '../types/common.model';

/**
 * PROVISIONAL: fotografía de prueba (ideas/Fotografía_de_prueba.jpg) usada en cualquier
 * lugar que requiera imagen mientras el fotógrafo no suba las suyas desde el panel.
 * Al subir una imagen real, esta deja de usarse automáticamente.
 */
export const PLACEHOLDER_MEDIA: Media = {
  id: 'placeholder',
  url: '/placeholders/foto-provisional.jpg',
  width: 816,
  height: 583,
  alt: 'Fotografía provisional',
};

export const isPlaceholder = (media: Media | null | undefined) => !media || media.id === PLACEHOLDER_MEDIA.id;

export const orPlaceholder = (media: Media | null | undefined): Media => media ?? PLACEHOLDER_MEDIA;
