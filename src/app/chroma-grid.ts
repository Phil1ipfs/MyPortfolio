import gsap from 'gsap';

export interface ChromaItem {
  image: string;
  title: string;
  subtitle: string;
  description: string;
  techStack: string[];
  borderColor?: string;
  gradient?: string;
  url?: string;
}

export interface ChromaGridOptions {
  radius?: number;
  columns?: number;
  rows?: number;
  damping?: number;
  fadeOut?: number;
  ease?: string;
}

export class ChromaGrid {
  private container: HTMLElement;
  private fadeOverlay: HTMLElement | null = null;
  private radius: number;
  private columns: number;
  private rows: number;
  private damping: number;
  private fadeOut: number;
  private ease: string;
  private setX: any;
  private setY: any;
  private pos = { x: 0, y: 0 };

  constructor(container: HTMLElement, options: ChromaGridOptions = {}) {
    this.container = container;
    this.radius = options.radius ?? 300;
    this.columns = options.columns ?? 3;
    this.rows = options.rows ?? 2;
    this.damping = options.damping ?? 0.45;
    this.fadeOut = options.fadeOut ?? 0.6;
    this.ease = options.ease ?? 'power3.out';

    this.init();
  }

  private init(): void {
    // Set CSS variables
    this.container.style.setProperty('--r', `${this.radius}px`);
    this.container.style.setProperty('--cols', String(this.columns));
    this.container.style.setProperty('--rows', String(this.rows));

    // Setup GSAP quicksetters
    this.setX = gsap.quickSetter(this.container, '--x', 'px');
    this.setY = gsap.quickSetter(this.container, '--y', 'px');

    // Initialize position to center
    const { width, height } = this.container.getBoundingClientRect();
    this.pos = { x: width / 2, y: height / 2 };
    this.setX(this.pos.x);
    this.setY(this.pos.y);

    // Get fade overlay
    this.fadeOverlay = this.container.querySelector('.chroma-fade');

    // Add event listeners
    this.container.addEventListener('pointermove', (e) => this.handleMove(e));
    this.container.addEventListener('pointerleave', () => this.handleLeave());

    // Add card hover effects
    const cards = this.container.querySelectorAll('.chroma-card');
    cards.forEach((card) => {
      card.addEventListener('mousemove', (e) => this.handleCardMove(e as MouseEvent));
    });
  }

  private moveTo(x: number, y: number): void {
    gsap.to(this.pos, {
      x,
      y,
      duration: this.damping,
      ease: this.ease,
      onUpdate: () => {
        if (this.setX && this.setY) {
          this.setX(this.pos.x);
          this.setY(this.pos.y);
        }
      },
      overwrite: true
    });
  }

  private handleMove(e: PointerEvent): void {
    const rect = this.container.getBoundingClientRect();
    this.moveTo(e.clientX - rect.left, e.clientY - rect.top);

    if (this.fadeOverlay) {
      gsap.to(this.fadeOverlay, { opacity: 0, duration: 0.25, overwrite: true });
    }
  }

  private handleLeave(): void {
    if (this.fadeOverlay) {
      gsap.to(this.fadeOverlay, {
        opacity: 1,
        duration: this.fadeOut,
        overwrite: true
      });
    }
  }

  private handleCardMove(e: MouseEvent): void {
    const card = e.currentTarget as HTMLElement;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  }

  public dispose(): void {
    this.container.removeEventListener('pointermove', (e) => this.handleMove(e));
    this.container.removeEventListener('pointerleave', () => this.handleLeave());

    const cards = this.container.querySelectorAll('.chroma-card');
    cards.forEach((card) => {
      card.removeEventListener('mousemove', (e) => this.handleCardMove(e as MouseEvent));
    });
  }
}
