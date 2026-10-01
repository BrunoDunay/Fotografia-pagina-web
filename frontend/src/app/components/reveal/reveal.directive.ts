import { DestroyRef, Directive, ElementRef, afterNextRender, inject, input } from '@angular/core';

/**
 * Aparición sutil al hacer scroll.
 * Solo actúa en el navegador y solo sobre elementos fuera de la vista inicial,
 * así el contenido renderizado en SSR nunca parpadea ni queda oculto sin JavaScript.
 */
@Directive({ selector: '[appReveal]' })
export class Reveal {
  /** Retraso en ms para escalonar elementos de una misma fila. */
  readonly revealDelay = input(0);

  constructor() {
    const el = inject(ElementRef<HTMLElement>).nativeElement as HTMLElement;
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      if (el.getBoundingClientRect().top < window.innerHeight) return;

      el.classList.add('reveal');
      el.style.transitionDelay = `${this.revealDelay()}ms`;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          el.classList.add('is-visible');
          observer.disconnect();
        },
        { rootMargin: '0px 0px -10% 0px' },
      );
      observer.observe(el);
      destroyRef.onDestroy(() => observer.disconnect());
    });
  }
}
