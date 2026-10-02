import { Injectable, inject } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ContentApiService } from '../../../core/services/api/content-api.service';
import { SettingsStore } from '../../../core/services/settings.store';
import { ToastService } from '../../../core/services/toast.service';
import { AllSettings, SettingsSection } from '../../../core/types/settings.model';

/** Guarda una sección de configuración y refresca el sitio público en esta misma sesión. */
@Injectable({ providedIn: 'root' })
export class SettingsSaver {
  private readonly api = inject(ContentApiService);
  private readonly store = inject(SettingsStore);
  private readonly toast = inject(ToastService);

  save<K extends SettingsSection>(section: K, value: AllSettings[K], message = 'Cambios guardados.'): Observable<AllSettings[K]> {
    return this.api.saveSettings(section, value).pipe(
      tap(() => {
        this.toast.success(message);
        this.store.refresh().subscribe();
      }),
    );
  }
}

/** Convierte '' en null para campos opcionales. */
export const orNull = (value: string | null | undefined) => (value && value.trim() ? value.trim() : null);
