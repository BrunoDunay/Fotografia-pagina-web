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
import { ticketPalette } from '../../core/ticket-designs';
import { downloadBlob, renderTicketJpeg } from '../../core/utils/ticket-image';
import { ReservationTicket } from '../../components/ticket/reservation-ticket';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';

type LoadState = { status: 'loading' } | { status: 'ready'; reservation: PublicReservation } | { status: 'missing' };

/** Ancho de la imagen exportada: formato de historia 1080×1920. */

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
  /** Fondo de la página: el tono oscuro de la variación de color del ticket. */
  protected readonly stageColor = computed(() => {
    const r = this.reservation();
    return r ? ticketPalette(r.design, r.palette).dark : null;
  });

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
        this.seo.setPage({ title: 'Ticket no disponible | Armando Ovalle', noindex: true });
      }
      if (!r) return;
      this.seo.setPage({
        title: `${r.title} · ${formatLongDate(r.eventDate)} | Armando Ovalle`,
        description: 'Fecha reservada con Armando Ovalle. ¡Nos vemos pronto!',
        image: r.cover?.url ?? `${this.siteUrl}/brand/logo-ao-share.png`,
        path: `/reservation/${r.code}`,
        noindex: true,
      });
    });
  }

  /** Descarga el ticket tal cual se ve, como JPG de 1080×1920 (formato de historia). Sin menú de compartir. */
  protected async saveImage(): Promise<void> {
    const element = this.ticketRef()?.nativeElement;
    const r = this.reservation();
    if (!element || !r || this.exporting()) return;

    this.exporting.set(true);
    try {
      const blob = await renderTicketJpeg(element, ticketPalette(r.design, r.palette).paper);
      downloadBlob(blob, `ticket-${r.code}.jpg`);
      this.toast.success('Imagen descargada.');
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
