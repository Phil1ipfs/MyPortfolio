/**
 * LanyardDrag - Makes the lanyard card draggable with physics
 */

export interface LanyardDragOptions {
  friction?: number;
  gravity?: number;
  maxRotation?: number;
}

export class LanyardDrag {
  private card: HTMLElement;
  private options: Required<LanyardDragOptions>;
  private isDragging = false;

  // Physics properties
  private velocityX = 0;
  private velocityY = 0;
  private rotation = 0;
  private velocityRotation = 0;

  // Mouse tracking
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseX = 0;
  private mouseY = 0;

  // Animation
  private rafId?: number;

  constructor(card: HTMLElement, options: LanyardDragOptions = {}) {
    this.card = card;
    this.options = {
      friction: options.friction ?? 0.95,
      gravity: options.gravity ?? 0.5,
      maxRotation: options.maxRotation ?? 25
    };

    this.init();
  }

  private init() {
    console.log('LanyardDrag: Initializing drag on card:', this.card);
    this.card.style.cursor = 'grab';

    this.card.addEventListener('mousedown', this.onMouseDown.bind(this));
    document.addEventListener('mousemove', this.onMouseMove.bind(this));
    document.addEventListener('mouseup', this.onMouseUp.bind(this));

    this.card.addEventListener('touchstart', this.onTouchStart.bind(this), { passive: false });
    document.addEventListener('touchmove', this.onTouchMove.bind(this), { passive: false });
    document.addEventListener('touchend', this.onTouchEnd.bind(this));

    console.log('LanyardDrag: Event listeners attached');
    this.animate();
  }

  private onMouseDown(e: MouseEvent) {
    console.log('LanyardDrag: mousedown event fired', e);
    e.preventDefault();
    this.isDragging = true;
    this.card.style.cursor = 'grabbing';
    this.card.style.animation = 'none';

    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;

    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityRotation = 0;
  }

  private onMouseMove(e: MouseEvent) {
    if (!this.isDragging) return;

    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = e.clientX;
    this.mouseY = e.clientY;
  }

  private onMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;
    this.card.style.cursor = 'grab';

    const deltaX = this.mouseX - this.lastMouseX;
    const deltaY = this.mouseY - this.lastMouseY;

    this.velocityX = deltaX;
    this.velocityY = deltaY;
    this.velocityRotation = deltaX * 0.3;
  }

  private onTouchStart(e: TouchEvent) {
    e.preventDefault();
    const touch = e.touches[0];
    this.isDragging = true;
    this.card.style.animation = 'none';

    this.lastMouseX = touch.clientX;
    this.lastMouseY = touch.clientY;
    this.mouseX = touch.clientX;
    this.mouseY = touch.clientY;

    this.velocityX = 0;
    this.velocityY = 0;
    this.velocityRotation = 0;
  }

  private onTouchMove(e: TouchEvent) {
    if (!this.isDragging) return;
    e.preventDefault();

    const touch = e.touches[0];
    this.lastMouseX = this.mouseX;
    this.lastMouseY = this.mouseY;
    this.mouseX = touch.clientX;
    this.mouseY = touch.clientY;
  }

  private onTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;

    const deltaX = this.mouseX - this.lastMouseX;
    const deltaY = this.mouseY - this.lastMouseY;

    this.velocityX = deltaX;
    this.velocityY = deltaY;
    this.velocityRotation = deltaX * 0.3;
  }

  private animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    if (this.isDragging) {
      // Apply drag movement
      const deltaX = this.mouseX - this.lastMouseX;
      this.rotation += deltaX * 0.2;

      // Clamp rotation
      this.rotation = Math.max(-this.options.maxRotation, Math.min(this.options.maxRotation, this.rotation));

      this.card.style.transform = `translateX(-50%) rotate(${this.rotation}deg)`;
    } else {
      // Apply physics when not dragging
      this.velocityY += this.options.gravity;
      this.velocityX *= this.options.friction;
      this.velocityY *= this.options.friction;
      this.velocityRotation *= this.options.friction;

      this.rotation += this.velocityRotation;

      // Spring back to center
      const returnForce = -this.rotation * 0.05;
      this.velocityRotation += returnForce;

      // Damping
      this.rotation *= 0.95;

      // Clamp rotation
      this.rotation = Math.max(-this.options.maxRotation, Math.min(this.options.maxRotation, this.rotation));

      // Stop small movements
      if (Math.abs(this.velocityX) < 0.1 && Math.abs(this.velocityY) < 0.1 && Math.abs(this.velocityRotation) < 0.1 && Math.abs(this.rotation) < 0.5) {
        this.velocityX = 0;
        this.velocityY = 0;
        this.velocityRotation = 0;
        this.rotation = 0;

        // Resume swing animation when settled
        if (this.card.style.animation === 'none') {
          this.card.style.animation = 'swingCard 4s ease-in-out infinite';
        }
      }

      this.card.style.transform = `translateX(-50%) rotate(${this.rotation}deg)`;
    }
  }

  public dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
