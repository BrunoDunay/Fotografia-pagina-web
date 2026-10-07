import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { SettingsStore } from '../../../core/services/settings.store';
import { AdminService } from '../../../core/types/catalog.model';
import { ApiError, Media } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonText } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ImagePicker } from '../shared/image-picker';
import { VideoPicker } from '../shared/video-picker';
import { ConfirmService } from '../shared/confirm.service';
import { GalleryManager } from './gallery-manager';

type Tab = 'info' | 'hero' | 'video' | 'packages' | 'gallery' | 'seo';

/** Alta y edición de un servicio: textos, Hero/portada, video, paquetes, galería y SEO. */
@Component({
  selector: 'app-service-edit',
  imports: [ReactiveFormsModule, RouterLink, Btn, SkeletonText, PageHeader, ImagePicker, VideoPicker, GalleryManager],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './service-edit.html',
  styleUrl: './service-edit.css',
})
export class ServiceEdit implements OnInit {
  /** Sin id → servicio nuevo. */
  readonly id = input<string | undefined>();

  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);
  private readonly router = inject(Router);
  private readonly store = inject(SettingsStore);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly isNew = computed(() => !this.id());
  protected readonly service = signal<AdminService | null>(null);
  protected readonly loaded = signal(false);
  protected readonly saving = signal(false);
  protected readonly tab = signal<Tab>('info');
  protected readonly heroImage = signal<Media | null>(null);
  protected readonly coverImage = signal<Media | null>(null);
  protected readonly video = signal<Media | null>(null);
  protected readonly packageIds = signal<string[]>([]);

  protected readonly allPackages = toSignal(this.api.packages().pipe(catchError(() => of([]))), { initialValue: [] });

  protected readonly tabs = computed<{ value: Tab; label: string }[]>(() => [
    { value: 'info', label: 'Información' },
    { value: 'hero', label: 'Fotos principales' },
    { value: 'video', label: 'Video' },
    { value: 'packages', label: 'Paquetes' },
    ...(this.isNew() ? [] : [{ value: 'gallery' as Tab, label: 'Galería' }]),
    { value: 'seo', label: 'Google y redes' },
  ]);

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(120)]],
    slug: ['', Validators.pattern(/^([a-z0-9]+(-[a-z0-9]+)*)?$/)],
    shortDescription: [''],
    description: [''],
    heroTitle: [''],
    heroSubtitle: [''],
    heroDescription: [''],
    seoTitle: [''],
    seoDescription: [''],
    isVisible: [true],
    isProvisional: [false],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      this.loaded.set(true);
      return;
    }
    this.api.service(id).subscribe({
      next: (s) => {
        this.service.set(s);
        this.form.reset({
          name: s.name,
          slug: s.slug,
          shortDescription: s.shortDescription ?? '',
          description: s.description ?? '',
          heroTitle: s.heroTitle ?? '',
          heroSubtitle: s.heroSubtitle ?? '',
          heroDescription: s.heroDescription ?? '',
          seoTitle: s.seoTitle ?? '',
          seoDescription: s.seoDescription ?? '',
          isVisible: s.isVisible,
          isProvisional: s.isProvisional,
        });
        this.heroImage.set(s.hero);
        this.coverImage.set(s.cover);
        this.video.set(s.video);
        this.packageIds.set(s.packageIds);
        this.loaded.set(true);
      },
      error: () => void this.router.navigate(['/panel/services']),
    });
  }

  protected togglePackage(id: string, checked: boolean): void {
    this.packageIds.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Revisa los campos marcados.');
      return;
    }
    const v = this.form.getRawValue();
    const body = {
      ...v,
      slug: v.slug || undefined,
      videoMediaId: this.video()?.id ?? null,
      heroMediaId: this.heroImage()?.id ?? null,
      coverMediaId: this.coverImage()?.id ?? null,
      packageIds: this.packageIds(),
    };
    this.saving.set(true);
    const request = this.isNew() ? this.api.createService(body) : this.api.updateService(this.id()!, body);
    request.subscribe({
      next: (s) => {
        this.saving.set(false);
        this.toast.success(this.isNew() ? 'Servicio creado. Ahora puedes subir su galería.' : 'Servicio guardado.');
        this.form.markAsPristine();
        this.store.refresh().subscribe();
        if (this.isNew()) void this.router.navigate(['/panel/services', s.id]);
      },
      error: (e: ApiError) => {
        this.saving.set(false);
        if (e.code === 'DUPLICATE') this.form.controls.slug.setErrors({ duplicate: true });
      },
    });
  }

  protected async remove(): Promise<void> {
    const s = this.service();
    if (!s) return;
    const ok = await this.confirm.ask({
      title: `Eliminar "${s.name}"`,
      message: 'Se eliminará la página del servicio y su galería. Si solo quieres quitarlo del sitio, mejor desmarca "Visible".',
      confirmLabel: 'Eliminar servicio',
      danger: true,
    });
    if (!ok) return;
    this.api.deleteService(s.id).subscribe(() => {
      this.toast.success('Servicio eliminado.');
      void this.router.navigate(['/panel/services']);
    });
  }
}
