import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  RESPONSE_INIT,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { SeoService } from '../../core/services/seo.service';
import { ToastService } from '../../core/services/toast.service';
import { SITE_URL } from '../../core/config/api.config';
import { PublicReservation } from '../../core/types/agenda.model';
import { formatLongDate } from '../../core/utils/date-mx';
import { ReservationTicket } from '../../components/ticket/reservation-ticket';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';

type LoadState = { status: 'loading' } | { status: 'ready'; reservation: PublicReservation } | { status: 'missing' };

/** Ancho de la imagen exportada: formato de historia 1080×1920. */
const EXPORT_WIDTH = 1080;

/**
 * Ticket digital (/reservation/:code). Layout propio, sin navbar: pensado para abrirse
 * desde WhatsApp en el celular, guardarse como imagen o compartirse en historias.
 */
@Component({
  selector: 'app-reservation-page',
  imports: [RouterLink, ReservationTicket, Btn, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reservation.html',
  styleUrl: './reservation.css',
})
export class ReservationPage {
  /** Viene del parámetro de ruta :code (withComponentInputBinding). */
  readonly code = input.required<string>();

  private readonly api = inject(PublicApiService);
  private readonly seo = inject(SeoService);
  private readonly toast = inject(ToastService);
  private readonly siteUrl = inject(SITE_URL);
  private readonly response = inject(RESPONSE_INIT, { optional: true });

  private readonly ticketRef = viewChild(ReservationTicket, { read: ElementRef<HTMLElement> });

  protected readonly now = signal(Date.now());
  protected readonly exporting = signal(false);
  protected readonly canShareLink = signal(false);

  protected readonly state = toSignal(
    toObservable(this.code).pipe(
      switchMap((code) =>
        this.api.reservation(code).pipe(
          map((reservation): LoadState => ({ status: 'ready', reservation })),
          catchError(() => of<LoadState>({ status: 'missing' })),
          tap((s) => s.status === 'missing' && this.response && (this.response.status = 404)),
        ),
      ),
    ),
    { initialValue: { status: 'loading' } as LoadState },
  );

  protected readonly reservation = computed(() => {
    const s = this.state();
    return s.status === 'ready' ? s.reservation : null;
  });

  protected readonly backdrop = computed(() => this.reservation()?.cover?.url ?? null);

  constructor() {
    // La cuenta regresiva solo corre en el navegador (en SSR se pinta el valor del momento).
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.now.set(Date.now());
      const timer = setInterval(() => this.now.set(Date.now()), 1000);
      destroyRef.onDestroy(() => clearInterval(timer));
      this.canShareLink.set(typeof navigator.share === 'function');
    });

    effect(() => {
      const r = this.reservation();
      if (this.state().status === 'missing') {
        this.seo.setPage({ title: 'Ticket no disponible | Armando Ovalle Wedding Studio', noindex: true });
      }
      if (!r) return;
      const what = r.service ? `${r.service.name} · ` : '';
      this.seo.setPage({
        title: `${r.title} · ${formatLongDate(r.eventDate)} | Armando Ovalle Wedding Studio`,
        description: `${what}Fecha reservada con Armando Ovalle Wedding Studio. ¡Nos vemos pronto!`,
        image: r.cover?.url ?? `${this.siteUrl}/brand/logo-dark.png`,
        path: `/reservation/${r.code}`,
        noindex: true,
      });
    });
  }

  /** Genera el PNG 1080×1920 del ticket; en celular abre "Compartir" (historias, WhatsApp…), si no, lo descarga. */
  protected async saveImage(): Promise<void> {
    const element = this.ticketRef()?.nativeElement;
    const r = this.reservation();
    if (!element || !r || this.exporting()) return;

    this.exporting.set(true);
    try {
      const { toBlob } = await import('html-to-image');
      await document.fonts.ready;
      // Lienzo exacto 1080×1920 (el alto en pantalla puede tener decimales).
      const blob = await toBlob(element, {
        pixelRatio: 1,
        canvasWidth: EXPORT_WIDTH,
        canvasHeight: Math.round((EXPORT_WIDTH * 16) / 9),
        // La sombra del ticket es para la pantalla, no para la imagen.
        style: { boxShadow: 'none' },
      });
      if (!blob) throw new Error('empty');

      const file = new File([blob], `ticket-${r.code}.png`, { type: 'image/png' });
      // Solo en celular/tablet: en escritorio (p. ej. Edge en Windows) "Compartir" abre un diálogo
      // del sistema poco útil; ahí es mejor descargar directo.
      const touchDevice = matchMedia('(pointer: coarse)').matches;
      if (touchDevice && navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: r.title });
          return;
        } catch (error) {
          if ((error as DOMException).name === 'AbortError') return;
          // Si compartir falla por otra razón, se descarga.
        }
      }
      const url = URL.createObjectURL(blob);
      const link = Object.assign(document.createElement('a'), { href: url, download: file.name });
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      this.toast.success('Imagen guardada.');
    } catch {
      this.toast.error('No se pudo generar la imagen. Intenta de nuevo o toma una captura de pantalla.');
    } finally {
      this.exporting.set(false);
    }
  }

  protected async shareLink(): Promise<void> {
    const r = this.reservation();
    if (!r) return;
    const url = `${location.origin}/reservation/${r.code}`;
    if (this.canShareLink()) {
      try {
        await navigator.share({ title: r.title, text: '¡Nuestra fecha está reservada!', url });
        return;
      } catch (error) {
        if ((error as DOMException).name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      this.toast.success('Enlace copiado.');
    } catch {
      this.toast.error('No se pudo copiar el enlace.');
    }
  }
}
