import * as THREE from 'three';
import { CharacterAura } from './characterAura.js';

const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

const featherSvgPath1 = new Path2D("M77.25 99.90 c-7.15 -0.54 -11.45 -1.27 -17.53 -2.97 -9.68 -2.74 -12.51 -3.31 -19.14 -3.92 -2.39 -0.21 -3.95 -0.25 -9.95 -0.17 -3.92 0.06 -9.08 0.20 -11.48 0.32 -2.40 0.12 -5.45 0.26 -6.80 0.32 -2.27 0.08 -2.42 0.06 -2.22 -0.17 0.55 -0.67 6.65 -5.34 9.72 -7.47 3.02 -2.08 10.72 -7.14 10.87 -7.14 0.05 0 0.38 -0.20 0.75 -0.46 1.01 -0.69 5.96 -3.63 7.43 -4.41 0.72 -0.37 1.47 -0.80 1.68 -0.95 0.69 -0.47 4.13 -2.31 7.72 -4.10 4.70 -2.34 6.83 -3.31 12.43 -5.68 2.04 -0.86 8.33 -3.26 10.63 -4.07 0.80 -0.28 2.45 -0.89 3.66 -1.36 1.21 -0.47 2.63 -1 3.17 -1.16 0.54 -0.15 1.27 -0.46 1.62 -0.66 0.37 -0.20 1.49 -0.70 2.50 -1.15 4.29 -1.84 10.81 -5.56 13.78 -7.86 3.72 -2.86 3.98 -3.08 6.61 -5.59 1.27 -1.21 2.42 -2.20 2.54 -2.20 0.17 0 0.18 0.15 0.08 0.87 -0.47 3.14 -1.61 7.76 -2.63 10.70 -1.04 3 -3.05 7.04 -4.46 9.02 -0.66 0.93 -0.63 0.95 1.61 0.70 7.23 -0.81 9.52 -1.29 16.15 -3.25 0.60 -0.18 1.45 -0.43 1.91 -0.55 0.46 -0.12 1.19 -0.38 1.61 -0.58 0.43 -0.18 1.49 -0.60 2.37 -0.92 0.89 -0.32 2.24 -0.84 2.99 -1.18 0.77 -0.34 1.68 -0.75 2.07 -0.90 1.90 -0.83 6.65 -3.34 8.24 -4.36 0.69 -0.46 1.32 -0.83 1.38 -0.83 0.11 0 0.51 -0.28 2.22 -1.49 0.38 -0.28 0.77 -0.51 0.84 -0.51 0.06 0 0.29 -0.17 0.47 -0.37 0.20 -0.21 0.58 -0.49 0.84 -0.61 1.27 -0.61 6.88 -5.51 10.20 -8.91 5.71 -5.85 9.22 -10.67 15.47 -21.27 4.24 -7.20 6.51 -10.80 6.80 -10.80 0.28 0 0.41 3.81 0.25 7.15 -0.41 8.02 -2.86 17.62 -6.81 26.77 -1.12 2.59 -4.06 8.33 -5.53 10.80 -3.35 5.64 -6.55 10.01 -10.37 14.13 -0.84 0.90 -1.50 1.67 -1.47 1.70 0.09 0.08 3.23 -0.66 3.60 -0.84 0.18 -0.09 0.44 -0.14 0.57 -0.11 0.20 0.03 0 0.46 -0.90 1.96 -0.63 1.06 -1.65 2.57 -2.25 3.37 -1.32 1.75 -4.03 4.50 -6.23 6.34 -2.56 2.13 -7.04 5.04 -11.25 7.29 -0.67 0.35 -1.33 0.75 -1.47 0.86 -0.12 0.12 -0.35 0.21 -0.49 0.21 -0.12 0 -0.95 0.34 -1.82 0.74 -0.87 0.41 -1.85 0.86 -2.19 1.01 -1.07 0.47 -5.77 2.25 -7.04 2.65 -0.67 0.21 -1.29 0.44 -1.36 0.52 -0.09 0.08 -0.34 0.14 -0.57 0.14 -0.23 0 -0.46 0.06 -0.51 0.14 -0.05 0.06 -0.37 0.17 -0.70 0.23 -0.35 0.05 -0.75 0.15 -0.89 0.23 -0.38 0.18 -5.08 1.32 -7.76 1.87 -3.32 0.67 -7.75 1.35 -11.62 1.78 -0.58 0.08 -1.09 0.20 -1.12 0.29 -0.03 0.09 0.31 0.26 0.75 0.40 0.44 0.12 2.22 0.66 3.95 1.16 1.73 0.51 3.95 1.15 4.95 1.42 0.98 0.26 1.79 0.54 1.79 0.61 0 0.08 -0.09 0.14 -0.21 0.14 -0.11 0 -0.55 0.11 -0.95 0.23 -0.66 0.20 -4.53 1.10 -5.34 1.24 -0.17 0.03 -1.41 0.23 -2.76 0.44 -1.35 0.21 -2.56 0.44 -2.68 0.49 -0.12 0.06 -1.67 0.23 -3.45 0.38 -3 0.26 -12.34 0.47 -14.24 0.34z m13.78 -2.65 c3.92 -0.49 7.12 -0.96 7.12 -1.09 0 -0.05 -0.37 -0.18 -0.80 -0.29 -1.52 -0.38 -7.09 -2.27 -8.21 -2.77 l-1.12 -0.51 0.05 -0.63 0.05 -0.63 0.92 -0.11 c0.51 -0.05 2.25 -0.17 3.87 -0.26 3.03 -0.18 6.88 -0.64 10.98 -1.33 18.88 -3.17 36.08 -11.53 44.57 -21.70 0.63 -0.74 1.13 -1.36 1.13 -1.39 0 -0.03 -0.32 0.03 -0.72 0.15 -2.07 0.64 -4.79 1.29 -5.36 1.29 -0.64 0 -0.66 -0.02 -0.66 -0.52 0 -0.47 0.17 -0.64 1.88 -2.10 2.40 -2.04 5.47 -5.10 7.32 -7.33 1.82 -2.20 4.55 -5.82 4.38 -5.82 -0.03 0 -0.67 0.81 -1.42 1.79 -4.43 5.86 -9.65 10.73 -16.02 14.99 -0.93 0.63 -1.56 1.13 -1.41 1.13 0.98 0 5.51 -0.90 7.32 -1.45 0.41 -0.12 1.06 -0.23 1.42 -0.23 0.64 0 0.66 0.02 0.66 0.52 0 0.44 -0.18 0.69 -1.42 1.88 -10.80 10.32 -29.92 17.84 -49.72 19.57 -2.24 0.20 -8.84 0.54 -10.49 0.54 l-0.61 0 1.03 0.75 c1.18 0.86 3.32 1.99 4.82 2.56 0.58 0.21 1.41 0.54 1.85 0.70 0.74 0.28 0.80 0.34 0.80 0.81 0 0.61 0.09 0.58 -2.91 0.92 -7.61 0.84 -14.68 0.67 -21.74 -0.54 -2.47 -0.41 -7.26 -1.64 -11.47 -2.91 -8.01 -2.42 -12.27 -3.29 -18.47 -3.83 -2.27 -0.18 -10.03 -0.18 -12.71 0 -1.09 0.08 -2.80 0.18 -3.80 0.25 l-1.81 0.11 0.05 -0.58 c0.05 -0.55 0.12 -0.64 1.65 -1.68 2.19 -1.49 5.27 -3.48 9.86 -6.34 14.10 -8.82 23.31 -13.44 37.09 -18.64 9.39 -3.52 14.68 -5.80 19.26 -8.27 2.59 -1.39 6.06 -3.49 6.69 -4.04 0.35 -0.31 0 -0.11 -2.62 1.53 -4.70 2.92 -10.81 5.70 -20.21 9.19 -5.65 2.10 -11.41 4.38 -14.93 5.93 -7.66 3.37 -17.20 8.56 -26.87 14.64 -6.77 4.26 -14.18 9.33 -13.75 9.42 0.14 0.03 1.50 -0.06 3.05 -0.20 4.79 -0.40 10.26 -0.58 15.37 -0.49 8.62 0.14 13.41 0.90 23.11 3.66 8.35 2.37 11.87 3.05 19.39 3.71 0.38 0.03 3 0.03 5.82 0.02 4.09 -0.03 5.67 -0.11 7.73 -0.37z m4.29 -34.24 c3.95 -0.35 8.68 -1.01 12.17 -1.70 1.82 -0.37 6.92 -1.62 6.84 -1.70 -0.05 -0.03 -1.16 0.21 -2.50 0.55 -3.22 0.80 -6.49 1.39 -10.63 1.91 -0.81 0.11 -6.51 0.55 -7 0.55 -0.31 0 -0.35 -0.08 -0.35 -0.55 0 -0.44 0.15 -0.72 0.78 -1.41 2.82 -3.14 5.68 -8.90 7.12 -14.24 0.21 -0.83 0.43 -1.61 0.47 -1.76 0.05 -0.15 -0.58 0.28 -1.41 1 l-1.49 1.27 0.70 0.05 c0.67 0.05 0.70 0.08 0.70 0.51 0 0.67 -1.27 4.38 -2.13 6.17 -1.38 2.94 -3.17 5.48 -5.73 8.15 l-1.36 1.44 0.58 0 c0.34 0 1.78 -0.11 3.20 -0.23z m1.45 -14.10 c0 -0.05 -0.20 0.06 -0.46 0.25 -0.25 0.18 -0.46 0.37 -0.46 0.40 0 0.05 0.21 -0.06 0.46 -0.25 0.26 -0.18 0.46 -0.37 0.46 -0.40z m69.73 -15.68 c0.08 -0.26 0.06 -0.31 -0.03 -0.15 -0.08 0.12 -0.20 0.40 -0.25 0.61 -0.08 0.26 -0.06 0.31 0.03 0.15 0.08 -0.12 0.20 -0.40 0.25 -0.61z m1.61 -4.47 c2.01 -6.14 3.22 -12.07 3.60 -17.58 0.08 -1.06 0.06 -1.24 -0.09 -1 -1.45 2.40 -2.25 3.80 -2.10 3.63 0.11 -0.09 0.46 -0.18 0.78 -0.18 l0.58 0 0 0.66 c0 1.04 -0.43 4.30 -0.86 6.39 -0.61 3.05 -2.02 8.22 -2.77 10.23 -0.05 0.09 -0.05 0.18 0 0.18 0.05 0 0.43 -1.06 0.86 -2.33z");
const featherSvgPath2 = new Path2D("M77.02 98.06 c-7.47 -0.66 -11.04 -1.33 -19.39 -3.71 -9.49 -2.71 -14.47 -3.51 -22.65 -3.66 -4.84 -0.09 -10 0.09 -15.85 0.57 -2.07 0.17 -3.95 0.31 -4.21 0.29 l-0.46 0 0.46 -0.38 c1.06 -0.86 6.19 -4.46 9.11 -6.37 12.23 -8.02 23.43 -14.32 32.69 -18.39 3.52 -1.55 9.28 -3.83 14.93 -5.93 10.05 -3.72 15.57 -6.28 21.13 -9.77 3.63 -2.28 5.99 -4.06 9.08 -6.81 0.66 -0.58 1.23 -1.04 1.26 -1 0.12 0.12 -1.03 4.55 -1.78 6.83 -1.36 4.07 -4.01 8.90 -6.26 11.41 -0.44 0.49 -0.78 0.92 -0.75 0.95 0.06 0.05 5.01 -0.31 6.34 -0.46 10.46 -1.26 20.50 -4.27 29.78 -8.96 4.06 -2.05 8.65 -4.85 11.70 -7.17 7.95 -5.97 14.09 -12.46 19.88 -21.01 2.08 -3.06 2.60 -3.90 6.49 -10.41 1.79 -2.99 3.37 -5.57 3.51 -5.74 0.23 -0.29 0.25 -0.14 0.17 2.14 -0.41 12.39 -5.86 27.91 -14.27 40.70 -3.92 5.96 -7.98 10.63 -12.76 14.65 -1.03 0.87 -1.82 1.62 -1.73 1.65 0.20 0.06 2.74 -0.58 5.04 -1.29 0.98 -0.29 1.94 -0.52 2.16 -0.49 0.35 0.05 0.32 0.11 -0.74 1.50 -2.31 3.02 -6.68 7.01 -10.31 9.43 -9.91 6.63 -21.93 11.21 -35.25 13.44 -4.10 0.69 -7.95 1.15 -10.98 1.33 -3.69 0.20 -4.75 0.32 -4.82 0.54 -0.12 0.38 5.71 2.50 10.11 3.66 1.09 0.29 2.02 0.55 2.05 0.60 0.11 0.11 -0.35 0.20 -2.94 0.61 -6.29 1.01 -8.50 1.19 -14.47 1.24 -3.08 0.02 -5.90 0.02 -6.28 -0.02z m8.19 -1.44 c2.51 -0.15 6.26 -0.52 7.18 -0.70 0.57 -0.12 0.49 -0.17 -1.62 -0.96 -2.16 -0.80 -4.20 -1.87 -5.62 -2.92 -1.38 -1.03 -1.68 -1.35 -1.38 -1.44 0.12 -0.05 2.22 -0.14 4.66 -0.23 9.23 -0.35 15.77 -1.24 23.66 -3.25 13.48 -3.41 25.45 -9.48 33.04 -16.74 0.80 -0.77 1.36 -1.41 1.27 -1.44 -0.09 -0.03 -0.64 0.08 -1.21 0.25 -2.36 0.70 -6.16 1.38 -9.14 1.62 -1.27 0.11 -1.33 0.17 1.30 -1.50 4.64 -2.92 9.22 -6.69 12.88 -10.58 9.14 -9.75 16.52 -24.47 19.34 -38.51 0.43 -2.10 0.93 -5.94 0.81 -6.08 -0.17 -0.17 -0.43 0.17 -1.50 1.91 -7.23 11.68 -10.52 16.08 -16.75 22.33 -3.48 3.49 -5.60 5.37 -8.73 7.72 -4.50 3.37 -7.95 5.47 -13.48 8.19 -10.96 5.41 -22.05 8.28 -35.98 9.34 -4.66 0.35 -4.36 0.47 -2.60 -1.18 3.94 -3.74 6.58 -7.84 8.25 -12.83 0.81 -2.43 0.74 -2.56 -0.72 -1.41 -3.92 3.09 -9.49 6.40 -15.22 9.06 -2.77 1.27 -8.47 3.58 -14.19 5.73 -13.02 4.90 -22.36 9.52 -34.70 17.15 -6.29 3.89 -13.67 8.67 -13.87 9 -0.08 0.12 0.23 0.14 1.10 0.06 5.08 -0.43 13.54 -0.54 17.13 -0.25 6.20 0.54 10.46 1.41 18.47 3.83 11.07 3.35 18.44 4.36 27.62 3.83z");

