import gsap from 'gsap';

interface Slot {
  x: number;
  y: number;
  z: number;
  zIndex: number;
}

interface CardSwapConfig {
  ease: string;
  durDrop: number;
  durMove: number;
  durReturn: number;
  promoteOverlap: number;
  returnDelay: number;
}

interface CardSwapOptions {
  cardDistance?: number;
  verticalDistance?: number;
  delay?: number;
  pauseOnHover?: boolean;
  skewAmount?: number;
  easing?: 'linear' | 'elastic';
}

export class CardSwap {
  private container: HTMLElement;
  private cards: HTMLElement[];
  private cardDistance: number;
  private verticalDistance: number;
  private delay: number;
  private pauseOnHover: boolean;
  private skewAmount: number;
  private config: CardSwapConfig;
  private order: number[];
  private timeline: gsap.core.Timeline | null = null;
  private intervalId: number | null = null;

  constructor(container: HTMLElement, options: CardSwapOptions = {}) {
    this.container = container;
    this.cardDistance = options.cardDistance ?? 60;
    this.verticalDistance = options.verticalDistance ?? 70;
    this.delay = options.delay ?? 5000;
    this.pauseOnHover = options.pauseOnHover ?? false;
    this.skewAmount = options.skewAmount ?? 6;

    const easing = options.easing ?? 'elastic';
    this.config =
      easing === 'elastic'
        ? {
            ease: 'elastic.out(0.6,0.9)',
            durDrop: 2,
            durMove: 2,
            durReturn: 2,
            promoteOverlap: 0.9,
            returnDelay: 0.05
          }
        : {
            ease: 'power1.inOut',
            durDrop: 0.8,
            durMove: 0.8,
            durReturn: 0.8,
            promoteOverlap: 0.45,
            returnDelay: 0.2
          };

    this.cards = Array.from(this.container.querySelectorAll('.card')) as HTMLElement[];
    this.order = Array.from({ length: this.cards.length }, (_, i) => i);

    this.init();
  }

  private makeSlot(i: number): Slot {
    return {
      x: i * this.cardDistance,
      y: -i * this.verticalDistance,
      z: -i * this.cardDistance * 1.5,
      zIndex: this.cards.length - i
    };
  }

  private placeNow(el: HTMLElement, slot: Slot): void {
    gsap.set(el, {
      x: slot.x,
      y: slot.y,
      z: slot.z,
      xPercent: -50,
      yPercent: -50,
      skewY: this.skewAmount,
      transformOrigin: 'center center',
      zIndex: slot.zIndex,
      force3D: true
    });
  }

  private init(): void {
    // Initial placement
    this.cards.forEach((card, i) => {
      this.placeNow(card, this.makeSlot(i));
    });

    // Start animation
    this.swap();
    this.intervalId = window.setInterval(() => this.swap(), this.delay);

    // Pause on hover
    if (this.pauseOnHover) {
      this.container.addEventListener('mouseenter', () => this.pause());
      this.container.addEventListener('mouseleave', () => this.resume());
    }
  }

  private swap(): void {
    if (this.order.length < 2) return;

    const [front, ...rest] = this.order;
    const elFront = this.cards[front];
    const tl = gsap.timeline();
    this.timeline = tl;

    // Drop front card
    tl.to(elFront, {
      y: '+=500',
      duration: this.config.durDrop,
      ease: this.config.ease
    });

    // Promote remaining cards
    tl.addLabel('promote', `-=${this.config.durDrop * this.config.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const el = this.cards[idx];
      const slot = this.makeSlot(i);
      tl.set(el, { zIndex: slot.zIndex }, 'promote');
      tl.to(
        el,
        {
          x: slot.x,
          y: slot.y,
          z: slot.z,
          duration: this.config.durMove,
          ease: this.config.ease
        },
        `promote+=${i * 0.15}`
      );
    });

    // Return front card to back
    const backSlot = this.makeSlot(this.cards.length - 1);
    tl.addLabel('return', `promote+=${this.config.durMove * this.config.returnDelay}`);
    tl.call(
      () => {
        gsap.set(elFront, { zIndex: backSlot.zIndex });
      },
      undefined,
      'return'
    );
    tl.to(
      elFront,
      {
        x: backSlot.x,
        y: backSlot.y,
        z: backSlot.z,
        duration: this.config.durReturn,
        ease: this.config.ease
      },
      'return'
    );

    tl.call(() => {
      this.order = [...rest, front];
    });
  }

  private pause(): void {
    if (this.timeline) {
      this.timeline.pause();
    }
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private resume(): void {
    if (this.timeline) {
      this.timeline.play();
    }
    if (this.intervalId === null) {
      this.intervalId = window.setInterval(() => this.swap(), this.delay);
    }
  }

  public dispose(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
    }
    if (this.timeline) {
      this.timeline.kill();
    }
  }
}
