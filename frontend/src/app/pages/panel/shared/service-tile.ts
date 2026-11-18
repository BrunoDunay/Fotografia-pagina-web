import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Media } from '../../../core/types/common.model';
import { Photo } from '../../../components/photo/photo';

/**
 * Tarjeta de un servicio para el panel, parecida a la del sitio: foto vertical con el nombre encima.
 * Lo que va debajo de la foto (datos, botones, lista de paquetes) lo pone cada página con <ng-content>.
 */
@Component({
  selector: 'app-service-tile',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-hidden]': 'hidden()' },
  template: `
    <div class="cover">
      <app-photo [media]="cover()" ratio="4 / 5" sizes="(max-width: 640px) 50vw, 260px" [maxWidth]="520" />
      <div class="shade" aria-hidden="true"></div>
      <div class="badges"><ng-content select="[tileBadges]" /></div>
      <strong class="name">{{ name() }}</strong>
    </div>
    <div class="body"><ng-content /></div>
  `,
  styles: `
    :host {
      display: grid;
      align-content: start;
      overflow: hidden;
      border: var(--hairline);
      background: var(--color-surface);
      transition: border-color var(--duration-fast), box-shadow var(--duration-fast), translate var(--duration-fast);
    }
    :host(.is-hidden) .cover { filter: grayscale(0.7); opacity: 0.6; }
    .cover { position: relative; overflow: hidden; background: var(--color-background); }
    .cover app-photo { display: block; transition: scale 600ms var(--ease-out, ease-out); }
    :host(:hover) .cover app-photo { scale: 1.04; }
    .shade { position: absolute; inset: 0; background: linear-gradient(180deg, transparent 45%, rgb(20 14 10 / 0.72)); pointer-events: none; }
    .badges { position: absolute; top: var(--space-2); left: var(--space-2); right: var(--space-2); display: flex; flex-wrap: wrap; gap: var(--space-1); }
    .name {
      position: absolute;
      left: var(--space-3);
      right: var(--space-3);
      bottom: var(--space-3);
      font-family: var(--font-serif);
      font-size: var(--text-xl);
      font-weight: 500;
      line-height: 1.1;
      color: #fff;
      text-shadow: 0 1px 8px rgb(0 0 0 / 0.4);
    }
    .body { display: grid; gap: var(--space-2); padding: var(--space-3); }
  `,
})
export class ServiceTile {
  readonly name = input.required<string>();
  readonly cover = input<Media | null | undefined>(null);
  /** Servicio oculto del sitio: la foto se ve apagada. */
  readonly hidden = input(false);
}