/**
 * Generates an ultra-sharp canvas texture of the stylized glowing red crow feather.
 * Uses 512x512 resolution for high-DPI crisp rendering and flawless red glow based on custom SVG feather shape.
 */
function createCrowFeatherTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Draws SVG feather shape paths scaled & centered onto 512x512 canvas
  const drawFeatherShape = (c) => {
    c.save();
    c.translate(256, 256);
    c.scale(2.15, 2.15);
    c.translate(-98, -63.5);
    c.fill(featherSvgPath1);
    c.fill(featherSvgPath2);
    c.restore();
  };

  const strokeInnerVeins = (c) => {
    c.save();
    c.translate(256, 256);
    c.scale(2.15, 2.15);
    c.translate(-98, -63.5);
    c.stroke(featherSvgPath1);
    c.restore();
  };

  const strokeOuterBorder = (c) => {
    c.save();
    c.translate(256, 256);
    c.scale(2.15, 2.15);
    c.translate(-98, -63.5);
    c.stroke(featherSvgPath2);
    c.restore();
  };

  // Layer 1: Dark obsidian jet-black center fill (True black feather body)
  ctx.save();
  ctx.fillStyle = '#050103';
  drawFeatherShape(ctx);
  ctx.restore();

  // Layer 2: Inner feather vein lines - Extra Dark Dried Blood Red
  ctx.save();
  ctx.shadowColor = '#150003';
  ctx.shadowBlur = 4;
  ctx.strokeStyle = '#280006';
  ctx.lineWidth = 1.2;
  strokeInnerVeins(ctx);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = '#3d0009';
  ctx.lineWidth = 0.7;
  strokeInnerVeins(ctx);
  ctx.restore();

  // Layer 3: Outer border intense red aura glow stroke
  ctx.save();
  ctx.shadowColor = '#ff0033';
  ctx.shadowBlur = 28;
  ctx.strokeStyle = 'rgba(255, 0, 40, 0.95)';
  ctx.lineWidth = 3.5;
  strokeOuterBorder(ctx);
  ctx.restore();

  // Layer 4: Vibrant crimson outer edge stroke
  ctx.save();
  ctx.shadowColor = '#ff1a4d';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#ff002b';
  ctx.lineWidth = 2.0;
  strokeOuterBorder(ctx);
  ctx.restore();

  // Layer 5: Sharp neon red outer edge highlight
  ctx.save();
  ctx.shadowColor = '#ff4d73';
  ctx.shadowBlur = 6;
  ctx.strokeStyle = '#ff2b52';
  ctx.lineWidth = 1.0;
  strokeOuterBorder(ctx);
  ctx.restore();

  // Layer 6: Bright crimson outer rim highlight stroke
  ctx.save();
  ctx.strokeStyle = '#ff99b3';
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.9;
  strokeOuterBorder(ctx);
  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.instancedMesh = null;

    // Optimized particle count: 1250 for Desktop, 200 for Mobile
    this.particleCount = isMobile ? 200 : 1250;
    this.particleData = [];
    this.dummy = new THREE.Object3D();

    this.characterAura = new CharacterAura(scene);

    this._create();
  }

  _create() {
    // Light geometry (subdivided 4x4 on desktop, 2x2 on mobile)
    const segs = isMobile ? 2 : 4;
    const baseGeo = new THREE.PlaneGeometry(0.28, 0.28, segs, segs);

    if (!isMobile) {
      const posAttr = baseGeo.getAttribute('position');
      for (let i = 0; i < posAttr.count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        const curveZ = Math.sin((x + y) * 3.5) * 0.025;
        posAttr.setZ(i, curveZ);
      }
      baseGeo.computeVertexNormals();
    }

    const featherTexture = createCrowFeatherTexture();

    const material = new THREE.MeshStandardMaterial({
      map: featherTexture,
      transparent: true,
      alphaTest: 0.03,
      side: THREE.DoubleSide,
      roughness: 0.2,
      metalness: 0.3,
      emissiveMap: featherTexture,
      emissive: new THREE.Color(0xff1a36),
      emissiveIntensity: 0.90,
    });

    this.instancedMesh = new THREE.InstancedMesh(baseGeo, material, this.particleCount);
    this.instancedMesh.castShadow = false;
    this.instancedMesh.receiveShadow = false;

    const whiteColor = new THREE.Color(0xffffff);

    for (let i = 0; i < this.particleCount; i++) {
      // Wider spatial bounds to prevent screen clutter
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 24,
        Math.random() * 14 - 1.0,
        (Math.random() - 0.5) * 24
      );

      const baseRot = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      // Reduced feather scale (Mobile: 0.15 - 0.38, Desktop: 0.22 - 0.57)
      const scaleBase = isMobile ? 0.15 : 0.22;
      const scaleRange = isMobile ? 0.23 : 0.35;
      const scaleVal = Math.random() * scaleRange + scaleBase;

      const scale = new THREE.Vector3(
        scaleVal,
        scaleVal * (Math.random() * 0.4 + 0.85),
        scaleVal
      );

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        Math.random() * 0.007 + 0.003,
        (Math.random() - 0.5) * 0.005
      );

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.02,
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.02
      );

      const wobblePhase = Math.random() * Math.PI * 2;
      const wobbleSpeed = Math.random() * 1.4 + 1.0;

      this.particleData.push({
        position,
        rotation: baseRot.clone(),
        baseRotZ: baseRot.z,
        scale,
        velocity,
        rotSpeed,
        wobblePhase,
        wobbleSpeed,
      });

      this.instancedMesh.setColorAt(i, whiteColor);

      this.dummy.position.copy(position);
      this.dummy.rotation.copy(baseRot);
      this.dummy.scale.copy(scale);
      this.dummy.updateMatrix();
      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
    if (this.instancedMesh.instanceColor) {
      this.instancedMesh.instanceColor.needsUpdate = true;
    }

    this.scene.add(this.instancedMesh);
  }

  update(elapsedTime, deltaTime, camera, model) {
    if (this.characterAura) {
      this.characterAura.update(elapsedTime, deltaTime, camera, model);
    }

    if (!this.instancedMesh || deltaTime === 0) return;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particleData[i];

      const swayX = Math.sin(elapsedTime * p.wobbleSpeed + p.wobblePhase) * 0.003;
      const swayZ = Math.cos(elapsedTime * p.wobbleSpeed + p.wobblePhase) * 0.003;

      p.position.x += p.velocity.x + swayX;
      p.position.y += p.velocity.y;
      p.position.z += p.velocity.z + swayZ;

      p.rotation.x += p.rotSpeed.x;
      p.rotation.y += p.rotSpeed.y;
      p.rotation.z = p.baseRotZ + Math.sin(elapsedTime * p.wobbleSpeed * 1.4 + p.wobblePhase) * 0.35;

      if (p.position.y > 13.5) {
        p.position.y = -1.0;
        p.position.x = (Math.random() - 0.5) * 24;
        p.position.z = (Math.random() - 0.5) * 24;
      }

      this.dummy.position.copy(p.position);
      this.dummy.rotation.copy(p.rotation);
      this.dummy.scale.copy(p.scale);
      this.dummy.updateMatrix();

      this.instancedMesh.setMatrixAt(i, this.dummy.matrix);
    }

    this.instancedMesh.instanceMatrix.needsUpdate = true;
  }

  dispose() {
    if (this.characterAura) {
      this.characterAura.dispose();
    }
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
      this.scene.remove(this.instancedMesh);
    }
  }
}



