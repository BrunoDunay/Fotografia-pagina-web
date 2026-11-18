import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, output, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudioPackage } from '../../../core/types/catalog.model';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { ConfirmService } from '../shared/confirm.service';

type FeatureGroup = FormGroup<{ label: FormControl<string>; value: FormControl<string> }>;

/**
 * Editor de un paquete en una ventana lateral. Lo usan Paquetes y la pestaña Paquetes de cada servicio.
 * Uso: <app-package-editor [pkg]="p | 'new'" [presetServiceIds]="[serviceId]" (saved)="…" (removed)="…" (closed)="…" />
 */
@Component({
  selector: 'app-package-editor',
  imports: [ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragHandle, Btn, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'onEscape()' },
  template: `
    <div class="backdrop" (click)="close()"></div>
    <form class="sheet p-form" role="dialog" aria-modal="true" aria-labelledby="pkg-editor-title" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <div class="p-row head">
        <div>
          <h2 id="pkg-editor-title" class="p-card__title">{{ isNew() ? 'Nuevo paquete' : 'Editar paquete' }}</h2>
          @if (serviceLabel(); as label) {
            <p class="p-help">{{ label }}</p>
          }
        </div>
        <span class="p-spacer"></span>
        <button type="button" class="p-icon-btn" (click)="close()" aria-label="Cerrar editor"><app-icon name="close" [size]="16" /></button>
      </div>

      <div class="field">
        <label class="field__label" for="pkg-name">Nombre *</label>
        <input id="pkg-name" class="field__control" formControlName="name" />
      </div>
      <div class="field">
        <label class="field__label" for="pkg-subtitle">Subtítulo</label>
        <input id="pkg-subtitle" class="field__control" formControlName="subtitle" placeholder="Ej. Ideal para bodas íntimas" />
      </div>
      <div class="p-grid">
        <div class="field">
          <label class="field__label" for="pkg-price">Precio (MXN)</label>
          <input id="pkg-price" class="field__control" type="number" min="0" step="100" formControlName="price" placeholder="Sin definir" />
        </div>
        <label class="p-check align-end"><input type="checkbox" formControlName="isPriceProvisional" /> Ocultar el precio al público</label>
      </div>
      <div class="p-row">
        <label class="p-check"><input type="checkbox" formControlName="isFeatured" /> Recomendado</label>
        <label class="p-check"><input type="checkbox" formControlName="isActive" /> Activo (visible)</label>
      </div>

      <div class="field">
        <span class="field__label">Características</span>
        <div formArrayName="features" cdkDropList (cdkDropListDropped)="moveFeature($event)" class="features">
          @for (f of features.controls; track f; let i = $index) {
            <div class="feature" [formGroupName]="i" cdkDrag>
              <span class="p-drag" cdkDragHandle>⠿</span>
              <input class="field__control" formControlName="label" placeholder="Ej. USB en caja de madera" aria-label="Característica" />
              <input class="field__control value" formControlName="value" placeholder="Detalle (opcional)" aria-label="Detalle" />
              <button type="button" class="p-icon-btn p-icon-btn--danger" (click)="features.removeAt(i); form.markAsDirty()" aria-label="Quitar">
                <app-icon name="close" [size]="14" />
              </button>
            </div>
          }
        </div>
        <button type="button" class="p-link add" (click)="addFeature()">+ Agregar característica</button>
      </div>

      <div class="field">
        <span class="field__label">Se muestra en</span>
        <span class="field__hint">Un paquete puede estar en varios servicios.</span>
        <div class="services">
          @for (s of services(); track s.id) {
            <label class="p-check">
              <input type="checkbox" [checked]="form.controls.serviceIds.value.includes(s.id)" (change)="toggleService(s.id, $any($event.target).checked)" />
              {{ s.name }}
            </label>
          }
        </div>
      </div>

      <div class="p-row foot">
        @if (!isNew()) {
          <button appBtn variant="ghost" type="button" class="danger" (click)="remove()">Eliminar</button>
        }
        <span class="p-spacer"></span>
        <button appBtn variant="ghost" type="button" (click)="close()">Cancelar</button>
        <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar paquete</button>
      </div>
    </form>
  `,
  styles: `
    .backdrop { position: fixed; inset: 0; z-index: calc(var(--z-modal) - 4); background: var(--color-overlay); }
    .sheet {
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      z-index: calc(var(--z-modal) - 3);
      width: min(600px, 100vw);
      overflow-y: auto;
      padding: var(--space-6);
      background: var(--color-surface);
      box-shadow: var(--shadow-lg);
      animation: slide-in var(--duration-base, 240ms) var(--ease-out, ease-out);
    }
    @keyframes slide-in { from { translate: 24px 0; opacity: 0; } }
    .head { align-items: flex-start; }
    .foot { position: sticky; bottom: calc(-1 * var(--space-6)); padding: var(--space-4) 0; margin-bottom: calc(-1 * var(--space-4)); background: var(--color-surface); border-top: var(--hairline); }
    .align-end { align-self: end; padding-bottom: 0.8rem; }
    .features { display: grid; gap: var(--space-2); }
    .feature { display: grid; grid-template-columns: auto 1.4fr 1fr auto; align-items: center; gap: var(--space-2); background: var(--color-surface); }
    .feature.cdk-drag-preview { box-shadow: var(--shadow-lg); z-index: var(--z-modal) !important; }
    .add { justify-self: start; padding: 0; border: 0; background: none; }
    .services { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: var(--space-2); }
    .danger { color: var(--color-danger); }
    @media (max-width: 560px) {
      .sheet { padding: var(--space-4); }
      .feature { grid-template-columns: auto 1fr auto; }
      .feature .value { grid-column: 2; }
    }
  `,
})
export class PackageEditor implements OnInit {
  /** Paquete a editar o 'new' para uno nuevo. */
  readonly pkg = input.required<StudioPackage | 'new'>();
  /** Servicios ya marcados al crear un paquete (ej. desde la tarjeta de un servicio). */
  readonly presetServiceIds = input<string[]>([]);

