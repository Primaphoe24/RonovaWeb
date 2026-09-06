import * as THREE from 'three';
import { CharacterAura } from './characterAura.js';

const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

/**
 * Generates an ultra-sharp canvas texture of the stylized glowing red crow feather.
 * Uses 512x512 resolution for high-DPI crisp rendering and flawless red glow.
 */
function createCrowFeatherTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // Closed feather boundary path mathematically modeled on the reference silhouette
  const drawFeatherPath = (c) => {
    c.beginPath();
    // 1. Bottom-left sharp needle tip (stem/base)
    c.moveTo(35, 440);

    // 2. Lower edge sweep towards bottom barb
    c.bezierCurveTo(120, 478, 195, 482, 255, 475);
    // Lower barb sharp notch cutback
    c.lineTo(270, 445);
    // Lower edge sweep to top-right tip
    c.bezierCurveTo(345, 410, 435, 240, 492, 28);

    // 3. Top-right sharp needle feather tip -> Upper edge sweep towards upper barb notch
    c.bezierCurveTo(430, 120, 350, 215, 290, 245);
    // Upper barb sharp triangular peak
    c.lineTo(330, 205);
    // Upper edge sweep back to bottom-left stem tip
    c.bezierCurveTo(210, 285, 100, 365, 35, 440);

    c.closePath();
  };

  // Layer 1: Outer intense red aura glow
  ctx.save();
  ctx.shadowColor = '#ff0033';
  ctx.shadowBlur = 32;
  ctx.strokeStyle = 'rgba(255, 0, 40, 0.9)';
  ctx.lineWidth = 12;
  drawFeatherPath(ctx);
  ctx.stroke();
  ctx.restore();

  // Layer 2: Secondary vibrant crimson edge glow
  ctx.save();
  ctx.shadowColor = '#ff1a4d';
  ctx.shadowBlur = 14;
  ctx.strokeStyle = '#ff002b';
  ctx.lineWidth = 6;
  drawFeatherPath(ctx);
  ctx.stroke();
  ctx.restore();

  // Layer 3: Dark blood crimson center gradient fill
  ctx.save();
  const grad = ctx.createRadialGradient(260, 260, 10, 260, 260, 240);
  grad.addColorStop(0.0, 'rgba(10, 0, 3, 0.98)');
  grad.addColorStop(0.45, 'rgba(42, 0, 8, 0.96)');
  grad.addColorStop(0.78, 'rgba(130, 0, 20, 0.98)');
  grad.addColorStop(0.98, 'rgba(255, 0, 35, 1.0)');
  ctx.fillStyle = grad;
  drawFeatherPath(ctx);
  ctx.fill();
  ctx.restore();

  // Layer 4: Sharp neon edge stroke
  ctx.save();
  ctx.shadowColor = '#ff4d73';
  ctx.shadowBlur = 6;
  ctx.strokeStyle = '#ff2b52';
  ctx.lineWidth = 3;
  drawFeatherPath(ctx);
  ctx.stroke();
  ctx.restore();

  // Layer 5: Soft bright rim highlight stroke
  ctx.save();
  ctx.strokeStyle = '#ff99b3';
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.85;
  drawFeatherPath(ctx);
  ctx.stroke();
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
      emissive: new THREE.Color(0xff002b),
      emissiveIntensity: 0.70,
    });

    this.instancedMesh = new THREE.InstancedMesh(baseGeo, material, this.particleCount);
    this.instancedMesh.castShadow = false;
    this.instancedMesh.receiveShadow = false;

    const featherColors = [
      new THREE.Color(0xff0033),
      new THREE.Color(0xd90024),
      new THREE.Color(0xff2b4f),
      new THREE.Color(0xaa0015),
      new THREE.Color(0xff0055),
      new THREE.Color(0x77000b),
    ];

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

      const color = featherColors[Math.floor(Math.random() * featherColors.length)];
      this.instancedMesh.setColorAt(i, color);

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



