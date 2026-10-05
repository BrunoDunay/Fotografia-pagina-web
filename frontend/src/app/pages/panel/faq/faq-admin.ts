import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CdkDrag, CdkDragDrop, CdkDragHandle, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { Faq } from '../../../core/types/catalog.model';
import { Btn } from '../../../components/buttons/btn';
import { Icon } from '../../../components/icon/icon';
import { SkeletonTable } from '../../../components/skeletons';
import { PageHeader } from '../shared/page-header';
import { ConfirmService } from '../shared/confirm.service';

type AdminFaq = Faq & { service: { id: string; name: string } | null };

@Component({
  selector: 'app-faq-admin',
  imports: [ReactiveFormsModule, CdkDropList, CdkDrag, CdkDragHandle, Btn, Icon, SkeletonTable, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Preguntas frecuentes" subtitle="Arrastra para ordenar. Las generales aparecen en la página de inicio y en la de Preguntas frecuentes; las de un servicio, en su página.">
      <button appBtn type="button" (click)="edit('new')">+ Nueva pregunta</button>
    </app-page-header>

    @if (editing() !== null) {
      <form class="p-card p-form fade-up" [formGroup]="form" (ngSubmit)="save()" novalidate>
        <div class="field">
          <label class="field__label" for="q">Pregunta *</label>
          <input id="q" class="field__control" formControlName="question" />
        </div>
        <div class="field">
          <label class="field__label" for="a">Respuesta *</label>
          <textarea id="a" class="field__control" formControlName="answer" rows="4"></textarea>
        </div>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="s">Dónde se muestra</label>
            <select id="s" class="field__control" formControlName="serviceId">
              <option value="">Generales (inicio y Preguntas frecuentes)</option>
              @for (s of services(); track s.id) {
                <option [value]="s.id">Solo en: {{ s.name }}</option>
              }
            </select>
          </div>
          <label class="p-check end"><input type="checkbox" formControlName="isActive" /> Activa (visible)</label>
        </div>
        <div class="p-row">
          <span class="p-spacer"></span>
          <button appBtn variant="ghost" type="button" (click)="editing.set(null)">Cancelar</button>
          <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar</button>
        </div>
      </form>
    }

    @if (faqs(); as list) {
      <ul class="p-list" cdkDropList (cdkDropListDropped)="drop($event)">
        @for (f of list; track f.id) {
          <li class="p-list-item" cdkDrag [class.is-inactive]="!f.isActive">
            <span class="p-drag" cdkDragHandle aria-label="Arrastrar">⠿</span>
            <button type="button" class="row" (click)="edit(f)">
              <strong>{{ f.question }}</strong>
              <span class="p-help answer">{{ f.answer }}</span>
            </button>
            @if (f.service) {
              <span class="p-badge p-badge--accent">{{ f.service.name }}</span>
            }
            @if (!f.isActive) {
              <span class="p-badge">Oculta</span>
            }
            <button type="button" class="p-icon-btn p-icon-btn--danger" (click)="remove(f)" aria-label="Eliminar"><app-icon name="close" [size]="14" /></button>
          </li>
        }
      </ul>
    } @else {
      <app-skeleton-table [rows]="6" [columns]="2" />
    }
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .row { display: grid; flex: 1; min-width: 0; padding: 0; border: 0; background: none; text-align: left; }
    .answer { overflow: hidden; white-space: nowrap; text-overflow: ellipsis; }
    .is-inactive { opacity: 0.55; }
    .end { align-self: end; padding-bottom: 0.8rem; }
  `,
})
export class FaqAdmin {
  private readonly api = inject(ContentApiService);
  private readonly toast = inject(ToastService);
  private readonly confirm = inject(ConfirmService);

  protected readonly faqs = signal<AdminFaq[] | null>(null);
  protected readonly editing = signal<AdminFaq | 'new' | null>(null);
  protected readonly saving = signal(false);
  protected readonly services = toSignal(this.api.services().pipe(catchError(() => of([]))), { initialValue: [] });

  protected readonly form = inject(NonNullableFormBuilder).group({
    question: ['', [Validators.required, Validators.maxLength(300)]],
    answer: ['', [Validators.required, Validators.maxLength(3000)]],
    serviceId: [''],
    isActive: [true],
  });

  constructor() {
    this.load();
  }

  private load(): void {
    this.api.faqs().subscribe((list) => this.faqs.set(list));
  }

  protected edit(faq: AdminFaq | 'new'): void {
    this.editing.set(faq);
    this.form.reset(
      faq === 'new'
        ? { question: '', answer: '', serviceId: '', isActive: true }
        : { question: faq.question, answer: faq.answer, serviceId: faq.serviceId ?? '', isActive: faq.isActive ?? true },
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const body = { ...v, serviceId: v.serviceId || null };
    const current = this.editing();
    this.saving.set(true);
    const request = current === 'new' ? this.api.createFaq(body) : this.api.updateFaq((current as AdminFaq).id, body);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.toast.success('Pregunta guardada.');
        this.load();
      },
      error: () => this.saving.set(false),
    });
  }

  protected drop(event: CdkDragDrop<AdminFaq[]>): void {
    const list = [...(this.faqs() ?? [])];
    if (event.previousIndex === event.currentIndex) return;
    moveItemInArray(list, event.previousIndex, event.currentIndex);
    this.faqs.set(list);
    this.api.reorderFaqs(list.map((f) => f.id)).subscribe(() => this.toast.success('Orden actualizado.'));
  }

  protected async remove(faq: AdminFaq): Promise<void> {
    const ok = await this.confirm.ask({ title: 'Eliminar pregunta', message: `"${faq.question}"`, confirmLabel: 'Eliminar', danger: true });
    if (!ok) return;
    this.api.deleteFaq(faq.id).subscribe(() => {
      this.toast.success('Pregunta eliminada.');
      this.load();
    });
  }
}
