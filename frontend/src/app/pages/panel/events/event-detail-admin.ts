import { ChangeDetectionStrategy, Component, ElementRef, OnInit, computed, inject, input, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, firstValueFrom, of, startWith } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { SITE_URL } from '../../../core/config/api.config';
import { EventDetail, EventStatus, Payment } from '../../../core/types/agenda.model';
import { formatLongDate, formatMoney, todayInMexico } from '../../../core/utils/date-mx';
import { buildWhatsAppLink } from '../../../core/utils/whatsapp-link';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonDashboard } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ConfirmService } from '../shared/confirm.service';
import { TicketPreviewData, TicketStylePicker } from '../shared/ticket-style-picker';
import { ReservationTicket, TicketData } from '../../../components/ticket/reservation-ticket';
import { Media } from '../../../core/types/common.model';
import {
  EVENT_STATUS_LABEL,
  PAYMENT_CONCEPT_LABEL,
  PAYMENT_METHOD_LABEL,
  PAYMENT_STATUS_LABEL,
  entries,
  shortDate,
  shortTime,
} from '../shared/labels';

/** Teléfono capturado libremente → dígitos con lada de México para wa.me. */
function toWhatsAppDigits(phone: string | null): string | null {
  const digits = (phone ?? '').replace(/\D/g, '');
  if (digits.length === 10) return `52${digits}`;
  return digits.length >= 11 ? digits : null;
}

@Component({
  selector: 'app-event-detail-admin',
  imports: [ReactiveFormsModule, RouterLink, Btn, Icon, SkeletonDashboard, PageHeader, TicketStylePicker, ReservationTicket],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-detail-admin.html',
  styleUrl: './event-detail-admin.css',
})
export class EventDetailAdmin implements OnInit {
  readonly id = input.required<string>();
  /** ?created=1 tras el flujo rápido. */
  readonly created = input<string | undefined>();
  /** ?confirm=1: al crear el evento se pidió enviar el correo de confirmación. */
  readonly confirmEmail = input<string | undefined>(undefined, { alias: 'confirm' });

  private readonly agenda = inject(AgendaApiService);
  private readonly content = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly siteUrl = inject(SITE_URL);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly event = signal<EventDetail | null>(null);
  protected readonly saving = signal(false);
  protected readonly savingTicket = signal(false);
  protected readonly addingPayment = signal(false);
  protected readonly sendingMail = signal(false);
  /** Ticket fuera de pantalla que se convierte en la imagen adjunta del correo. */
  private readonly mailTicket = viewChild('mailTicket', { read: ElementRef });
  protected readonly mailNow = signal(Date.now());

  protected readonly statusOptions = entries(EVENT_STATUS_LABEL);
  protected readonly conceptOptions = entries(PAYMENT_CONCEPT_LABEL);
  protected readonly methodOptions = entries(PAYMENT_METHOD_LABEL);
  protected readonly statusLabel = EVENT_STATUS_LABEL;
  protected readonly paymentStatusLabel = PAYMENT_STATUS_LABEL;
  protected readonly conceptLabel = PAYMENT_CONCEPT_LABEL;
  protected readonly methodLabel = PAYMENT_METHOD_LABEL;
  protected readonly money = formatMoney;
  protected readonly shortDate = shortDate;
  protected readonly longDate = formatLongDate;

  protected readonly services = toSignal(this.content.services().pipe(catchError(() => of([]))), { initialValue: [] });
  protected readonly packages = toSignal(this.content.packages().pipe(catchError(() => of([]))), { initialValue: [] });

