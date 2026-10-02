import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { BrandSettings, SeoSettings } from '../../../core/types/settings.model';
import { Media } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { ImagePicker } from '../shared/image-picker';
import { SettingsSaver, orNull } from './settings-saver';

@Component({
  selector: 'app-content-brand',
  imports: [ReactiveFormsModule, Btn, ImagePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <section class="p-card p-form">
        <h2 class="p-card__title">Marca</h2>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="studio">Nombre del estudio</label>
            <input id="studio" class="field__control" formControlName="studioName" />
          </div>
          <div class="field">
            <label class="field__label" for="photographer">Nombre del fotógrafo</label>
            <input id="photographer" class="field__control" formControlName="photographerName" />
          </div>
          <div class="field">
            <label class="field__label" for="tagline">Frase corta (footer)</label>
            <input id="tagline" class="field__control" formControlName="tagline" />
          </div>
        </div>
      </section>

      <section class="p-card p-form">
        <h2 class="p-card__title">SEO y redes sociales</h2>
        <p class="p-help">Cómo aparece el sitio en Google y al compartir el enlace en WhatsApp, Facebook, etc.</p>
        <div class="p-grid p-grid--2">
          <div class="p-form">
            <div class="field">
              <label class="field__label" for="seo-title">Título</label>
              <input id="seo-title" class="field__control" formControlName="defaultTitle" maxlength="160" />
              <span class="field__hint">{{ form.controls.defaultTitle.value.length }}/60 recomendado</span>
            </div>
            <div class="field">
              <label class="field__label" for="seo-desc">Descripción</label>
              <textarea id="seo-desc" class="field__control" formControlName="defaultDescription" maxlength="300"></textarea>
              <span class="field__hint">{{ form.controls.defaultDescription.value.length }}/160 recomendado</span>
            </div>
          </div>
          <app-image-picker label="Imagen para compartir" folder="site" ratio="1.91 / 1" [(value)]="ogImage" hint="Si no hay, se usa la imagen del Hero." />
        </div>
      </section>

      <div class="p-actions">
        <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar marca y SEO</button>
      </div>
    </form>
  `,
})
export class ContentBrand implements OnInit {
  readonly brand = input.required<BrandSettings>();
  readonly seo = input.required<SeoSettings>();
  private readonly saver = inject(SettingsSaver);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);
  protected readonly ogImage = signal<Media | null>(null);
  protected readonly form = this.fb.group({
    studioName: ['', Validators.required],
    photographerName: ['', Validators.required],
    tagline: [''],
    defaultTitle: ['', Validators.required],
    defaultDescription: ['', Validators.required],
  });

  ngOnInit(): void {
    const b = this.brand();
    const s = this.seo();
    this.form.reset({
      studioName: b.studioName,
      photographerName: b.photographerName,
      tagline: b.tagline ?? '',
      defaultTitle: s.defaultTitle,
      defaultDescription: s.defaultDescription,
    });
    this.ogImage.set(s.ogImage);
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const b = this.brand();
    this.saving.set(true);
    forkJoin([
      this.saver.save('brand', { ...b, studioName: v.studioName, photographerName: v.photographerName, tagline: orNull(v.tagline) }, 'Marca actualizada.'),
      this.saver.save('seo', { defaultTitle: v.defaultTitle, defaultDescription: v.defaultDescription, ogImage: this.ogImage() }, 'SEO actualizado.'),
    ]).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }
}
