import { InjectionToken } from '@angular/core';
import { ChatEngine } from './chat-types';
import { RuleBasedChatEngine } from './rule-based-engine';

/** Swap the factory to change how the assistant answers (e.g. a remote LLM engine). */
export const CHAT_ENGINE = new InjectionToken<ChatEngine>('CHAT_ENGINE', {
  providedIn: 'root',
  factory: () => new RuleBasedChatEngine()
});
