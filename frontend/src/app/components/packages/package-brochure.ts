import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { StudioPackage } from '../../core/types/catalog.model';
import { formatMoney } from '../../core/utils/date-mx';
import { SettingsStore } from '../../core/services/settings.store';
import { Photo } from '../photo/photo';
import { Media } from '../../core/types/common.model';

/**
 * Paquetes con estética de folleto impreso (ref. ideas/Home/Paquetes.jpg):
 * marco de línea fina, columnas separadas por divisores verticales, tira de fotos debajo.
 * Un precio provisional o vacío se muestra como "Precio por confirmar" (nunca se inventa).
 */
@Component({
  selector: 'app-package-brochure',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './package-brochure.html',
  styleUrl: './package-brochure.css',
})
export class PackageBrochure {
  readonly packages = input.required<StudioPackage[]>();
  readonly heading = input('Paquetes');
  /** Fotos de la tira inferior (hasta 3); sin fotos se muestran las provisionales. */
  readonly photos = input<Media[]>([]);
  protected readonly strip = computed<(Media | null)[]>(() => {
    const photos = this.photos().slice(0, 3);
    return photos.length ? photos : [null, null, null];
  });

  protected readonly settings = inject(SettingsStore);
  protected readonly studio = computed(() => this.settings.brand()?.photographerName ?? 'Armando Ovalle');

  protected priceLabel(pkg: StudioPackage): string {
    return pkg.price === null || pkg.isPriceProvisional ? 'Precio por confirmar' : formatMoney(pkg.price, pkg.currency);
  }
}
