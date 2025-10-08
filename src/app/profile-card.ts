/**
 * ProfileCard - 3D Tilt Card Component
 * Converted from React ProfileCard with 3D tilt effects
 */

export interface ProfileCardOptions {
  maxTilt?: number;
  scale?: number;
  speed?: number;
  perspective?: number;
  glareEnable?: boolean;
  glareMaxOpacity?: number;
  glareColor?: string;
  glarePosition?: 'top' | 'bottom' | 'left' | 'right' | 'all';
}

export class ProfileCard {
  private element: HTMLElement;
  private options: Required<ProfileCardOptions>;
  private rafId: number | null = null;
  private targetRotateX = 0;
  private targetRotateY = 0;
  private currentRotateX = 0;
  private currentRotateY = 0;
  private glareElement: HTMLDivElement | null = null;
  private innerElement: HTMLDivElement | null = null;

  constructor(element: HTMLElement, options: ProfileCardOptions = {}) {
    this.element = element;
    this.options = {
      maxTilt: options.maxTilt ?? 15,
      scale: options.scale ?? 1.05,
      speed: options.speed ?? 400,
      perspective: options.perspective ?? 1000,
      glareEnable: options.glareEnable ?? true,
      glareMaxOpacity: options.glareMaxOpacity ?? 0.7,
      glareColor: options.glareColor ?? '#ffffff',
      glarePosition: options.glarePosition ?? 'bottom'
    };

    this.init();
  }

  private init() {
    // Set up container
    this.element.style.transformStyle = 'preserve-3d';
    this.element.style.perspective = `${this.options.perspective}px`;
    this.element.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;

    // Create inner wrapper for the actual image
    this.innerElement = document.createElement('div');
    this.innerElement.className = 'profile-card-inner';
    this.innerElement.style.transformStyle = 'preserve-3d';
    this.innerElement.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    this.innerElement.style.width = '100%';
    this.innerElement.style.height = '100%';

    // Move all children to inner element
    while (this.element.firstChild) {
      this.innerElement.appendChild(this.element.firstChild);
    }
    this.element.appendChild(this.innerElement);

    // Add glare effect
    if (this.options.glareEnable) {
      this.glareElement = document.createElement('div');
      this.glareElement.className = 'profile-card-glare';
      this.glareElement.style.position = 'absolute';
      this.glareElement.style.top = '0';
      this.glareElement.style.left = '0';
      this.glareElement.style.width = '100%';
      this.glareElement.style.height = '100%';
      this.glareElement.style.overflow = 'hidden';
      this.glareElement.style.pointerEvents = 'none';
      this.glareElement.style.borderRadius = '8px';

      const glareInner = document.createElement('div');
      glareInner.className = 'profile-card-glare-inner';
      glareInner.style.position = 'absolute';
      glareInner.style.width = '100%';
      glareInner.style.height = '100%';
      glareInner.style.background = `linear-gradient(0deg, rgba(255,255,255,0) 0%, ${this.options.glareColor} 100%)`;
      glareInner.style.opacity = '0';
      glareInner.style.transition = `opacity ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;

      this.glareElement.appendChild(glareInner);
      this.innerElement.appendChild(this.glareElement);
    }

    // Add event listeners
    this.element.addEventListener('mouseenter', this.onMouseEnter.bind(this));
    this.element.addEventListener('mousemove', this.onMouseMove.bind(this));
    this.element.addEventListener('mouseleave', this.onMouseLeave.bind(this));
  }

  private onMouseEnter(e: MouseEvent) {
    this.element.style.transition = 'none';
    if (this.innerElement) {
      this.innerElement.style.transition = 'none';
    }
  }

  private onMouseMove(e: MouseEvent) {
    const rect = this.element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate tilt percentages
    const percentX = (x - centerX) / centerX;
    const percentY = (y - centerY) / centerY;

    // Set target rotation
    this.targetRotateY = percentX * this.options.maxTilt;
    this.targetRotateX = -percentY * this.options.maxTilt;

    // Update transform
    this.updateTransform();

    // Update glare
    if (this.glareElement && this.options.glareEnable) {
      const glareInner = this.glareElement.querySelector('.profile-card-glare-inner') as HTMLDivElement;
      if (glareInner) {
        const glareX = (x / rect.width) * 100;
        const glareY = (y / rect.height) * 100;

        glareInner.style.background = `
          radial-gradient(circle at ${glareX}% ${glareY}%,
          rgba(255,255,255,${this.options.glareMaxOpacity}) 0%,
          rgba(255,255,255,0) 80%)
        `;
        glareInner.style.opacity = '1';
      }
    }
  }

  private onMouseLeave() {
    this.element.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    if (this.innerElement) {
      this.innerElement.style.transition = `transform ${this.options.speed}ms cubic-bezier(0.03, 0.98, 0.52, 0.99)`;
    }

    this.targetRotateX = 0;
    this.targetRotateY = 0;
    this.currentRotateX = 0;
    this.currentRotateY = 0;

    // Reset to original position
    if (this.innerElement) {
      this.innerElement.style.transform = `
        perspective(${this.options.perspective}px)
        rotateX(0deg)
        rotateY(0deg)
        scale3d(1, 1, 1)
      `;
    }

    // Hide glare
    if (this.glareElement && this.options.glareEnable) {
      const glareInner = this.glareElement.querySelector('.profile-card-glare-inner') as HTMLDivElement;
      if (glareInner) {
        glareInner.style.opacity = '0';
      }
    }
  }

  private updateTransform() {
    if (!this.innerElement) return;

    // Smooth lerp for rotation
    this.currentRotateX += (this.targetRotateX - this.currentRotateX) * 0.1;
    this.currentRotateY += (this.targetRotateY - this.currentRotateY) * 0.1;

    const transform = `
      perspective(${this.options.perspective}px)
      rotateX(${this.currentRotateX}deg)
      rotateY(${this.currentRotateY}deg)
      scale3d(${this.options.scale}, ${this.options.scale}, ${this.options.scale})
    `;

    this.innerElement.style.transform = transform;
  }

  public dispose() {
    this.element.removeEventListener('mouseenter', this.onMouseEnter);
    this.element.removeEventListener('mousemove', this.onMouseMove);
    this.element.removeEventListener('mouseleave', this.onMouseLeave);

    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
    }

    // Remove added elements
    if (this.glareElement && this.glareElement.parentNode) {
      this.glareElement.parentNode.removeChild(this.glareElement);
    }
  }
}
