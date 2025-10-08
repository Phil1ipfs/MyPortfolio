import * as THREE from 'three';

export interface LiquidEtherOptions {
  mouseForce?: number;
  cursorSize?: number;
  isViscous?: boolean;
  viscous?: number;
  iterationsViscous?: number;
  iterationsPoisson?: number;
  dt?: number;
  BFECC?: boolean;
  resolution?: number;
  isBounce?: boolean;
  colors?: string[];
  autoDemo?: boolean;
  autoSpeed?: number;
  autoIntensity?: number;
  takeoverDuration?: number;
  autoResumeDelay?: number;
  autoRampDuration?: number;
}

// Shader code
const FACE_VERT = `
attribute vec3 position;
uniform vec2 px;
uniform vec2 boundarySpace;
varying vec2 uv;
precision highp float;
void main(){
  vec3 pos = position;
  vec2 scale = 1.0 - boundarySpace * 2.0;
  pos.xy = pos.xy * scale;
  uv = vec2(0.5)+(pos.xy)*0.5;
  gl_Position = vec4(pos, 1.0);
}
`;

const LINE_VERT = `
attribute vec3 position;
uniform vec2 px;
precision highp float;
varying vec2 uv;
void main(){
  vec3 pos = position;
  uv = 0.5 + pos.xy * 0.5;
  vec2 n = sign(pos.xy);
  pos.xy = abs(pos.xy) - px * 1.0;
  pos.xy *= n;
  gl_Position = vec4(pos, 1.0);
}
`;

const MOUSE_VERT = `
precision highp float;
attribute vec3 position;
attribute vec2 uv;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;
void main(){
  vec2 pos = position.xy * scale * 2.0 * px + center;
  vUv = uv;
  gl_Position = vec4(pos, 0.0, 1.0);
}
`;

const ADVECTION_FRAG = `
precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform bool isBFECC;
uniform vec2 fboSize;
uniform vec2 px;
varying vec2 uv;
void main(){
  vec2 ratio = max(fboSize.x, fboSize.y) / fboSize;
  if(isBFECC == false){
    vec2 vel = texture2D(velocity, uv).xy;
    vec2 uv2 = uv - vel * dt * ratio;
    vec2 newVel = texture2D(velocity, uv2).xy;
    gl_FragColor = vec4(newVel, 0.0, 0.0);
  } else {
    vec2 spot_new = uv;
    vec2 vel_old = texture2D(velocity, uv).xy;
    vec2 spot_old = spot_new - vel_old * dt * ratio;
    vec2 vel_new1 = texture2D(velocity, spot_old).xy;
    vec2 spot_new2 = spot_old + vel_new1 * dt * ratio;
    vec2 error = spot_new2 - spot_new;
    vec2 spot_new3 = spot_new - error / 2.0;
    vec2 vel_2 = texture2D(velocity, spot_new3).xy;
    vec2 spot_old2 = spot_new3 - vel_2 * dt * ratio;
    vec2 newVel2 = texture2D(velocity, spot_old2).xy;
    gl_FragColor = vec4(newVel2, 0.0, 0.0);
  }
}
`;

const COLOR_FRAG = `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D palette;
uniform vec4 bgColor;
varying vec2 uv;
void main(){
  vec2 vel = texture2D(velocity, uv).xy;
  float lenv = clamp(length(vel) * 3.0, 0.0, 1.0);
  vec3 c = texture2D(palette, vec2(lenv, 0.5)).rgb;
  vec3 outRGB = mix(bgColor.rgb, c, lenv * 0.5);
  float outA = mix(bgColor.a, 0.4, lenv);
  gl_FragColor = vec4(outRGB, outA);
}
`;

const DIVERGENCE_FRAG = `
precision highp float;
uniform sampler2D velocity;
uniform float dt;
uniform vec2 px;
varying vec2 uv;
void main(){
  float x0 = texture2D(velocity, uv-vec2(px.x, 0.0)).x;
  float x1 = texture2D(velocity, uv+vec2(px.x, 0.0)).x;
  float y0 = texture2D(velocity, uv-vec2(0.0, px.y)).y;
  float y1 = texture2D(velocity, uv+vec2(0.0, px.y)).y;
  float divergence = (x1 - x0 + y1 - y0) / 2.0;
  gl_FragColor = vec4(divergence / dt);
}
`;

