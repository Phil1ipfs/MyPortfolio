/**
 * LanyardDrag - Makes the lanyard card draggable with physics
 */

export interface LanyardDragOptions {
  friction?: number;
  gravity?: number;
  maxRotation?: number;
  elasticity?: number;
  springStrength?: number;
  stretchFactor?: number;
  bounceStrength?: number;
  dragRotationFactor?: number;
  flipSpeed?: number;
}

export class LanyardDrag {
  private card: HTMLElement;
  private rope: HTMLElement | null = null;
  private options: Required<LanyardDragOptions>;
  private isDragging = false;

  // Physics properties
  private velocityX = 0;
  private velocityY = 0;
  private positionY = 0;
  private rotation = 0;
  private velocityRotation = 0;
  private scaleY = 1;

  // Mouse tracking
  private lastMouseX = 0;
  private lastMouseY = 0;
  private mouseX = 0;
  private mouseY = 0;
  private dragStartY = 0;

  // Animation
  private rafId?: number;

  // Original position
  private originalTop = 0;
  private originalY = 0;

  constructor(card: HTMLElement, options: LanyardDragOptions = {}) {
    this.card = card;
    this.options = {
      friction: options.friction ?? 0.92,
      gravity: options.gravity ?? 0.15,
      maxRotation: options.maxRotation ?? 30,
      elasticity: options.elasticity ?? 0.7,
      springStrength: options.springStrength ?? 0.1,
      stretchFactor: options.stretchFactor ?? 0.65,
      bounceStrength: options.bounceStrength ?? 0.5,
      dragRotationFactor: options.dragRotationFactor ?? 0.2,
      flipSpeed: options.flipSpeed ?? 0.18
    };

    this.init();
  }

  private init() {
    console.log('LanyardDrag: Initializing drag on card:', this.card);
    this.card.style.cursor = 'grab';

    // Find the rope element
    const wrapper = this.card.closest('.lanyard-wrapper');
    if (wrapper) {
      this.rope = wrapper.querySelector('.lanyard-rope') as HTMLElement;
    }

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
    this.dragStartY = e.clientY;

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
    this.velocityY = deltaY * 0.8;
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
    this.dragStartY = touch.clientY;

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
    this.velocityY = deltaY * 0.8;
    this.velocityRotation = deltaX * 0.3;
  }

  private animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    if (this.isDragging) {
      // Calculate drag delta
      const deltaY = this.mouseY - this.dragStartY;
      const deltaX = this.mouseX - this.lastMouseX;

      // Apply stretch effect - only allow downward drag
      if (deltaY > 0) {
        this.positionY = deltaY * this.options.stretchFactor;

        // Elastic stretch - card stretches vertically
        this.scaleY = 1 + (deltaY * 0.001);

        // Stretch the rope
        if (this.rope) {
          const stretchAmount = 100 + (deltaY * 0.3);
          this.rope.style.height = `${stretchAmount}px`;
        }
      } else {
        this.positionY = 0;
        this.scaleY = 1;
        if (this.rope) {
          this.rope.style.height = '100px';
        }
      }

      // Add rotation based on drag distance and horizontal movement
      const dragRotation = (this.positionY * this.options.dragRotationFactor);
      this.rotation += deltaX * 0.1;
      const targetRotation = this.rotation + dragRotation;
      this.rotation = Math.max(-this.options.maxRotation, Math.min(this.options.maxRotation, targetRotation));

      this.card.style.transform = `translateX(-50%) translateY(${this.positionY}px) rotate(${this.rotation}deg) scaleY(${this.scaleY})`;
    } else {
      // Spring back with bounce effect
      const springForce = -this.positionY * this.options.springStrength;
      this.velocityY += springForce;

      // Add gravity for natural fall
      this.velocityY += this.options.gravity;

      // Apply velocity
      this.positionY += this.velocityY;

      // Apply friction
      this.velocityY *= this.options.friction;
      this.velocityRotation *= this.options.friction;

      // Bounce when reaching original position
      if (this.positionY < 0) {
        this.positionY = 0;
        this.velocityY *= -this.options.bounceStrength; // Bounce back
      }

      // Scale back to normal with smooth easing
      this.scaleY += (1 - this.scaleY) * 0.2;

      // Rotation snap back with flip effect - smooth easing
      const rotationSpring = -this.rotation * this.options.flipSpeed;
      this.velocityRotation += rotationSpring;
      this.rotation += this.velocityRotation;
      this.rotation *= 0.94;

      // Update rope stretch
      if (this.rope) {
        const ropeHeight = 100 + (this.positionY * 0.3);
        this.rope.style.height = `${Math.max(100, ropeHeight)}px`;
      }

      // Stop small movements
      if (Math.abs(this.velocityY) < 0.1 && Math.abs(this.positionY) < 0.5 && Math.abs(this.velocityRotation) < 0.1 && Math.abs(this.rotation) < 0.5) {
        this.velocityY = 0;
        this.velocityRotation = 0;
        this.rotation = 0;
        this.positionY = 0;
        this.scaleY = 1;

        if (this.rope) {
          this.rope.style.height = '100px';
        }

        // Resume swing animation when settled
        if (this.card.style.animation === 'none') {
          this.card.style.animation = 'swingCard 4s ease-in-out infinite';
        }
      }

      this.card.style.transform = `translateX(-50%) translateY(${this.positionY}px) rotate(${this.rotation}deg) scaleY(${this.scaleY})`;
    }
  }

  public dispose() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }
  }
}
