import { Component, input, output } from '@angular/core';

/** Clickable starter / follow-up questions. */
@Component({
  selector: 'app-suggested-questions',
  template: `
    <div class="suggest" role="group" aria-labelledby="chatbot-suggest-label">
      <p class="suggest__label" id="chatbot-suggest-label">{{ label() }}</p>
      <div class="suggest__list">
        @for (q of questions(); track q) {
          <button type="button" class="suggest__btn" [disabled]="disabled()" (click)="pick.emit(q)">{{ q }}</button>
        }
      </div>
    </div>
  `,
  styles: `
    .suggest {
      display: grid;
      gap: 8px;
      padding-left: 38px;
    }
    .suggest__label {
      font-family: var(--font-mono);
      font-size: 0.68rem;
      letter-spacing: 0.04em;
      color: var(--text-dim);
    }
    .suggest__list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }
    .suggest__btn {
      padding: 6px 11px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: rgba(255, 255, 255, 0.03);
      color: var(--text-muted);
      font-size: 0.78rem;
      text-align: left;
      line-height: 1.35;
      transition: color 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
    }
    .suggest__btn:hover:not(:disabled) {
      color: var(--text);
      border-color: rgba(148, 163, 255, 0.45);
      background: rgba(112, 102, 255, 0.12);
    }
    .suggest__btn:disabled {
      opacity: 0.5;
      cursor: default;
    }
  `
})
export class SuggestedQuestions {
  readonly questions = input.required<readonly string[]>();
  readonly label = input('Try asking');
  readonly disabled = input(false);
  readonly pick = output<string>();
}
