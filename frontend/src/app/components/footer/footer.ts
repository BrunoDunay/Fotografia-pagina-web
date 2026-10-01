import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, map, of } from 'rxjs';
import { SettingsStore } from '../../core/services/settings.store';
import { PublicApiService } from '../../core/services/api/public-api.service';
import { Icon } from '../icon/icon';
import { NAV_LINKS } from '../navbar/nav-links';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly settings = inject(SettingsStore);
  protected readonly links = NAV_LINKS;
  protected readonly year = new Date().getFullYear();
  protected readonly services = toSignal(
    inject(PublicApiService)
      .services()
      .pipe(
        map((list) => list.slice(0, 6)),
        catchError(() => of([])),
      ),
    { initialValue: [] },
  );
}
