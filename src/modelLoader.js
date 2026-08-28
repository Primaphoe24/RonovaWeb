import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.mixer = null;
    this.animations = [];
    this.model = null;
    this.clock = new THREE.Clock();

    this.startTime = 1.0;
    this.endTime = 0;
    this.loopBlendDuration = 0.35;
    this.timeScale = 1.0;
    this.isPaused = false;

    this.actionA = null;
    this.actionB = null;
    this.activeAction = null;
    this.inactiveAction = null;
    this.isCrossfading = false;

    this.loader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
    this.loader.setDRACOLoader(dracoLoader);
  }

  async load(path, options = {}, onProgress = null) {
    if (options.startTime !== undefined) this.startTime = options.startTime;
    if (options.endTime !== undefined) this.endTime = options.endTime;
    if (options.loopBlendDuration !== undefined) this.loopBlendDuration = options.loopBlendDuration;

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
            this.playAnimation(0, 0.5, this.startTime, this.endTime, this.loopBlendDuration);
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

  playAnimation(index = 0, fadeTime = 0.5, startTime = this.startTime, endTime = this.endTime, loopBlendDuration = this.loopBlendDuration) {
    if (!this.mixer || index >= this.animations.length) return;

    this.startTime = startTime;
    this.endTime = endTime;
    this.loopBlendDuration = loopBlendDuration;

    const mainClip = this.animations[index];
    const cloneClip = mainClip.clone();
    cloneClip.name = mainClip.name + '_loop_clone';

    this.actionA = this.mixer.clipAction(mainClip);
    this.actionB = this.mixer.clipAction(cloneClip);

    this.actionA.setLoop(THREE.LoopRepeat, Infinity);
    this.actionB.setLoop(THREE.LoopRepeat, Infinity);
    this.actionA.timeScale = this.timeScale;
    this.actionB.timeScale = this.timeScale;

    if (this.activeAction) {
      this.activeAction.fadeOut(fadeTime);
    }

    this.activeAction = this.actionA;
    this.inactiveAction = this.actionB;

    this.activeAction.reset();
    this.activeAction.time = this.startTime;
    this.activeAction.fadeIn(fadeTime).play();

    this.mixer.update(0.001);
    this.isCrossfading = false;
  }

  setAnimationRange(start, end, blendDuration = this.loopBlendDuration) {
    this.startTime = Math.max(0, start);
    this.endTime = Math.max(0, end);
    this.loopBlendDuration = Math.max(0, blendDuration);

    if (this.activeAction) {
      const clipDuration = this.activeAction.getClip().duration;
      const effectiveEnd = (this.endTime > 0 && this.endTime < clipDuration) ? this.endTime : clipDuration;

      if (this.activeAction.time < this.startTime || this.activeAction.time >= effectiveEnd) {
        this.activeAction.time = this.startTime;
        if (this.mixer) this.mixer.update(0);
      }
    }
  }

  setSpeed(speed) {
    this.timeScale = speed;
    if (this.actionA) this.actionA.timeScale = speed;
    if (this.actionB) this.actionB.timeScale = speed;
  }

  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }

  getAnimationTimeInfo() {
    if (!this.activeAction) return { time: 0, duration: 0 };
    return {
      time: this.activeAction.time,
      duration: this.activeAction.getClip().duration,
    };
  }

  getAnimationNames() {
    return this.animations.map((clip) => clip.name);
  }

  update() {
    if (!this.mixer || this.isPaused || !this.activeAction) return;

    const delta = this.clock.getDelta();
    this.mixer.update(delta);

    const clipDuration = this.activeAction.getClip().duration;
    const effectiveEnd = (this.endTime > 0 && this.endTime < clipDuration)
      ? this.endTime
      : clipDuration;

    const totalRange = effectiveEnd - this.startTime;
    const blendDur = Math.min(this.loopBlendDuration, totalRange * 0.45);

    if (totalRange > 0 && blendDur > 0.05) {
      const timeRemaining = effectiveEnd - this.activeAction.time;

      if (timeRemaining <= blendDur && !this.isCrossfading && this.activeAction.time >= this.startTime) {
        this.isCrossfading = true;

        this.inactiveAction.reset();
        this.inactiveAction.timeScale = this.timeScale;
        this.inactiveAction.time = this.startTime;
        this.inactiveAction.enabled = true;
        this.inactiveAction.setEffectiveWeight(1.0);
        this.inactiveAction.setEffectiveTimeScale(1.0);

        this.inactiveAction.crossFadeFrom(this.activeAction, blendDur, false);
        this.inactiveAction.play();

        const temp = this.activeAction;
        this.activeAction = this.inactiveAction;
        this.inactiveAction = temp;
      }

      if (this.isCrossfading && (effectiveEnd - this.inactiveAction.time <= 0 || this.activeAction.time > this.startTime + blendDur)) {
        this.isCrossfading = false;
        this.inactiveAction.stop();
      }
    } else if (totalRange > 0) {
      if (this.activeAction.time >= effectiveEnd || this.activeAction.time < this.startTime) {
        this.activeAction.time = this.startTime;
        this.mixer.update(0);
      }
    }
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
  }
}
