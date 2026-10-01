export interface VideoEmbed {
  provider: 'youtube' | 'vimeo';
  id: string;
  embedUrl: string;
  /** Miniatura para la "fachada" (solo YouTube la da sin API). */
  thumbnailUrl: string | null;
}

const YOUTUBE_PATTERNS = [
  /^https:\/\/(?:www\.|m\.)?youtube\.com\/watch\?(?:.*&)?v=([\w-]{11})/,
  /^https:\/\/(?:www\.)?youtube\.com\/(?:embed|shorts|live)\/([\w-]{11})/,
  /^https:\/\/youtu\.be\/([\w-]{11})/,
];
const VIMEO_PATTERN = /^https:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d{6,12})/;

/** Convierte una URL de YouTube/Vimeo a su URL de embed. Cualquier otro host se rechaza (null). */
export function parseVideoUrl(url: string | null | undefined): VideoEmbed | null {
  if (!url) return null;
  const clean = url.trim();

  for (const pattern of YOUTUBE_PATTERNS) {
    const match = clean.match(pattern);
    if (match) {
      const id = match[1];
      return {
        provider: 'youtube',
        id,
        embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1`,
        thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      };
    }
  }

  const vimeo = clean.match(VIMEO_PATTERN);
  if (vimeo) {
    return {
      provider: 'vimeo',
      id: vimeo[1],
      embedUrl: `https://player.vimeo.com/video/${vimeo[1]}?autoplay=1&dnt=1`,
      thumbnailUrl: null,
    };
  }

  return null;
}
