import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminService } from '../../../core/types/catalog.model';
import { Btn } from '../../../components/buttons/btn';
import { Photo } from '../../../components/photo/photo';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';

type ServiceRow = AdminService & { imageCount?: number };

@Component({
  selector: 'app-services-admin-list',
  imports: [RouterLink, CdkDropList, CdkDrag, CdkDragHandle, Btn, Photo, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Servicios" subtitle="Arrastra para cambiar el orden en el sitio. Cada servicio tiene su propia página, galería y paquetes.">
      <a appBtn routerLink="/panel/services/new">+ Nuevo servicio</a>
    </app-page-header>

    @if (services(); as list) {
      <ul class="p-list" cdkDropList (cdkDropListDropped)="drop($event)">
        @for (s of list; track s.id) {
          <li class="p-list-item" cdkDrag [class.is-hidden]="!s.isVisible">
            <span class="p-drag" cdkDragHandle aria-label="Arrastrar para ordenar">⠿</span>
            <app-photo class="thumb" [media]="s.cover" ratio="3 / 4" sizes="48px" [maxWidth]="120" />
            <div class="info">
              <a [routerLink]="['/panel/services', s.id]"><strong>{{ s.name }}</strong></a>
              <span class="p-help">/events/{{ s.slug }} · {{ s.imageCount ?? 0 }} foto(s) · {{ s.packageIds.length }} paquete(s)</span>
            </div>
            @if (s.isProvisional) {
              <span class="p-badge p-badge--warning">Textos provisionales</span>
            }
            <label class="p-check">
              <input type="checkbox" [checked]="s.isVisible" (change)="toggle(s, $any($event.target).checked)" />
              Visible
            </label>
            <a appBtn size="sm" variant="ghost" [routerLink]="['/panel/services', s.id]">Editar</a>
          </li>
        }
      </ul>
    } @else {
      <app-skeleton-table [rows]="8" [columns]="3" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .thumb { width: 42px; flex: none; }
    .info { display: grid; flex: 1; min-width: 0; overflow-wrap: anywhere; }
    .is-hidden { opacity: 0.55; }
    /* Celular: nombre y datos en la primera línea; insignia, "Visible" y "Editar" debajo. */
    @media (max-width: 640px) {
      .info { flex-basis: calc(100% - 90px); }
    }
  `,
})
export class ServicesAdminList {
  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  protected readonly services = signal<ServiceRow[] | null>(null);

  constructor() {
    this.api.services().subscribe((list) => this.services.set(list));
  }

  protected drop(event: CdkDragDrop<ServiceRow[]>): void {
    const list = [...(this.services() ?? [])];
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.services.set(list);
    this.api.reorderServices(list.map((s) => s.id)).subscribe(() => this.toast.success('Orden actualizado.'));
  }

  protected toggle(service: ServiceRow, isVisible: boolean): void {
    this.api.setServiceVisibility(service.id, isVisible).subscribe(() => {
      this.services.update((list) => list?.map((s) => (s.id === service.id ? { ...s, isVisible } : s)) ?? null);
      this.toast.success(isVisible ? `"${service.name}" visible en el sitio.` : `"${service.name}" oculto del sitio.`);
    });
  }
}
