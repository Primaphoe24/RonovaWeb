import * as THREE from 'three';

export class ParticleSystem {
  constructor(scene) {
    this.scene = scene;
    this.instancedMesh = null;
    this.particleCount = 5000;
    this.particleData = [];
    this.dummy = new THREE.Object3D();

    this._create();
  }

  _create() {
    const baseGeo = new THREE.OctahedronGeometry(0.04, 0);
    baseGeo.scale(0.6, 1.8, 0.6);

    const material = new THREE.MeshStandardMaterial({
      color: 0x990000,
      emissive: 0x330005,
      emissiveIntensity: 0.4,
      roughness: 0.08,
      metalness: 0.9,
      flatShading: true,
    });

    this.instancedMesh = new THREE.InstancedMesh(baseGeo, material, this.particleCount);
    this.instancedMesh.castShadow = true;
    this.instancedMesh.receiveShadow = false;

    const bloodColors = [
      new THREE.Color(0x3a0005),
      new THREE.Color(0x8b0000),
      new THREE.Color(0xcc0000),
      new THREE.Color(0xff002b),
      new THREE.Color(0x50000a),
    ];

    for (let i = 0; i < this.particleCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 18,
        Math.random() * 12,
        (Math.random() - 0.5) * 18
      );

      const rotation = new THREE.Euler(
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2,
        Math.random() * Math.PI * 2
      );

      const scaleVal = Math.random() * 0.5 + 0.2;
      const scale = new THREE.Vector3(scaleVal, scaleVal * (Math.random() * 0.8 + 0.8), scaleVal);

      const velocity = new THREE.Vector3(
        (Math.random() - 0.5) * 0.008,
        Math.random() * 0.008 + 0.003,
        (Math.random() - 0.5) * 0.008
      );

      const rotSpeed = new THREE.Vector3(
        (Math.random() - 0.5) * 0.03,
        (Math.random() - 0.5) * 0.04,
        (Math.random() - 0.5) * 0.03
      );

      this.particleData.push({
        position,
        rotation,
        scale,
        velocity,
        rotSpeed,
      });

      const color = bloodColors[Math.floor(Math.random() * bloodColors.length)];
      this.instancedMesh.setColorAt(i, color);

      this.dummy.position.copy(position);
      this.dummy.rotation.copy(rotation);
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

  update(time) {
    if (!this.instancedMesh) return;

    for (let i = 0; i < this.particleCount; i++) {
      const p = this.particleData[i];

      p.position.x += p.velocity.x + Math.sin(time * 1.5 + p.position.y) * 0.003;
      p.position.y += p.velocity.y;
      p.position.z += p.velocity.z + Math.cos(time * 1.5 + p.position.x) * 0.003;

      p.rotation.x += p.rotSpeed.x;
      p.rotation.y += p.rotSpeed.y;
      p.rotation.z += p.rotSpeed.z;

      if (p.position.y > 12) {
        p.position.y = 0;
        p.position.x = (Math.random() - 0.5) * 18;
        p.position.z = (Math.random() - 0.5) * 18;
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
    if (this.instancedMesh) {
      this.instancedMesh.geometry.dispose();
      this.instancedMesh.material.dispose();
      this.scene.remove(this.instancedMesh);
    }
  }
}
