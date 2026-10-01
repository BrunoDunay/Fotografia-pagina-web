import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SettingsStore } from '../../core/services/settings.store';
import { SeoService } from '../../core/services/seo.service';
import { Photo } from '../../components/photo/photo';
import { Btn } from '../../components/buttons/btn';
import { Icon } from '../../components/icon/icon';
import { Reveal } from '../../components/reveal/reveal.directive';
import { SectionTitle } from '../../components/section-title/section-title';
import { CtaBand } from '../../components/cta-band/cta-band';
import { SkeletonText } from '../../components/skeletons';

/** Página "Sobre mí" (ref. ideas/Sobre mi.jpg — "Mary Kvitkova"). Todo el contenido es editable en el panel. */
@Component({
  selector: 'app-about',
  imports: [RouterLink, Photo, Btn, Icon, Reveal, SectionTitle, CtaBand, SkeletonText],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  protected readonly settings = inject(SettingsStore);
  protected readonly about = computed(() => this.settings.settings()?.about ?? null);
  /** Hasta 3 fotos: hero, y las dos del collage. Sin fotos → provisional. */
  protected readonly images = computed(() => {
    const list = this.about()?.images ?? [];
    return [list[0] ?? null, list[1] ?? null, list[2] ?? null];
  });

  constructor() {
    const seo = inject(SeoService);
    this.settings.load().subscribe((s) => {
      if (!s) return;
      seo.setPage({
        title: `Sobre mí — ${s.about.name} | ${s.brand.studioName}`,
        description: s.about.intro ?? s.seo.defaultDescription,
        image: s.about.images[0]?.url ?? null,
        path: '/about',
        type: 'article',
      });
    });
  }
}
