"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
  SMAAEffect,
  SMAAPreset,
} from "postprocessing";

// ─── tuneable options ────────────────────────────────────────────────────────
const OPTS = {
  distortion: "turbulentDistortion" as const,
  length: 400,
  roadWidth: 10,
  islandWidth: 2,
  lanesPerRoad: 4,
  fov: 90,
  fovSpeedUp: 150,
  speedUp: 2,
  carLightsFade: 0.4,
  totalSideLightSticks: 20,
  lightPairsPerRoadWay: 40,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.12, 0.5] as [number, number],
  lightStickHeight: [1.3, 1.7] as [number, number],
  movingAwaySpeed: [60, 80] as [number, number],
  movingCloserSpeed: [-120, -160] as [number, number],
  carLightsLength: [400 * 0.03, 400 * 0.2] as [number, number],
  carLightsRadius: [0.05, 0.14] as [number, number],
  carWidthPercentage: [0.3, 0.5] as [number, number],
  carShiftX: [-0.8, 0.8] as [number, number],
  carFloorSeparation: [0, 5] as [number, number],
  // Enterprise palette: dark road, subtle cyan/blue light streaks
  colors: {
    roadColor: 0x060810,
    islandColor: 0x080c14,
    background: 0x060810,
    shoulderLines: 0x1e293b,
    brokenLines: 0x1e293b,
    leftCars:  [0x1d4ed8, 0x1e40af, 0x2563eb],  // blue shades
    rightCars: [0x0e7490, 0x0284c7, 0x38bdf8],   // cyan/sky shades
    sticks: 0x0ea5e9,
  },
};

// ─── helpers ─────────────────────────────────────────────────────────────────
function randomRange(base: number | [number, number]): number {
  if (Array.isArray(base)) return Math.random() * (base[1] - base[0]) + base[0];
  return Math.random() * base;
}
function pickRandom<T>(arr: T | T[]): T {
  if (Array.isArray(arr)) return arr[Math.floor(Math.random() * arr.length)];
  return arr;
}
function lerp(current: number, target: number, speed = 0.1, limit = 0.001): number {
  let change = (target - current) * speed;
  if (Math.abs(change) < limit) change = target - current;
  return change;
}
function resizeRendererToDisplaySize(
  renderer: THREE.WebGLRenderer,
  setSize: (w: number, h: number, b: boolean) => void
): boolean {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const needsResize = canvas.width !== width || canvas.height !== height;
  if (needsResize) setSize(width, height, false);
  return needsResize;
}

// ─── distortions ─────────────────────────────────────────────────────────────
const nsin = (v: number) => Math.sin(v) * 0.5 + 0.5;

const turbulentUniforms = {
  uFreq: { value: new THREE.Vector4(4, 8, 8, 1) },
  uAmp:  { value: new THREE.Vector4(25, 5, 10, 10) },
};

const DISTORTIONS: Record<string, any> = {
  turbulentDistortion: {
    uniforms: turbulentUniforms,
    getDistortion: `
      uniform vec4 uFreq;
      uniform vec4 uAmp;
      float nsin(float val){ return sin(val)*0.5+0.5; }
      #define PI 3.14159265358979
      float getDistortionX(float progress){
        return (cos(PI*progress*uFreq.r+uTime)*uAmp.r + pow(cos(PI*progress*uFreq.g+uTime*(uFreq.g/uFreq.r)),2.)*uAmp.g);
      }
      float getDistortionY(float progress){
        return (-nsin(PI*progress*uFreq.b+uTime)*uAmp.b + -pow(nsin(PI*progress*uFreq.a+uTime/(uFreq.b/uFreq.a)),5.)*uAmp.a);
      }
      vec3 getDistortion(float progress){
        return vec3(getDistortionX(progress)-getDistortionX(0.0125), getDistortionY(progress)-getDistortionY(0.0125), 0.);
      }
    `,
    getJS: (progress: number, time: number) => {
      const uFreq = turbulentUniforms.uFreq.value;
      const uAmp  = turbulentUniforms.uAmp.value;
      const getX  = (p: number) => Math.cos(Math.PI*p*uFreq.x+time)*uAmp.x + Math.pow(Math.cos(Math.PI*p*uFreq.y+time*(uFreq.y/uFreq.x)),2)*uAmp.y;
      const getY  = (p: number) => -nsin(Math.PI*p*uFreq.z+time)*uAmp.z - Math.pow(nsin(Math.PI*p*uFreq.w+time/(uFreq.z/uFreq.w)),5)*uAmp.w;
      const d = new THREE.Vector3(getX(progress)-getX(progress+0.007), getY(progress)-getY(progress+0.007), 0);
      return d.multiply(new THREE.Vector3(-2,-5,0)).add(new THREE.Vector3(0,0,-10));
    },
  },
};

