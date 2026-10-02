import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { AuthService } from '../../../core/services/auth.service';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { ApiError } from '../../../core/types/common.model';
import { Btn } from '../../../components/buttons/btn';
import { PageHeader } from '../shared/page-header';
import { SettingsSaver, orNull } from '../content/settings-saver';

const passwordsMatch = (group: AbstractControl): ValidationErrors | null =>
  group.get('newPassword')?.value === group.get('confirmPassword')?.value ? null : { mismatch: true };

@Component({
  selector: 'app-settings-admin',
  imports: [ReactiveFormsModule, Btn, PageHeader],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-header title="Configuración" />

    <section class="p-card p-form">
      <h2 class="p-card__title">Disponibilidad pública</h2>
      <form class="p-form" [formGroup]="availability" (ngSubmit)="saveAvailability()" novalidate>
        <div class="p-grid">
          <div class="field">
            <label class="field__label" for="max">Eventos por día para marcar "Ocupado"</label>
            <input id="max" class="field__control" type="number" min="1" max="10" formControlName="maxEventsPerDay" />
            <span class="field__hint">Con 1, cualquier evento ocupa el día. Súbelo si a veces cubres eventos simultáneos con apoyo.</span>
          </div>
        </div>
        <div class="field">
          <label class="field__label" for="note">Texto bajo el título del calendario</label>
          <input id="note" class="field__control" formControlName="publicNote" maxlength="300" />
        </div>
        <div><button appBtn size="sm" type="submit" [loading]="savingAvailability()" [disabled]="availability.invalid || availability.pristine">Guardar</button></div>
      </form>
    </section>

    <section class="p-card p-form">
      <h2 class="p-card__title">Cuenta</h2>
      <p>Sesión iniciada como <strong>{{ auth.admin()?.email }}</strong></p>
      <form class="p-form narrow" [formGroup]="password" (ngSubmit)="changePassword()" novalidate>
        <div class="field">
          <label class="field__label" for="current">Contraseña actual</label>
          <input id="current" class="field__control" type="password" formControlName="currentPassword" autocomplete="current-password" />
          @if (passwordError()) {
            <span class="field__error">{{ passwordError() }}</span>
          }
        </div>
        <div class="field">
          <label class="field__label" for="new">Nueva contraseña</label>
          <input id="new" class="field__control" type="password" formControlName="newPassword" autocomplete="new-password" />
          <span class="field__hint">Mínimo 10 caracteres.</span>
        </div>
        <div class="field">
          <label class="field__label" for="confirm">Confirmar nueva contraseña</label>
          <input id="confirm" class="field__control" type="password" formControlName="confirmPassword" autocomplete="new-password" />
          @if (password.hasError('mismatch') && password.controls.confirmPassword.touched) {
            <span class="field__error">Las contraseñas no coinciden.</span>
          }
        </div>
        <div><button appBtn size="sm" type="submit" [loading]="savingPassword()" [disabled]="password.invalid || savingPassword()">Cambiar contraseña</button></div>
      </form>
    </section>
  `,
  styles: `
    :host { display: grid; gap: var(--space-5); }
    .narrow { max-width: 420px; }
  `,
})
export class SettingsAdmin {
  protected readonly auth = inject(AuthService);
  private readonly api = inject(ContentApiService);
  private readonly saver = inject(SettingsSaver);
  private readonly toast = inject(ToastService);
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly savingAvailability = signal(false);
  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal<string | null>(null);

  protected readonly availability = this.fb.group({
    maxEventsPerDay: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
    publicNote: [''],
  });

  protected readonly password = this.fb.group(
    {
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(10)]],
      confirmPassword: ['', Validators.required],
    },
    { validators: passwordsMatch },
  );

  constructor() {
    this.api.settings().subscribe((s) =>
      this.availability.reset({ maxEventsPerDay: s.availability.maxEventsPerDay, publicNote: s.availability.publicNote ?? '' }),
    );
  }

  protected saveAvailability(): void {
    const v = this.availability.getRawValue();
    this.savingAvailability.set(true);
    this.saver.save('availability', { maxEventsPerDay: Number(v.maxEventsPerDay), publicNote: orNull(v.publicNote) }, 'Disponibilidad actualizada.').subscribe({
      next: () => {
        this.savingAvailability.set(false);
        this.availability.markAsPristine();
      },
      error: () => this.savingAvailability.set(false),
    });
  }

  protected changePassword(): void {
    const v = this.password.getRawValue();
    this.savingPassword.set(true);
    this.passwordError.set(null);
    this.auth.changePassword(v.currentPassword, v.newPassword).subscribe({
      next: () => {
        this.savingPassword.set(false);
        this.password.reset();
        this.toast.success('Contraseña actualizada.');
      },
      error: (e: ApiError) => {
        this.savingPassword.set(false);
        this.passwordError.set(e.fields?.['currentPassword'] ?? e.fields?.['newPassword'] ?? e.message);
      },
    });
  }
}
