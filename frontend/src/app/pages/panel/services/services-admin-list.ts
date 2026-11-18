import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminService } from '../../../core/types/catalog.model';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ServiceTile } from '../shared/service-tile';

type ServiceRow = AdminService & { imageCount?: number };

/** Servicios como tarjetas con foto (como en el sitio). Se acomodan arrastrando; clic para editar. */
@Component({
  selector: 'app-services-admin-list',
  imports: [RouterLink, CdkDropList, CdkDrag, Btn, SkeletonTable, PageHeader, ServiceTile],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Servicios" subtitle="Arrastra las tarjetas para cambiar el orden en el sitio. Haz clic en una para editar su página, galería y paquetes.">
      <a appBtn routerLink="/panel/services/new">+ Nuevo servicio</a>
    </app-page-header>

    @if (services(); as list) {
      <div class="grid" cdkDropList cdkDropListOrientation="mixed" (cdkDropListDropped)="drop($event)">
        @for (s of list; track s.id) {
          <app-service-tile class="tile" cdkDrag (cdkDragStarted)="dragging = true" [name]="s.name" [cover]="s.cover" [hidden]="!s.isVisible" tabindex="0" role="link" [attr.aria-label]="'Editar ' + s.name" (click)="open(s)" (keydown.enter)="open(s)">
            <span tileBadges class="p-badge order">{{ $index + 1 }}</span>
            @if (!s.isVisible) {
              <span tileBadges class="p-badge">Oculto</span>
            }
            @if (s.isProvisional) {
              <span tileBadges class="p-badge p-badge--warning">Textos provisionales</span>
            }
            <span class="p-help">{{ s.imageCount ?? 0 }} foto(s) · {{ s.packageIds.length }} paquete(s)</span>
            <label class="p-check" (click)="$event.stopPropagation()">
              <input type="checkbox" [checked]="s.isVisible" (change)="toggle(s, $any($event.target).checked)" />
              Visible en el sitio
            </label>
          </app-service-tile>
        }
      </div>
    } @else {
      <app-skeleton-table [rows]="8" [columns]="3" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: var(--space-4); }
    .tile { cursor: grab; }
    .tile:hover, .tile:focus-visible { outline: none; }
    .tile:hover, .tile:focus-visible { border-color: var(--color-primary); box-shadow: var(--shadow-md, 0 8px 22px rgb(0 0 0 / 0.1)); translate: 0 -3px; }
    .tile.cdk-drag-preview { box-shadow: var(--shadow-lg); }
    .tile.cdk-drag-placeholder { opacity: 0.35; }
    .order { background: rgb(255 255 255 / 0.9); color: var(--color-text); }
    @media (max-width: 480px) {
      .grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: var(--space-3); }
    }
  `,
})
export class ServicesAdminList {
  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  protected readonly services = signal<ServiceRow[] | null>(null);
  /** Evita abrir el servicio al soltar una tarjeta que se estaba arrastrando. */
  protected dragging = false;

  constructor() {
    this.api.services().subscribe((list) => this.services.set(list));
  }

  protected open(service: ServiceRow): void {
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    void this.router.navigate(['/panel/services', service.id]);
  }

  protected drop(event: CdkDragDrop<ServiceRow[]>): void {
    setTimeout(() => (this.dragging = false));
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
