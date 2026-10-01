import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { SettingsStore } from '../../core/services/settings.store';
import { ThemeService } from '../../core/services/theme.service';
import { Icon } from '../icon/icon';
import { NAV_LINKS } from './nav-links';

/**
 * Navbar de 3 zonas (ref. ideas/Navbar.jpg): enlaces · logotipo centrado · redes.
 * Sobre un Hero es transparente con logo claro; al hacer scroll se vuelve una
 * "píldora" marfil flotante con logo oscuro.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '[class.is-overlay]': 'transparent()',
    '[class.is-solid]': '!transparent()',
    '[class.menu-open]': 'menuOpen()',
  },
})
export class Navbar {
  /** La página actual tiene un Hero a sangre bajo el navbar. */
  readonly overlay = input(false);

  protected readonly settings = inject(SettingsStore);
  protected readonly theme = inject(ThemeService);
  protected readonly links = NAV_LINKS;
  protected readonly menuOpen = signal(false);
  private readonly scrolled = signal(false);

  protected readonly transparent = computed(() => this.overlay() && !this.scrolled() && !this.menuOpen());

  constructor() {
    const document = inject(DOCUMENT);
    const destroyRef = inject(DestroyRef);

    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.menuOpen.set(false));

    // Bloquear el scroll del fondo mientras el menú móvil está abierto.
    effect(() => document.body.style.setProperty('overflow', this.menuOpen() ? 'hidden' : ''));

    afterNextRender(() => {
      const onScroll = () => this.scrolled.set(window.scrollY > 40);
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && this.menuOpen.set(false);
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      window.addEventListener('keydown', onKey);
      destroyRef.onDestroy(() => {
        window.removeEventListener('scroll', onScroll);
        window.removeEventListener('keydown', onKey);
      });
    });
  }

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }
}
