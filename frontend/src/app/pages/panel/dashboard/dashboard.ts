import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { Dashboard as DashboardData } from '../../../core/types/agenda.model';
import { ApiError } from '../../../core/types/common.model';
import { formatLongDate, formatMoney } from '../../../core/utils/date-mx';
import { SkeletonDashboard } from '../../../components/skeletons';

/**
 * Dashboard del panel. Fase 2: resumen básico que valida la API protegida con JWT.
 * Fase 4 lo completa (accesos rápidos, agenda de la semana, etc.).
 */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, SkeletonDashboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly data = signal<DashboardData | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly formatLongDate = formatLongDate;
  protected readonly formatMoney = formatMoney;

  constructor() {
    inject(AgendaApiService)
      .dashboard()
      .subscribe({
        next: (d) => this.data.set(d),
        error: (e: ApiError) => this.error.set(e.message),
      });
  }
}