const EXTERNAL_FORCE_FRAG = `
precision highp float;
uniform vec2 force;
uniform vec2 center;
uniform vec2 scale;
uniform vec2 px;
varying vec2 vUv;
void main(){
  vec2 circle = (vUv - 0.5) * 2.0;
  float d = 1.0 - min(length(circle), 1.0);
  d *= d;
  gl_FragColor = vec4(force * d, 0.0, 1.0);
}
`;

const POISSON_FRAG = `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D divergence;
uniform vec2 px;
varying vec2 uv;
void main(){
  float p0 = texture2D(pressure, uv + vec2(px.x * 2.0, 0.0)).r;
  float p1 = texture2D(pressure, uv - vec2(px.x * 2.0, 0.0)).r;
  float p2 = texture2D(pressure, uv + vec2(0.0, px.y * 2.0)).r;
  float p3 = texture2D(pressure, uv - vec2(0.0, px.y * 2.0)).r;
  float div = texture2D(divergence, uv).r;
  float newP = (p0 + p1 + p2 + p3) / 4.0 - div;
  gl_FragColor = vec4(newP);
}
`;

const PRESSURE_FRAG = `
precision highp float;
uniform sampler2D pressure;
uniform sampler2D velocity;
uniform vec2 px;
uniform float dt;
varying vec2 uv;
void main(){
  float step = 1.0;
  float p0 = texture2D(pressure, uv + vec2(px.x * step, 0.0)).r;
  float p1 = texture2D(pressure, uv - vec2(px.x * step, 0.0)).r;
  float p2 = texture2D(pressure, uv + vec2(0.0, px.y * step)).r;
  float p3 = texture2D(pressure, uv - vec2(0.0, px.y * step)).r;
  vec2 v = texture2D(velocity, uv).xy;
  vec2 gradP = vec2(p0 - p1, p2 - p3) * 0.5;
  v = v - gradP * dt;
  gl_FragColor = vec4(v, 0.0, 1.0);
}
`;

const VISCOUS_FRAG = `
precision highp float;
uniform sampler2D velocity;
uniform sampler2D velocity_new;
uniform float v;
uniform vec2 px;
uniform float dt;
varying vec2 uv;
void main(){
  vec2 old = texture2D(velocity, uv).xy;
  vec2 new0 = texture2D(velocity_new, uv + vec2(px.x * 2.0, 0.0)).xy;
  vec2 new1 = texture2D(velocity_new, uv - vec2(px.x * 2.0, 0.0)).xy;
  vec2 new2 = texture2D(velocity_new, uv + vec2(0.0, px.y * 2.0)).xy;
  vec2 new3 = texture2D(velocity_new, uv - vec2(0.0, px.y * 2.0)).xy;
  vec2 newv = 4.0 * old + v * dt * (new0 + new1 + new2 + new3);
  newv /= 4.0 * (1.0 + v * dt);
  gl_FragColor = vec4(newv, 0.0, 0.0);
}
`;

function makePaletteTexture(stops: string[]): THREE.DataTexture {
  let arr: string[];
  if (Array.isArray(stops) && stops.length > 0) {
    arr = stops.length === 1 ? [stops[0], stops[0]] : stops;
  } else {
    arr = ['#ffffff', '#ffffff'];
  }
  const w = arr.length;
  const data = new Uint8Array(w * 4);
  for (let i = 0; i < w; i++) {
    const c = new THREE.Color(arr[i]);
    data[i * 4 + 0] = Math.round(c.r * 255);
    data[i * 4 + 1] = Math.round(c.g * 255);
    data[i * 4 + 2] = Math.round(c.b * 255);
    data[i * 4 + 3] = 255;
  }
  const tex = new THREE.DataTexture(data, w, 1, THREE.RGBAFormat);
  tex.magFilter = THREE.LinearFilter;
  tex.minFilter = THREE.LinearFilter;
  tex.wrapS = THREE.ClampToEdgeWrapping;
  tex.wrapT = THREE.ClampToEdgeWrapping;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  return tex;
}

class Common {
  width = 0;
  height = 0;
  aspect = 1;
  pixelRatio = 1;
  time = 0;
  delta = 0;
  container: HTMLElement | null = null;
  renderer: THREE.WebGLRenderer | null = null;
  clock: THREE.Clock | null = null;

