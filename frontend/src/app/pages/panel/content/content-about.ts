import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { FormArray, FormGroup, FormControl, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AboutSettings } from '../../../core/types/settings.model';
import { Media } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { ImagePicker } from '../shared/image-picker';
import { SettingsSaver, orNull } from './settings-saver';

type StatGroup = FormGroup<{ value: FormControl<string>; label: FormControl<string> }>;

@Component({
  selector: 'app-content-about',
  imports: [ReactiveFormsModule, Btn, Icon, ImagePicker],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <section class="p-card p-form">
        <h2 class="p-card__title">Presentación</h2>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="name">Nombre</label>
            <input id="name" class="field__control" formControlName="name" />
          </div>
          <div class="field">
            <label class="field__label" for="headline">Especialidad / subtítulo</label>
            <input id="headline" class="field__control" formControlName="headline" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="intro">Introducción</label>
          <textarea id="intro" class="field__control" formControlName="intro"></textarea>
        </div>
        <div class="field">
          <label class="field__label" for="story">Historia</label>
          <textarea id="story" class="field__control" formControlName="story" rows="6"></textarea>
        </div>
        <div class="field">
          <label class="field__label" for="philosophy">Filosofía</label>
          <textarea id="philosophy" class="field__control" formControlName="philosophy"></textarea>
        </div>
      </section>

      <section class="p-card p-form">
        <h2 class="p-card__title">Fotografías (hasta 3)</h2>
        <div class="p-grid">
          <app-image-picker label="1 · Foto de encabezado" folder="about" ratio="16 / 9" [(value)]="image1" />
          <app-image-picker label="2 · Foto de fondo del par" folder="about" ratio="4 / 3" [(value)]="image2" />
          <app-image-picker label="3 · Foto al frente del par" folder="about" ratio="3 / 4" [(value)]="image3" />
        </div>
      </section>

      <section class="p-card p-form">
        <h2 class="p-card__title">Experiencia y formación</h2>
        <div formArrayName="stats" class="stats">
          @for (stat of stats.controls; track stat; let i = $index) {
            <div class="stat" [formGroupName]="i">
              <input class="field__control value" formControlName="value" placeholder="7+" aria-label="Valor" />
              <input class="field__control" formControlName="label" placeholder="Años de experiencia" aria-label="Etiqueta" />
              <button type="button" class="p-icon-btn p-icon-btn--danger" (click)="stats.removeAt(i)" aria-label="Quitar dato">
                <app-icon name="close" [size]="16" />
              </button>
            </div>
          }
          @if (stats.length < 6) {
            <button type="button" class="p-link add" (click)="addStat()">+ Agregar dato</button>
          }
        </div>
        <div class="p-grid" formGroupName="education">
          <div class="field">
            <label class="field__label" for="degree">Carrera</label>
            <input id="degree" class="field__control" formControlName="degree" />
          </div>
          <div class="field">
            <label class="field__label" for="inst">Institución</label>
            <input id="inst" class="field__control" formControlName="institution" />
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="spec">Especialidades (separadas por coma)</label>
          <input id="spec" class="field__control" formControlName="specialties" />
        </div>
      </section>

      <section class="p-card p-form" formGroupName="travel">
        <h2 class="p-card__title">Cobertura fuera de Aguascalientes</h2>
        <div class="field">
          <label class="field__label" for="national">En México</label>
          <textarea id="national" class="field__control" formControlName="national"></textarea>
        </div>
        <div class="field">
          <label class="field__label" for="intl">Fuera de México</label>
          <textarea id="intl" class="field__control" formControlName="international"></textarea>
        </div>
      </section>

      <label class="p-check"><input type="checkbox" formControlName="isProvisional" /> Marcar textos como provisionales (aparece como pendiente en el Resumen)</label>

      <div class="p-actions">
        <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar "Sobre mí"</button>
      </div>
    </form>
  `,
  styles: `
    .stats { display: grid; gap: var(--space-2); }
    .stat { display: grid; grid-template-columns: 6rem 1fr auto; gap: var(--space-2); max-width: 520px; }
    .add { justify-self: start; border: 0; background: none; padding: 0; }
  `,
})
export class ContentAbout implements OnInit {
  readonly initial = input.required<AboutSettings>();
  private readonly saver = inject(SettingsSaver);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly saving = signal(false);
  protected readonly image1 = signal<Media | null>(null);
  protected readonly image2 = signal<Media | null>(null);
  protected readonly image3 = signal<Media | null>(null);

  protected readonly form = this.fb.group({
    name: ['', Validators.required],
    headline: [''],
    intro: [''],
    story: [''],
    philosophy: [''],
    stats: this.fb.array<StatGroup>([]),
    education: this.fb.group({ degree: [''], institution: [''] }),
    specialties: [''],
    travel: this.fb.group({ national: [''], international: [''] }),
    isProvisional: [false],
  });

  protected get stats(): FormArray<StatGroup> {
    return this.form.controls.stats;
  }

  ngOnInit(): void {
    const a = this.initial();
    this.form.patchValue({
      name: a.name,
      headline: a.headline ?? '',
      intro: a.intro ?? '',
      story: a.story ?? '',
      philosophy: a.philosophy ?? '',
      education: { degree: a.education.degree ?? '', institution: a.education.institution ?? '' },
      specialties: a.specialties.join(', '),
      travel: { national: a.travel.national ?? '', international: a.travel.international ?? '' },
      isProvisional: a.isProvisional,
    });
    for (const s of a.stats) this.addStat(s.value, s.label);
    this.image1.set(a.images[0] ?? null);
    this.image2.set(a.images[1] ?? null);
    this.image3.set(a.images[2] ?? null);
  }

  protected addStat(value = '', label = ''): void {
    this.stats.push(this.fb.group({ value: [value, Validators.required], label: [label, Validators.required] }));
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const value: AboutSettings = {
      name: v.name,
      headline: orNull(v.headline),
      intro: orNull(v.intro),
      story: orNull(v.story),
      philosophy: orNull(v.philosophy),
      education: { degree: orNull(v.education.degree), institution: orNull(v.education.institution) },
      stats: v.stats.filter((s) => s.value && s.label),
      specialties: v.specialties.split(',').map((s) => s.trim()).filter(Boolean),
      travel: { national: orNull(v.travel.national), international: orNull(v.travel.international) },
      images: [this.image1(), this.image2(), this.image3()].filter((m): m is Media => !!m),
      isProvisional: v.isProvisional,
    };
    this.saving.set(true);
    this.saver.save('about', value, '"Sobre mí" actualizado.').subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }
}
