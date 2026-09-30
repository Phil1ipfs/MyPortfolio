import { Component, ElementRef, afterRenderEffect, computed, effect, inject, input, output, signal, viewChild } from '@angular/core';
import { ChatInput } from './chat-input';
import { ChatMessage } from './chat-message';
import { SuggestedQuestions } from './suggested-questions';
import { CHAT_ENGINE } from './engine/chat-engine.token';
import { ChatMessage as ChatMessageModel } from './engine/chat-types';
import { SUGGESTED_QUESTIONS } from './engine/rule-based-engine';

/** Minimum time the typing indicator shows, so instant answers don't feel jumpy. */
const MIN_TYPING_MS = 450;

@Component({
  selector: 'app-chatbot-panel',
  imports: [ChatMessage, ChatInput, SuggestedQuestions],
  templateUrl: './chatbot-panel.html',
  styleUrl: './chatbot-panel.css',
  host: {
    '[class.is-open]': 'open()',
    '[attr.inert]': 'open() ? null : ""',
    '(keydown.escape)': 'onEscape($event)'
  }
})
export class ChatbotPanel {
  readonly open = input(false);
  readonly closed = output<void>();
  readonly navigated = output<void>();

  private readonly engine = inject(CHAT_ENGINE);
  private nextId = 1;

  protected readonly messages = signal<ChatMessageModel[]>([
    {
      id: 0,
      role: 'assistant',
      text: "Hi! I'm Phillip's portfolio assistant. Ask me about his projects, skills, experience, education, certifications — or how to get in touch."
    }
  ]);
  protected readonly loading = signal(false);

  /** Starter questions before the first question; afterwards, the last reply's follow-ups. */
  protected readonly suggestions = computed(() => {
    const list = this.messages();
    const last = list[list.length - 1];
    if (!list.some(m => m.role === 'user')) return SUGGESTED_QUESTIONS;
    return last.role === 'assistant' ? last.suggestions ?? [] : [];
  });
  protected readonly hasAsked = computed(() => this.messages().some(m => m.role === 'user'));

  private readonly scroller = viewChild.required<ElementRef<HTMLElement>>('scroller');
  private readonly composer = viewChild.required(ChatInput);

  constructor() {
    // Focus the input whenever the panel opens.
    effect(() => {
      if (this.open()) setTimeout(() => this.composer().focus(), 60);
    });

    // Keep the conversation in view: follow the typing indicator, then show
    // each new answer from its first line (long answers shouldn't open mid-way).
    afterRenderEffect(() => {
      const list = this.messages();
      const loading = this.loading();
      const el = this.scroller().nativeElement;
      const bubbles = el.querySelectorAll('app-chat-message');
      const last = bubbles[bubbles.length - 1] as HTMLElement | undefined;

      if (!loading && last && list.length > 1 && list[list.length - 1].role === 'assistant') {
        el.scrollTop += last.getBoundingClientRect().top - el.getBoundingClientRect().top - 12;
      } else {
        el.scrollTop = el.scrollHeight;
      }
    });
  }

  protected async ask(question: string): Promise<void> {
    const text = question.trim();
    if (!text || this.loading()) return;

    const history = this.messages();
    this.messages.update(list => [...list, { id: this.nextId++, role: 'user', text }]);
    this.loading.set(true);

    try {
      const [reply] = await Promise.all([
        this.engine.reply(text, history),
        new Promise(resolve => setTimeout(resolve, MIN_TYPING_MS))
      ]);
      this.messages.update(list => [...list, { id: this.nextId++, role: 'assistant', ...reply }]);
    } catch {
      this.messages.update(list => [
        ...list,
        {
          id: this.nextId++,
          role: 'assistant',
          text: "Sorry — I couldn't answer that just now. You can still browse the portfolio or contact Phillip directly."
        }
      ]);
    } finally {
      this.loading.set(false);
    }
  }

  protected onEscape(event: Event): void {
    // Don't let Escape also close the case study or mobile menu underneath.
    event.stopPropagation();
    this.closed.emit();
  }
}
