import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AgendaApiService } from '../../../core/services/api/agenda-api.service';
import { AuthService } from '../../../core/services/auth.service';
import { Dashboard as DashboardData } from '../../../core/types/agenda.model';
import { ApiError } from '../../../core/types/common.model';
import { formatLongDate, formatMoney, ticketStage } from '../../../core/utils/date-mx';
import { Btn } from '../../../components/buttons/btn';
import { SkeletonDashboard } from '../../../components/skeletons';
import { EVENT_STATUS_LABEL, PAYMENT_STATUS_LABEL, shortDate, shortTime } from '../shared/labels';

interface ProvisionalGroup {
  type: string;
  title: string;
  link: string;
  items: { id: string; label: string }[];
}

const GROUPS: Record<string, { title: string; link: string }> = {
  content: { title: 'Textos del sitio', link: '/panel/content' },
  package: { title: 'Precios de paquetes', link: '/panel/packages' },
  service: { title: 'Textos de servicios', link: '/panel/services' },
  gallery: { title: 'Galerías sin fotografías', link: '/panel/services' },
  legal: { title: 'Documentos legales', link: '/panel/legal' },
};

/** Resumen del día: próximos eventos, saldos y lo que falta por confirmar del contenido. */
@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, Btn, SkeletonDashboard],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  protected readonly auth = inject(AuthService);
  protected readonly data = signal<DashboardData | null>(null);
  protected readonly error = signal<string | null>(null);
  protected readonly formatLongDate = formatLongDate;
  protected readonly formatMoney = formatMoney;
  protected readonly shortDate = shortDate;
  protected readonly shortTime = shortTime;
  protected readonly statusLabel = EVENT_STATUS_LABEL;
  protected readonly paymentLabel = PAYMENT_STATUS_LABEL;

  protected readonly greeting = computed(() => {
    const hour = Number(new Intl.DateTimeFormat('es-MX', { hour: 'numeric', hour12: false, timeZone: 'America/Mexico_City' }).format(new Date()));
    const name = this.auth.admin()?.name.split(' ')[0] ?? '';
    return `${hour < 12 ? 'Buenos días' : hour < 19 ? 'Buenas tardes' : 'Buenas noches'}${name ? ', ' + name : ''}`;
  });

  protected readonly provisionalGroups = computed<ProvisionalGroup[]>(() => {
    const groups = new Map<string, ProvisionalGroup>();
    for (const item of this.data()?.provisional ?? []) {
      const meta = GROUPS[item.type] ?? { title: 'Otros', link: '/panel' };
      if (!groups.has(item.type)) groups.set(item.type, { type: item.type, ...meta, items: [] });
      groups.get(item.type)!.items.push({ id: item.id, label: item.label });
    }
    return [...groups.values()];
  });

  constructor() {
    inject(AgendaApiService)
      .dashboard()
      .subscribe({
        next: (d) => this.data.set(d),
        error: (e: ApiError) => this.error.set(e.message),
      });
  }

  protected countdown(date: string, today: string): string {
    const { stage, daysLeft } = ticketStage(date, today);
    if (stage === 'today') return 'Hoy';
    return daysLeft === 1 ? 'Mañana' : `En ${daysLeft} días`;
  }
}
