import { Component, ElementRef, input, output, viewChild } from '@angular/core';

/** Floating launcher in the bottom-right corner. */
@Component({
  selector: 'app-chatbot-button',
  template: `
    <button
      #button
      type="button"
      class="fab"
      [class.is-open]="open()"
      [attr.aria-expanded]="open()"
      aria-controls="chatbot-panel"
      [attr.aria-label]="open() ? 'Close portfolio assistant' : 'Open portfolio assistant — ask about Phillip'"
      (click)="toggle.emit()"
    >
      <span class="fab__icon" aria-hidden="true">
        <i class="fa-solid fa-comment-dots fab__chat"></i>
        <i class="fa-solid fa-xmark fab__close"></i>
      </span>
      <span class="fab__label" aria-hidden="true">Ask about Phillip</span>
    </button>
  `,
  styles: `
    :host {
      position: fixed;
      right: 24px;
      bottom: 24px;
      z-index: 110;
    }
    .fab {
      position: relative;
      display: grid;
      place-items: center;
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 1px solid rgba(255, 255, 255, 0.14);
      background: var(--gradient-accent);
      color: #fff;
      box-shadow: 0 12px 32px -10px var(--accent-glow), 0 0 0 6px rgba(112, 102, 255, 0.08);
      transition: transform 0.25s var(--ease-out), box-shadow 0.25s ease;
    }
    .fab:hover {
      transform: translateY(-2px);
      box-shadow: 0 16px 40px -10px var(--accent-glow), 0 0 0 8px rgba(112, 102, 255, 0.1);
    }
    .fab:focus-visible {
      outline: 2px solid #fff;
      outline-offset: 4px;
      border-radius: 50%;
    }
    .fab__icon {
      position: relative;
      width: 22px;
      height: 22px;
      font-size: 1.25rem;
    }
    .fab__icon i {
      position: absolute;
      inset: 0;
      display: grid;
      place-items: center;
      transition: opacity 0.2s ease, transform 0.25s var(--ease-out);
    }
    .fab__close {
      opacity: 0;
      transform: rotate(-90deg);
    }
    .fab.is-open .fab__chat {
      opacity: 0;
      transform: rotate(90deg);
    }
    .fab.is-open .fab__close {
      opacity: 1;
      transform: none;
    }
    /* Hover hint on desktop only. */
    .fab__label {
      position: absolute;
      right: calc(100% + 12px);
      padding: 7px 12px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: rgba(10, 14, 30, 0.92);
      color: var(--text);
      font-size: 0.8rem;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(6px);
      pointer-events: none;
      transition: opacity 0.2s ease, transform 0.2s var(--ease-out);
    }
    @media (hover: hover) {
      .fab:not(.is-open):hover .fab__label,
      .fab:not(.is-open):focus-visible .fab__label {
        opacity: 1;
        transform: none;
      }
    }
    @media (max-width: 560px) {
      :host {
        right: 16px;
        bottom: 16px;
      }
      .fab {
        width: 52px;
        height: 52px;
      }
    }
  `
})
export class ChatbotButton {
  readonly open = input(false);
  readonly toggle = output<void>();

  private readonly button = viewChild.required<ElementRef<HTMLButtonElement>>('button');

  focus(): void {
    this.button().nativeElement.focus();
  }
}
