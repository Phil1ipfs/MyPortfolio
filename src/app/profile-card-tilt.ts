export interface ProfileCardTiltOptions {
  enableTilt?: boolean;
  maxTilt?: number;
}

export class ProfileCardTilt {
  private element: HTMLElement;
  private options: Required<ProfileCardTiltOptions>;

  constructor(element: HTMLElement, options: ProfileCardTiltOptions = {}) {
    this.element = element;
    this.options = {
      enableTilt: options.enableTilt ?? true,
      maxTilt: options.maxTilt ?? 15
    };

    if (this.options.enableTilt) {
      this.init();
    }
  }

  private init(): void {
    this.element.addEventListener('mousemove', this.handleMouseMove);
    this.element.addEventListener('mouseleave', this.handleMouseLeave);
  }

  private handleMouseMove = (e: MouseEvent): void => {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * this.options.maxTilt;
    const rotateY = ((centerX - x) / centerX) * this.options.maxTilt;

    this.element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(10px)`;
  };

  private handleMouseLeave = (): void => {
    this.element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
  };

  public dispose(): void {
    this.element.removeEventListener('mousemove', this.handleMouseMove);
    this.element.removeEventListener('mouseleave', this.handleMouseLeave);
    this.element.style.transform = '';
  }
}
