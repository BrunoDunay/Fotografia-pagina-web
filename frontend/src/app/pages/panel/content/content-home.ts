import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { HomeSettings } from '../../../core/types/settings.model';
import { Media } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { ImagePicker } from '../shared/image-picker';
import { SettingsSaver, orNull } from './settings-saver';

@Component({
  selector: 'app-content-home',
  imports: [ReactiveFormsModule, Btn, ImagePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <section class="p-card p-form" formGroupName="hero">
        <h2 class="p-card__title">Hero principal</h2>
        <div class="p-grid p-grid--2">
          <app-image-picker label="Imagen del Hero" folder="site" ratio="16 / 9" [(value)]="heroImage"
            hint="Horizontal, de alta calidad. Se recorta para llenar la pantalla." />
          <div class="p-form">
            <div class="field">
              <label class="field__label" for="h-title">Título</label>
              <input id="h-title" class="field__control" formControlName="title" />
            </div>
            <div class="field">
              <label class="field__label" for="h-sub">Subtítulo (letra manuscrita)</label>
              <input id="h-sub" class="field__control" formControlName="subtitle" />
            </div>
            <div class="p-grid">
              <div class="field">
                <label class="field__label" for="h-cta">Texto del botón</label>
                <input id="h-cta" class="field__control" formControlName="ctaLabel" placeholder="Vacío = sin botón" />
              </div>
              <div class="field">
                <label class="field__label" for="h-link">Enlace del botón</label>
                <input id="h-link" class="field__control" formControlName="ctaLink" placeholder="/availability" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="p-card p-form" formGroupName="valueProposition">
        <h2 class="p-card__title">Propuesta de valor</h2>
        <div class="field">
          <label class="field__label" for="v-title">Frase principal</label>
          <input id="v-title" class="field__control" formControlName="title" />
        </div>
        <div class="field">
          <label class="field__label" for="v-text">Texto</label>
          <textarea id="v-text" class="field__control" formControlName="text"></textarea>
        </div>
        <label class="p-check"><input type="checkbox" formControlName="isProvisional" /> Marcar como texto provisional (aparece en el dashboard)</label>
      </section>

      <section class="p-card p-form" formGroupName="aboutTeaser">
        <h2 class="p-card__title">Sobre mí (resumen en la Home)</h2>
        <div class="p-grid p-grid--2">
          <app-image-picker label="Foto" folder="about" ratio="4 / 3" [(value)]="aboutImage" />
          <div class="p-form">
            <div class="p-grid">
              <div class="field">
                <label class="field__label" for="a-eyebrow">Etiqueta superior</label>
                <input id="a-eyebrow" class="field__control" formControlName="eyebrow" />
              </div>
              <div class="field">
                <label class="field__label" for="a-cta">Texto del botón</label>
                <input id="a-cta" class="field__control" formControlName="ctaLabel" />
              </div>
            </div>
            <div class="field">
              <label class="field__label" for="a-title">Título</label>
              <input id="a-title" class="field__control" formControlName="title" />
            </div>
            <div class="field">
              <label class="field__label" for="a-sub">Subtítulo (itálica)</label>
              <input id="a-sub" class="field__control" formControlName="subtitle" />
            </div>
            <div class="field">
              <label class="field__label" for="a-text">Texto</label>
              <textarea id="a-text" class="field__control" formControlName="text"></textarea>
            </div>
          </div>
        </div>
      </section>

      <div class="p-actions">
        <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar Home</button>
      </div>
    </form>
  `,
})
export class ContentHome implements OnInit {
  readonly initial = input.required<HomeSettings>();
  private readonly saver = inject(SettingsSaver);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);
  protected readonly heroImage = signal<Media | null>(null);
  protected readonly aboutImage = signal<Media | null>(null);

  protected readonly form = this.fb.group({
    hero: this.fb.group({ title: ['', Validators.required], subtitle: [''], ctaLabel: [''], ctaLink: [''] }),
    valueProposition: this.fb.group({ title: ['', Validators.required], text: [''], isProvisional: [false] }),
    aboutTeaser: this.fb.group({ eyebrow: [''], title: ['', Validators.required], subtitle: [''], text: [''], ctaLabel: [''] }),
  });

  ngOnInit(): void {
    const h = this.initial();
    this.form.reset({
      hero: { title: h.hero.title, subtitle: h.hero.subtitle ?? '', ctaLabel: h.hero.ctaLabel ?? '', ctaLink: h.hero.ctaLink ?? '' },
      valueProposition: { title: h.valueProposition.title, text: h.valueProposition.text ?? '', isProvisional: h.valueProposition.isProvisional },
      aboutTeaser: {
        eyebrow: h.aboutTeaser.eyebrow ?? '',
        title: h.aboutTeaser.title,
        subtitle: h.aboutTeaser.subtitle ?? '',
        text: h.aboutTeaser.text ?? '',
        ctaLabel: h.aboutTeaser.ctaLabel ?? '',
      },
    });
    this.heroImage.set(h.hero.image);
    this.aboutImage.set(h.aboutTeaser.image);
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const value: HomeSettings = {
      hero: { title: v.hero.title, subtitle: orNull(v.hero.subtitle), ctaLabel: orNull(v.hero.ctaLabel), ctaLink: orNull(v.hero.ctaLink), image: this.heroImage() },
      valueProposition: { title: v.valueProposition.title, text: orNull(v.valueProposition.text), isProvisional: v.valueProposition.isProvisional },
      aboutTeaser: {
        eyebrow: orNull(v.aboutTeaser.eyebrow),
        title: v.aboutTeaser.title,
        subtitle: orNull(v.aboutTeaser.subtitle),
        text: orNull(v.aboutTeaser.text),
        ctaLabel: orNull(v.aboutTeaser.ctaLabel),
        image: this.aboutImage(),
      },
    };
    this.saving.set(true);
    this.saver.save('home', value, 'Home actualizada.').subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }
}
