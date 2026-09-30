import { Component, ElementRef, OnDestroy, OnInit, computed, effect, inject, input, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { GalleryImage, PROFILE, PROJECTS, Project } from '../../data/portfolio.data';
import { CertViewerService } from '../../shared/cert-viewer';

/**
 * Case-study view for any project. Opened via `/?project=<slug>` so links are
 * shareable and refresh-safe without changing the hosting config. Sections
 * render only when the project has data for them.
 */
@Component({
  selector: 'app-project-detail',
  imports: [RouterLink],
  templateUrl: './project-detail.html',
  styleUrl: './project-detail.css',
  host: {
    '(document:keydown.escape)': 'onEscape()'
  }
})
export class ProjectDetail implements OnInit, OnDestroy {
  readonly project = input.required<Project>();

  protected readonly profile = PROFILE;
  protected readonly cs = computed(() => this.project().caseStudy);

  protected readonly next = computed(() => {
    const i = PROJECTS.indexOf(this.project());
    return PROJECTS[(i + 1) % PROJECTS.length];
  });
  protected readonly position = computed(() => PROJECTS.indexOf(this.project()) + 1);
  protected readonly total = PROJECTS.length;

  /** Images for the Preview gallery (the cover is already shown in the header). */
  protected readonly screenshots = computed<GalleryImage[]>(() => this.project().gallery ?? []);

  private readonly viewer = inject(CertViewerService);

  private readonly router = inject(Router);
  private readonly panel = viewChild.required<ElementRef<HTMLElement>>('panel');
  private readonly heading = viewChild.required<ElementRef<HTMLElement>>('heading');
  private returnFocus: HTMLElement | null = null;

  constructor() {
    // Moving between projects: reset scroll and focus the new title.
    effect(() => {
      this.project();
      const panel = this.panel().nativeElement;
      panel.scrollTop = 0;
      queueMicrotask(() => this.heading().nativeElement.focus({ preventScroll: true }));
    });
  }

  ngOnInit(): void {
    this.returnFocus = document.activeElement as HTMLElement | null;
    document.documentElement.classList.add('is-scroll-locked');
  }

  ngOnDestroy(): void {
    document.documentElement.classList.remove('is-scroll-locked');
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
  }

  protected openScreenshot(index: number): void {
    const shot = this.screenshots()[index];
    this.viewer.open(shot.src, `${this.project().name} — ${shot.caption} (${index + 1} of ${this.screenshots().length})`);
  }

  /** Escape closes the case study, unless the screenshot viewer is open (it closes itself). */
  protected onEscape(): void {
    if (this.viewer.current()) return;
    this.close();
  }

  close(): void {
    this.router.navigate(['/']);
  }
}