// ─── Road class ───────────────────────────────────────────────────────────────
class Road {
  webgl: any; options: any; uTime: any; leftRoadWay: any; rightRoadWay: any;
  constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options; this.uTime = { value: 0 }; }
  createPlane(side: number, width: number, isRoad: boolean) {
    const opts = this.options;
    const segments = 100;
    const geometry = new THREE.PlaneGeometry(1, 1, 1, segments);
    const islandSpeedFix = `
      float shoulderLinesWidthPercentage = ${opts.shoulderLinesWidthPercentage.toFixed(2)};
      float brokenLinesWidthPercentage   = ${opts.brokenLinesWidthPercentage.toFixed(2)};
      float brokenLinesLengthPercentage  = ${opts.brokenLinesLengthPercentage.toFixed(2)};
    `;
    let color = isRoad ? opts.colors.roadColor : opts.colors.islandColor;
    const material = new THREE.ShaderMaterial({
      fragmentShader: `
        varying vec2 vUv;
        uniform vec3 uColor;
        uniform float uTime;
        #define USE_FOG
        uniform vec3 fogColor;
        uniform float fogNear;
        uniform float fogFar;
        void main(){
          vec3 c = uColor;
          gl_FragColor = vec4(c,1.0);
          #ifdef USE_FOG
            float depth = gl_FragCoord.z / gl_FragCoord.w;
            float fogFactor = smoothstep(fogNear, fogFar, depth);
            gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
          #endif
        }
      `,
      vertexShader: `
        uniform float uTime;
        ${DISTORTIONS.turbulentDistortion.getDistortion}
        void main(){
          vec3 transformed = position.xyz;
          float progress = (transformed.y + 0.5);
          vec3 distortion = getDistortion(progress);
          transformed.x += distortion.x;
          transformed.y += distortion.y;
          transformed.z += distortion.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed,1.0);
        }
      `,
      uniforms: {
        uColor:   { value: new THREE.Color(color) },
        uTime:    this.uTime,
        fogColor: { value: new THREE.Color(opts.colors.background) },
        fogNear:  { value: opts.length * 0.2 },
        fogFar:   { value: opts.length * 500 },
        ...DISTORTIONS.turbulentDistortion.uniforms,
      },
      side: THREE.FrontSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.rotation.x = -Math.PI / 2;
    mesh.scale.y = opts.length;
    mesh.scale.x = width;
    mesh.position.x = side * (opts.roadWidth / 2 + width / 2);
    this.webgl.scene.add(mesh);
    return mesh;
  }
  init() {
    this.leftRoadWay  = this.createPlane(-1, this.options.roadWidth, true);
    this.rightRoadWay = this.createPlane(1,  this.options.roadWidth, true);
    this.createPlane(0, this.options.islandWidth, false);
  }
  update(time: number) {
    this.uTime.value = time;
  }
}

// ─── CarLights class ──────────────────────────────────────────────────────────
class CarLights {
  webgl: any; options: any; colors: any; speed: any; fade: any; mesh: any;
  constructor(webgl: any, options: any, colors: any, speed: any, fade: any) {
    this.webgl = webgl; this.options = options;
    this.colors = colors; this.speed = speed; this.fade = fade;
  }
  init() {
    const opts = this.options;
    const curve   = new THREE.LineCurve3(new THREE.Vector3(0,0,0), new THREE.Vector3(0,0,-1));
    const geo     = new THREE.TubeGeometry(curve, 40, 1, 8, false);
    const instanced = new THREE.InstancedBufferGeometry().copy(geo as any);
    instanced.instanceCount = opts.lightPairsPerRoadWay * 2;
    const laneWidth = opts.roadWidth / opts.lanesPerRoad;
    const aOffset: number[] = [], aMetrics: number[] = [], aColor: number[] = [];
    let colors: THREE.Color | THREE.Color[] = this.colors;
    if (Array.isArray(colors)) colors = colors.map((c: any) => new THREE.Color(c));
    else colors = new THREE.Color(colors as any);
    for (let i = 0; i < opts.lightPairsPerRoadWay; i++) {
      const radius = randomRange(opts.carLightsRadius);
      const length = randomRange(opts.carLightsLength);
      const speed  = randomRange(this.speed);
      const carLane = i % opts.lanesPerRoad;
      let laneX = carLane * laneWidth - opts.roadWidth / 2 + laneWidth / 2;
      laneX += randomRange(opts.carShiftX) * laneWidth;
      const offsetY = randomRange(opts.carFloorSeparation) + radius * 1.3;
      const offsetZ = -randomRange(opts.length);
      const carWidth = randomRange(opts.carWidthPercentage) * laneWidth;
      aOffset.push(laneX - carWidth/2, offsetY, offsetZ, laneX + carWidth/2, offsetY, offsetZ);
      aMetrics.push(radius, length, speed, radius, length, speed);
      const c = pickRandom(colors) as THREE.Color;
      aColor.push(c.r, c.g, c.b, c.r, c.g, c.b);
    }
    instanced.setAttribute("aOffset",  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),  3, false));
    instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 3, false));
    instanced.setAttribute("aColor",   new THREE.InstancedBufferAttribute(new Float32Array(aColor),   3, false));
    const material = new THREE.ShaderMaterial({
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;
        void main(){
          gl_FragColor = vec4(vColor, vAlpha);
        }
      `,
      vertexShader: `
        attribute vec3 aOffset;
        attribute vec3 aMetrics;
        attribute vec3 aColor;
        uniform float uTime;
        uniform vec2 uFade;
        uniform float uTravelLength;
        varying vec3 vColor;
        varying float vAlpha;
        ${DISTORTIONS.turbulentDistortion.getDistortion}
        void main(){
          float radius = aMetrics.r;
          float myLength = aMetrics.g;
          float speed = aMetrics.b;
          vec3 transformed = position.xyz;
          transformed.xy *= radius;
          transformed.z  *= myLength;
          float zOffset = aOffset.z + myLength;
          zOffset = mod(zOffset - speed * uTime, uTravelLength);
          transformed.z += zOffset;
          float progress = abs(transformed.z / uTravelLength);
          vec3 distortion = getDistortion(progress);
          transformed.x += distortion.x + aOffset.x;
          transformed.y += distortion.y + aOffset.y;
          transformed.z += distortion.z;
          vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
          gl_Position = projectionMatrix * mvPosition;
          vColor = aColor;
          float fadeStart = uFade.x;
          float fadeEnd   = uFade.y;
          float inFade    = smoothstep(fadeStart, fadeStart + 0.1, progress);
          float outFade   = smoothstep(fadeEnd,   fadeEnd   - 0.1, progress);
          vAlpha = inFade * outFade;
        }
      `,
      uniforms: {
        uTime:         { value: 0 },
        uTravelLength: { value: opts.length },
        uFade:         { value: this.fade },
        ...DISTORTIONS.turbulentDistortion.uniforms,
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(instanced, material);
    this.mesh.frustumCulled = false;
    this.webgl.scene.add(this.mesh);
  }
  update(time: number) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
  }
}

// ─── LightsSticks class ───────────────────────────────────────────────────────
class LightsSticks {
  webgl: any; options: any; mesh: any;
  constructor(webgl: any, options: any) { this.webgl = webgl; this.options = options; }
  init() {
    const opts = this.options;
    const geo = new THREE.PlaneGeometry(1, 1);
    const instanced = new THREE.InstancedBufferGeometry().copy(geo as any);
    instanced.instanceCount = opts.totalSideLightSticks;
    const aOffset: number[] = [], aMetrics: number[] = [], aColor: number[] = [];
    for (let i = 0; i < opts.totalSideLightSticks; i++) {
      aOffset.push(randomRange(opts.lightStickWidth), randomRange(opts.lightStickHeight), (i / opts.totalSideLightSticks) * opts.length);
      aMetrics.push(i);
      const c = new THREE.Color(opts.colors.sticks);
      aColor.push(c.r, c.g, c.b);
    }
    instanced.setAttribute("aOffset",  new THREE.InstancedBufferAttribute(new Float32Array(aOffset),  3, false));
    instanced.setAttribute("aMetrics", new THREE.InstancedBufferAttribute(new Float32Array(aMetrics), 1, false));
    instanced.setAttribute("aColor",   new THREE.InstancedBufferAttribute(new Float32Array(aColor),   3, false));
    const mat = new THREE.ShaderMaterial({
      fragmentShader: `
        varying vec3 vColor;
        void main(){ gl_FragColor = vec4(vColor, 1.0); }
      `,
      vertexShader: `
        attribute vec3 aOffset;
        attribute float aMetrics;
        attribute vec3 aColor;
        uniform float uTime;
        uniform float uTravelLength;
        varying vec3 vColor;
        ${DISTORTIONS.turbulentDistortion.getDistortion}
        void main(){
          vec3 transformed = position.xyz;
          transformed.x  *= aOffset.x;
          transformed.y  *= aOffset.y;
          float zPos = mod(aOffset.z - uTime * 60.0, uTravelLength);
          transformed.z  += zPos;
          float progress = zPos / uTravelLength;
          vec3 distortion = getDistortion(progress);
          transformed.x += distortion.x;
          transformed.y += distortion.y;
          transformed.z += distortion.z;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
          vColor = aColor;
        }
      `,
      uniforms: {
        uTime:         { value: 0 },
        uTravelLength: { value: opts.length },
        ...DISTORTIONS.turbulentDistortion.uniforms,
      },
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.Mesh(instanced, mat);
    this.mesh.frustumCulled = false;
    this.webgl.scene.add(this.mesh);
  }
  update(time: number) {
    (this.mesh.material as THREE.ShaderMaterial).uniforms.uTime.value = time;
  }
}

// ─── Main WebGL App ───────────────────────────────────────────────────────────
class HyperspeedApp {
  container: HTMLElement; options: typeof OPTS;
  renderer!: THREE.WebGLRenderer; composer!: EffectComposer;
  camera!: THREE.PerspectiveCamera; scene!: THREE.Scene;
  clock!: THREE.Clock; road!: Road;
  leftCarLights!: CarLights; rightCarLights!: CarLights; leftSticks!: LightsSticks;
  fovTarget: number; speedUpTarget = 0; speedUp = 0; timeOffset = 0;
  disposed = false; hasValidSize = false;

  constructor(container: HTMLElement) {
    this.container = container;
    this.options   = OPTS;
    this.fovTarget = OPTS.fov;

    const w = Math.max(1, container.offsetWidth);
    const h = Math.max(1, container.offsetHeight);

    this.renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    this.renderer.setSize(w, h, false);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    this.composer = new EffectComposer(this.renderer);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(OPTS.fov, w / h, 0.1, 10000);
    this.camera.position.set(0, 8, -5);
    this.scene = new THREE.Scene();
    this.scene.background = null;
    this.scene.fog = new THREE.Fog(OPTS.colors.background, OPTS.length * 0.2, OPTS.length * 500);
    this.clock = new THREE.Clock();

    this.road            = new Road(this, OPTS);
    this.leftCarLights   = new CarLights(this, OPTS, OPTS.colors.leftCars,  OPTS.movingAwaySpeed,   new THREE.Vector2(0, 1 - OPTS.carLightsFade));
    this.rightCarLights  = new CarLights(this, OPTS, OPTS.colors.rightCars, OPTS.movingCloserSpeed, new THREE.Vector2(1, 0 + OPTS.carLightsFade));
    this.leftSticks      = new LightsSticks(this, OPTS);

    if (w > 0 && h > 0) this.hasValidSize = true;

    this.tick = this.tick.bind(this);
    this.onResize = this.onResize.bind(this);
    window.addEventListener("resize", this.onResize);
  }

  onResize() {
    const w = this.container.offsetWidth, h = this.container.offsetHeight;
    if (w <= 0 || h <= 0) { this.hasValidSize = false; return; }
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.composer.setSize(w, h);
    this.hasValidSize = true;
  }

  async init() {
    // Passes
    const renderPass = new RenderPass(this.scene, this.camera);
    const bloomPass  = new EffectPass(this.camera, new BloomEffect({ luminanceThreshold: 0.15, luminanceSmoothing: 0, resolutionScale: 1 }));
    const smaaPass   = new EffectPass(this.camera, new SMAAEffect({ preset: SMAAPreset.MEDIUM, searchImage: SMAAEffect.searchImageDataURL as any, areaImage: SMAAEffect.areaImageDataURL as any }));
    renderPass.renderToScreen = false;
    bloomPass.renderToScreen  = false;
    smaaPass.renderToScreen   = true;
    this.composer.addPass(renderPass);
    this.composer.addPass(bloomPass);
    this.composer.addPass(smaaPass);

    // Scene objects
    this.road.init();
    this.leftCarLights.init();
    this.leftCarLights.mesh.position.setX(-OPTS.roadWidth/2 - OPTS.islandWidth/2);
    this.rightCarLights.init();
    this.rightCarLights.mesh.position.setX(OPTS.roadWidth/2 + OPTS.islandWidth/2);
    this.leftSticks.init();
    this.leftSticks.mesh.position.setX(-(OPTS.roadWidth + OPTS.islandWidth/2));

    this.tick();
  }

  tick() {
    if (this.disposed) return;
    if (!this.hasValidSize) {
      const w = this.container.offsetWidth, h = this.container.offsetHeight;
      if (w > 0 && h > 0) {
        this.renderer.setSize(w, h, false);
        this.camera.aspect = w / h;
        this.camera.updateProjectionMatrix();
        this.composer.setSize(w, h);
        this.hasValidSize = true;
      } else { requestAnimationFrame(this.tick); return; }
    }
    resizeRendererToDisplaySize(this.renderer, (w, h, b) => {
      this.composer.setSize(w, h, b as any);
      this.hasValidSize = true;
    });
    const delta = this.clock.getDelta();
    const lerpP = Math.exp(-(-60 * Math.log2(1 - 0.1)) * delta);
    this.speedUp += lerp(this.speedUp, this.speedUpTarget, lerpP, 0.00001);
    this.timeOffset += this.speedUp * delta;
    const time = this.clock.elapsedTime + this.timeOffset;
    this.leftCarLights.update(time);
    this.rightCarLights.update(time);
    this.leftSticks.update(time);
    this.road.update(time);
    const fovChange = lerp(this.camera.fov, this.fovTarget, lerpP);
    if (fovChange !== 0) { this.camera.fov += fovChange * delta * 6; }
    const distortion = DISTORTIONS.turbulentDistortion.getJS(0.025, time);
    this.camera.lookAt(new THREE.Vector3(
      this.camera.position.x + distortion.x,
      this.camera.position.y + distortion.y,
      this.camera.position.z + distortion.z,
    ));
    this.camera.updateProjectionMatrix();
    this.composer.render(delta);
    requestAnimationFrame(this.tick);
  }

  dispose() {
    this.disposed = true;
    this.scene.traverse((obj: any) => {
      if (!obj.isMesh) return;
      obj.geometry?.dispose();
      if (Array.isArray(obj.material)) obj.material.forEach((m: any) => m.dispose());
      else obj.material?.dispose();
    });
    this.scene.clear();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
    if (this.renderer.domElement.parentNode)
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    this.composer.dispose();
    window.removeEventListener("resize", this.onResize);
  }
}

// ─── React component ──────────────────────────────────────────────────────────
export function Hyperspeed({ style }: { style?: React.CSSProperties }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef       = useRef<HyperspeedApp | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const app = new HyperspeedApp(containerRef.current);
    appRef.current = app;
    app.init();
    return () => { app.dispose(); appRef.current = null; };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        ...style,
      }}
    />
  );
}
