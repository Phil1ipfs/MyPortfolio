import { Component, signal, viewChild } from '@angular/core';
import { ChatbotButton } from './chatbot-button';
import { ChatbotPanel } from './chatbot-panel';

/**
 * Portfolio Assistant entry point. Only the launcher button ships in the main
 * bundle; the panel, knowledge base and answer engine are a lazy chunk that is
 * prefetched when the browser is idle and rendered on first open.
 */
@Component({
  selector: 'app-chatbot',
  imports: [ChatbotButton, ChatbotPanel],
  template: `
    <app-chatbot-button [open]="open()" [class.is-hidden-mobile]="open()" (toggle)="toggle()" />

    @defer (when activated(); prefetch on idle) {
      <app-chatbot-panel [open]="open()" (closed)="close(true)" (navigated)="onNavigate()" />
    }
  `,
  styles: `
    /* On phones the open panel covers the launcher and has its own close button. */
    @media (max-width: 560px) {
      app-chatbot-button.is-hidden-mobile {
        display: none;
      }
    }
  `
})
export class Chatbot {
  protected readonly open = signal(false);
  /** Stays true after the first open so the panel (and the conversation) is kept. */
  protected readonly activated = signal(false);

  private readonly button = viewChild.required(ChatbotButton);

  protected toggle(): void {
    if (this.open()) {
      this.close(true);
    } else {
      this.activated.set(true);
      this.open.set(true);
    }
  }

  protected close(restoreFocus: boolean): void {
    this.open.set(false);
    if (restoreFocus) queueMicrotask(() => this.button().focus());
  }

  /** A chat link was followed: on small screens get the panel out of the way. */
  protected onNavigate(): void {
    if (window.matchMedia('(max-width: 560px)').matches) this.close(false);
  }
}
