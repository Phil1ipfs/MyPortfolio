import { Component, ElementRef, computed, input, output, signal, viewChild } from '@angular/core';

/** Message box + send button. Enter sends. */
@Component({
  selector: 'app-chat-input',
  template: `
    <form class="composer" (submit)="submit($event)">
      <label class="visually-hidden" for="chatbot-input">Ask about Phillip</label>
      <input
        #field
        id="chatbot-input"
        type="text"
        autocomplete="off"
        maxlength="300"
        placeholder="Ask about Phillip's work…"
        [value]="value()"
        (input)="value.set(field.value)"
      />
      <button type="submit" class="composer__send" [disabled]="!canSend()" aria-label="Send message">
        <i class="fa-solid fa-paper-plane" aria-hidden="true"></i>
      </button>
    </form>
  `,
  styles: `
    .composer {
      display: flex;
      gap: 8px;
      padding: 12px;
      border-top: 1px solid var(--border);
    }
    input {
      flex: 1;
      min-width: 0;
      height: 42px;
      padding: 0 14px;
      border-radius: 12px;
      border: 1px solid var(--border-strong);
      background: rgba(4, 6, 14, 0.7);
      color: var(--text);
      /* 16px keeps iOS Safari from zooming on focus. */
      font-size: 16px;
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
    }
    input::placeholder {
      color: var(--text-dim);
    }
    input:focus {
      outline: none;
      border-color: var(--accent-strong);
      box-shadow: 0 0 0 3px rgba(112, 102, 255, 0.2);
    }
    .composer__send {
      flex: none;
      display: grid;
      place-items: center;
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--accent);
      color: #fff;
      transition: background-color 0.2s ease, opacity 0.2s ease;
    }
    .composer__send:hover:not(:disabled) {
      background: var(--accent-strong);
    }
    .composer__send:disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
    @media (min-width: 561px) {
      input {
        font-size: 0.9rem;
      }
    }
  `
})
export class ChatInput {
  /** While an answer is loading the user can keep typing but not send. */
  readonly busy = input(false);
  readonly send = output<string>();

  protected readonly value = signal('');
  protected readonly canSend = computed(() => !this.busy() && this.value().trim().length > 0);

  private readonly field = viewChild.required<ElementRef<HTMLInputElement>>('field');

  focus(): void {
    this.field().nativeElement.focus();
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (!this.canSend()) return;
    this.send.emit(this.value().trim());
    this.value.set('');
    this.field().nativeElement.value = '';
  }
}