  init(container: HTMLElement) {
    this.container = container;
    this.pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.autoClear = false;
    this.renderer.setClearColor(new THREE.Color(0x000000), 0);
    this.renderer.setPixelRatio(this.pixelRatio);
    this.renderer.setSize(this.width, this.height);
    this.renderer.domElement.style.width = '100%';
    this.renderer.domElement.style.height = '100%';
    this.renderer.domElement.style.display = 'block';
    this.clock = new THREE.Clock();
    this.clock.start();
  }

  resize() {
    if (!this.container) return;
    const rect = this.container.getBoundingClientRect();
    this.width = Math.max(1, Math.floor(rect.width));
    this.height = Math.max(1, Math.floor(rect.height));
    this.aspect = this.width / this.height;
    if (this.renderer) this.renderer.setSize(this.width, this.height, false);
  }

  update() {
    if (!this.clock) return;
    this.delta = this.clock.getDelta();
    this.time += this.delta;
  }
}

class Mouse {
  mouseMoved = false;
  coords = new THREE.Vector2();
  coords_old = new THREE.Vector2();
  diff = new THREE.Vector2();
  timer: any = null;
  container: HTMLElement | null = null;
  isHoverInside = false;
  hasUserControl = false;
  isAutoActive = false;
  autoIntensity = 2.0;
  takeoverActive = false;
  takeoverStartTime = 0;
  takeoverDuration = 0.25;
  takeoverFrom = new THREE.Vector2();
  takeoverTo = new THREE.Vector2();
  onInteract: (() => void) | null = null;

  private _onMouseMove = this.onDocumentMouseMove.bind(this);
  private _onTouchStart = this.onDocumentTouchStart.bind(this);
  private _onTouchMove = this.onDocumentTouchMove.bind(this);
  private _onMouseEnter = this.onMouseEnter.bind(this);
  private _onMouseLeave = this.onMouseLeave.bind(this);
  private _onTouchEnd = this.onTouchEnd.bind(this);

  init(container: HTMLElement) {
    this.container = container;
    container.addEventListener('mousemove', this._onMouseMove);
    container.addEventListener('touchstart', this._onTouchStart);
    container.addEventListener('touchmove', this._onTouchMove);
    container.addEventListener('mouseenter', this._onMouseEnter);
    container.addEventListener('mouseleave', this._onMouseLeave);
    container.addEventListener('touchend', this._onTouchEnd);
  }

  dispose() {
    if (!this.container) return;
    this.container.removeEventListener('mousemove', this._onMouseMove);
    this.container.removeEventListener('touchstart', this._onTouchStart);
    this.container.removeEventListener('touchmove', this._onTouchMove);
    this.container.removeEventListener('mouseenter', this._onMouseEnter);
    this.container.removeEventListener('mouseleave', this._onMouseLeave);
    this.container.removeEventListener('touchend', this._onTouchEnd);
  }

  setCoords(x: number, y: number) {
    if (!this.container) return;
    if (this.timer) clearTimeout(this.timer);
    const rect = this.container.getBoundingClientRect();
    const nx = (x - rect.left) / rect.width;
    const ny = (y - rect.top) / rect.height;
    this.coords.set(nx * 2 - 1, -(ny * 2 - 1));
    this.mouseMoved = true;
    this.timer = setTimeout(() => {
      this.mouseMoved = false;
    }, 100);
  }

  setNormalized(nx: number, ny: number) {
    this.coords.set(nx, ny);
    this.mouseMoved = true;
  }

  onDocumentMouseMove(event: MouseEvent) {
    if (this.onInteract) this.onInteract();
    if (this.isAutoActive && !this.hasUserControl && !this.takeoverActive) {
      if (!this.container) return;
      const rect = this.container.getBoundingClientRect();
      const nx = (event.clientX - rect.left) / rect.width;
      const ny = (event.clientY - rect.top) / rect.height;
      this.takeoverFrom.copy(this.coords);
      this.takeoverTo.set(nx * 2 - 1, -(ny * 2 - 1));
      this.takeoverStartTime = performance.now();
      this.takeoverActive = true;
      this.hasUserControl = true;
      this.isAutoActive = false;
      return;
    }
    this.setCoords(event.clientX, event.clientY);
    this.hasUserControl = true;
  }

