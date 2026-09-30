import { Component, computed, signal } from '@angular/core';
import { PROJECTS, PROJECT_FILTERS, ProjectCategory } from '../../data/portfolio.data';
import { ProjectCard } from '../../shared/project-card/project-card';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';

type Filter = 'All' | ProjectCategory;

@Component({
  selector: 'app-projects',
  imports: [SectionHeader, ProjectCard, RevealDirective],
  templateUrl: './projects.html',
  styleUrl: './projects.css'
})
export class Projects {
  protected readonly filters = PROJECT_FILTERS;

  /** Featured order follows the brief: Literexia, Bulldog Exchange, Pinkventory. */
  protected readonly lead = PROJECTS.find(p => p.slug === 'literexia')!;
  protected readonly featured = PROJECTS.filter(p => p.featured && p !== this.lead);
  /** Older portfolio projects, promoted into the main block below the featured ones. */
  protected readonly showcase = PROJECTS.filter(p => p.showcase);
  private readonly others = PROJECTS.filter(p => !p.featured && !p.showcase);

  protected readonly filter = signal<Filter>('All');
  protected readonly filtered = computed(() => {
    const f = this.filter();
    return f === 'All' ? this.others : this.others.filter(p => p.categories.includes(f));
  });

  protected countFor(filter: Filter): number {
    return filter === 'All' ? this.others.length : this.others.filter(p => p.categories.includes(filter)).length;
  }
}
