export interface TypewriterOptions {
  speed?: number;
  delay?: number;
  cursor?: boolean;
  onComplete?: () => void;
}

export class Typewriter {
  private element: HTMLElement;
  private text: string;
  private speed: number;
  private delay: number;
  private cursor: boolean;
  private onComplete?: () => void;
  private currentIndex: number = 0;
  private timeoutId: number | null = null;
  private isTyping: boolean = false;
  private cursorElement: HTMLElement | null = null;

  constructor(element: HTMLElement, options: TypewriterOptions = {}) {
    this.element = element;
    this.text = element.textContent || '';
    this.speed = options.speed ?? 50;
    this.delay = options.delay ?? 0;
    this.cursor = options.cursor ?? true;
    this.onComplete = options.onComplete;

    // Store original text and clear element
    this.element.textContent = '';
  }

  public start(): void {
    if (this.isTyping) return;

    this.isTyping = true;
    this.currentIndex = 0;

    // Add cursor if enabled
    if (this.cursor) {
      this.cursorElement = document.createElement('span');
      this.cursorElement.className = 'typewriter-cursor';
      this.cursorElement.textContent = '|';
      this.element.appendChild(this.cursorElement);
    }

    // Start typing after delay
    this.timeoutId = window.setTimeout(() => {
      this.type();
    }, this.delay);
  }

  private type(): void {
    if (this.currentIndex < this.text.length) {
      const char = this.text.charAt(this.currentIndex);

      // Insert character before cursor
      if (this.cursorElement && this.cursorElement.parentNode) {
        const textNode = document.createTextNode(char);
        this.element.insertBefore(textNode, this.cursorElement);
      } else {
        this.element.textContent += char;
      }

      this.currentIndex++;
      this.timeoutId = window.setTimeout(() => this.type(), this.speed);
    } else {
      // Typing complete
      this.isTyping = false;

      // Remove cursor after completion
      if (this.cursorElement) {
        setTimeout(() => {
          if (this.cursorElement && this.cursorElement.parentNode) {
            this.cursorElement.remove();
          }
        }, 500);
      }

      if (this.onComplete) {
        this.onComplete();
      }
    }
  }

  public reset(): void {
    if (this.timeoutId !== null) {
      clearTimeout(this.timeoutId);
      this.timeoutId = null;
    }

    this.isTyping = false;
    this.currentIndex = 0;
    this.element.textContent = '';

    if (this.cursorElement && this.cursorElement.parentNode) {
      this.cursorElement.remove();
      this.cursorElement = null;
    }
  }

  public dispose(): void {
    this.reset();
    this.element.textContent = this.text;
  }
}