  onDocumentTouchStart(event: TouchEvent) {
    if (event.touches.length === 1) {
      const t = event.touches[0];
      if (this.onInteract) this.onInteract();
      this.setCoords(t.pageX, t.pageY);
      this.hasUserControl = true;
    }
  }

  onDocumentTouchMove(event: TouchEvent) {
    if (event.touches.length === 1) {
      const t = event.touches[0];
      if (this.onInteract) this.onInteract();
      this.setCoords(t.pageX, t.pageY);
    }
  }

  onTouchEnd() {
    this.isHoverInside = false;
  }

  onMouseEnter() {
    this.isHoverInside = true;
  }

  onMouseLeave() {
    this.isHoverInside = false;
  }

  update() {
    if (this.takeoverActive) {
      const t = (performance.now() - this.takeoverStartTime) / (this.takeoverDuration * 1000);
      if (t >= 1) {
        this.takeoverActive = false;
        this.coords.copy(this.takeoverTo);
        this.coords_old.copy(this.coords);
        this.diff.set(0, 0);
      } else {
        const k = t * t * (3 - 2 * t);
        this.coords.copy(this.takeoverFrom).lerp(this.takeoverTo, k);
      }
    }
    this.diff.subVectors(this.coords, this.coords_old);
    this.coords_old.copy(this.coords);
    if (this.coords_old.x === 0 && this.coords_old.y === 0) this.diff.set(0, 0);
    if (this.isAutoActive && !this.takeoverActive) this.diff.multiplyScalar(this.autoIntensity);
  }
}

class AutoDriver {
  mouse: Mouse;
  manager: any;
  enabled: boolean;
  speed: number;
  resumeDelay: number;
  rampDurationMs: number;
  active = false;
  current = new THREE.Vector2(0, 0);
  target = new THREE.Vector2();
  lastTime = performance.now();
  activationTime = 0;
  margin = 0.2;
  private _tmpDir = new THREE.Vector2();

  constructor(mouse: Mouse, manager: any, opts: any) {
    this.mouse = mouse;
    this.manager = manager;
    this.enabled = opts.enabled;
    this.speed = opts.speed;
    this.resumeDelay = opts.resumeDelay || 3000;
    this.rampDurationMs = (opts.rampDuration || 0) * 1000;
    this.pickNewTarget();
  }

  pickNewTarget() {
    const r = Math.random;
    this.target.set((r() * 2 - 1) * (1 - this.margin), (r() * 2 - 1) * (1 - this.margin));
  }

  forceStop() {
    this.active = false;
    this.mouse.isAutoActive = false;
  }

  update() {
    if (!this.enabled) return;
    const now = performance.now();
    const idle = now - this.manager.lastUserInteraction;
    if (idle < this.resumeDelay) {
      if (this.active) this.forceStop();
      return;
    }
    if (this.mouse.isHoverInside) {
      if (this.active) this.forceStop();
      return;
    }
    if (!this.active) {
      this.active = true;
      this.current.copy(this.mouse.coords);
      this.lastTime = now;
      this.activationTime = now;
    }
    this.mouse.isAutoActive = true;
    let dtSec = (now - this.lastTime) / 1000;
    this.lastTime = now;
    if (dtSec > 0.2) dtSec = 0.016;
    const dir = this._tmpDir.subVectors(this.target, this.current);
    const dist = dir.length();
    if (dist < 0.01) {
      this.pickNewTarget();
      return;
    }
    dir.normalize();
    let ramp = 1;
    if (this.rampDurationMs > 0) {
      const t = Math.min(1, (now - this.activationTime) / this.rampDurationMs);
      ramp = t * t * (3 - 2 * t);
    }
    const step = this.speed * dtSec * ramp;
    const move = Math.min(step, dist);
    this.current.addScaledVector(dir, move);
    this.mouse.setNormalized(this.current.x, this.current.y);
  }
}

class ShaderPass {
  props: any;
  uniforms?: any;
  scene: THREE.Scene | null = null;
  camera: THREE.Camera | null = null;
  material: THREE.RawShaderMaterial | null = null;
  geometry: THREE.BufferGeometry | null = null;
  plane: THREE.Mesh | null = null;

  constructor(props: any) {
    this.props = props || {};
    this.uniforms = this.props.material?.uniforms;
  }

