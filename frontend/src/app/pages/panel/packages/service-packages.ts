import { ChangeDetectionStrategy, Component, computed, inject, input, linkedSignal, output, signal } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudioPackage } from '../../../core/types/catalog.model';
import { formatMoney } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { ConfirmService } from '../shared/confirm.service';
import { PackageEditor } from './package-editor';

/**
 * Paquetes de un servicio como tarjetas: se acomodan arrastrando (ese orden es el de su página),
 * se editan con un clic, se agregan (nuevos o ya existentes) y se quitan del servicio.
 * Lo usan la ventana de cada servicio en Paquetes y la pestaña Paquetes del servicio.
 */
@Component({
  selector: 'app-service-packages',
  imports: [CdkDropList, CdkDrag, Btn, Icon, PackageEditor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (list().length) {
      <p class="p-help">Arrastra las tarjetas para cambiar el orden en la página de {{ serviceName() }}. Haz clic en una para editarla.</p>
      <div class="grid" cdkDropList cdkDropListOrientation="mixed" (cdkDropListDropped)="drop($event)">
        @for (p of list(); track p.id) {
          <article class="pkg" cdkDrag (cdkDragStarted)="dragging = true" [class.is-inactive]="!p.isActive">
            <button type="button" class="pkg__body" (click)="open(p)">
              <span class="pkg__top">
                <span class="pkg__index">{{ $index + 1 }}</span>
                @if (p.isFeatured) {
                  <span class="p-badge p-badge--accent">Recomendado</span>
                }
                @if (!p.isActive) {
                  <span class="p-badge">Inactivo</span>
                }
              </span>
              <strong class="pkg__name">{{ p.name }}</strong>
              <span class="pkg__price" [class.is-pending]="p.price === null || p.isPriceProvisional">
                {{ p.price === null ? 'Sin precio' : p.isPriceProvisional ? money(p.price) + ' · oculto' : money(p.price) }}
              </span>
              <span class="p-help">{{ p.features.length }} característica(s)</span>
              <span class="pkg__edit">Editar →</span>
            </button>
            <button type="button" class="p-icon-btn p-icon-btn--danger pkg__remove" (click)="unlink(p)" [attr.aria-label]="'Quitar ' + p.name + ' de ' + serviceName()" title="Quitar de este servicio">
              <app-icon name="close" [size]="14" />
            </button>
          </article>
        }
      </div>
    } @else {
      <p class="p-card p-empty">{{ serviceName() }} todavía no tiene paquetes. Sin paquetes, su página invita a pedir una cotización.</p>
    }

    <div class="p-row actions">
      <button appBtn size="sm" type="button" (click)="editing.set('new')">+ Nuevo paquete</button>
      @if (others().length) {
        <label class="add-existing">
          <span class="p-help">o agrega uno que ya existe:</span>
          <select class="field__control" (change)="link($any($event.target).value); $any($event.target).value = ''">
            <option value="">Elegir paquete…</option>
            @for (o of others(); track o.id) {
              <option [value]="o.id">{{ o.name }}{{ o.price !== null ? ' · ' + money(o.price) : '' }}</option>
            }
          </select>
        </label>
      }
    </div>

    @if (editing(); as e) {
      <app-package-editor [pkg]="e" [presetServiceIds]="[serviceId()]" (saved)="onSaved()" (removed)="onSaved()" (closed)="editing.set(null)" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-4); }
    .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(190px, 1fr)); gap: var(--space-3); }
    .pkg {
      position: relative;
      display: grid;
      border: var(--hairline);
      background: var(--color-surface);
      cursor: grab;
      transition: border-color var(--duration-fast), box-shadow var(--duration-fast), translate var(--duration-fast);
    }
    .pkg:hover { border-color: var(--color-primary); box-shadow: var(--shadow-md, 0 6px 18px rgb(0 0 0 / 0.08)); translate: 0 -2px; }
    .pkg.cdk-drag-preview { box-shadow: var(--shadow-lg); z-index: var(--z-modal) !important; }
    .pkg.cdk-drag-placeholder { opacity: 0.35; }
    .pkg.is-inactive { opacity: 0.6; }
    .pkg__body { display: grid; gap: var(--space-1); padding: var(--space-4); border: 0; background: none; text-align: left; cursor: inherit; }
    .pkg__top { display: flex; flex-wrap: wrap; align-items: center; gap: var(--space-2); min-height: 1.5rem; padding-right: 2rem; }
    .pkg__index { display: grid; place-items: center; width: 1.5rem; height: 1.5rem; border-radius: 50%; background: var(--color-background); font-size: var(--text-xs, 0.75rem); color: var(--color-text-muted); }
    .pkg__name { margin-top: var(--space-1); font-family: var(--font-serif); font-size: var(--text-xl); font-weight: 500; line-height: 1.15; }
    .pkg__price { font-size: var(--text-sm); }
    .pkg__price.is-pending { font-style: italic; color: var(--color-primary); }
    .pkg__edit { margin-top: var(--space-2); font-size: var(--text-sm); color: var(--color-primary); }
    .pkg__remove { position: absolute; top: var(--space-2); right: var(--space-2); }
    .actions { align-items: end; }
    .add-existing { display: grid; gap: var(--space-1); min-width: min(100%, 260px); }
  `,
})
export class ServicePackages {
  readonly serviceId = input.required<string>();
  readonly serviceName = input.required<string>();
  /** Ids de los paquetes del servicio, en su orden. */
  readonly packageIds = input.required<string[]>();
  /** Todos los paquetes (para mostrar los del servicio y ofrecer los demás). */
  readonly packages = input.required<StudioPackage[]>();
  /** Algo cambió (orden, alta, edición o baja): el padre vuelve a cargar. */
  readonly changed = output<void>();

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly money = formatMoney;
  protected readonly editing = signal<StudioPackage | 'new' | null>(null);
  /** Evita abrir el editor al soltar una tarjeta que se estaba arrastrando. */
  protected dragging = false;

  /** Orden local: cambia al instante al arrastrar y se reinicia cuando llegan datos nuevos. */
  private readonly order = linkedSignal(() => this.packageIds());

  protected readonly list = computed(() => {
    const byId = new Map(this.packages().map((p) => [p.id, p]));
    return this.order()
      .map((id) => byId.get(id))
      .filter((p): p is StudioPackage => !!p);
  });

  protected readonly others = computed(() => {
    const mine = new Set(this.order());
    return this.packages().filter((p) => !mine.has(p.id));
  });

  protected open(pkg: StudioPackage): void {
    if (this.dragging) {
      this.dragging = false;
      return;
    }
    this.editing.set(pkg);
  }

  protected drop(event: CdkDragDrop<unknown>): void {
    // El clic que sigue a soltar no debe abrir el editor.
    setTimeout(() => (this.dragging = false));
    if (event.previousIndex === event.currentIndex) return;
    const ids = [...this.order()];
    moveItemInArray(ids, event.previousIndex, event.currentIndex);
    this.order.set(ids);
    this.api.reorderServicePackages(this.serviceId(), ids).subscribe(() => {
      this.toast.success('Orden actualizado.');
      this.changed.emit();
    });
  }

  protected link(packageId: string): void {
    const pkg = this.packages().find((p) => p.id === packageId);
    if (!pkg) return;
    this.api.updatePackage(pkg.id, { serviceIds: [...(pkg.serviceIds ?? []), this.serviceId()] }).subscribe(() => {
      this.toast.success(`"${pkg.name}" agregado a ${this.serviceName()}.`);
      this.changed.emit();
    });
  }

  protected async unlink(pkg: StudioPackage): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Quitar "${pkg.name}"`,
      message: `Deja de mostrarse en ${this.serviceName()}. El paquete no se borra: sigue en los demás servicios y en Paquetes.`,
      confirmLabel: 'Quitar del servicio',
    });
    if (!ok) return;
    const serviceIds = (pkg.serviceIds ?? []).filter((id) => id !== this.serviceId());
    this.api.updatePackage(pkg.id, { serviceIds }).subscribe(() => {
      this.toast.success(`"${pkg.name}" quitado de ${this.serviceName()}.`);
      this.changed.emit();
    });
  }

  protected onSaved(): void {
    this.editing.set(null);
    this.changed.emit();
  }
}
