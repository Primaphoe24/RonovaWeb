import * as THREE from 'three';

export const RING_CONFIG = {
  ring: {
    position: [0, 1.30, -0.52],
    rotation: [-0.25, 0, 0],
    radius: 0.44,
    tube: 0.015,
    color: 0xff0033,
  },
  showGuideRing: false,
  showBroadFog: true,
};

function createWispyDarkBloodSmokeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  const blackWisps = [
    { x: 256, y: 260, rx: 140, ry: 200, a: 0.90 },
    { x: 210, y: 210, rx: 100, ry: 160, a: 0.75 },
    { x: 302, y: 200, rx: 110, ry: 170, a: 0.75 },
    { x: 256, y: 140, rx: 90, ry: 130, a: 0.65 },
  ];

  blackWisps.forEach(({ x, y, rx, ry, a }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0.0, `rgba(8, 1, 3, ${a})`);
    grad.addColorStop(0.5, `rgba(4, 0, 1, ${a * 0.7})`);
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const bloodWisps = [
    { x: 256, y: 250, rx: 85, ry: 130, a: 0.90 },
    { x: 225, y: 200, rx: 65, ry: 100, a: 0.80 },
    { x: 287, y: 190, rx: 70, ry: 105, a: 0.80 },
    { x: 256, y: 140, rx: 50, ry: 80, a: 0.65 },
  ];

  bloodWisps.forEach(({ x, y, rx, ry, a }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0.0, `rgba(140, 0, 15, ${a})`);
    grad.addColorStop(0.4, `rgba(90, 0, 10, ${a * 0.8})`);
    grad.addColorStop(0.8, `rgba(45, 0, 5, ${a * 0.35})`);
    grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(0, 0, rx, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createBroadFogTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  const cx = 256;
  const cy = 256;

  const mainGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 250);
  mainGrad.addColorStop(0.0, 'rgba(120, 0, 15, 0.75)');
  mainGrad.addColorStop(0.35, 'rgba(75, 0, 10, 0.45)');
  mainGrad.addColorStop(0.70, 'rgba(30, 0, 5, 0.20)');
  mainGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = mainGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, 250, 0, Math.PI * 2);
  ctx.fill();

  const cloudPuffs = [
    { x: 190, y: 210, r: 130, a: 0.40 },
    { x: 310, y: 220, r: 140, a: 0.40 },
    { x: 230, y: 310, r: 120, a: 0.35 },
    { x: 300, y: 150, r: 110, a: 0.35 },
    { x: 180, y: 160, r: 110, a: 0.30 },
  ];

  cloudPuffs.forEach(({ x, y, r, a }) => {
    const pGrad = ctx.createRadialGradient(x, y, 0, x, y, r);
    pGrad.addColorStop(0.0, `rgba(140, 5, 20, ${a})`);
    pGrad.addColorStop(0.5, `rgba(60, 0, 8, ${a * 0.5})`);
    pGrad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = pGrad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

function createShinyFireSparkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 128);

  const cx = 64;
  const cy = 64;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');
  grad.addColorStop(0.15, 'rgba(255, 180, 195, 1.0)');
  grad.addColorStop(0.4, 'rgba(230, 20, 45, 0.90)');
  grad.addColorStop(0.75, 'rgba(140, 0, 15, 0.40)');
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

const isMobile = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

export class BroadRedFog {
  constructor(scene) {
    this.scene = scene;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.texture = createBroadFogTexture();
    this.fogCount = isMobile ? 35 : 85;
    this.fogParticles = [];

    this._createBroadFog();
  }

  _createBroadFog() {
    const geo = new THREE.PlaneGeometry(1, 1);

    const fogColors = [
      new THREE.Color(0x7a000e),
      new THREE.Color(0x570009),
      new THREE.Color(0x940013),
      new THREE.Color(0x380005),
      new THREE.Color(0x6b000b),
    ];

    for (let i = 0; i < this.fogCount; i++) {
      const color = fogColors[i % fogColors.length];

      const mat = new THREE.MeshBasicMaterial({
        map: this.texture,
        color: color,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 0,
      });

      const mesh = new THREE.Mesh(geo, mat);

      const x = (Math.random() - 0.5) * 26.0;
      const z = (Math.random() - 0.5) * 26.0;
      const y = 0.05 + Math.random() * 3.4;

      mesh.position.set(x, y, z);

      const scaleX = 7.0 + Math.random() * 7.0;
      const scaleY = 4.5 + Math.random() * 5.0;
      mesh.scale.set(scaleX, scaleY, 1.0);
      mesh.rotation.z = Math.random() * Math.PI * 2;

      this.group.add(mesh);

      const driftSpeedX = (Math.random() - 0.5) * 0.16;
      const driftSpeedZ = (Math.random() - 0.5) * 0.16;
      const rotSpeed = (Math.random() - 0.5) * 0.04;

      const maxOpacity = 0.07 + Math.random() * 0.08;

      this.fogParticles.push({
        mesh,
        material: mat,
        baseX: x,
        baseY: y,
        baseZ: z,
        x,
        y,
        z,
        baseScaleX: scaleX,
        baseScaleY: scaleY,
        driftSpeedX,
        driftSpeedZ,
        rotSpeed,
        maxOpacity,
        wobblePhase: Math.random() * Math.PI * 2,
      });
    }
  }

  update(elapsedTime, deltaTime, camera) {
    if (!deltaTime) deltaTime = 0.016;

    for (let i = 0; i < this.fogCount; i++) {
      const f = this.fogParticles[i];

      f.x += f.driftSpeedX * deltaTime;
      f.z += f.driftSpeedZ * deltaTime;

      if (f.x > 13.5) f.x = -13.5;
      if (f.x < -13.5) f.x = 13.5;
      if (f.z > 13.5) f.z = -13.5;
      if (f.z < -13.5) f.z = 13.5;

      const waveY = Math.sin(elapsedTime * 0.5 + f.wobblePhase) * 0.16;
      const waveX = Math.cos(elapsedTime * 0.35 + f.wobblePhase) * 0.14;

      f.mesh.position.set(f.x + waveX, f.y + waveY, f.z);
      f.mesh.rotation.z += f.rotSpeed * deltaTime;

      const breathe = 0.88 + Math.sin(elapsedTime * 0.7 + f.wobblePhase) * 0.12;

      const distFromCenter = Math.sqrt(f.x * f.x + f.z * f.z);
      const edgeFade = Math.max(0, 1.0 - Math.pow(distFromCenter / 14.0, 2));

      f.material.opacity = Math.max(0, f.maxOpacity * breathe * edgeFade);

      if (camera) {
        f.mesh.quaternion.copy(camera.quaternion);
      }
    }
  }

  dispose() {
    if (this.group) {
      this.scene.remove(this.group);
    }
    if (this.texture) this.texture.dispose();
  }
}

export class CharacterAura {
  constructor(scene, targetPosition = new THREE.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.targetPosition = targetPosition.clone();

    this.group = new THREE.Group();
    this.group.position.copy(this.targetPosition);
    this.scene.add(this.group);

    this.auraGroup = new THREE.Group();
    this.auraGroup.position.set(...RING_CONFIG.ring.position);
    this.auraGroup.rotation.set(...RING_CONFIG.ring.rotation);
    this.group.add(this.auraGroup);

    this.smokeTexture = createWispyDarkBloodSmokeTexture();
    this.emberTexture = createShinyFireSparkTexture();

    this.broadFog = null;
    if (RING_CONFIG.showBroadFog) {
      this.broadFog = new BroadRedFog(scene);
    }

    this.smokeCount = isMobile ? 60 : 320;
    this.smokeParticles = [];

    this.emberCount = isMobile ? 50 : 280;
    this.emberGeometry = null;
    this.emberMaterial = null;
    this.emberPoints = null;
    this.emberData = [];

    this.guideRingMesh = null;
    this.wingNodes = [];
    this.modelChecked = false;

    if (RING_CONFIG.showGuideRing) {
      this._createGuideRingMesh();
    }

    this._createHornWingSmokeSystem();
    this._createDarkEmberSystem();
  }

  _createGuideRingMesh() {
    const geo = new THREE.TorusGeometry(
      RING_CONFIG.ring.radius,
      RING_CONFIG.ring.tube,
      16,
      64
    );
    const mat = new THREE.MeshBasicMaterial({
      color: RING_CONFIG.ring.color,
      wireframe: false,
    });
    this.guideRingMesh = new THREE.Mesh(geo, mat);
    this.auraGroup.add(this.guideRingMesh);
  }

  _detectWingNodes(model) {
    if (!model || this.modelChecked) return;
    this.modelChecked = true;

    this.wingNodes = [];
    model.traverse((child) => {
      const name = (child.name || '').toLowerCase();
      if (name.includes('wing') || name.includes('sayap') || name.includes('feather')) {
        this.wingNodes.push(child);
      }
    });
  }

  _createHornWingSmokeSystem() {
    const geo = new THREE.PlaneGeometry(0.20, 0.45);

    const colors = [
      new THREE.Color(0x80000d),
      new THREE.Color(0x59000a),
      new THREE.Color(0x400006),
      new THREE.Color(0x990010),
      new THREE.Color(0x2d0004),
    ];

    const R = RING_CONFIG.ring.radius;

    for (let i = 0; i < this.smokeCount; i++) {
      const color = colors[i % colors.length];

      const mat = new THREE.MeshBasicMaterial({
        map: this.smokeTexture,
        color: color,
        transparent: true,
        blending: THREE.NormalBlending,
        depthWrite: false,
        opacity: 0,
      });

      const mesh = new THREE.Mesh(geo, mat);
      const isLeft = i % 2 === 0;

      const particleIdx = Math.floor(i / 2);
      const totalPerSide = this.smokeCount / 2;
      const theta = (0.08 + (particleIdx / totalPerSide) * 0.82) * Math.PI;

      const radialJitter = (Math.random() - 0.5) * 0.05;
      const radius = R + radialJitter;

      const lx = (isLeft ? -1 : 1) * Math.sin(theta) * radius;
      const ly = -Math.cos(theta) * radius;
      const lz = (Math.random() - 0.5) * 0.04;

      mesh.position.set(lx, ly, lz);

      const scaleX = 0.14 + Math.random() * 0.12;
      const scaleY = 0.22 + Math.random() * 0.18;
      mesh.scale.set(scaleX, scaleY, 1.0);

      const arcTangentAngle = (isLeft ? -1 : 1) * (theta - Math.PI / 2);
      mesh.rotation.z = arcTangentAngle + (Math.random() - 0.5) * 0.20;

      this.auraGroup.add(mesh);

      this.smokeParticles.push({
        mesh,
        material: mat,
        isLeft,
        baseX: lx,
        baseY: ly,
        baseZ: lz,
        x: lx,
        y: ly,
        z: lz,
        baseScaleX: scaleX,
        baseScaleY: scaleY,
        rotSpeed: (Math.random() - 0.5) * 0.16,
        driftX: (isLeft ? -1 : 1) * (0.015 + Math.random() * 0.035),
        upSpeed: 0.10 + Math.random() * 0.15,
        driftZ: -0.01 - Math.random() * 0.02,
        maxOpacity: 0.28 + Math.random() * 0.20,
        life: Math.random(),
      });
    }
  }

  _createDarkEmberSystem() {
    this.emberGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(this.emberCount * 3);
    const colors = new Float32Array(this.emberCount * 3);

    const sparkColors = [
      new THREE.Color(0xff2a45),
      new THREE.Color(0xd9001d),
      new THREE.Color(0xff6680),
      new THREE.Color(0x990012),
      new THREE.Color(0xff4d66),
    ];

    const R = RING_CONFIG.ring.radius;

    for (let i = 0; i < this.emberCount; i++) {
      const isLeft = i % 2 === 0;
      const theta = (0.08 + Math.random() * 0.82) * Math.PI;
      const radius = R + (Math.random() - 0.5) * 0.06;

      const lx = (isLeft ? -1 : 1) * Math.sin(theta) * radius;
      const ly = -Math.cos(theta) * radius;
      const lz = (Math.random() - 0.5) * 0.04;

      positions[i * 3 + 0] = lx;
      positions[i * 3 + 1] = ly;
      positions[i * 3 + 2] = lz;

      const color = sparkColors[i % sparkColors.length];
      colors[i * 3 + 0] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      this.emberData.push({
        isLeft,
        baseX: lx,
        baseY: ly,
        baseZ: lz,
        baseColor: color.clone(),
        x: lx,
        y: ly,
        z: lz,
        vy: 0.14 + Math.random() * 0.30,
        vx: (isLeft ? -1 : 1) * (0.015 + Math.random() * 0.045),
        vz: -0.01 - Math.random() * 0.03,
        twinklePhase: Math.random() * Math.PI * 2,
        life: Math.random(),
      });
    }

    this.emberGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.emberGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    this.emberMaterial = new THREE.PointsMaterial({
      size: 0.040,
      map: this.emberTexture,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexColors: true,
      sizeAttenuation: true,
      opacity: 0.95,
    });

    this.emberPoints = new THREE.Points(this.emberGeometry, this.emberMaterial);
    this.auraGroup.add(this.emberPoints);
  }

  update(elapsedTime, deltaTime, camera, model) {
    if (!deltaTime) deltaTime = 0.016;

    if (model && !this.modelChecked) {
      this._detectWingNodes(model);
    }

    if (this.broadFog) {
      this.broadFog.update(elapsedTime, deltaTime, camera);
    }

    if (this.auraGroup) {
      this.auraGroup.position.set(...RING_CONFIG.ring.position);
      this.auraGroup.rotation.set(...RING_CONFIG.ring.rotation);
    }

    for (let i = 0; i < this.smokeCount; i++) {
      const p = this.smokeParticles[i];

      p.life += deltaTime * 0.38;
      if (p.life >= 1.0) {
        p.life %= 1.0;
      }

      const progress = p.life;
      const lifetime = 1.0 / 0.38;

      const curX = p.baseX + p.driftX * lifetime * progress;
      const curY = p.baseY + p.upSpeed * lifetime * progress;
      const curZ = p.baseZ + p.driftZ * lifetime * progress;

      p.mesh.position.set(
        curX + Math.sin(elapsedTime * 1.8 + i) * 0.015,
        curY,
        curZ
      );

      p.mesh.rotation.z += p.rotSpeed * deltaTime;

      const currentScaleX = p.baseScaleX * (1.0 + progress * 0.5);
      const currentScaleY = p.baseScaleY * (1.0 + progress * 0.7);
      p.mesh.scale.set(currentScaleX, currentScaleY, 1.0);

      let opacity = 0;
      if (progress < 0.25) {
        opacity = (progress / 0.25) * p.maxOpacity;
      } else if (progress < 0.70) {
        opacity = p.maxOpacity;
      } else {
        opacity = Math.max(0, (1.0 - progress) / 0.30) * p.maxOpacity;
      }

      p.material.opacity = Math.max(0, opacity);

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }
    }

    if (this.emberGeometry) {
      const posAttr = this.emberGeometry.getAttribute('position');
      const colorAttr = this.emberGeometry.getAttribute('color');
      const positions = posAttr.array;
      const colors = colorAttr.array;

      for (let i = 0; i < this.emberCount; i++) {
        const e = this.emberData[i];
        e.life += deltaTime * 0.55;
        if (e.life >= 1.0) {
          e.life %= 1.0;
        }

        const progress = e.life;
        const lifetime = 1.0 / 0.55;

        const curX = e.baseX + e.vx * lifetime * progress;
        const curY = e.baseY + e.vy * lifetime * progress;
        const curZ = e.baseZ + e.vz * lifetime * progress;

        positions[i * 3 + 0] = curX + Math.sin(elapsedTime * 3.0 + i) * 0.012;
        positions[i * 3 + 1] = curY;
        positions[i * 3 + 2] = curZ;

        let fade = 0;
        if (progress < 0.20) {
          fade = progress / 0.20;
        } else if (progress < 0.75) {
          fade = 1.0;
        } else {
          fade = Math.max(0, (1.0 - progress) / 0.25);
        }

        colors[i * 3 + 0] = e.baseColor.r * fade;
        colors[i * 3 + 1] = e.baseColor.g * fade;
        colors[i * 3 + 2] = e.baseColor.b * fade;
      }

      posAttr.needsUpdate = true;
      if (colorAttr) colorAttr.needsUpdate = true;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  dispose() {
    if (this.broadFog) {
      this.broadFog.dispose();
    }
    if (this.group) {
      this.scene.remove(this.group);
    }
    if (this.smokeTexture) this.smokeTexture.dispose();
    if (this.emberTexture) this.emberTexture.dispose();
    if (this.guideRingMesh) {
      this.guideRingMesh.geometry.dispose();
      this.guideRingMesh.material.dispose();
    }
  }
}
