import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideClientHydration, withEventReplay, withHttpTransferCacheOptions } from '@angular/platform-browser';

import { routes } from './app.routes';
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { ssrTimeoutInterceptor } from './core/interceptors/ssr-timeout.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      // La transición entre páginas es la cortina con el monograma (components/brand-intro/route-curtain.ts).
    ),
    provideHttpClient(withFetch(), withInterceptors([ssrTimeoutInterceptor, authInterceptor, errorInterceptor])),
    // Las respuestas GET hechas en SSR se reutilizan en el navegador (sin doble petición).
    // Nunca se cachean peticiones con Authorization (panel).
    provideClientHydration(withEventReplay(), withHttpTransferCacheOptions({ includeRequestsWithAuthHeaders: false })),
  ],
};
