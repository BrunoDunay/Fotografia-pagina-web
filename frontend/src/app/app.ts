import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastOutlet } from './components/toast/toast-outlet';
import { SettingsStore } from './core/services/settings.store';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <router-outlet />
    <app-toast-outlet />
  `,
})
export class App {
  constructor() {
    // Datos globales del sitio: se piden una vez (en SSR viajan al navegador por TransferState).
    inject(SettingsStore).load().subscribe();
    inject(ThemeService).load().subscribe();
  }
}
