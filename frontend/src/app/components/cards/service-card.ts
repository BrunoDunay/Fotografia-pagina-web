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
    .media { position: relative; overflow: hidden; }
    .media app-photo { transition: transform 1.4s var(--ease-out), filter 0.9s var(--ease-out); }
    .card:hover .media app-photo { transform: scale(1.05); filter: brightness(0.94); }
    /* Marco fino que aparece hacia adentro de la foto. */
    .media::after {
      content: '';
      position: absolute;
      inset: var(--space-3);
      border: 1px solid rgb(255 255 255 / 0.75);
      opacity: 0;
      transform: scale(1.04);
      transition: opacity 0.6s var(--ease-out), transform 0.8s var(--ease-out);
      pointer-events: none;
    }
    .card:hover .media::after { opacity: 1; transform: none; }
    .title { margin-top: var(--space-3); font-size: var(--text-xl); transition: color var(--duration) var(--ease-out); }
    .card:hover .title { color: var(--color-primary); }
    .desc { font-size: var(--text-sm); color: var(--color-text-muted); }
    .more {
      justify-self: start;
      font-size: var(--text-xs);
      letter-spacing: var(--tracking-wide);
      text-transform: uppercase;
      color: var(--color-primary);
      background: linear-gradient(currentColor, currentColor) no-repeat 0 100% / 0 1px;
      padding-bottom: 2px;
      transition: background-size 0.5s var(--ease-out), letter-spacing 0.5s var(--ease-out);
    }
    .card:hover .more { background-size: 100% 1px; letter-spacing: calc(var(--tracking-wide) + 0.04em); }
  `,
})
export class ServiceCard {
  readonly service = input.required<ServiceSummary>();
  readonly showDescription = input(false);
}