  init() {
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    if (this.uniforms) {
      this.material = new THREE.RawShaderMaterial(this.props.material);
      this.geometry = new THREE.PlaneGeometry(2, 2);
      this.plane = new THREE.Mesh(this.geometry, this.material);
      this.scene.add(this.plane);
    }
  }

  update(common: Common) {
    if (!common.renderer || !this.scene || !this.camera) return;
    common.renderer.setRenderTarget(this.props.output || null);
    common.renderer.render(this.scene, this.camera);
    common.renderer.setRenderTarget(null);
  }
}

class Advection extends ShaderPass {
  line!: THREE.LineSegments;

  constructor(simProps: any) {
    super({
      material: {
        vertexShader: FACE_VERT,
        fragmentShader: ADVECTION_FRAG,
        uniforms: {
          boundarySpace: { value: simProps.cellScale },
          px: { value: simProps.cellScale },
          fboSize: { value: simProps.fboSize },
          velocity: { value: simProps.src.texture },
          dt: { value: simProps.dt },
          isBFECC: { value: true }
        }
      },
      output: simProps.dst
    });
    this.init();
    this.createBoundary();
  }

  createBoundary() {
    const boundaryG = new THREE.BufferGeometry();
    const vertices = new Float32Array([
      -1, -1, 0, -1, 1, 0, -1, 1, 0, 1, 1, 0, 1, 1, 0, 1, -1, 0, 1, -1, 0, -1, -1, 0
    ]);
    boundaryG.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
    const boundaryM = new THREE.RawShaderMaterial({
      vertexShader: LINE_VERT,
      fragmentShader: ADVECTION_FRAG,
      uniforms: this.uniforms!
    });
    this.line = new THREE.LineSegments(boundaryG, boundaryM);
    this.scene!.add(this.line);
  }

  updateSim(common: Common, params: any) {
    if (this.uniforms) {
      this.uniforms.dt.value = params.dt;
      this.line.visible = params.isBounce;
      this.uniforms.isBFECC.value = params.BFECC;
    }
    this.update(common);
  }
}

class ExternalForce extends ShaderPass {
  mouse!: THREE.Mesh;

  constructor(simProps: any) {
    super({ output: simProps.dst });
    this.init();
    const mouseG = new THREE.PlaneGeometry(1, 1);
    const mouseM = new THREE.RawShaderMaterial({
      vertexShader: MOUSE_VERT,
      fragmentShader: EXTERNAL_FORCE_FRAG,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      uniforms: {
        px: { value: simProps.cellScale },
        force: { value: new THREE.Vector2(0, 0) },
        center: { value: new THREE.Vector2(0, 0) },
        scale: { value: new THREE.Vector2(simProps.cursor_size, simProps.cursor_size) }
      }
    });
    this.mouse = new THREE.Mesh(mouseG, mouseM);
    this.scene!.add(this.mouse);
  }

  updateForce(common: Common, mouse: Mouse, params: any) {
    const forceX = (mouse.diff.x / 2) * params.mouse_force;
    const forceY = (mouse.diff.y / 2) * params.mouse_force;
    const cursorSizeX = params.cursor_size * params.cellScale.x;
    const cursorSizeY = params.cursor_size * params.cellScale.y;
    const centerX = Math.min(
      Math.max(mouse.coords.x, -1 + cursorSizeX + params.cellScale.x * 2),
      1 - cursorSizeX - params.cellScale.x * 2
    );
    const centerY = Math.min(
      Math.max(mouse.coords.y, -1 + cursorSizeY + params.cellScale.y * 2),
      1 - cursorSizeY - params.cellScale.y * 2
    );
    const uniforms = (this.mouse.material as THREE.RawShaderMaterial).uniforms;
    uniforms['force'].value.set(forceX, forceY);
    uniforms['center'].value.set(centerX, centerY);
    uniforms['scale'].value.set(params.cursor_size, params.cursor_size);
    this.update(common);
  }
}

class Viscous extends ShaderPass {
  constructor(simProps: any) {
    super({
      material: {
        vertexShader: FACE_VERT,
        fragmentShader: VISCOUS_FRAG,
        uniforms: {
          boundarySpace: { value: simProps.boundarySpace },
          velocity: { value: simProps.src.texture },
          velocity_new: { value: simProps.dst_.texture },
          v: { value: simProps.viscous },
          px: { value: simProps.cellScale },
          dt: { value: simProps.dt }
        }
      },
      output: simProps.dst,
      output0: simProps.dst_,
      output1: simProps.dst
    });
    this.init();
  }

