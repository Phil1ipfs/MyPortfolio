import { Component, ElementRef, Injectable, effect, inject, signal, viewChild } from '@angular/core';

export interface CertView { src: string; caption: string; }

/** Opens a certificate image in the shared viewer from anywhere on the page. */
@Injectable({ providedIn: 'root' })
export class CertViewerService {
  readonly current = signal<CertView | null>(null);

  open(src: string, caption: string): void {
    this.current.set({ src, caption });
  }

  close(): void {
    this.current.set(null);
  }
}

/**
 * Certificate modal. Replaces the previous getElementById-driven modal with a
 * native <dialog>, which provides focus trapping, Escape-to-close and a backdrop.
 */
@Component({
  selector: 'app-cert-viewer',
  template: `
    <dialog #dialog class="cert-dialog" aria-labelledby="cert-dialog-caption" (close)="viewer.close()" (click)="onBackdropClick($event)">
      @if (viewer.current(); as cert) {
        <figure class="cert-dialog__figure">
          <img [src]="cert.src" [alt]="cert.caption" decoding="async" />
          <figcaption id="cert-dialog-caption">{{ cert.caption }}</figcaption>
        </figure>
        <button type="button" class="cert-dialog__close" (click)="dialog.close()" aria-label="Close certificate">
          <i class="fa-solid fa-xmark" aria-hidden="true"></i>
        </button>
      }
    </dialog>
  `,
  styles: `
    .cert-dialog {
      margin: auto;
      width: min(1000px, calc(100vw - 32px));
      max-height: calc(100vh - 48px);
      padding: 0;
      border: 1px solid var(--border-strong);
      border-radius: var(--radius-lg);
      background: var(--bg-elevated);
      color: var(--text);
      overflow: visible;
    }
    .cert-dialog[open] {
      animation: cert-in 0.25s var(--ease-out);
    }
    .cert-dialog::backdrop {
      background: rgba(3, 5, 12, 0.78);
      backdrop-filter: blur(6px);
    }
    .cert-dialog__figure {
      display: grid;
      gap: 12px;
      padding: 14px 14px 16px;
    }
    img {
      width: 100%;
      max-height: calc(100vh - 140px);
      object-fit: contain;
      border-radius: 10px;
      background: #fff;
    }
    figcaption {
      color: var(--text-muted);
      font-size: 0.9rem;
      text-align: center;
    }
    .cert-dialog__close {
      position: absolute;
      top: -14px;
      right: -14px;
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 1px solid var(--border-strong);
      background: var(--surface-strong);
      display: grid;
      place-items: center;
    }
    .cert-dialog__close:hover {
      background: var(--accent);
    }
    @media (max-width: 600px) {
      .cert-dialog__close {
        top: 8px;
        right: 8px;
      }
    }
    @keyframes cert-in {
      from { opacity: 0; transform: translateY(8px) scale(0.98); }
    }
  `
})
export class CertViewer {
  protected readonly viewer = inject(CertViewerService);
  private readonly dialog = viewChild.required<ElementRef<HTMLDialogElement>>('dialog');

  constructor() {
    effect(() => {
      const dialog = this.dialog().nativeElement;
      if (this.viewer.current() && !dialog.open) {
        dialog.showModal();
      } else if (!this.viewer.current() && dialog.open) {
        dialog.close();
      }
    });
  }

  protected onBackdropClick(event: MouseEvent): void {
    // Clicks on the <dialog> element itself (not its children) land on the backdrop.
    if (event.target === this.dialog().nativeElement) {
      this.dialog().nativeElement.close();
    }
  }
}