  protected readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(160)]],
    eventDate: ['', Validators.required],
    startTime: [''],
    endTime: [''],
    serviceId: [''],
    packageId: [''],
    totalPrice: [0, Validators.min(0)],
    venue: [''],
    city: [''],
    blocksAvailability: [true],
    notes: [''],
  });

  private readonly formServiceId = toSignal(this.form.controls.serviceId.valueChanges.pipe(startWith('')), { initialValue: '' });

  /** Tipo de evento elegido en el formulario. */
  protected readonly selectedService = computed(() => {
    this.formServiceId();
    return this.services().find((s) => s.id === this.form.controls.serviceId.value) ?? null;
  });

  /** Solo los paquetes del tipo de evento elegido (más el que el evento ya tenía guardado, para no perderlo). */
  protected readonly packageOptions = computed(() => {
    const service = this.selectedService();
    const saved = this.event()?.package?.id;
    const sameService = !!service && this.event()?.service?.id === service.id;
    return this.packages().filter((p) => (!!service && p.isActive && service.packageIds.includes(p.id)) || (sameService && p.id === saved));
  });

  protected readonly paymentForm = this.fb.group({
    amount: [null as number | null, [Validators.required, Validators.min(1)]],
    paidAt: [todayInMexico(), Validators.required],
    concept: ['abono'],
    method: ['transferencia'],
    notes: [''],
  });

  protected readonly ticketForm = this.fb.group({
    displayTitle: ['', Validators.required],
    monogram: [''],
    message: [''],
    ticketDesign: ['envelope'],
    ticketPalette: ['mocha'],
    showTime: [true],
    showVenue: [false],
    isActive: [true],
  });

  /** Foto propia del ticket (para los diseños con fotografía). Sin ella se usa la del tipo de evento. */
  protected readonly ticketCover = signal<Media | null>(null);
  private readonly ticketValue = toSignal(this.ticketForm.valueChanges.pipe(startWith(null)), { initialValue: null });

  /** Vista previa del ticket con lo que hay en el formulario (aún sin guardar). */
  protected readonly ticketPreview = computed<TicketPreviewData | null>(() => {
    this.ticketValue();
    const e = this.event();
    if (!e) return null;
    const v = this.ticketForm.getRawValue();
    return {
      title: v.displayTitle || e.title,
      monogram: v.monogram || null,
      message: v.message || null,
      eventDate: e.eventDate,
      startTime: v.showTime ? e.startTime : null,
      endTime: v.showTime ? e.endTime : null,
      venue: v.showVenue ? e.venue : null,
      city: v.showVenue ? e.city : null,
      eventType: e.service?.slug ?? null,
      cover: this.ticketCover() ?? e.reservation?.defaultCover ?? null,
    };
  });

  /** El ticket tal como está guardado (diseño y color incluidos), para adjuntarlo al correo. */
  protected readonly mailTicketData = computed<TicketData | null>(() => {
    const preview = this.ticketPreview();
    if (!preview) return null;
    const { ticketDesign, ticketPalette } = this.ticketForm.getRawValue();
    return { ...preview, design: ticketDesign, palette: ticketPalette };
  });

  /** "5 oct 2026, 14:32" en la hora de México. */
  protected sentLabel(iso: string): string {
    return new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Mexico_City' }).format(new Date(iso));
  }

  protected readonly ticketUrl = computed(() => {
    const code = this.event()?.reservation?.publicCode;
    return code ? `${this.siteUrl}/reservation/${code}` : null;
  });

  protected readonly shareToClient = computed(() => {
    const e = this.event();
    const url = this.ticketUrl();
    const digits = toWhatsAppDigits(e?.client.phone ?? null);
    if (!e || !url || !digits) return null;
    const firstName = e.client.name.split(' ')[0];
    return buildWhatsAppLink(
      digits,
      `¡Hola ${firstName}! Aquí está la reservación de tu evento con Armando Ovalle Wedding Studio: ${url}`,
    );
  });

  ngOnInit(): void {
    this.load();
    // Al cambiar el tipo de evento, se quita el paquete si no pertenece al nuevo tipo.
    this.form.controls.serviceId.valueChanges.subscribe(() => {
      const current = this.form.controls.packageId.value;
      if (current && !this.packageOptions().some((p) => p.id === current)) this.form.controls.packageId.setValue('');
    });
  }

  private load(): void {
    this.agenda.event(this.id()).subscribe({
      next: (e) => this.setEvent(e),
      error: () => void this.router.navigate(['/panel/events']),
    });
  }

  /**
   * Envía al cliente el correo de confirmación (resumen de lo contratado + ticket digital adjunto).
   * La imagen del ticket se genera aquí, a partir del ticket que se ve en el navegador.
   */
  protected async sendConfirmation(): Promise<void> {
    const e = this.event();
    if (!e || this.sendingMail()) return;
    this.sendingMail.set(true);
    try {
      const ticket = await this.renderTicketImage();
      const res = await firstValueFrom(this.agenda.sendConfirmation(e.id, ticket));
      this.event.update((current) => (current ? { ...current, confirmationSentAt: res.confirmationSentAt } : current));
      this.toast.success(`Correo de confirmación enviado a ${res.sentTo}.`);
    } catch {
      // El interceptor ya mostró el motivo (correo sin configurar, cliente sin correo…).
    } finally {
      this.sendingMail.set(false);
    }
  }

  /** JPG 1080×1920 del ticket (ligero para correo); si no se puede generar, el correo se envía solo con el enlace. */
  private async renderTicketImage(): Promise<Blob | null> {
    const element = this.mailTicket()?.nativeElement as HTMLElement | undefined;
    if (!element) return null;
    try {
      this.mailNow.set(Date.now());
      const { toCanvas } = await import('html-to-image');
      await document.fonts.ready;
      const canvas = await toCanvas(element, { pixelRatio: 1, canvasWidth: 1080, canvasHeight: 1920, style: { boxShadow: 'none' } });
      return await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    } catch {
      return null;
    }
  }

  private setEvent(e: EventDetail): void {
    const firstLoad = !this.event();
    this.event.set(e);
    // Tras crear el evento con "enviar confirmación": se manda en cuanto el ticket está pintado.
    if (firstLoad && this.confirmEmail()) {
      if (!e.client.email) this.toast.error('El evento se guardó, pero el cliente no tiene correo: no se envió la confirmación.');
      else if (!e.mailEnabled) this.toast.error('El evento se guardó, pero el correo saliente aún no está configurado: no se envió la confirmación.');
      else setTimeout(() => void this.sendConfirmation(), 900);
    }
    this.form.reset({
      title: e.title,
      eventDate: e.eventDate,
      startTime: shortTime(e.startTime),
      endTime: shortTime(e.endTime),
      serviceId: e.service?.id ?? '',
      packageId: e.package?.id ?? '',
      totalPrice: e.totalPrice,
      venue: e.venue ?? '',
      city: e.city ?? '',
      blocksAvailability: e.blocksAvailability,
      notes: e.notes ?? '',
    });
    if (e.reservation) {
      this.ticketCover.set(e.reservation.cover ?? null);
      this.ticketForm.reset({
        displayTitle: e.reservation.displayTitle,
        monogram: e.reservation.monogram ?? '',
        message: e.reservation.message ?? '',
        ticketDesign: e.reservation.ticketDesign,
        ticketPalette: e.reservation.ticketPalette,
        showTime: e.reservation.showTime,
        showVenue: e.reservation.showVenue,
        isActive: e.reservation.isActive,
      });
    }
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    this.saving.set(true);
    this.agenda
      .updateEvent(this.id(), {
        ...v,
        startTime: v.startTime || null,
        endTime: v.endTime || null,
        serviceId: v.serviceId || null,
        packageId: v.packageId || null,
        totalPrice: Number(v.totalPrice) || 0,
      })
      .subscribe({
        next: (e) => {
          this.setEvent(e);
          this.saving.set(false);
          this.toast.success('Cambios guardados.');
        },
        error: () => this.saving.set(false),
      });
  }

  protected changeStatus(status: string): void {
    this.agenda.setEventStatus(this.id(), status as EventStatus).subscribe((e) => {
      this.setEvent(e);
      this.toast.success(`Estado: ${EVENT_STATUS_LABEL[e.status]}.`);
    });
  }

  protected addPayment(): void {
    this.paymentForm.markAllAsTouched();
    if (this.paymentForm.invalid) return;
    const v = this.paymentForm.getRawValue();
    this.addingPayment.set(true);
    this.agenda
      .createPayment({
        eventId: this.id(),
        amount: Number(v.amount),
        paidAt: v.paidAt,
        concept: v.concept as Payment['concept'],
        method: v.method as Payment['method'],
        notes: v.notes || null,
      })
      .subscribe({
        next: () => {
          this.addingPayment.set(false);
          this.paymentForm.reset({ amount: null, paidAt: todayInMexico(), concept: 'abono', method: 'transferencia', notes: '' });
          this.toast.success('Pago registrado.');
          this.load();
        },
        error: () => this.addingPayment.set(false),
      });
  }

  protected async deletePayment(payment: Payment): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar pago',
      message: `¿Eliminar el pago de ${formatMoney(payment.amount)} del ${shortDate(payment.paidAt)}?`,
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.agenda.deletePayment(payment.id).subscribe(() => {
      this.toast.success('Pago eliminado.');
      this.load();
    });
  }

  /** Cambios desde el selector de diseño y color. */
  protected setTicketStyle(field: 'ticketDesign' | 'ticketPalette', value: string): void {
    this.ticketForm.controls[field].setValue(value);
    this.ticketForm.markAsDirty();
  }

  protected saveTicket(): void {
    const reservation = this.event()?.reservation;
    if (!reservation || this.ticketForm.invalid) return;
    const v = this.ticketForm.getRawValue();
    this.savingTicket.set(true);
    this.agenda
      .updateReservation(reservation.id, { ...v, monogram: v.monogram || null, message: v.message || null, coverMediaId: this.ticketCover()?.id ?? null })
      .subscribe({
      next: () => {
        this.savingTicket.set(false);
        this.toast.success('Ticket actualizado.');
        this.load();
      },
      error: () => this.savingTicket.set(false),
    });
  }

  protected async regenerateCode(): Promise<void> {
    const reservation = this.event()?.reservation;
    if (!reservation) return;
    const ok = await this.confirm.ask({
      title: 'Generar un enlace nuevo',
      message: 'El enlace actual dejará de funcionar. Úsalo si lo compartiste por error.',
      confirmLabel: 'Generar enlace nuevo',
    });
    if (!ok) return;
    this.agenda.regenerateReservationCode(reservation.id).subscribe(() => {
      this.toast.success('Enlace nuevo generado.');
      this.load();
    });
  }

  protected copyLink(): void {
    const url = this.ticketUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(
      () => this.toast.success('Enlace copiado.'),
      () => this.toast.error('No se pudo copiar. Selecciona el enlace y cópialo manualmente.'),
    );
  }

  protected async remove(): Promise<void> {
    const ok = await this.confirm.ask({
      title: 'Eliminar evento',
      message: 'Se eliminarán también sus pagos y su ticket. La fecha volverá a aparecer disponible.',
      confirmLabel: 'Eliminar evento',
      danger: true,
    });
    if (!ok) return;
    this.agenda.deleteEvent(this.id()).subscribe(() => {
      this.toast.success('Evento eliminado.');
      void this.router.navigate(['/panel/events']);
    });
  }
}
