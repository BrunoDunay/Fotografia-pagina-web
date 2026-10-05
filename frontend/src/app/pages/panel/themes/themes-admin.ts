import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ThemeService } from '../../../core/services/theme.service';
import { ToastService } from '../../../core/services/toast.service';
import { ThemeDecoration } from '../../../core/types/catalog.model';
import { Media } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ImagePicker } from '../shared/image-picker';
import { DECORATION_LABEL } from '../shared/labels';

interface AdminTheme {
  id: string;
  key: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  /** Festividad (se activa sola por fecha) o estación (solo en modo manual). */
  autoEnabled: boolean;
  decoration: ThemeDecoration;
  heroImage: Media | null;
}

type Mode = 'off' | 'manual' | 'auto';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

/**
 * Temas estacionales. La lista de temas, su decoración y sus colores son fijos;
 * el fotógrafo elige el modo (apagado, automático o manual) y, de cada tema,
 * las fechas en que aparece y la foto de portada que se muestra durante el tema.
 */
@Component({
  selector: 'app-themes-admin',
  imports: [ReactiveFormsModule, Btn, Icon, SkeletonTable, PageHeader, ImagePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './themes-admin.html',
  styleUrl: './themes-admin.css',
})
export class ThemesAdmin {
  private readonly api = inject(ContentApiService);
  private readonly themeService = inject(ThemeService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly months = MONTHS;
  protected readonly decorationLabel = DECORATION_LABEL;
  protected readonly themes = signal<AdminTheme[] | null>(null);
  protected readonly mode = signal<Mode>('off');
  protected readonly manualThemeId = signal<string | null>(null);
  protected readonly activeThemeId = signal<string | null>(null);
  /** Siguiente tema que se mostrará en modo automático y desde qué día. */
  protected readonly nextAuto = signal<{ themeId: string; date: string } | null>(null);
  protected readonly nextAutoName = computed(() => this.themes()?.find((t) => t.id === this.nextAuto()?.themeId)?.name ?? null);
  protected readonly editing = signal<AdminTheme | null>(null);
  protected readonly heroImage = signal<Media | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    startMonth: [1],
    startDay: [1, [Validators.required, Validators.min(1), Validators.max(31)]],
    endMonth: [1],
    endDay: [31, [Validators.required, Validators.min(1), Validators.max(31)]],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.themes().subscribe((res) => {
      this.themes.set(res.themes as AdminTheme[]);
      this.mode.set(res.mode);
      this.manualThemeId.set(res.manualThemeId);
      this.activeThemeId.set(res.activeThemeId);
      this.nextAuto.set(res.nextAuto);
    });
  }

  /** "2026-10-25" → "25 oct" */
  protected shortDay(iso: string): string {
    const [, month, day] = iso.split('-').map(Number);
    return `${day} ${MONTHS[month - 1]}`;
  }

  protected range(t: AdminTheme): string {
    return `${t.startDay} ${MONTHS[t.startMonth - 1]} – ${t.endDay} ${MONTHS[t.endMonth - 1]}`;
  }

  protected setMode(mode: Mode, manualThemeId: string | null = this.manualThemeId()): void {
    if (mode === 'manual' && !manualThemeId) {
      manualThemeId = this.themes()?.[0]?.id ?? null;
    }
    this.api.setThemeMode(mode, mode === 'manual' ? manualThemeId : null).subscribe(() => {
      this.toast.success(mode === 'off' ? 'Temas apagados.' : mode === 'auto' ? 'Los temas se activan solos según la fecha.' : 'Tema activado.');
      this.themeService.load().subscribe();
      this.load();
    });
  }

  protected edit(theme: AdminTheme): void {
    this.editing.set(theme);
    this.form.reset({ startMonth: theme.startMonth, startDay: theme.startDay, endMonth: theme.endMonth, endDay: theme.endDay });
    this.heroImage.set(theme.heroImage);
  }

  protected save(): void {
    const theme = this.editing();
    this.form.markAllAsTouched();
    if (!theme || this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      startMonth: Number(v.startMonth),
      startDay: Number(v.startDay),
      endMonth: Number(v.endMonth),
      endDay: Number(v.endDay),
      heroMediaId: this.heroImage()?.id ?? null,
    };
    this.saving.set(true);
    this.api.updateTheme(theme.id, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.success('Tema guardado.');
        this.themeService.load().subscribe();
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }
}
