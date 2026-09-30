/** A link the assistant can attach to an answer. Rendered as a chip. */
export type ChatLink =
  | { kind: 'project'; label: string; slug: string }
  | { kind: 'section'; label: string; section: string }
  | { kind: 'external'; label: string; href: string; icon?: string; download?: boolean };

export interface ChatBullet {
  text: string;
  link?: ChatLink;
}

/** Structured answer, so the UI can render lists and navigation links. */
export interface ChatReply {
  text: string;
  bullets?: ChatBullet[];
  links?: ChatLink[];
  /** Follow-up questions to offer as chips. */
  suggestions?: string[];
}

export interface ChatMessage extends Partial<ChatReply> {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

/**
 * Anything that can answer a question. Today: RuleBasedChatEngine (in-browser).
 * Later: an engine that POSTs to a serverless /api/chat endpoint that holds the
 * LLM API key — the UI does not need to change.
 */
export interface ChatEngine {
  reply(question: string, history: readonly ChatMessage[]): Promise<ChatReply>;
}