  readonly saved = output<StudioPackage>();
  readonly removed = output<string>();
  readonly closed = output<void>();

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly services = toSignal(this.api.services().pipe(catchError(() => of([]))), { initialValue: [] });
  protected readonly saving = signal(false);
  protected readonly isNew = computed(() => this.pkg() === 'new');
  private readonly serviceIds = signal<string[]>([]);

  /** "En: Bodas, Bodas en la playa" para saber de un vistazo dónde aparece. */
  protected readonly serviceLabel = computed(() => {
    const names = this.serviceIds()
      .map((id) => this.services().find((s) => s.id === id)?.name)
      .filter(Boolean);
    return names.length ? `En: ${names.join(', ')}` : 'Todavía no está en ningún servicio';
  });

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    subtitle: [''],
    price: [null as number | null],
    isPriceProvisional: [true],
    isFeatured: [false],
    isActive: [true],
    features: this.fb.array<FeatureGroup>([]),
    serviceIds: [[] as string[]],
  });

  protected get features(): FormArray<FeatureGroup> {
    return this.form.controls.features;
  }

  ngOnInit(): void {
    const pkg = this.pkg();
    if (pkg === 'new') {
      this.form.reset({ name: '', subtitle: '', price: null, isPriceProvisional: true, isFeatured: false, isActive: true, serviceIds: this.presetServiceIds() });
      this.addFeature();
    } else {
      this.form.reset({
        name: pkg.name,
        subtitle: pkg.subtitle ?? '',
        price: pkg.price,
        isPriceProvisional: pkg.isPriceProvisional,
        isFeatured: pkg.isFeatured,
        isActive: pkg.isActive,
        serviceIds: pkg.serviceIds ?? [],
      });
      for (const f of pkg.features) this.addFeature(f.label, f.value ?? '');
    }
    this.serviceIds.set(this.form.controls.serviceIds.value);
    this.form.markAsPristine();
  }

  protected addFeature(label = '', value = ''): void {
    this.features.push(this.fb.group({ label: [label, Validators.required], value: [value] }));
  }

  protected moveFeature(event: CdkDragDrop<unknown>): void {
    const controls = [...this.features.controls];
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    this.features.clear();
    for (const c of controls) this.features.push(c);
    this.form.markAsDirty();
  }

  protected toggleService(id: string, checked: boolean): void {
    const ids = this.form.controls.serviceIds.value;
    const next = checked ? [...ids, id] : ids.filter((x) => x !== id);
    this.form.controls.serviceIds.setValue(next);
    this.serviceIds.set(next);
    this.form.markAsDirty();
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      ...v,
      subtitle: v.subtitle || null,
      price: v.price === null || (v.price as unknown) === '' ? null : Number(v.price),
      features: v.features.filter((f) => f.label.trim()).map((f) => ({ label: f.label.trim(), value: f.value.trim() || null })),
    };
    const current = this.pkg();
    this.saving.set(true);
    const request = current === 'new' ? this.api.createPackage(body) : this.api.updatePackage(current.id, body);
    request.subscribe({
      next: (pkg) => {
        this.saving.set(false);
        this.toast.success('Paquete guardado.');
        this.form.markAsPristine();
        this.saved.emit(pkg);
      },
      error: () => this.saving.set(false),
    });
  }

  /** Escape cierra el editor, salvo que esté abierta una confirmación (esa se cierra sola). */
  protected onEscape(): void {
    if (!this.confirm.pending()) void this.close();
  }

  protected async close(): Promise<void> {
    if (this.saving()) return;
    if (this.form.dirty) {
      const ok = await this.confirm.ask({
        title: 'Descartar cambios',
        message: 'Hiciste cambios en este paquete que todavía no se guardan.',
        confirmLabel: 'Descartar',
        danger: true,
      });
      if (!ok) return;
    }
    this.closed.emit();
  }

  protected async remove(): Promise<void> {
    const pkg = this.pkg();
    if (pkg === 'new') return;
    const ok = await this.confirm.ask({
      title: `Eliminar "${pkg.name}"`,
      message: 'Se quita de todos los servicios donde aparece. Los eventos que lo usan conservan sus datos. Si solo quieres ocultarlo, desmarca "Activo".',
      confirmLabel: 'Eliminar paquete',
      danger: true,
    });
    if (!ok) return;
    this.api.deletePackage(pkg.id).subscribe(() => {
      this.toast.success('Paquete eliminado.');
      this.removed.emit(pkg.id);
    });
  }
}