  updateViscous(common: Common, params: any): any {
    if (!this.uniforms) return;
    let fbo_in: any, fbo_out: any;
    this.uniforms.v.value = params.viscous;
    for (let i = 0; i < params.iterations; i++) {
      if (i % 2 === 0) {
        fbo_in = this.props.output0;
        fbo_out = this.props.output1;
      } else {
        fbo_in = this.props.output1;
        fbo_out = this.props.output0;
      }
      this.uniforms.velocity_new.value = fbo_in.texture;
      this.props.output = fbo_out;
      this.uniforms.dt.value = params.dt;
      this.update(common);
    }
    return fbo_out;
  }
}

class Divergence extends ShaderPass {
  constructor(simProps: any) {
    super({
      material: {
        vertexShader: FACE_VERT,
        fragmentShader: DIVERGENCE_FRAG,
        uniforms: {
          boundarySpace: { value: simProps.boundarySpace },
          velocity: { value: simProps.src.texture },
          px: { value: simProps.cellScale },
          dt: { value: simProps.dt }
        }
      },
      output: simProps.dst
    });
    this.init();
  }

  updateDiv(common: Common, vel: any) {
    if (this.uniforms) {
      this.uniforms.velocity.value = vel.texture;
    }
    this.update(common);
  }
}

class Poisson extends ShaderPass {
  constructor(simProps: any) {
    super({
      material: {
        vertexShader: FACE_VERT,
        fragmentShader: POISSON_FRAG,
        uniforms: {
          boundarySpace: { value: simProps.boundarySpace },
          pressure: { value: simProps.dst_.texture },
          divergence: { value: simProps.src.texture },
          px: { value: simProps.cellScale }
        }
      },
      output: simProps.dst,
      output0: simProps.dst_,
      output1: simProps.dst
    });
    this.init();
  }

  updatePoisson(common: Common, iterations: number): any {
    let p_in: any, p_out: any;
    for (let i = 0; i < iterations; i++) {
      if (i % 2 === 0) {
        p_in = this.props.output0;
        p_out = this.props.output1;
      } else {
        p_in = this.props.output1;
        p_out = this.props.output0;
      }
      if (this.uniforms) this.uniforms.pressure.value = p_in.texture;
      this.props.output = p_out;
      this.update(common);
    }
    return p_out;
  }
}

class Pressure extends ShaderPass {
  constructor(simProps: any) {
    super({
      material: {
        vertexShader: FACE_VERT,
        fragmentShader: PRESSURE_FRAG,
        uniforms: {
          boundarySpace: { value: simProps.boundarySpace },
          pressure: { value: simProps.src_p.texture },
          velocity: { value: simProps.src_v.texture },
          px: { value: simProps.cellScale },
          dt: { value: simProps.dt }
        }
      },
      output: simProps.dst
    });
    this.init();
  }

  updatePressure(common: Common, vel: any, pressure: any) {
    if (this.uniforms) {
      this.uniforms.velocity.value = vel.texture;
      this.uniforms.pressure.value = pressure.texture;
    }
    this.update(common);
  }
}

class Simulation {
  options: any;
  fbos: Record<string, THREE.WebGLRenderTarget> = {};
  fboSize = new THREE.Vector2();
  cellScale = new THREE.Vector2();
  boundarySpace = new THREE.Vector2();
  advection!: Advection;
  externalForce!: ExternalForce;
  viscous!: Viscous;
  divergence!: Divergence;
  poisson!: Poisson;
  pressure!: Pressure;

  constructor(common: Common, options?: any) {
    this.options = {
      iterations_poisson: 32,
      iterations_viscous: 32,
      mouse_force: 20,
      resolution: 0.5,
      cursor_size: 100,
      viscous: 30,
      isBounce: false,
      dt: 0.014,
      isViscous: false,
      BFECC: true,
      ...options
    };
    this.init(common);
  }

  init(common: Common) {
    this.calcSize(common);
    this.createAllFBO();
    this.createShaderPass();
  }

