import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, map, of, switchMap, combineLatest } from 'rxjs';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Client } from '../../../core/types/agenda.model';
import { Paginated } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';

/** CRM sencillo: buscar, crear y abrir clientes. */
@Component({
  selector: 'app-clients-list',
  imports: [FormsModule, ReactiveFormsModule, Btn, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Clientes" subtitle="Personas que te han contratado o están por hacerlo.">
      <button appBtn type="button" (click)="showForm.set(!showForm())">{{ showForm() ? 'Cerrar' : '+ Nuevo cliente' }}</button>
    </app-page-header>

    @if (showForm()) {
      <form class="p-card p-form fade-up" [formGroup]="form" (ngSubmit)="create()" novalidate>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="name">Nombre *</label>
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
          <div class="field p-span-all">
            <label class="field__label" for="notes">Notas</label>
            <textarea id="notes" class="field__control" formControlName="notes"></textarea>
          </div>
        </div>
        <div class="p-row"><span class="p-spacer"></span><button appBtn type="submit" [disabled]="form.invalid || saving()" [loading]="saving()">Guardar cliente</button></div>
      </form>
    }

    <input class="field__control search" type="search" placeholder="Buscar por nombre, teléfono o email" [ngModel]="query()" (ngModelChange)="query.set($event); page.set(1)" aria-label="Buscar clientes" />

    @if (result(); as r) {
      @if (r.items.length) {
        <div class="p-table-wrap">
          <table class="p-table">
            <thead><tr><th>Nombre</th><th>Teléfono</th><th>Email</th><th class="num">Eventos</th></tr></thead>
            <tbody>
              @for (c of r.items; track c.id) {
                <tr class="is-link" (click)="open(c)" tabindex="0" (keydown.enter)="open(c)">
                  <td><strong>{{ c.name }}</strong></td>
                  <td>{{ c.phone ?? '—' }}</td>
                  <td>{{ c.email ?? '—' }}</td>
                  <td class="num">{{ c.eventsCount ?? 0 }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <div class="p-row pager">
          <span class="p-help">{{ r.total }} cliente(s)</span>
          <span class="p-spacer"></span>
          <button appBtn size="sm" variant="ghost" type="button" [disabled]="page() === 1" (click)="page.set(page() - 1)">← Anterior</button>
          <button appBtn size="sm" variant="ghost" type="button" [disabled]="!r.hasMore" (click)="page.set(page() + 1)">Siguiente →</button>
        </div>
      } @else {
        <div class="p-card p-empty">{{ query() ? 'Ningún cliente coincide con la búsqueda.' : 'Todavía no hay clientes.' }}</div>
      }
    } @else {
      <app-skeleton-table [rows]="6" [columns]="4" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .search { max-width: 420px; }
    .pager { margin-top: calc(-1 * var(--space-2)); }
  `,
})
export class ClientsList {
  private readonly agenda = inject(AgendaApiService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  protected readonly query = signal('');
  protected readonly page = signal(1);
  protected readonly showForm = signal(false);
  protected readonly saving = signal(false);
  private readonly reload = signal(0);

  protected readonly form = inject(NonNullableFormBuilder).group({
    name: ['', [Validators.required, Validators.maxLength(160)]],
    phone: [''],
    email: ['', Validators.email],
    notes: [''],
  });

  protected readonly result = toSignal(
    combineLatest([toObservable(this.query), toObservable(this.page), toObservable(this.reload)]).pipe(
      debounceTime(200),
      switchMap(([q, page]) =>
        this.agenda.clients({ q: q.trim() || undefined, page, limit: 25 }).pipe(catchError(() => of(null as Paginated<Client> | null))),
      ),
      map((r) => r ?? { items: [], total: 0, page: 1, limit: 25, hasMore: false }),
    ),
  );

  protected create(): void {
    if (this.form.invalid) return;
    this.saving.set(true);
    this.agenda.createClient(this.form.getRawValue()).subscribe({
      next: (client) => {
        this.toast.success('Cliente guardado.');
        void this.router.navigate(['/panel/clients', client.id]);
      },
      error: () => this.saving.set(false),
    });
  }

  protected open(c: Client): void {
    void this.router.navigate(['/panel/clients', c.id]);
  }
}
