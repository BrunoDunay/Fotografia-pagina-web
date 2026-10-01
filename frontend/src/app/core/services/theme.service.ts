import { HttpClient } from '@angular/common/http';
import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import { catchError, of, tap } from 'rxjs';
import { API_URL } from '../config/api.config';
import { ActiveTheme } from '../types/catalog.model';

/** Solo se permiten variables de color; nada de CSS arbitrario desde la API. */
const ALLOWED_TOKEN = /^--color-[a-z-]+$/;

/**
 * Tema estacional activo (resuelto en el servidor según fecha/modo).
 * Aplica `data-season` y los overrides de color en <html>.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = inject(API_URL);
  private readonly document = inject(DOCUMENT);

  readonly active = signal<ActiveTheme | null>(null);
  private appliedTokens: string[] = [];

  load() {
    return this.http.get<ActiveTheme | null>(`${this.apiUrl}/themes/active`).pipe(
      tap((theme) => this.apply(theme)),
      catchError(() => of(null)),
    );
  }

  apply(theme: ActiveTheme | null): void {
    const root = this.document.documentElement;
    for (const token of this.appliedTokens) root.style.removeProperty(token);
    this.appliedTokens = [];

    if (theme) {
      root.setAttribute('data-season', theme.key);
      for (const [token, value] of Object.entries(theme.tokenOverrides ?? {})) {
        if (!ALLOWED_TOKEN.test(token)) continue;
        root.style.setProperty(token, value);
        this.appliedTokens.push(token);
      }
    } else {
      root.removeAttribute('data-season');
    }
    this.active.set(theme);
  }
}
