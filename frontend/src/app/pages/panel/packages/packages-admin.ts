import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { StudioPackage } from '../../../core/types/catalog.model';
import { formatMoney } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ConfirmService } from '../shared/confirm.service';

type FeatureGroup = FormGroup<{ label: FormControl<string>; value: FormControl<string> }>;

@Component({
  selector: 'app-packages-admin',
  imports: [ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragHandle, Btn, Icon, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './packages-admin.html',
  styleUrl: './packages-admin.css',
})
export class PackagesAdmin {
  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly packages = signal<StudioPackage[] | null>(null);
  protected readonly editing = signal<StudioPackage | 'new' | null>(null);
  protected readonly saving = signal(false);
  protected readonly services = toSignal(this.api.services().pipe(catchError(() => of([]))), { initialValue: [] });

  /** "Bodas, Bodas en playa": distingue paquetes con el mismo nombre en distintos servicios. */
  protected serviceNames(ids: string[] | undefined): string {
    const names = (ids ?? []).map((id) => this.services().find((s) => s.id === id)?.name).filter(Boolean);
    return names.length ? names.join(', ') : 'Sin servicio';
  }
  protected readonly money = formatMoney;

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

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.packages().subscribe((list) => this.packages.set(list));
  }

  protected edit(pkg: StudioPackage | 'new'): void {
    this.editing.set(pkg);
    this.features.clear();
    if (pkg === 'new') {
      this.form.reset({ name: '', subtitle: '', price: null, isPriceProvisional: true, isFeatured: false, isActive: true, serviceIds: [] });
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
    this.form.controls.serviceIds.setValue(checked ? [...ids, id] : ids.filter((x) => x !== id));
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
    const current = this.editing();
    this.saving.set(true);
    const request = current === 'new' ? this.api.createPackage(body) : this.api.updatePackage((current as StudioPackage).id, body);
    request.subscribe({
      next: (pkg) => {
        this.saving.set(false);
        this.toast.success('Paquete guardado.');
        this.editing.set(pkg);
        this.form.markAsPristine();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected drop(event: CdkDragDrop<StudioPackage[]>): void {
    const list = [...(this.packages() ?? [])];
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.packages.set(list);
    this.api.reorderPackages(list.map((p) => p.id)).subscribe(() => this.toast.success('Orden actualizado.'));
  }

  protected async remove(pkg: StudioPackage): Promise<void> {
    const ok = await this.confirm.ask({
      title: `Eliminar "${pkg.name}"`,
      message: 'Los eventos que lo usan conservarán sus datos, pero el paquete dejará de existir. Si solo quieres ocultarlo, desactívalo.',
      confirmLabel: 'Eliminar paquete',
      danger: true,
    });
    if (!ok) return;
    this.api.deletePackage(pkg.id).subscribe(() => {
      this.toast.success('Paquete eliminado.');
      this.editing.set(null);
      this.load();
    });
  }

  protected isEditing(pkg: StudioPackage): boolean {
    const e = this.editing();
    return e !== null && e !== 'new' && e.id === pkg.id;
  }

  protected editingPackage(): StudioPackage | null {
    const e = this.editing();
    return e && e !== 'new' ? e : null;
  }
}
