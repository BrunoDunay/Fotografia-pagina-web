import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ContactSettings } from '../../../core/types/settings.model';
import { buildWhatsAppLink } from '../../../core/utils/whatsapp-link';
import { Btn } from '../../../components/buttons/btn';
import { SettingsSaver, orNull } from './settings-saver';

@Component({
  selector: 'app-content-contact',
  imports: [ReactiveFormsModule, Btn],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <form class="p-form" [formGroup]="form" (ngSubmit)="save()" novalidate>
      <section class="p-card p-form">
        <h2 class="p-card__title">Datos de contacto</h2>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="pname">Nombre</label>
            <input id="pname" class="field__control" formControlName="photographerName" />
          </div>
          <div class="field">
            <label class="field__label" for="studio">Estudio</label>
            <input id="studio" class="field__control" formControlName="studioName" />
          </div>
          <div class="field">
            <label class="field__label" for="phone">Teléfono (como se muestra)</label>
            <input id="phone" class="field__control" formControlName="phone" placeholder="+52 449 999 5998" />
          </div>
          <div class="field">
            <label class="field__label" for="wa">WhatsApp (solo dígitos con lada)</label>
            <input id="wa" class="field__control" formControlName="whatsapp" inputmode="numeric" [attr.aria-invalid]="form.controls.whatsapp.invalid" />
            <span class="field__hint">Ej. 524499995998 (52 = México)</span>
          </div>
          <div class="field">
            <label class="field__label" for="email">Email</label>
            <input id="email" class="field__control" type="email" formControlName="email" />
          </div>
        </div>
      </section>

      <section class="p-card p-form">
        <h2 class="p-card__title">Redes sociales</h2>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="ig">Instagram (usuario)</label>
            <input id="ig" class="field__control" formControlName="instagramHandle" placeholder="armandoovalle.ws" />
          </div>
          <div class="field">
            <label class="field__label" for="igurl">Instagram (enlace)</label>
            <input id="igurl" class="field__control" type="url" formControlName="instagramUrl" placeholder="https://www.instagram.com/…" />
          </div>
          <div class="field">
            <label class="field__label" for="fb">Facebook (nombre)</label>
            <input id="fb" class="field__control" formControlName="facebookName" />
          </div>
          <div class="field">
            <label class="field__label" for="fburl">Facebook (enlace)</label>
            <input id="fburl" class="field__control" type="url" formControlName="facebookUrl" placeholder="https://www.facebook.com/…" />
            @if (!form.controls.facebookUrl.value) {
              <span class="field__hint">Sin enlace, Facebook se muestra solo como texto.</span>
            }
          </div>
        </div>
      </section>

      <section class="p-card p-form">
        <h2 class="p-card__title">Mensaje automático de WhatsApp</h2>
        <div class="field">
          <label class="field__label" for="msg">Mensaje con el que se abre la conversación</label>
          <textarea id="msg" class="field__control" formControlName="message"></textarea>
        </div>
        <a class="p-link" [href]="preview()" target="_blank" rel="noopener">Probar enlace de WhatsApp</a>
      </section>

      <div class="p-actions">
        <button appBtn type="submit" [loading]="saving()" [disabled]="saving() || form.invalid">Guardar contacto</button>
      </div>
    </form>
  `,
})
export class ContentContact implements OnInit {
  readonly initial = input.required<ContactSettings>();
  readonly initialMessage = input.required<string>();
  private readonly saver = inject(SettingsSaver);
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly saving = signal(false);

  protected readonly form = this.fb.group({
    photographerName: ['', Validators.required],
    studioName: ['', Validators.required],
    phone: [''],
    whatsapp: ['', [Validators.required, Validators.pattern(/^\d{10,15}$/)]],
    email: ['', Validators.email],
    instagramHandle: [''],
    instagramUrl: [''],
    facebookName: [''],
    facebookUrl: [''],
    message: ['', Validators.required],
  });

  ngOnInit(): void {
    const c = this.initial();
    this.form.reset({
      photographerName: c.photographerName,
      studioName: c.studioName,
      phone: c.phone ?? '',
      whatsapp: c.whatsapp,
      email: c.email ?? '',
      instagramHandle: c.instagram.handle ?? '',
      instagramUrl: c.instagram.url ?? '',
      facebookName: c.facebook.name ?? '',
      facebookUrl: c.facebook.url ?? '',
      message: this.initialMessage(),
    });
  }

  protected preview(): string {
    const v = this.form.getRawValue();
    return buildWhatsAppLink(v.whatsapp || '0', v.message);
  }

  protected save(): void {
    const v = this.form.getRawValue();
    const contact: ContactSettings = {
      photographerName: v.photographerName,
      studioName: v.studioName,
      phone: orNull(v.phone),
      whatsapp: v.whatsapp,
      email: orNull(v.email),
      instagram: { handle: orNull(v.instagramHandle?.replace(/^@/, '')), url: orNull(v.instagramUrl) },
      facebook: { name: orNull(v.facebookName), url: orNull(v.facebookUrl) },
    };
    this.saving.set(true);
    forkJoin([this.saver.save('contact', contact, 'Contacto actualizado.'), this.saver.save('whatsapp', { message: v.message }, 'Mensaje de WhatsApp actualizado.')]).subscribe({
      next: () => this.saving.set(false),
      error: () => this.saving.set(false),
    });
  }
}
