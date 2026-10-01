import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';

/** URL base de la API (absoluta para que funcione también en SSR). */
export const API_URL = new InjectionToken<string>('API_URL', {
  providedIn: 'root',
  factory: () => environment.apiUrl,
});

export const SITE_URL = new InjectionToken<string>('SITE_URL', {
  providedIn: 'root',
  factory: () => environment.siteUrl,
});
