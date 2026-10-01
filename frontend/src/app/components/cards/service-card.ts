import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ServiceSummary } from '../../core/types/catalog.model';
import { Photo } from '../photo/photo';

/** Card vertical 3:4 (ref. ideas/Home/Servicios.jpg): foto protagonista, título serif debajo. */
@Component({
  selector: 'app-service-card',
  imports: [RouterLink, Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="card" [routerLink]="['/events', service().slug]">
      <div class="media">
        <app-photo [media]="service().cover" [alt]="service().name" ratio="3 / 4" sizes="(max-width: 600px) 50vw, (max-width: 1100px) 33vw, 300px" />
      </div>
      <h3 class="title">{{ service().name }}</h3>
      @if (showDescription() && service().shortDescription) {
        <p class="desc">{{ service().shortDescription }}</p>
      }
      <span class="more">Ver más</span>
    </a>
  `,
  styles: `
    .card { display: grid; gap: var(--space-2); }
    .media { overflow: hidden; }
    .media app-photo { transition: transform 1.1s var(--ease-out); }
    .card:hover .media app-photo { transform: scale(1.045); }
    .title { margin-top: var(--space-3); font-size: var(--text-xl); }
    .desc { font-size: var(--text-sm); color: var(--color-text-muted); }
    .more {
      justify-self: start;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-primary);
      border-bottom: 1px solid transparent;
      transition: border-color var(--duration);
    }
    .card:hover .more { border-color: currentColor; }
  `,
})
export class ServiceCard {
  readonly service = input.required<ServiceSummary>();
  readonly showDescription = input(false);
}
