import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Client } from '../../../core/types/agenda.model';
import { suggestedTicketDesign, ticketDesign } from '../../../core/ticket-designs';
import { ApiError } from '../../../core/types/common.model';
import { todayInMexico } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { PageHeader } from '../shared/page-header';
import { TicketPreviewData, TicketStylePicker } from '../shared/ticket-style-picker';
import { EVENT_STATUS_LABEL, PAYMENT_CONCEPT_LABEL, PAYMENT_METHOD_LABEL, entries } from '../shared/labels';

/**
 * Flujo rápido "Hoy contraté una boda para el 24 de octubre":
 * 1 cliente · 2 fecha · 3 tipo · 4 paquete · 5 precio · 6 apartado · 7 guardar.
 * Al guardar: el calendario público se marca como ocupado y se crea el ticket para compartir.
 */
@Component({
  selector: 'app-event-create',
  imports: [ReactiveFormsModule, RouterLink, Btn, PageHeader, TicketStylePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './event-create.html',
  styleUrl: './event-create.css',
})
export class EventCreate implements OnInit {
  /** ?date=YYYY-MM-DD (desde el calendario). */
  readonly date = input<string | undefined>();

  private readonly agenda = inject(AgendaApiService);
  private readonly content = inject(ContentApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly statusOptions = entries(EVENT_STATUS_LABEL);
  protected readonly conceptOptions = entries(PAYMENT_CONCEPT_LABEL);
  protected readonly methodOptions = entries(PAYMENT_METHOD_LABEL);

  protected readonly services = toSignal(this.content.services().pipe(catchError(() => of([]))), { initialValue: [] });
  protected readonly packages = toSignal(this.content.packages().pipe(catchError(() => of([]))), { initialValue: [] });

  protected readonly clientMode = signal<'existing' | 'new'>('new');
  protected readonly selectedClient = signal<Client | null>(null);
  protected readonly saving = signal(false);
  protected readonly serverErrors = signal<Record<string, string>>({});

  protected readonly form = this.fb.group({
    clientSearch: [''],
    newClient: this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(160)]],
      phone: [''],
      email: ['', Validators.email],
    }),
    title: ['', [Validators.required, Validators.maxLength(160)]],
    eventDate: ['', Validators.required],
    startTime: [''],
    endTime: [''],
    serviceId: [''],
    packageId: [''],
    totalPrice: [null as number | null, [Validators.min(0)]],
    venue: [''],
    city: ['Aguascalientes'],
    status: ['confirmed' as const as string],
    blocksAvailability: [true],
    notes: [''],
    withPayment: [true],
    sendConfirmation: [true],
    payment: this.fb.group({
      amount: [null as number | null, [Validators.min(0)]],
      paidAt: [todayInMexico()],
      concept: ['apartado'],
      method: ['transferencia'],
    }),
  });

  /** Búsqueda de clientes existentes (con espera breve para no saturar la API). */
  protected readonly clientResults = toSignal(
    this.form.controls.clientSearch.valueChanges.pipe(
      debounceTime(250),
      map((q) => q.trim()),
      distinctUntilChanged(),
      switchMap((q) => (q.length < 2 ? of([]) : this.agenda.clients({ q, limit: 8 }).pipe(map((r) => r.items), catchError(() => of([]))))),
    ),
    { initialValue: [] as Client[] },
  );

  private readonly serviceId = toSignal(this.form.controls.serviceId.valueChanges.pipe(startWith('')), { initialValue: '' });

  // ---- Ticket: diseño, color y vista previa ----
  protected readonly design = signal('envelope');
  protected readonly palette = signal('mocha');
  /** Si el fotógrafo ya eligió un diseño a mano, no se vuelve a sugerir al cambiar el tipo de evento. */
  private designPicked = false;
  private readonly formValue = toSignal(this.form.valueChanges.pipe(startWith(null)), { initialValue: null });

  /** Datos del formulario para la vista previa del ticket (con ejemplos mientras faltan). */
  protected readonly ticketPreview = computed<TicketPreviewData>(() => {
    this.formValue();
    const v = this.form.getRawValue();
    const service = this.services().find((s) => s.id === v.serviceId);
    return {
      title: v.title.trim() || 'Camila & Sebastián',
      monogram: null,
      message: null,
      eventDate: /^\d{4}-\d{2}-\d{2}$/.test(v.eventDate) ? v.eventDate : todayInMexico(),
      startTime: v.startTime || null,
      endTime: v.endTime || null,
      venue: null,
      city: null,
      eventType: service?.slug ?? null,
      cover: service?.cover ?? service?.hero ?? null,
    };
  });

  /** Correo del cliente (nuevo o existente): si lo hay, se puede enviar la confirmación al guardar. */
  protected readonly clientEmail = computed(() => {
    this.formValue();
    return this.clientMode() === 'existing' ? (this.selectedClient()?.email ?? '') : this.form.controls.newClient.controls.email.value.trim();
  });

  /** Tipo de evento elegido en el formulario. */
  protected readonly selectedService = computed(() => this.services().find((s) => s.id === this.serviceId()) ?? null);

  /** Solo los paquetes del tipo de evento elegido; sin tipo de evento (o si no tiene paquetes) no hay ninguno. */
  protected readonly packageOptions = computed(() => {
    const service = this.selectedService();
    if (!service) return [];
    return this.packages().filter((p) => p.isActive && service.packageIds.includes(p.id));
  });

  ngOnInit(): void {
    const date = this.date();
    if (date && /^\d{4}-\d{2}-\d{2}$/.test(date)) this.form.controls.eventDate.setValue(date);
  }

  constructor() {
    // Al cambiar el tipo de evento, se quita el paquete si no pertenece al nuevo tipo.
    this.form.controls.serviceId.valueChanges.subscribe((serviceId) => {
      const service = this.services().find((s) => s.id === serviceId);
      const current = this.form.controls.packageId.value;
      if (current && !service?.packageIds.includes(current)) this.form.controls.packageId.setValue('');
    });
    // Al elegir paquete con precio definitivo, sugerirlo como precio total.
    this.form.controls.packageId.valueChanges.subscribe((id) => {
      const pkg = this.packages().find((p) => p.id === id);
      if (pkg?.price && !this.form.controls.totalPrice.value) {
        this.form.controls.totalPrice.setValue(pkg.price);
      }
    });

    // Sugerir el diseño del ticket según el tipo de evento (boda → sobre, XV → floral, graduación…).
    this.form.controls.serviceId.valueChanges.subscribe((id) => {
      if (this.designPicked) return;
      const slug = this.services().find((s) => s.id === id)?.slug;
      const suggested = suggestedTicketDesign(slug);
      if (suggested !== this.design()) {
        this.design.set(suggested);
        this.palette.set(ticketDesign(suggested).palettes[0].key);
      }
    });

    // Sugerir el nombre del evento a partir del cliente nuevo.
    this.form.controls.newClient.controls.name.valueChanges.subscribe((name) => {
      const title = this.form.controls.title;
      if (!title.dirty) title.setValue(name);
    });
  }

  protected pickDesign(design: string): void {
    this.designPicked = true;
    this.design.set(design);
  }

  protected setClientMode(mode: 'existing' | 'new'): void {
    this.clientMode.set(mode);
    this.selectedClient.set(null);
    const newClient = this.form.controls.newClient;
    if (mode === 'new') newClient.enable();
    else newClient.disable();
  }

  protected pickClient(client: Client): void {
    this.selectedClient.set(client);
    this.form.controls.clientSearch.setValue('', { emitEvent: true });
    if (!this.form.controls.title.dirty) this.form.controls.title.setValue(client.name);
  }

  protected invalid(path: string): boolean {
    const control = this.form.get(path);
    return !!control && control.invalid && control.touched;
  }

  protected submit(): void {
    this.form.markAllAsTouched();
    if (this.clientMode() === 'existing' && !this.selectedClient()) {
      this.toast.error('Selecciona un cliente existente o captura uno nuevo.');
      return;
    }
    if (this.form.invalid) {
      this.toast.error('Revisa los campos marcados.');
      return;
    }

    const v = this.form.getRawValue();
    const payment = v.withPayment && Number(v.payment.amount) > 0 ? { ...v.payment, amount: Number(v.payment.amount) } : undefined;
    const body = {
      ...(this.clientMode() === 'existing' ? { clientId: this.selectedClient()!.id } : { newClient: v.newClient }),
      title: v.title,
      eventDate: v.eventDate,
      startTime: v.startTime || null,
      endTime: v.endTime || null,
      serviceId: v.serviceId || null,
      packageId: v.packageId || null,
      totalPrice: Number(v.totalPrice) || 0,
      venue: v.venue || null,
      city: v.city || null,
      status: v.status,
      blocksAvailability: v.blocksAvailability,
      notes: v.notes || null,
      initialPayment: payment,
      reservation: { ticketDesign: this.design(), ticketPalette: this.palette() },
    };

    this.saving.set(true);
    this.serverErrors.set({});
    this.agenda.createEvent(body).subscribe({
      next: (event) => {
        this.toast.success(v.blocksAvailability ? 'Evento guardado. La fecha ya aparece como ocupada.' : 'Evento guardado.');
        const confirm = v.sendConfirmation && !!event.client.email;
        void this.router.navigate(['/panel/events', event.id], { queryParams: { created: 1, ...(confirm ? { confirm: 1 } : {}) } });
      },
      error: (err: ApiError) => {
        this.saving.set(false);
        if (err.fields) {
          this.serverErrors.set(err.fields);
          this.toast.error(err.message);
        }
      },
    });
  }
}
