import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { forkJoin } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminService, StudioPackage } from '../../../core/types/catalog.model';
import { formatMoney } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ServiceTile } from '../shared/service-tile';
import { ConfirmService } from '../shared/confirm.service';
import { PackageEditor } from './package-editor';
import { ServicePackages } from './service-packages';

/**
 * Paquetes organizados por servicio: cada tarjeta muestra la foto del servicio y la lista de sus paquetes.
 * Clic en la tarjeta → ventana con esos paquetes (para acomodarlos y elegir cuál editar).
 * Los paquetes que no están en ningún servicio aparecen aparte.
 */
@Component({
  selector: 'app-packages-admin',
  imports: [CdkDropList, CdkDrag, Btn, Icon, SkeletonTable, PageHeader, ServiceTile, PackageEditor, ServicePackages],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  templateUrl: './packages-admin.html',
  styleUrl: './packages-admin.css',
})
export class PackagesAdmin {
  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly money = formatMoney;
  protected readonly services = signal<AdminService[] | null>(null);
  protected readonly packages = signal<StudioPackage[]>([]);
  /** Servicio abierto en la ventana de sus paquetes. */
  protected readonly openId = signal<string | null>(null);
  /** Editor abierto desde fuera de un servicio (paquete nuevo o uno sin servicio). */
  protected readonly editing = signal<StudioPackage | 'new' | null>(null);
  protected dragging = false;

  protected readonly byId = computed(() => new Map(this.packages().map((p) => [p.id, p])));
  protected readonly openService = computed(() => this.services()?.find((s) => s.id === this.openId()) ?? null);
  protected readonly unassigned = computed(() => this.packages().filter((p) => !p.serviceIds?.length));

  constructor() {
    this.load();
  }

  protected load(): void {
    forkJoin([this.api.services(), this.api.packages()]).subscribe(([services, packages]) => {
      this.services.set(services);
      this.packages.set(packages);
    });
  }

  protected packagesOf(service: AdminService): StudioPackage[] {
    const map = this.byId();
    return service.packageIds.map((id) => map.get(id)).filter((p): p is StudioPackage => !!p);
  }

  protected open(service: AdminService): void {
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    this.openId.set(service.id);
  }

  protected drop(event: CdkDragDrop<unknown>): void {
    setTimeout(() => (this.dragging = false));
    const list = [...(this.services() ?? [])];
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.services.set(list);
    this.api.reorderServices(list.map((s) => s.id)).subscribe(() => this.toast.success('Orden de servicios actualizado.'));
  }

  protected onEditorDone(): void {
    this.editing.set(null);
    this.load();
  }

  /** Escape cierra la ventana del servicio (el editor y las confirmaciones se cierran solos). */
  protected onEscape(): void {
    if (this.confirm.pending() || this.editing()) return;
    if (document.querySelector('app-service-packages app-package-editor')) return;
    this.openId.set(null);
  }
}
