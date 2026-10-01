import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, shareReplay, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { PublicSettings } from '../types/settings.model';
import { buildWhatsAppLink } from '../utils/whatsapp-link';

/**
 * Configuración pública del sitio (marca, contacto, textos de Home…).
 * Se pide una sola vez; en SSR la respuesta viaja al navegador vía TransferState.
 */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);

  private readonly state = signal<PublicSettings | null>(null);
  private request$?: Observable<PublicSettings | null>;

  readonly settings = this.state.asReadonly();
  readonly brand = computed(() => this.state()?.brand ?? null);
  readonly contact = computed(() => this.state()?.contact ?? null);
  readonly whatsappLink = computed(() => {
    const s = this.state();
    return s ? buildWhatsAppLink(s.contact.whatsapp, s.whatsapp.message) : null;
  });

  load(): Observable<PublicSettings | null> {
    this.request$ ??= this.http.get<PublicSettings>(`${this.apiUrl}/settings/public`).pipe(
      tap((settings) => this.state.set(settings)),
      catchError(() => of(null)),
      shareReplay(1),
    );
    return this.request$;
  }

  /** Tras guardar desde el panel, refresca para que el sitio público lo refleje. */
  refresh(): Observable<PublicSettings | null> {
    this.request$ = undefined;
    return this.load();
  }
}
