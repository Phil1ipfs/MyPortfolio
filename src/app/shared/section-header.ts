import { Component, input } from '@angular/core';
import { RevealDirective } from './reveal.directive';

/** Eyebrow + title + optional lead paragraph used at the top of every section. */
@Component({
  selector: 'app-section-header',
  imports: [RevealDirective],
  template: `
    <header class="section-header" [class.section-header--center]="align() === 'center'" appReveal>
      <p class="eyebrow">{{ eyebrow() }}</p>
      <h2 [id]="headingId()">{{ title() }}</h2>
      @if (lead()) {
        <p class="section-header__lead">{{ lead() }}</p>
      }
    </header>
  `,
  styles: `
    .section-header {
      display: grid;
      gap: 14px;
      max-width: 640px;
      margin-bottom: clamp(36px, 5vw, 56px);
    }
    .section-header--center {
      margin-inline: auto;
      text-align: center;
      justify-items: center;
    }
    h2 {
      font-size: clamp(1.9rem, 1.2rem + 2.4vw, 2.75rem);
    }
    .section-header__lead {
      color: var(--text-muted);
      font-size: 1.02rem;
    }
  `
})
export class SectionHeader {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly headingId = input.required<string>();
  readonly lead = input<string>();
  readonly align = input<'start' | 'center'>('start');
}
