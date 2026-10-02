import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { PublicApiService } from '../../../core/services/api/public-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { LegalDocument, LegalType } from '../../../core/types/catalog.model';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonText } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';

type SectionGroup = FormGroup<{ title: FormControl<string>; body: FormControl<string> }>;

const LABELS: Record<LegalType, { label: string; path: string }> = {
  contract: { label: 'Contrato', path: '/contract' },
  terms: { label: 'Términos y condiciones', path: '/legal/terms' },
  privacy: { label: 'Aviso de privacidad', path: '/legal/privacy' },
};

/** Editor de contrato, términos y aviso de privacidad (secciones numeradas automáticamente). */
@Component({
  selector: 'app-legal-admin',
  imports: [ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragHandle, Btn, Icon, SkeletonText, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Documentos legales" subtitle="El PDF descargable se genera automáticamente con este mismo contenido." />

    <div class="p-tabs" role="tablist">
      @for (t of types; track t) {
        <button type="button" class="p-tab" [class.is-active]="type() === t" (click)="select(t)">{{ labels[t].label }}</button>
      }
    </div>

    @if (doc()) {
      <form class="p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <section class="p-card p-form">
          <div class="p-grid">
            <div class="field">
              <label class="field__label" for="title">Título</label>
              <input id="title" class="field__control" formControlName="title" />
            </div>
            <div class="field">
              <label class="field__label" for="version">Versión</label>
              <input id="version" class="field__control" formControlName="version" />
            </div>
          </div>
          <div class="field">
            <label class="field__label" for="intro">Introducción</label>
            <textarea id="intro" class="field__control" formControlName="intro"></textarea>
          </div>
          <label class="p-check"><input type="checkbox" formControlName="isProvisional" /> Documento provisional (muestra un aviso en la página)</label>
          <div class="p-row">
            <a class="p-link" [href]="labels[type()].path" target="_blank" rel="noopener">Ver página</a>
            <a class="p-link" [href]="pdfUrl()" target="_blank" rel="noopener">Ver PDF</a>
          </div>
        </section>

        <div formArrayName="sections" cdkDropList (cdkDropListDropped)="move($event)" class="sections">
          @for (s of sections.controls; track s; let i = $index) {
            <section class="p-card section" [formGroupName]="i" cdkDrag>
              <div class="p-row">
                <span class="p-drag" cdkDragHandle aria-label="Arrastrar">⠿</span>
                <span class="num">{{ i + 1 }}.</span>
                <input class="field__control" formControlName="title" placeholder="Título de la sección" aria-label="Título de la sección" />
                <button type="button" class="p-icon-btn p-icon-btn--danger" (click)="sections.removeAt(i); form.markAsDirty()" aria-label="Eliminar sección">
                  <app-icon name="close" [size]="14" />
                </button>
              </div>
              <textarea class="field__control" formControlName="body" rows="5" aria-label="Contenido de la sección"></textarea>
            </section>
          }
        </div>
        <button type="button" class="p-link add" (click)="addSection()">+ Agregar sección</button>

        <div class="p-actions">
          <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid || form.pristine">Guardar documento</button>
        </div>
      </form>
    } @else {
      <app-skeleton-text [lines]="10" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .sections { display: grid; gap: var(--space-3); }
    .section { display: grid; gap: var(--space-3); }
    .section .p-row { flex-wrap: nowrap; }
    .section.cdk-drag-preview { box-shadow: var(--shadow-lg); }
    .num { font-family: var(--font-serif); font-size: var(--text-xl); color: var(--color-primary); }
    .add { justify-self: start; padding: 0; border: 0; background: none; }
  `,
})
export class LegalAdmin {
  private readonly api = inject(ContentApiService);
  private readonly publicApi = inject(PublicApiService);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly types: LegalType[] = ['contract', 'terms', 'privacy'];
  protected readonly labels = LABELS;
  protected readonly type = signal<LegalType>('contract');
  protected readonly doc = signal<LegalDocument | null>(null);
  protected readonly saving = signal(false);
  private docs: LegalDocument[] = [];

  protected readonly form = this.fb.group({
    title: ['', Validators.required],
    version: ['', Validators.required],
    intro: [''],
    isProvisional: [true],
    sections: this.fb.array<SectionGroup>([]),
  });

  protected get sections(): FormArray<SectionGroup> {
    return this.form.controls.sections;
  }

  constructor() {
    this.api.legalDocuments().subscribe((docs) => {
      this.docs = docs;
      this.select(this.type());
    });
  }

  protected pdfUrl(): string {
    return this.publicApi.legalPdfUrl(this.type());
  }

  protected select(type: LegalType): void {
    this.type.set(type);
    const doc = this.docs.find((d) => d.type === type) ?? null;
    this.doc.set(doc);
    if (!doc) return;
    this.sections.clear();
    this.form.reset({ title: doc.title, version: doc.version, intro: doc.intro ?? '', isProvisional: doc.isProvisional });
    for (const s of doc.sections) this.addSection(s.title, s.body);
    this.form.markAsPristine();
  }

  protected addSection(title = '', body = ''): void {
    this.sections.push(this.fb.group({ title: [title, Validators.required], body: [body, Validators.required] }));
    this.form.markAsDirty();
  }

  protected move(event: CdkDragDrop<unknown>): void {
    const controls = [...this.sections.controls];
    moveItemInArray(controls, event.previousIndex, event.currentIndex);
    this.sections.clear();
    for (const c of controls) this.sections.push(c);
    this.form.markAsDirty();
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const body = { ...v, intro: v.intro || null, sections: v.sections.map((s, i) => ({ number: i + 1, ...s })) };
    this.saving.set(true);
    this.api.updateLegal(this.type(), body).subscribe({
      next: (doc) => {
        this.saving.set(false);
        this.docs = this.docs.map((d) => (d.type === doc.type ? doc : d));
        this.form.markAsPristine();
        this.toast.success('Documento guardado.');
      },
      error: () => this.saving.set(false),
    });
  }
}
