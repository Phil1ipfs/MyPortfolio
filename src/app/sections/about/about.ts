import { Component, ElementRef, OnDestroy, afterNextRender, viewChild } from '@angular/core';
import { CERTIFICATIONS, EDUCATION, EXPERIENCE, PROFILE, PROJECTS, TECH_STACK } from '../../data/portfolio.data';
import { ProfileCardTilt } from '../../profile-card-tilt';
import { RevealDirective } from '../../shared/reveal.directive';
import { SectionHeader } from '../../shared/section-header';
import { canHover, prefersReducedMotion } from '../../shared/motion';

@Component({
  selector: 'app-about',
  imports: [SectionHeader, RevealDirective],
  templateUrl: './about.html',
  styleUrl: './about.css'
})
export class About implements OnDestroy {
  protected readonly profile = PROFILE;
  protected readonly education = EDUCATION;
  protected readonly latestRole = EXPERIENCE[0];

  /** Each attribute is backed by a specific CV entry. */
  protected readonly strengths = [
    {
      icon: 'fa-solid fa-laptop-code',
      title: 'Development experience',
      text: `${EXPERIENCE[0].role} at ${EXPERIENCE[0].org}, plus mobile and web projects from Flutter apps to MERN and PHP systems.`
    },
    {
      icon: 'fa-solid fa-puzzle-piece',
      title: 'Problem solving',
      text: 'Hackathon experience, including 2nd place at the NU Manila Ideathon, Hackercup and InnOlympics.'
    },
    {
      icon: 'fa-solid fa-people-group',
      title: 'Teamwork',
      text: 'Strong communicator and leader — officer and committee roles in AWS Learning Club and Google Developer Group NU.'
    },
    {
      icon: 'fa-solid fa-book-open',
      title: 'Continuous learning',
      text: `${CERTIFICATIONS.length} certifications and courses, most recently in REST APIs, React, databases and security.`
    }
  ];

  /** Counts derived from the content data — not hand-typed numbers. */
  protected readonly stats = [
    { value: PROJECTS.length, label: 'Projects built & designed' },
    { value: TECH_STACK.reduce((n, c) => n + c.items.length, 0), label: 'Technologies in my stack' },
    { value: CERTIFICATIONS.length, label: 'Certifications & courses' }
  ];

  private readonly card = viewChild.required<ElementRef<HTMLElement>>('card');
  private tilt?: ProfileCardTilt;

  constructor() {
    afterNextRender(() => {
      // Reuse the existing tilt effect — gentler than before and only for mouse users.
      if (canHover() && !prefersReducedMotion()) {
        this.tilt = new ProfileCardTilt(this.card().nativeElement, { maxTilt: 6 });
      }
    });
  }

  ngOnDestroy(): void {
    this.tilt?.dispose();
  }
}
