import { ChangeDetectionStrategy, Component, computed, input, model } from '@angular/core';
import { ReservationTicket, TicketData } from '../../../components/ticket/reservation-ticket';
import { TICKET_DESIGNS, TICKET_GROUPS, ticketDesign, ticketPalette } from '../../../core/ticket-designs';

/** Datos del evento para la vista previa (sin diseño ni color: esos los elige este componente). */
export type TicketPreviewData = Omit<TicketData, 'design' | 'palette'>;

/**
 * Selector del diseño del ticket y su variación de color, con vista previa en vivo.
 * Uso: <app-ticket-style-picker [(design)]="…" [(palette)]="…" [data]="…" />
 */
@Component({
  selector: 'app-ticket-style-picker',
  imports: [ReservationTicket],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="picker">
      <div class="options">
        <p class="field__label">Diseño</p>
        @for (group of groups; track group.name) {
          <p class="group" [id]="'designs-' + $index">{{ group.name }}</p>
          <div class="designs" role="radiogroup" [attr.aria-labelledby]="'designs-' + $index">
            @for (d of group.designs; track d.key) {
              <button
                type="button"
                class="design"
                role="radio"
                [attr.aria-checked]="d.key === current().key"
                [class.is-selected]="d.key === current().key"
                (click)="pickDesign(d.key)"
              >
                <span class="thumb" aria-hidden="true">
                  <app-reservation-ticket [reservation]="thumbs().get(d.key)!" [now]="now" />
                </span>
                <strong>{{ d.label }}</strong>
                @if (d.photo) {
                  <small>Con fotografía</small>
                }
              </button>
            }
          </div>
        }

        <p class="field__label" id="palette-label">Color</p>
        <div class="palettes" role="radiogroup" aria-labelledby="palette-label">
          @for (p of current().palettes; track p.key) {
            <button
              type="button"
              class="palette"
              role="radio"
              [attr.aria-checked]="p.key === currentPalette().key"
              [class.is-selected]="p.key === currentPalette().key"
              (click)="palette.set(p.key)"
            >
              <span class="swatch" [style.background]="'linear-gradient(135deg, ' + p.main + ' 50%, ' + p.paper + ' 50%)'"></span>
              {{ p.label }}
            </button>
          }
        </div>
      </div>

      <div class="preview">
        <p class="field__label">Vista previa</p>
        <div class="preview__frame" [style.background]="currentPalette().dark">
          <app-reservation-ticket [reservation]="preview()" [now]="now" />
        </div>
      </div>
    </div>
  `,
  styles: `
    :host { display: block; container-type: inline-size; }
    .picker { display: grid; grid-template-columns: minmax(0, 1fr) 250px; gap: var(--space-5); align-items: start; }
    .options { display: grid; gap: var(--space-3); min-width: 0; }
    .group { margin: var(--space-2) 0 0; font-size: var(--text-sm); font-weight: 500; }
    .designs { display: grid; grid-template-columns: repeat(auto-fill, minmax(118px, 1fr)); gap: var(--space-3); }
    .design {
      display: grid;
      justify-items: center;
      gap: 2px;
      padding: var(--space-2);
      border: var(--hairline);
      background: var(--color-surface);
      text-align: center;
      cursor: pointer;
      transition: border-color var(--duration-fast);
    }
    .design:hover { border-color: var(--color-border-strong); }
    .design.is-selected { border-color: var(--color-text); box-shadow: 0 0 0 1px var(--color-text); }
    .design strong { margin-top: var(--space-2); font-size: var(--text-sm); font-weight: 500; }
    .design small { font-size: 0.7rem; line-height: 1.3; color: var(--color-text-muted); }
    /* Miniatura: el ticket real, en pequeño (no interactivo). */
    .thumb { display: block; width: 86px; pointer-events: none; }
    .thumb app-reservation-ticket { box-shadow: 0 4px 10px rgb(0 0 0 / 0.18); }
    .palettes { display: flex; flex-wrap: wrap; gap: var(--space-2); }
    .palette {
      display: flex;
      align-items: center;
      gap: var(--space-2);
      padding: var(--space-2) var(--space-3) var(--space-2) var(--space-2);
      border: var(--hairline);
      background: var(--color-surface);
      font-size: var(--text-sm);
      cursor: pointer;
    }
    .palette.is-selected { border-color: var(--color-text); box-shadow: 0 0 0 1px var(--color-text); }
    .swatch { width: 1.5rem; height: 1.5rem; border: 1px solid rgb(0 0 0 / 0.08); border-radius: var(--radius-sm); }
    .preview { position: sticky; top: calc(var(--space-6) + 60px); display: grid; gap: var(--space-2); }
    .preview__frame { padding: var(--space-4); }
    .preview__frame app-reservation-ticket { box-shadow: 0 12px 28px rgb(0 0 0 / 0.35); }
    /* En columnas angostas (ficha del evento, celular) la vista previa va debajo. */
    @container (max-width: 620px) {
      .picker { grid-template-columns: minmax(0, 1fr); }
      .preview { position: static; justify-items: center; }
      .preview__frame { width: min(250px, 100%); }
    }
  `,
})
export class TicketStylePicker {
  readonly design = model.required<string>();
  readonly palette = model.required<string>();
  readonly data = input.required<TicketPreviewData>();

  /** Diseños agrupados por tipo de evento. */
  protected readonly groups = TICKET_GROUPS.map((name) => ({ name, designs: TICKET_DESIGNS.filter((d) => d.group === name) }));
  /** La vista previa no necesita avanzar cada segundo. */
  protected readonly now = Date.now();

  protected readonly current = computed(() => ticketDesign(this.design()));
  protected readonly currentPalette = computed(() => ticketPalette(this.design(), this.palette()));

  protected readonly preview = computed<TicketData>(() => ({ ...this.data(), design: this.current().key, palette: this.currentPalette().key }));

  /** Miniatura de cada diseño con los datos del evento y su primer color (o el elegido, si es el diseño actual). */
  protected readonly thumbs = computed(
    () =>
      new Map<string, TicketData>(
        TICKET_DESIGNS.map((d) => [
          d.key,
          { ...this.data(), design: d.key, palette: d.key === this.current().key ? this.currentPalette().key : d.palettes[0].key },
        ]),
      ),
  );

  protected pickDesign(key: string): void {
    if (key === this.current().key) return;
    this.design.set(key);
    // Cada diseño tiene sus propios colores: se elige el primero del nuevo diseño.
    this.palette.set(ticketDesign(key).palettes[0].key);
  }
}
