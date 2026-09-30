import { Component, ElementRef, OnDestroy, afterNextRender, computed, inject, input } from '@angular/core';
import { PROJECTS } from '../../data/portfolio.data';
import { About } from '../../sections/about/about';
import { Certifications } from '../../sections/certifications/certifications';
import { Contact } from '../../sections/contact/contact';
import { Experience } from '../../sections/experience/experience';
import { Hero } from '../../sections/hero/hero';
import { ProjectDetail } from '../../sections/project-detail/project-detail';
import { Projects } from '../../sections/projects/projects';
import { TechStack } from '../../sections/tech-stack/tech-stack';
import { ActiveSectionService } from '../../shared/active-section.service';

/** Sections without their own nav item highlight the closest one. */
const NAV_ALIASES: Record<string, string> = { certifications: 'experience' };

@Component({
  selector: 'app-home',
  imports: [Hero, About, Projects, TechStack, Experience, Certifications, Contact, ProjectDetail],
  templateUrl: './home.html'
})
export class Home implements OnDestroy {
  /** Bound from the `?project=<slug>` query param (withComponentInputBinding). */
  readonly project = input<string>();

  protected readonly activeProject = computed(() => PROJECTS.find(p => p.slug === this.project()) ?? null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly activeSection = inject(ActiveSectionService);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      // Scroll-spy: the section crossing the middle of the viewport is "active".
      this.observer = new IntersectionObserver(
        entries => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              const id = entry.target.id;
              this.activeSection.active.set(NAV_ALIASES[id] ?? id);
            }
          }
        },
        { rootMargin: '-45% 0px -50% 0px' }
      );
      this.host.nativeElement.querySelectorAll('section[id]').forEach(s => this.observer!.observe(s));
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
