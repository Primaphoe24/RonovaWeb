import * as THREE from 'three';

/**
 * USER CONFIGURABLE HORN/WING AURA REFERENCE PARAMETERS
 * Positioned and scaled exactly according to user specifications!
 */
export const RING_CONFIG = {
  ring: {
    position: [0, 1.4, -0.62],        // [X, Y, Z] Exact user base position on GLB wing root/spine
    rotation: [-0.25, 0, 0],          // [RotX, RotY, RotZ] Exact user rotation in radians
    radius: 0.44,                     // Exact user ring radius (0.44m)
    tube: 0.015,                      // Guide tube thickness
    color: 0xff0033,                  // Color
  },
  showGuideRing: false,               // Set to true if you want to display the solid guide ring mesh
};

/**
 * Creates realistic, thin, elongated wispy smoke texture.
 * Fuses deep dark blood-red core with charcoal shadow black edges (no bright pink or light red!).
 */
function createWispyDarkBloodSmokeTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 512, 512);

  // 1. Dark Charcoal Black Outer Shadow Layer (Elongated wisps)
  const blackWisps = [
    { x: 256, y: 260, rx: 140, ry: 200, a: 0.90 },
    { x: 210, y: 210, rx: 100, ry: 160, a: 0.75 },
    { x: 302, y: 200, rx: 110, ry: 170, a: 0.75 },
    { x: 256, y: 140, rx: 90,  ry: 130, a: 0.65 },
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

  // 2. Deep Dark Blood-Red Core Layer (Dark blood red, no bright light red!)
  const bloodWisps = [
    { x: 256, y: 250, rx: 85, ry: 130, a: 0.90 },
    { x: 225, y: 200, rx: 65, ry: 100, a: 0.80 },
    { x: 287, y: 190, rx: 70, ry: 105, a: 0.80 },
    { x: 256, y: 140, rx: 50, ry: 80,  a: 0.65 },
  ];

  bloodWisps.forEach(({ x, y, rx, ry, a }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, ry / rx);
    const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
    grad.addColorStop(0.0, `rgba(140, 0, 15, ${a})`);    // Deep dark blood red
    grad.addColorStop(0.4, `rgba(90, 0, 10, ${a * 0.8})`); // Dark crimson blood
    grad.addColorStop(0.8, `rgba(45, 0, 5, ${a * 0.35})`); // Dark maroon shadow
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

/**
 * Creates a glistening, shiny fire spark texture with an intense white diamond core.
 */
function createShinyFireSparkTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, 128, 128);

  const cx = 64;
  const cy = 64;

  const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, 64);
  grad.addColorStop(0.0, 'rgba(255, 255, 255, 1.0)');  // Intense white diamond core
  grad.addColorStop(0.15, 'rgba(255, 180, 195, 1.0)'); // Glowing inner halo
  grad.addColorStop(0.4, 'rgba(230, 20, 45, 0.90)');   // Bright blood-red sparkle
  grad.addColorStop(0.75, 'rgba(140, 0, 15, 0.40)');  // Dark red border
  grad.addColorStop(1.0, 'rgba(0, 0, 0, 0)');

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(cx, cy, 64, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export class CharacterAura {
  constructor(scene, targetPosition = new THREE.Vector3(0, 0, 0)) {
    this.scene = scene;
    this.targetPosition = targetPosition.clone();

    // Root Group
    this.group = new THREE.Group();
    this.group.position.copy(this.targetPosition);
    this.scene.add(this.group);

    // Aura Transform Group (Positioned & Rotated according to user RING_CONFIG)
    this.auraGroup = new THREE.Group();
    this.auraGroup.position.set(...RING_CONFIG.ring.position);
    this.auraGroup.rotation.set(...RING_CONFIG.ring.rotation);
    this.group.add(this.auraGroup);

    this.smokeTexture = createWispyDarkBloodSmokeTexture();
    this.emberTexture = createShinyFireSparkTexture();

    // 160 thin wispy smoke plumes
    this.smokeCount = 160;
    this.smokeParticles = [];

    // 130 shiny glistening fire spark dots
    this.emberCount = 130;
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

    if (this.wingNodes.length > 0) {
      console.info(`[CharacterAura] Detected ${this.wingNodes.length} wing node(s) in GLB model.`);
    }
  }

  _createHornWingSmokeSystem() {
    // Thin elongated wispy plane geometry (no large bulky planes!)
    const geo = new THREE.PlaneGeometry(0.20, 0.45);

    // Deep dark blood red color spectrum (no bright light red!)
    const colors = [
      new THREE.Color(0x80000d), // Deep blood red
      new THREE.Color(0x59000a), // Dark crimson blood
      new THREE.Color(0x400006), // Dark maroon shadow
      new THREE.Color(0x990010), // Rich dark blood
      new THREE.Color(0x2d0004), // Dark shadow blood
    ];

    const R = RING_CONFIG.ring.radius; // 0.44m

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

      // Crescent wing arching path around the user's ring radius (0.44m)
      const particleIdx = Math.floor(i / 2);
      const totalPerSide = this.smokeCount / 2;
      const theta = (0.08 + (particleIdx / totalPerSide) * 0.82) * Math.PI;

      const radialJitter = (Math.random() - 0.5) * 0.05;
      const radius = R + radialJitter;

      // Horn circle arc local coordinates
      const lx = (isLeft ? -1 : 1) * Math.sin(theta) * radius;
      const ly = -Math.cos(theta) * radius;
      const lz = (Math.random() - 0.5) * 0.04;

      mesh.position.set(lx, ly, lz);

      // Compact, thin particle scale for realistic wispy smoke
      const scaleX = 0.14 + Math.random() * 0.12;
      const scaleY = 0.22 + Math.random() * 0.18;
      mesh.scale.set(scaleX, scaleY, 1.0);

      // Rotate particle along tangent of the ring circle
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

    // Glistening shiny blood red fire spark colors
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

    // Additive blending for glistening shiny fire sparks!
    this.emberMaterial = new THREE.PointsMaterial({
      size: 0.040, // Sharp glistening spark size
      map: this.emberTexture,
      transparent: true,
      blending: THREE.AdditiveBlending, // Shiny glistening fire spark effect!
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

    // Keep auraGroup transform synced to user RING_CONFIG
    if (this.auraGroup) {
      this.auraGroup.position.set(...RING_CONFIG.ring.position);
      this.auraGroup.rotation.set(...RING_CONFIG.ring.rotation);
    }

    // 1. Update Realistic Wispy Smoke Plumes
    for (let i = 0; i < this.smokeCount; i++) {
      const p = this.smokeParticles[i];

      p.life += deltaTime * 0.38;

      p.y += p.upSpeed * deltaTime;
      p.x += p.driftX * deltaTime;
      p.z += p.driftZ * deltaTime;

      const progress = p.life;

      p.mesh.position.set(
        p.x + Math.sin(elapsedTime * 1.8 + i) * 0.015,
        p.y,
        p.z
      );

      p.mesh.rotation.z += p.rotSpeed * deltaTime;

      const currentScaleX = p.baseScaleX * (1.0 + progress * 0.5);
      const currentScaleY = p.baseScaleY * (1.0 + progress * 0.7);
      p.mesh.scale.set(currentScaleX, currentScaleY, 1.0);

      let opacity = 0;
      if (progress < 0.2) {
        opacity = (progress / 0.2) * p.maxOpacity;
      } else if (progress < 0.75) {
        opacity = p.maxOpacity;
      } else if (progress <= 1.0) {
        opacity = (1.0 - (progress - 0.75) / 0.25) * p.maxOpacity;
      }

      p.material.opacity = Math.max(0, opacity);

      if (camera) {
        p.mesh.quaternion.copy(camera.quaternion);
      }

      if (progress >= 1.0) {
        p.life = 0;
        p.x = p.baseX;
        p.y = p.baseY;
        p.z = p.baseZ;
      }
    }

    // 2. Update Glistening Sparkling Fire Embers
    if (this.emberGeometry) {
      const posAttr = this.emberGeometry.getAttribute('position');
      const positions = posAttr.array;

      for (let i = 0; i < this.emberCount; i++) {
        const e = this.emberData[i];
        e.life += deltaTime * 0.55;

        e.y += e.vy * deltaTime;
        e.x += e.vx * deltaTime;
        e.z += e.vz * deltaTime;

        positions[i * 3 + 0] = e.x + Math.sin(elapsedTime * 3.0 + i) * 0.012;
        positions[i * 3 + 1] = e.y;
        positions[i * 3 + 2] = e.z;

        if (e.life >= 1.0) {
          e.life = 0;
          e.x = e.baseX;
          e.y = e.baseY;
          e.z = e.baseZ;
        }
      }

      posAttr.needsUpdate = true;
    }
  }

  setPosition(x, y, z) {
    this.group.position.set(x, y, z);
  }

  dispose() {
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
