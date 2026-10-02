import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
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
import { ConfirmService } from '../shared/confirm.service';
import { DECORATION_LABEL, entries } from '../shared/labels';

interface AdminTheme {
  id: string;
  key: string;
  name: string;
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
  autoEnabled: boolean;
  priority: number;
  decoration: ThemeDecoration;
  tokenOverrides: Record<string, string>;
  heroImage: Media | null;
  navbarBadge: string | null;
  isActive: boolean;
}

type Mode = 'off' | 'manual' | 'auto';

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const DEFAULT_ACCENT = '#d9b994';
const DEFAULT_PRIMARY = '#7d5f4b';

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
  private readonly confirm = inject(ConfirmService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly months = MONTHS;
  protected readonly decorations = entries(DECORATION_LABEL);
  protected readonly decorationLabel = DECORATION_LABEL;
  protected readonly themes = signal<AdminTheme[] | null>(null);
  protected readonly mode = signal<Mode>('off');
  protected readonly manualThemeId = signal<string | null>(null);
  protected readonly activeThemeId = signal<string | null>(null);
  protected readonly editing = signal<AdminTheme | 'new' | null>(null);
  protected readonly heroImage = signal<Media | null>(null);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    key: ['', [Validators.required, Validators.pattern(/^[a-z0-9]+(-[a-z0-9]+)*$/)]],
    name: ['', Validators.required],
    startMonth: [1],
    startDay: [1, [Validators.min(1), Validators.max(31)]],
    endMonth: [1],
    endDay: [31, [Validators.min(1), Validators.max(31)]],
    autoEnabled: [true],
    priority: [10, [Validators.min(0), Validators.max(100)]],
    decoration: ['none' as ThemeDecoration],
    useColors: [false],
    accent: [DEFAULT_ACCENT],
    primary: [DEFAULT_PRIMARY],
    navbarBadge: [''],
    isActive: [true],
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
    });
  }

  protected range(t: AdminTheme): string {
    return `${t.startDay} ${MONTHS[t.startMonth - 1]} – ${t.endDay} ${MONTHS[t.endMonth - 1]}`;
  }

  protected setMode(mode: Mode, manualThemeId: string | null = this.manualThemeId()): void {
    if (mode === 'manual' && !manualThemeId) {
      manualThemeId = this.themes()?.find((t) => t.isActive)?.id ?? null;
    }
    this.api.setThemeMode(mode, mode === 'manual' ? manualThemeId : null).subscribe(() => {
      this.toast.success(mode === 'off' ? 'Temas desactivados.' : mode === 'auto' ? 'Temas automáticos por fecha.' : 'Tema manual activado.');
      this.themeService.load().subscribe();
      this.load();
    });
  }

  protected edit(theme: AdminTheme | 'new'): void {
    this.editing.set(theme);
    if (theme === 'new') {
      this.form.reset();
      this.form.controls.key.enable();
      this.heroImage.set(null);
      return;
    }
    const accent = theme.tokenOverrides['--color-accent'];
    const primary = theme.tokenOverrides['--color-primary'];
    this.form.reset({
      key: theme.key,
      name: theme.name,
      startMonth: theme.startMonth,
      startDay: theme.startDay,
      endMonth: theme.endMonth,
      endDay: theme.endDay,
      autoEnabled: theme.autoEnabled,
      priority: theme.priority,
      decoration: theme.decoration,
      useColors: !!(accent || primary),
      accent: accent ?? DEFAULT_ACCENT,
      primary: primary ?? DEFAULT_PRIMARY,
      navbarBadge: theme.navbarBadge ?? '',
      isActive: theme.isActive,
    });
    this.form.controls.key.disable();
    this.heroImage.set(theme.heroImage);
  }

  protected save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const v = this.form.getRawValue();
    const body = {
      key: v.key,
      name: v.name,
      startMonth: Number(v.startMonth),
      startDay: Number(v.startDay),
      endMonth: Number(v.endMonth),
      endDay: Number(v.endDay),
      autoEnabled: v.autoEnabled,
      priority: Number(v.priority),
      decoration: v.decoration,
      tokenOverrides: v.useColors ? { '--color-accent': v.accent, '--color-primary': v.primary } : {},
      heroMediaId: this.heroImage()?.id ?? null,
      navbarBadge: v.navbarBadge || null,
      isActive: v.isActive,
    };
    const current = this.editing();
    this.saving.set(true);
    const request = current === 'new' ? this.api.createTheme(body) : this.api.updateTheme((current as AdminTheme).id, body);
    request.subscribe({
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

  protected async remove(theme: AdminTheme): Promise<void> {
    const ok = await this.confirm.ask({ title: `Eliminar "${theme.name}"`, message: 'Esta acción no se puede deshacer.', confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    this.api.deleteTheme(theme.id).subscribe(() => {
      this.toast.success('Tema eliminado.');
      this.editing.set(null);
      this.load();
    });
  }

  protected editingTheme(): AdminTheme | null {
    const e = this.editing();
    return e && e !== 'new' ? e : null;
  }
}