  getFloatType() {
    const isIOS = /(iPad|iPhone|iPod)/i.test(navigator.userAgent);
    return isIOS ? THREE.HalfFloatType : THREE.FloatType;
  }

  createAllFBO() {
    const type = this.getFloatType();
    const opts = {
      type,
      depthBuffer: false,
      stencilBuffer: false,
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping
    };
    const keys = ['vel_0', 'vel_1', 'vel_viscous0', 'vel_viscous1', 'div', 'pressure_0', 'pressure_1'];
    keys.forEach(key => {
      this.fbos[key] = new THREE.WebGLRenderTarget(this.fboSize.x, this.fboSize.y, opts);
    });
  }

  createShaderPass() {
    this.advection = new Advection({
      cellScale: this.cellScale,
      fboSize: this.fboSize,
      dt: this.options.dt,
      src: this.fbos['vel_0'],
      dst: this.fbos['vel_1']
    });
    this.externalForce = new ExternalForce({
      cellScale: this.cellScale,
      cursor_size: this.options.cursor_size,
      dst: this.fbos['vel_1']
    });
    this.viscous = new Viscous({
      cellScale: this.cellScale,
      boundarySpace: this.boundarySpace,
      viscous: this.options.viscous,
      src: this.fbos['vel_1'],
      dst: this.fbos['vel_viscous1'],
      dst_: this.fbos['vel_viscous0'],
      dt: this.options.dt
    });
    this.divergence = new Divergence({
      cellScale: this.cellScale,
      boundarySpace: this.boundarySpace,
      src: this.fbos['vel_viscous0'],
      dst: this.fbos['div'],
      dt: this.options.dt
    });
    this.poisson = new Poisson({
      cellScale: this.cellScale,
      boundarySpace: this.boundarySpace,
      src: this.fbos['div'],
      dst: this.fbos['pressure_1'],
      dst_: this.fbos['pressure_0']
    });
    this.pressure = new Pressure({
      cellScale: this.cellScale,
      boundarySpace: this.boundarySpace,
      src_p: this.fbos['pressure_0'],
      src_v: this.fbos['vel_viscous0'],
      dst: this.fbos['vel_0'],
      dt: this.options.dt
    });
  }

  calcSize(common: Common) {
    const width = Math.max(1, Math.round(this.options.resolution * common.width));
    const height = Math.max(1, Math.round(this.options.resolution * common.height));
    this.cellScale.set(1 / width, 1 / height);
    this.fboSize.set(width, height);
  }

  resize(common: Common) {
    this.calcSize(common);
    Object.values(this.fbos).forEach(fbo => {
      fbo.setSize(this.fboSize.x, this.fboSize.y);
    });
  }

  update(common: Common, mouse: Mouse) {
    if (this.options.isBounce) this.boundarySpace.set(0, 0);
    else this.boundarySpace.copy(this.cellScale);

    this.advection.updateSim(common, {
      dt: this.options.dt,
      isBounce: this.options.isBounce,
      BFECC: this.options.BFECC
    });

    this.externalForce.updateForce(common, mouse, {
      cursor_size: this.options.cursor_size,
      mouse_force: this.options.mouse_force,
      cellScale: this.cellScale
    });

    let vel = this.fbos['vel_1'];
    if (this.options.isViscous) {
      vel = this.viscous.updateViscous(common, {
        viscous: this.options.viscous,
        iterations: this.options.iterations_viscous,
        dt: this.options.dt
      });
    }

    this.divergence.updateDiv(common, vel);
    const pressure = this.poisson.updatePoisson(common, this.options.iterations_poisson);
    this.pressure.updatePressure(common, vel, pressure);
  }
}

class Output {
  simulation: Simulation;
  scene: THREE.Scene;
  camera: THREE.Camera;
  output: THREE.Mesh;

  constructor(common: Common, paletteTex: THREE.DataTexture) {
    this.simulation = new Simulation(common);
    this.scene = new THREE.Scene();
    this.camera = new THREE.Camera();
    this.output = new THREE.Mesh(
      new THREE.PlaneGeometry(2, 2),
      new THREE.RawShaderMaterial({
        vertexShader: FACE_VERT,
        fragmentShader: COLOR_FRAG,
        transparent: true,
        depthWrite: false,
        uniforms: {
          velocity: { value: this.simulation.fbos['vel_0'].texture },
          boundarySpace: { value: new THREE.Vector2() },
          palette: { value: paletteTex },
          bgColor: { value: new THREE.Vector4(0, 0, 0, 1) }
        }
      })
    );
    this.scene.add(this.output);
  }

