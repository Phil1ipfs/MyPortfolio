import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Project } from '../../data/portfolio.data';

/**
 * Project card used by both the featured row and the filterable grid.
 * Has its own cursor spotlight (the glow that follows the mouse inside the card).
 */
@Component({
  selector: 'app-project-card',
  imports: [RouterLink],
  templateUrl: './project-card.html',
  styleUrl: './project-card.css',
  host: {
    '[class.is-featured]': 'variant() === "featured"',
    '[class.is-wide]': 'variant() === "wide"',
    '[style.--accent-card]': 'project().accent',
    '(pointermove)': 'onPointerMove($event)'
  }
})
export class ProjectCard {
  readonly project = input.required<Project>();
  readonly variant = input<'default' | 'featured' | 'wide'>('default');

  protected readonly ctaLabel = computed(() => (this.project().caseStudy ? 'Read case study' : 'View project'));
  protected readonly visibleTech = computed(() => this.project().technologies.slice(0, this.variant() === 'default' ? 4 : 6));
  protected readonly hiddenTechCount = computed(() => this.project().technologies.length - this.visibleTech().length);

  /** Moves the cursor spotlight inside this card. */
  protected onPointerMove(event: PointerEvent): void {
    if (event.pointerType !== 'mouse') return;
    const el = event.currentTarget as HTMLElement;
    const rect = el.getBoundingClientRect();
    el.style.setProperty('--mouse-x', `${event.clientX - rect.left}px`);
    el.style.setProperty('--mouse-y', `${event.clientY - rect.top}px`);
  }
}
