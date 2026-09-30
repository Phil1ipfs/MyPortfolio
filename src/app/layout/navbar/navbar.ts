import { Component, ElementRef, effect, inject, signal, viewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_ITEMS, PROFILE } from '../../data/portfolio.data';
import { ActiveSectionService } from '../../shared/active-section.service';

/**
 * Single top navigation. Merges the previous sticky nav, bottom nav and mobile
 * sidebar; the sidebar lives on as the mobile drawer below 900px.
 */
@Component({
  selector: 'app-navbar',
  imports: [RouterLink],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  host: {
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'closeMenu(true)'
  }
})
export class Navbar {
  protected readonly items = NAV_ITEMS;
  protected readonly profile = PROFILE;
  protected readonly active = inject(ActiveSectionService).active;

  protected readonly scrolled = signal(false);
  protected readonly menuOpen = signal(false);

  private readonly toggle = viewChild.required<ElementRef<HTMLButtonElement>>('toggle');
  private readonly drawer = viewChild.required<ElementRef<HTMLElement>>('drawer');

  constructor() {
    this.onScroll();

    effect(() => {
      const open = this.menuOpen();
      document.documentElement.classList.toggle('is-scroll-locked', open);
      if (open) {
        queueMicrotask(() => this.drawer().nativeElement.querySelector<HTMLElement>('a')?.focus());
      }
    });
  }

  protected onScroll(): void {
    const scrolled = window.scrollY > 8;
    if (scrolled !== this.scrolled()) this.scrolled.set(scrolled);
  }

  protected toggleMenu(): void {
    this.menuOpen.update(open => !open);
  }

  closeMenu(restoreFocus = false): void {
    if (!this.menuOpen()) return;
    this.menuOpen.set(false);
    if (restoreFocus) this.toggle().nativeElement.focus();
  }
}
