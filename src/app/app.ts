import { Component, ElementRef, OnDestroy, afterNextRender, inject, viewChild } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import type { LiquidEtherFull } from './liquid-ether-full';
import { PROFILE } from './data/portfolio.data';
import { Navbar } from './layout/navbar/navbar';
import { CertViewer } from './shared/cert-viewer';
import { Chatbot } from './chatbot/chatbot';
import { prefersReducedMotion, prefersSaveData } from './shared/motion';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, Navbar, CertViewer, Chatbot],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App implements OnDestroy {
  protected readonly profile = PROFILE;
  protected readonly year = new Date().getFullYear();

  private readonly background = viewChild.required<ElementRef<HTMLElement>>('liquidEther');
  private liquidEther?: LiquidEtherFull;

  constructor() {
    // Anchor links land below the fixed navbar.
    inject(ViewportScroller).setOffset(() => [0, 72]);

    afterNextRender(() => {
      if (prefersReducedMotion() || prefersSaveData()) return;

      // Three.js is ~500 kB — load the liquid background after first paint, off the critical path.
      const start = () =>
        import('./liquid-ether-full').then(({ LiquidEtherFull }) => {
          const isSmall = window.innerWidth < 768;
          this.liquidEther = new LiquidEtherFull(this.background().nativeElement, {
            colors: ['#2a1f8f', '#5b4dff', '#2f6bff'],
            mouseForce: 18,
            cursorSize: 90,
            resolution: isSmall ? 0.25 : 0.4,
            iterationsPoisson: isSmall ? 16 : 24,
            iterationsViscous: 16,
            autoDemo: true,
            autoSpeed: 0.35,
            autoIntensity: 1.6,
            takeoverDuration: 0.25,
            autoResumeDelay: 2500,
            autoRampDuration: 0.8
          });
          this.background().nativeElement.classList.add('is-ready');
        });

      if ('requestIdleCallback' in window) {
        requestIdleCallback(start, { timeout: 2000 });
      } else {
        setTimeout(start, 600);
      }
    });
  }

  protected skipToMain(event: Event): void {
    event.preventDefault();
    document.getElementById('main')?.focus();
  }

  ngOnDestroy(): void {
    this.liquidEther?.dispose();
  }
}
