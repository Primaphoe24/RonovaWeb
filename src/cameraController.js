import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import gsap from 'gsap';

const CAMERA_PRESETS = {
  default: {
    position: new THREE.Vector3(-0.7, 1.2, 1.0),
    target: new THREE.Vector3(0, 1.45, 0),
  },
  front: {
    position: new THREE.Vector3(0, 2.0, 5.0),
    target: new THREE.Vector3(0, 1.25, 0),
  },
  back: {
    position: new THREE.Vector3(0, 2.0, -5.0),
    target: new THREE.Vector3(0, 1.25, 0),
  },
  side: {
    position: new THREE.Vector3(5.0, 2.0, 0),
    target: new THREE.Vector3(0, 1.25, 0),
  },
  top: {
    position: new THREE.Vector3(0, 9.0, 3.0),
    target: new THREE.Vector3(0, 0.75, 0),
  },
  closeup: {
    position: new THREE.Vector3(0.8, 2.4, 2.2),
    target: new THREE.Vector3(0, 1.75, 0),
  },
};

export class CameraController {
  constructor(camera, canvas) {
    this.camera = camera;
    this.canvas = canvas;
    this.isAutoOrbit = false;
    this.autoOrbitSpeed = 0.3;
    this.autoOrbitAngle = 0;
    this.autoOrbitRadius = 5;
    this.autoOrbitHeight = 2.4;
    this.isTransitioning = false;
    this.currentPreset = 'default';

    this.controls = new OrbitControls(camera, canvas);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.08;
    this.controls.enablePan = false;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 15;
    this.controls.maxPolarAngle = Math.PI * 0.85;
    this.controls.target.copy(CAMERA_PRESETS.default.target);

    this.camera.position.copy(CAMERA_PRESETS.default.position);
    this.controls.update();
  }

  goToPreset(presetName, duration = 2) {
    const preset = CAMERA_PRESETS[presetName];
    if (!preset) return;

    this.stopAutoOrbit();
    this.isTransitioning = true;
    this.currentPreset = presetName;
    this.controls.enabled = false;

    gsap.killTweensOf(this.camera.position);
    gsap.killTweensOf(this.controls.target);

    gsap.to(this.camera.position, {
      x: preset.position.x,
      y: preset.position.y,
      z: preset.position.z,
      duration: duration,
      ease: 'power3.inOut',
      onComplete: () => {
        this.camera.position.copy(preset.position);
        this.controls.target.copy(preset.target);
        this.camera.lookAt(preset.target);
        this.controls.enabled = true;
        this.controls.update();
        this.isTransitioning = false;
      },
    });

    gsap.to(this.controls.target, {
      x: preset.target.x,
      y: preset.target.y,
      z: preset.target.z,
      duration: duration,
      ease: 'power3.inOut',
      onUpdate: () => {
        this.camera.lookAt(this.controls.target);
      },
    });
  }

  startAutoOrbit() {
    this.isAutoOrbit = true;
    this.currentPreset = 'orbit';

    this.autoOrbitAngle = Math.atan2(
      this.camera.position.x,
      this.camera.position.z
    );
    this.autoOrbitRadius = Math.sqrt(
      this.camera.position.x ** 2 + this.camera.position.z ** 2
    );
    this.autoOrbitHeight = this.camera.position.y;

    gsap.to(this, {
      autoOrbitHeight: 2.4,
      autoOrbitRadius: 5.0,
      duration: 1.5,
      ease: 'power2.inOut',
    });
  }

  stopAutoOrbit() {
    this.isAutoOrbit = false;
  }

  update(deltaTime) {
    if (this.isAutoOrbit && !this.isTransitioning) {
      this.autoOrbitAngle += this.autoOrbitSpeed * deltaTime;

      this.camera.position.x = Math.sin(this.autoOrbitAngle) * this.autoOrbitRadius;
      this.camera.position.z = Math.cos(this.autoOrbitAngle) * this.autoOrbitRadius;
      this.camera.position.y = this.autoOrbitHeight;

      this.controls.target.set(0, 1.6, 0);
    }

    this.controls.update();
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }

  dispose() {
    this.controls.dispose();
  }
}
