import { Component, input, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ChatLink, ChatMessage as ChatMessageModel } from './engine/chat-types';

/** One chat bubble. Assistant replies can carry a list and navigation links. */
@Component({
  selector: 'app-chat-message',
  imports: [RouterLink, NgTemplateOutlet],
  template: `
    @let m = message();
    <div class="msg" [class.msg--user]="m.role === 'user'">
      @if (m.role === 'assistant') {
        <span class="msg__avatar" aria-hidden="true">JC</span>
      }
      <div class="msg__bubble">
        <span class="visually-hidden">{{ m.role === 'user' ? 'You said:' : 'Assistant:' }}</span>
        <p class="msg__text">{{ m.text }}</p>

        @if (m.bullets?.length) {
          <ul class="msg__list">
            @for (b of m.bullets; track $index) {
              <li>
                {{ b.text }}
                @if (b.link) {
                  <ng-container [ngTemplateOutlet]="linkTpl" [ngTemplateOutletContext]="{ $implicit: b.link, inline: true }" />
                }
              </li>
            }
          </ul>
        }

        @if (m.links?.length) {
          <div class="msg__links">
            @for (l of m.links; track l.label) {
              <ng-container [ngTemplateOutlet]="linkTpl" [ngTemplateOutletContext]="{ $implicit: l, inline: false }" />
            }
          </div>
        }
      </div>
    </div>

    <ng-template #linkTpl let-link let-inline="inline">
      @switch (link.kind) {
        @case ('project') {
          <a class="chip-link" [class.chip-link--inline]="inline" routerLink="/" [queryParams]="{ project: link.slug }" (click)="navigate.emit()">
            {{ link.label }} <i class="fa-solid fa-arrow-right" aria-hidden="true"></i>
          </a>
        }
        @case ('section') {
          <a class="chip-link" [class.chip-link--inline]="inline" routerLink="/" [fragment]="link.section" (click)="navigate.emit()">
            {{ link.label }} <i class="fa-solid fa-arrow-down" aria-hidden="true"></i>
          </a>
        }
        @default {
          <a
            class="chip-link"
            [class.chip-link--inline]="inline"
            [href]="link.href"
            [attr.download]="link.download ? '' : null"
            [attr.target]="isNewTab(link) ? '_blank' : null"
            [attr.rel]="isNewTab(link) ? 'noopener noreferrer' : null"
          >
            @if (link.icon) {
              <i [class]="link.icon" aria-hidden="true"></i>
            }
            {{ link.label }}
            @if (isNewTab(link)) {
              <span class="visually-hidden">(opens in a new tab)</span>
            }
          </a>
        }
      }
    </ng-template>
  `,
  styles: `
    .msg {
      display: flex;
      gap: 10px;
      align-items: flex-start;
      animation: msg-in 0.28s var(--ease-out) both;
    }
    .msg--user {
      justify-content: flex-end;
    }
    .msg__avatar {
      flex: none;
      display: grid;
      place-items: center;
      width: 28px;
      height: 28px;
      margin-top: 2px;
      border-radius: 9px;
      background: var(--gradient-accent);
      color: #fff;
      font-size: 0.66rem;
      font-weight: 700;
    }
    .msg__bubble {
      max-width: 86%;
      padding: 10px 13px;
      border-radius: 14px 14px 14px 4px;
      border: 1px solid var(--border);
      background: rgba(255, 255, 255, 0.035);
      font-size: 0.88rem;
      line-height: 1.55;
      overflow-wrap: anywhere;
    }
    .msg--user .msg__bubble {
      border-radius: 14px 14px 4px 14px;
      border-color: transparent;
      background: var(--accent);
      color: #fff;
    }
    .msg__text {
      color: inherit;
    }
    .msg__list {
      display: grid;
      gap: 6px;
      margin: 8px 0 0;
      padding-left: 16px;
      color: var(--text-muted);
    }
    .msg__list li::marker {
      color: var(--accent-strong);
    }
    .msg__links {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 10px;
    }
    .chip-link {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 5px 10px;
      border-radius: 999px;
      border: 1px solid var(--border-strong);
      background: rgba(112, 102, 255, 0.1);
      color: var(--text);
      font-size: 0.76rem;
      font-weight: 550;
      line-height: 1.3;
      transition: background-color 0.2s ease, border-color 0.2s ease;
    }
    .chip-link:hover {
      background: rgba(112, 102, 255, 0.24);
      border-color: rgba(148, 163, 255, 0.45);
    }
    .chip-link i {
      font-size: 0.72em;
      color: var(--accent-strong);
    }
    .chip-link--inline {
      margin: 4px 0 0;
      display: flex;
      width: fit-content;
    }
    @keyframes msg-in {
      from {
        opacity: 0;
        transform: translate3d(0, 6px, 0);
      }
    }
  `
})
export class ChatMessage {
  readonly message = input.required<ChatMessageModel>();
  readonly navigate = output<void>();

  protected isNewTab(link: ChatLink): boolean {
    return link.kind === 'external' && link.href.startsWith('http');
  }
}
