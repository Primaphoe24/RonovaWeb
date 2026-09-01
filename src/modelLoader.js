import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.mixer = null;
    this.animations = [];
    this.actions = [];
    this.model = null;
    this.clock = new THREE.Clock();

    this.timeScale = 1.0;
    this.isPaused = false;

    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  async load(path, options = {}, onProgress = null) {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => {
          const model = gltf.scene;

          const { position = [0, 0, 0], scale = 1, rotation = [0, 0, 0] } = options;
          model.position.set(...position);
          
          if (typeof scale === 'number') {
            model.scale.setScalar(scale);
          } else {
            model.scale.set(...scale);
          }
          
          model.rotation.set(...rotation);

          model.traverse((child) => {
            if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              if (child.geometry && !child.geometry.attributes.normal) {
                child.geometry.computeVertexNormals();
              }

              if (child.material) {
                child.material.envMapIntensity = 1.0;
                child.material.dithering = true;
                child.material.shadowSide = THREE.FrontSide;
              }
            }
          });

          if (gltf.animations && gltf.animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(model);
            this.animations = gltf.animations;
            this.playAllAnimations();
          }

          this.model = model;
          this.scene.add(model);

          resolve({ model, animations: gltf.animations || [] });
        },
        (xhr) => {
          if (onProgress) {
            if (xhr.total && xhr.total > 0) {
              const percent = Math.round((xhr.loaded / xhr.total) * 100);
              onProgress(percent);
            } else if (xhr.loaded > 0) {
              onProgress(50);
            }
          }
        },
        (error) => {
          console.error('Error loading model:', error);
          reject(error);
        }
      );
    });
  }

  playAllAnimations() {
    if (!this.mixer || !this.animations || this.animations.length === 0) return;

    this.actions = [];
    this.animations.forEach((clip) => {
      const action = this.mixer.clipAction(clip);
      action.setLoop(THREE.LoopRepeat, Infinity);
      action.timeScale = this.timeScale;
      action.reset().play();
      this.actions.push(action);
    });
  }

  playAnimation(index = null) {
    if (index === null || index === undefined) {
      this.playAllAnimations();
      return;
    }
    if (!this.mixer || index >= this.animations.length) return;

    const clip = this.animations[index];
    const action = this.mixer.clipAction(clip);
    action.setLoop(THREE.LoopRepeat, Infinity);
    action.timeScale = this.timeScale;
    action.reset().play();
    if (!this.actions.includes(action)) {
      this.actions.push(action);
    }
  }

  setSpeed(speed) {
    this.timeScale = speed;
    if (this.actions) {
      this.actions.forEach((action) => {
        action.timeScale = speed;
      });
    }
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  getAnimationTimeInfo() {
    if (!this.actions || this.actions.length === 0) return { time: 0, duration: 0 };
    return {
      time: this.actions[0].time,
      duration: this.actions[0].getClip().duration,
    };
  }

  getAnimationNames() {
    return this.animations.map((clip) => clip.name);
  }

  update() {
    if (!this.mixer || this.isPaused) return;

    const delta = this.clock.getDelta();
    this.mixer.update(delta);
  }

  dispose() {
    if (this.model) {
      this.scene.remove(this.model);
      this.model.traverse((child) => {
        if (child.isMesh) {
          child.geometry.dispose();
          if (child.material.map) child.material.map.dispose();
          child.material.dispose();
        }
      });
    }
    if (this.mixer) {
      this.mixer.stopAllAction();
    }
    this.actions = [];
  }
}
