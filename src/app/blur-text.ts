/**
 * BlurText Animation - Vanilla TypeScript
 * Converted from React motion component
 */

export interface BlurTextOptions {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: 'words' | 'letters';
  direction?: 'top' | 'bottom';
  threshold?: number;
  rootMargin?: string;
  animationFrom?: Record<string, string | number>;
  animationTo?: Array<Record<string, string | number>>;
  onAnimationComplete?: () => void;
  stepDuration?: number;
}

export class BlurText {
  private element: HTMLElement;
  private options: Required<Omit<BlurTextOptions, 'animationFrom' | 'animationTo' | 'onAnimationComplete'>> & {
    animationFrom?: Record<string, string | number>;
    animationTo?: Array<Record<string, string | number>>;
    onAnimationComplete?: () => void;
  };
  private observer?: IntersectionObserver;
  private spans: HTMLSpanElement[] = [];

  constructor(element: HTMLElement, options: BlurTextOptions) {
    this.element = element;
    this.options = {
      text: options.text,
      delay: options.delay ?? 200,
      className: options.className ?? '',
      animateBy: options.animateBy ?? 'words',
      direction: options.direction ?? 'top',
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? '0px',
      stepDuration: options.stepDuration ?? 0.35,
      animationFrom: options.animationFrom,
      animationTo: options.animationTo,
      onAnimationComplete: options.onAnimationComplete
    };

    this.init();
  }

  private init() {
    const elements = this.options.animateBy === 'words'
      ? this.options.text.split(' ')
      : this.options.text.split('');

    // Set up container
    this.element.style.display = 'flex';
    this.element.style.flexWrap = 'wrap';
    if (this.options.className) {
      this.element.className = this.options.className;
    }

    // Create spans for each word/letter
    elements.forEach((segment, index) => {
      const span = document.createElement('span');
      span.style.display = 'inline-block';
      span.style.willChange = 'transform, filter, opacity';

      // Set initial state
      const defaultFrom = this.options.direction === 'top'
        ? { filter: 'blur(10px)', opacity: 0, y: -50 }
        : { filter: 'blur(10px)', opacity: 0, y: 50 };

      const fromState = this.options.animationFrom ?? defaultFrom;

      span.style.filter = fromState['filter'] as string;
      span.style.opacity = String(fromState['opacity']);
      span.style.transform = `translateY(${fromState['y']}px)`;

      span.textContent = segment === ' ' ? '\u00A0' : segment;

      if (this.options.animateBy === 'words' && index < elements.length - 1) {
        span.textContent += '\u00A0';
      }

      this.element.appendChild(span);
      this.spans.push(span);
    });

    // Set up intersection observer
    this.setupObserver();
  }

  private setupObserver() {
    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.animate();
            this.observer?.unobserve(this.element);
          }
        });
      },
      {
        threshold: this.options.threshold,
        rootMargin: this.options.rootMargin
      }
    );

    this.observer.observe(this.element);
  }

  private animate() {
    const defaultTo = this.options.direction === 'top'
      ? [
          { filter: 'blur(5px)', opacity: 0.5, y: 5 },
          { filter: 'blur(0px)', opacity: 1, y: 0 }
        ]
      : [
          { filter: 'blur(5px)', opacity: 0.5, y: -5 },
          { filter: 'blur(0px)', opacity: 1, y: 0 }
        ];

    const toSnapshots = this.options.animationTo ?? defaultTo;
    const stepDuration = this.options.stepDuration * 1000; // Convert to ms
    const totalDuration = stepDuration * toSnapshots.length;

    this.spans.forEach((span, index) => {
      const delay = (index * this.options.delay);

      setTimeout(() => {
        this.animateSpan(span, toSnapshots, stepDuration, index === this.spans.length - 1);
      }, delay);
    });
  }

  private animateSpan(
    span: HTMLSpanElement,
    snapshots: Array<Record<string, string | number>>,
    stepDuration: number,
    isLast: boolean
  ) {
    snapshots.forEach((snapshot, stepIndex) => {
      setTimeout(() => {
        const filter = snapshot['filter'] as string;
        const opacity = snapshot['opacity'] as number;
        const y = snapshot['y'] as number;

        span.style.transition = `all ${stepDuration}ms cubic-bezier(0.4, 0, 0.2, 1)`;
        span.style.filter = filter;
        span.style.opacity = String(opacity);
        span.style.transform = `translateY(${y}px)`;

        // Call completion callback on last span and last step
        if (isLast && stepIndex === snapshots.length - 1 && this.options.onAnimationComplete) {
          setTimeout(() => {
            this.options.onAnimationComplete?.();
          }, stepDuration);
        }
      }, stepIndex * stepDuration);
    });
  }

  public dispose() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.spans.forEach(span => {
      if (span.parentNode) {
        span.parentNode.removeChild(span);
      }
    });
    this.spans = [];
  }
}
