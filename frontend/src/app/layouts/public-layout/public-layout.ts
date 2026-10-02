import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { ActivatedRouteSnapshot, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { filter, map } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { WhatsappFloat } from '../../components/whatsapp-float/whatsapp-float';
import { SeasonalDecor } from '../../components/seasonal-decor/seasonal-decor';
import { ThemeService } from '../../core/services/theme.service';

function deepestData(snapshot: ActivatedRouteSnapshot): Record<string, unknown> {
  let route = snapshot;
  while (route.firstChild) route = route.firstChild;
  return route.data;
}

/** Layout del sitio público: navbar + contenido + footer + WhatsApp flotante (+ decoración del tema sobre el Hero). */
@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, WhatsappFloat, SeasonalDecor],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip-link" href="#contenido">Saltar al contenido</a>
    @if (navOverlay() && decoration(); as decoration) {
      <app-seasonal-decor [decoration]="decoration" />
    }
    <app-navbar [overlay]="navOverlay()" />
    <main id="contenido" [class.with-offset]="!navOverlay()">
      <router-outlet />
    </main>
    <app-footer />
    <app-whatsapp-float />
  `,
  styles: `
    :host { position: relative; display: flex; flex-direction: column; min-height: 100vh; }
    main { flex: 1; }
    /* Páginas sin Hero: dejar espacio para el navbar fijo. */
    main.with-offset { padding-top: calc(var(--navbar-height) + var(--space-6)); }
    .skip-link {
      position: absolute;
      left: var(--space-4);
      top: -100px;
      z-index: var(--z-toast);
      padding: var(--space-2) var(--space-4);
      background: var(--color-secondary);
      color: var(--color-text-inverse);
    }
    .skip-link:focus { top: var(--space-4); }
  `,
})
export class PublicLayout {
  private readonly router = inject(Router);
  private readonly theme = inject(ThemeService);

  /** Decoración del tema activo; "none" = sin decoración. */
  protected readonly decoration = computed(() => {
    const decoration = this.theme.active()?.decoration;
    return decoration && decoration !== 'none' ? decoration : null;
  });

  /** Las rutas con `data: { navOverlay: true }` tienen un Hero bajo el navbar transparente. */
  protected readonly navOverlay = toSignal(
    this.router.events.pipe(
      filter((e) => e instanceof NavigationEnd),
      map(() => deepestData(this.router.routerState.snapshot.root)['navOverlay'] === true),
    ),
    { initialValue: deepestData(this.router.routerState.snapshot.root)['navOverlay'] === true },
  );
}
