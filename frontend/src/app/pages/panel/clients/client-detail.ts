import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Client, EventStatus, PaymentSummary } from '../../../core/types/agenda.model';
import { formatMoney } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonText } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ConfirmService } from '../shared/confirm.service';
import { EVENT_STATUS_LABEL, shortDate } from '../shared/labels';

interface ClientEvent {
  id: string;
  title: string;
  eventDate: string;
  status: EventStatus;
  service: { id: string; name: string } | null;
  payment: PaymentSummary;
}

@Component({
  selector: 'app-client-detail',
  imports: [ReactiveFormsModule, RouterLink, Btn, SkeletonText, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (client(); as c) {
      <app-page-header [title]="c.name" backLink="/panel/clients" backLabel="Clientes">
        <a appBtn variant="outline" routerLink="/panel/events/new">+ Nuevo evento</a>
        <button appBtn variant="ghost" type="button" class="danger" (click)="remove()">Eliminar</button>
      </app-page-header>

      <div class="layout">
        <form class="p-card p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
          <h2 class="p-card__title">Datos</h2>
          <div class="field">
            <label class="field__label" for="name">Nombre</label>
            <input id="name" class="field__control" formControlName="name" />
          </div>
          <div class="field">
            <label class="field__label" for="phone">Teléfono / WhatsApp</label>
            <input id="phone" class="field__control" formControlName="phone" inputmode="tel" />
          </div>
          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input id="email" class="field__control" type="email" formControlName="email" />
          </div>
          <div class="field">
            <label class="field__label" for="notes">Notas</label>
            <textarea id="notes" class="field__control" formControlName="notes"></textarea>
          </div>
          <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.pristine || form.invalid">Guardar</button>
        </form>

        <section class="p-card">
          <h2 class="p-card__title">Eventos</h2>
          @if (events().length) {
            <ul class="events">
              @for (e of events(); track e.id) {
                <li>
                  <a [routerLink]="['/panel/events', e.id]">
                    <strong>{{ e.title }}</strong>
                    <span class="p-help">{{ shortDate(e.eventDate) }} · {{ e.service?.name ?? 'Evento' }}</span>
                  </a>
                  <span class="p-badge" [class]="'p-badge p-badge--' + e.status">{{ statusLabel[e.status] }}</span>
                  <span class="num">{{ e.payment.balance > 0 ? money(e.payment.balance) + ' pendiente' : 'Liquidado' }}</span>
                </li>
              }
            </ul>
          } @else {
            <p class="p-help">Sin eventos todavía.</p>
          }
        </section>
      </div>
    } @else {
      <app-skeleton-text [lines]="6" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-6); }
    .danger { color: var(--color-danger); }
    .layout { display: grid; grid-template-columns: minmax(280px, 1fr) minmax(0, 1.4fr); gap: var(--space-5); align-items: start; }
    .events { display: grid; list-style: none; }
    .events li { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-3); padding: var(--space-3) 0; border-bottom: var(--hairline); }
    .events a { display: grid; flex: 1; min-width: 12rem; }
    .num { font-size: var(--text-sm); color: var(--color-text-muted); }
    @media (max-width: 900px) { .layout { grid-template-columns: 1fr; } }
  `,
})
export class ClientDetail implements OnInit {
  readonly id = input.required<string>();

  private readonly agenda = inject(AgendaApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);

  protected readonly client = signal<Client | null>(null);
  protected readonly events = signal<ClientEvent[]>([]);
  protected readonly saving = signal(false);
  protected readonly statusLabel = EVENT_STATUS_LABEL;
  protected readonly shortDate = shortDate;
  protected readonly money = formatMoney;

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    phone: [''],
    email: ['', Validators.email],
    notes: [''],
  });

  ngOnInit(): void {
    this.agenda.client(this.id()).subscribe({
      next: (c) => {
        this.client.set(c);
        this.events.set(c.events as ClientEvent[]);
        this.form.reset({ name: c.name, phone: c.phone ?? '', email: c.email ?? '', notes: c.notes ?? '' });
      },
      error: () => void this.router.navigate(['/panel/clients']),
    });
  }

  protected save(): void {
    this.saving.set(true);
    this.agenda.updateClient(this.id(), this.form.getRawValue()).subscribe({
      next: (c) => {
        this.client.set({ ...this.client()!, ...c });
        this.form.markAsPristine();
        this.saving.set(false);
        this.toast.success('Cliente actualizado.');
      },
      error: () => this.saving.set(false),
    });
  }

  protected async remove(): Promise<void> {
    const count = this.events().length;
    const ok = await this.confirm.ask({
      title: 'Eliminar cliente',
      message: count
        ? `Este cliente tiene ${count} evento(s). Se eliminarán también sus eventos, pagos y tickets.`
        : '¿Eliminar este cliente?',
      confirmLabel: 'Eliminar',
      danger: true,
    });
    if (!ok) return;
    this.agenda.deleteClient(this.id(), count > 0).subscribe(() => {
      this.toast.success('Cliente eliminado.');
      void this.router.navigate(['/panel/clients']);
    });
  }
}
