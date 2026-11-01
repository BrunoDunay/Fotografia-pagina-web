import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import QRCode from 'qrcode';
import { STAR_PATH } from './review-stars';

export type StoryPalette = 'marfil' | 'espresso' | 'arena';

export const STORY_PALETTES: { id: StoryPalette; label: string; swatch: string }[] = [
  { id: 'marfil', label: 'Marfil', swatch: '#faf7f3' },
  { id: 'espresso', label: 'Espresso', swatch: '#2a2421' },
  { id: 'arena', label: 'Arena', swatch: '#e9d6be' },
];

/**
 * Tarjeta vertical (9:16, para historias) que invita a dejar una reseña. Funciona como los tickets:
 * un talón con el QR que lleva directo al formulario. Todo se mide en "cqw" para que se vea igual
 * en la vista previa del panel y en la imagen de 1080 × 1920 que se descarga.
 * El QR se genera en el navegador (el panel no se renderiza en el servidor).
 */
@Component({
  selector: 'app-review-story-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': '"palette-" + palette()' },
  template: `
    <div class="frame">
      <img class="logo" [src]="palette() === 'espresso' ? '/brand/logo-light.png' : '/brand/logo-dark.png'" alt="Armando Ovalle Wedding Studio" />

      <p class="script kicker">Tu opinión</p>
      <p class="title">significa mucho<br />para mí</p>
      <p class="text">Cuéntame cómo viviste tu boda, tus XV años o tu sesión.</p>

      <div class="stars" aria-hidden="true">
        @for (i of [1, 2, 3, 4, 5]; track i) {
          <svg viewBox="0 0 24 24"><path [attr.d]="star" [attr.fill]="starFill()" /></svg>
        }
      </div>

      <!-- Talón del ticket con el QR -->
      <div class="stub">
        <p class="stub__label">Escanea y deja tu reseña</p>
        <span class="cut" aria-hidden="true"><i></i><i></i></span>
        <img class="qr" [src]="qr()" alt="Código QR para dejar una reseña" />
        <p class="stub__url">{{ shortUrl() }}</p>
      </div>

      <p class="handle">{{ '@' + handle() }}</p>
    </div>
  `,
  styles: `
    :host {
      --paper: #faf7f3; --ink: #2a2421; --muted: #6f645d; --gold: #d9b994; --accent: #7d5f4b; --stub: #ffffff; --line: #e4dcd3;
      display: block; container-type: inline-size; aspect-ratio: 9 / 16; overflow: hidden;
      background: var(--paper); color: var(--ink); font-family: var(--font-sans);
    }
    :host(.palette-espresso) { --paper: #2a2421; --ink: #faf7f3; --muted: #cbbfb4; --gold: #d9b994; --accent: #d9b994; --stub: #faf7f3; --line: #4a3f39; }
    :host(.palette-arena) { --paper: #ecdcc7; --ink: #2a2421; --muted: #5f544d; --gold: #b58e64; --accent: #7d5f4b; --stub: #fbf6ef; --line: #d6c0a5; }

    .frame { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; padding: 11cqw 9cqw 9cqw; text-align: center; }
    :host { position: relative; }
    /* Doble filete de papelería, como los tickets. */
    .frame::before, .frame::after { content: ''; position: absolute; pointer-events: none; border: 0.3cqw solid var(--line); }
    .frame::before { inset: 4cqw; }
    .frame::after { inset: 5.4cqw; border-width: 0.15cqw; border-color: var(--gold); opacity: 0.7; }

    .logo { width: 56cqw; height: auto; margin-bottom: 6cqw; }
    .kicker { font-size: 12cqw; line-height: 1; color: var(--accent); }
    .title { margin-top: 1cqw; font-family: var(--font-serif); font-size: 9.2cqw; line-height: 1.05; font-weight: 400; }
    .text { max-width: 62cqw; margin-top: 3.5cqw; font-size: 3.6cqw; line-height: 1.5; font-weight: 300; color: var(--muted); }
    .stars { display: flex; gap: 1.6cqw; margin-top: 4cqw; }
    .stars svg { width: 5.2cqw; height: 5.2cqw; fill: var(--gold); }

    .stub { position: relative; display: grid; justify-items: center; gap: 2cqw; width: 62cqw; margin-top: auto; padding: 4.5cqw 6cqw 4cqw; background: var(--stub); color: #2a2421; box-shadow: 0 1.5cqw 5cqw rgba(30, 24, 20, 0.16); }
    .stub__label { font-size: 2.5cqw; letter-spacing: 0.2em; text-transform: uppercase; font-weight: 500; color: #7d5f4b; white-space: nowrap; }
    /* Corte de talón: línea perforada con una muesca a cada lado. */
    .cut { position: relative; justify-self: stretch; height: 4cqw; margin-inline: -6cqw; }
    .cut::before { content: ''; position: absolute; left: 4.5cqw; right: 4.5cqw; top: 50%; border-top: 0.35cqw dashed #cfc3b6; }
    .cut i { position: absolute; top: 50%; width: 5cqw; height: 5cqw; border-radius: 50%; background: var(--paper); translate: 0 -50%; }
    .cut i:first-child { left: -2.5cqw; }
    .cut i:last-child { right: -2.5cqw; }
    .qr { width: 38cqw; height: 38cqw; image-rendering: pixelated; }
    .stub__url { font-size: 2.5cqw; letter-spacing: 0.06em; color: #6f645d; overflow-wrap: anywhere; }
    .handle { margin-top: 4cqw; font-size: 3.2cqw; letter-spacing: 0.2em; color: var(--muted); }
  `,
})
export class ReviewStoryCard {
  readonly url = input.required<string>();
  readonly palette = input<StoryPalette>('marfil');
  readonly handle = input('armandoovalle.ws');
  protected readonly star = STAR_PATH;
  /** Colores directos en el SVG: la imagen descargada no hereda los de las clases. */
  protected readonly starFill = computed(() => (this.palette() === 'arena' ? '#b58e64' : '#d9b994'));

  /**
   * El QR se pinta en un lienzo (12 px por módulo, 2 módulos de margen blanco) y se usa como imagen:
   * así sale idéntico en la vista previa y en el PNG que se descarga.
   */
  protected readonly qr = computed(() => {
    const { modules } = QRCode.create(this.url(), { errorCorrectionLevel: 'M' });
    const n = modules.size;
    const margin = 2;
    const px = 12;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = (n + margin * 2) * px;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#2a2421';
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (modules.get(y, x)) ctx.fillRect((x + margin) * px, (y + margin) * px, px, px);
    return canvas.toDataURL('image/png');
  });

  protected readonly shortUrl = computed(() => this.url().replace(/^https?:\/\//, '').replace(/#.*$/, ''));
}