  resize(common: Common) {
    this.simulation.resize(common);
  }

  render(common: Common) {
    if (!common.renderer) return;
    common.renderer.setRenderTarget(null);
    common.renderer.render(this.scene, this.camera);
  }

  update(common: Common, mouse: Mouse) {
    this.simulation.update(common, mouse);
    this.render(common);
  }
}

export class LiquidEtherFull {
  private container: HTMLElement;
  private common: Common;
  private mouse: Mouse;
  private output: Output;
  private autoDriver?: AutoDriver;
  private rafId: number | null = null;
  private running = false;
  private paletteTex: THREE.DataTexture;
  private resizeObserver?: ResizeObserver;
  private intersectionObserver?: IntersectionObserver;
  private isVisible = true;
  public lastUserInteraction = performance.now();

  constructor(container: HTMLElement, options: LiquidEtherOptions = {}) {
    this.container = container;

    const colors = options.colors || ['#5227FF', '#FF9FFC', '#B19EEF'];
    this.paletteTex = makePaletteTexture(colors);

    this.common = new Common();
    this.mouse = new Mouse();

    this.common.init(container);
    this.mouse.init(container);
    this.mouse.autoIntensity = options.autoIntensity || 2.2;
    this.mouse.takeoverDuration = options.takeoverDuration || 0.25;
    this.mouse.onInteract = () => {
      this.lastUserInteraction = performance.now();
      if (this.autoDriver) this.autoDriver.forceStop();
    };

    if (this.common.renderer) {
      container.appendChild(this.common.renderer.domElement);
      // Enable cursor interaction on canvas
      this.common.renderer.domElement.style.pointerEvents = 'auto';
    }

    this.output = new Output(this.common, this.paletteTex);

    // Apply options to simulation
    Object.assign(this.output.simulation.options, {
      mouse_force: options.mouseForce || 20,
      cursor_size: options.cursorSize || 100,
      isViscous: options.isViscous || false,
      viscous: options.viscous || 30,
      iterations_viscous: options.iterationsViscous || 32,
      iterations_poisson: options.iterationsPoisson || 32,
      dt: options.dt || 0.014,
      BFECC: options.BFECC !== false,
      resolution: options.resolution || 0.5,
      isBounce: options.isBounce || false
    });

    if (options.autoDemo !== false) {
      this.autoDriver = new AutoDriver(this.mouse, this, {
        enabled: true,
        speed: options.autoSpeed || 0.5,
        resumeDelay: options.autoResumeDelay || 3000,
        rampDuration: options.autoRampDuration || 0.6
      });
    }

    this.setupObservers();
    this.start();
  }

  private setupObservers() {
    // Resize observer
    this.resizeObserver = new ResizeObserver(() => {
      this.resize();
    });
    this.resizeObserver.observe(this.container);

    // Intersection observer
    this.intersectionObserver = new IntersectionObserver(
      entries => {
        const entry = entries[0];
        this.isVisible = entry.isIntersecting && entry.intersectionRatio > 0;
        if (this.isVisible && !document.hidden) {
          this.start();
        } else {
          this.pause();
        }
      },
      { threshold: [0, 0.01, 0.1] }
    );
    this.intersectionObserver.observe(this.container);

    // Visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else if (this.isVisible) {
        this.start();
      }
    });
  }

  private resize = () => {
    this.common.resize();
    this.output.resize(this.common);
  };

  private render = () => {
    if (this.autoDriver) this.autoDriver.update();
    this.mouse.update();
    this.common.update();
    this.output.update(this.common, this.mouse);
  };

  private loop = () => {
    if (!this.running) return;
    this.render();
    this.rafId = requestAnimationFrame(this.loop);
  };

  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  pause() {
    this.running = false;
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  dispose() {
    this.pause();

    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }

    this.mouse.dispose();

    if (this.common.renderer) {
      const canvas = this.common.renderer.domElement;
      if (canvas && canvas.parentNode) {
        canvas.parentNode.removeChild(canvas);
      }
      this.common.renderer.dispose();
    }

    if (this.paletteTex) {
      this.paletteTex.dispose();
    }
  }
}
