import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

export class ModelLoader {
  constructor(scene) {
    this.scene = scene;
    this.mixer = null;
    this.animations = [];
    this.actions = [];
    this.loopPairs = [];
    this.model = null;
    this.clock = new THREE.Clock();

    this.timeScale = 1.0;
    this.isPaused = false;
    this.startTime = 0;
    this.endTime = 0;
    this.loopBlendDuration = 0.5;

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

          const {
            position = [0, 0, 0],
            scale = 1,
            rotation = [0, 0, 0],
            startTime = 0,
            endTime = 0,
            speed = 1.25,
            loopBlendDuration = 0.5,
          } = options;

          this.startTime = startTime;
          this.endTime = endTime;
          this.timeScale = speed;
          this.loopBlendDuration = loopBlendDuration;

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

    if (this.actions) {
      this.actions.forEach((a) => a.stop());
    }
    this.actions = [];
    this.loopPairs = [];

    this.animations.forEach((clip) => {
      const clipStartTime = this.startTime;
      const clipEndTime = (this.endTime > 0 && this.endTime > this.startTime) ? this.endTime : clip.duration;

      if (this.loopBlendDuration > 0 && clipEndTime > clipStartTime) {
        const clipA = clip;
        const clipB = clip.clone();
        clipB.name = clip.name + '_b';

        const actionA = this.mixer.clipAction(clipA);
        const actionB = this.mixer.clipAction(clipB);

        [actionA, actionB].forEach((action) => {
          action.setLoop(THREE.LoopRepeat, Infinity);
          action.timeScale = this.timeScale;
          action.enabled = true;
        });

        actionA.setEffectiveWeight(1.0);
        actionA.time = clipStartTime;
        actionA.play();

        actionB.setEffectiveWeight(0.0);
        actionB.time = clipStartTime;
        actionB.stop();

        this.actions.push(actionA, actionB);
        this.loopPairs.push({
          actionA,
          actionB,
          activeIndex: 0,
          isBlending: false,
          clipStartTime,
          clipEndTime,
        });
      } else {
        const action = this.mixer.clipAction(clip);
        action.setLoop(THREE.LoopRepeat, Infinity);
        action.timeScale = this.timeScale;
        action.reset();
        if (clipStartTime > 0) {
          action.time = clipStartTime;
        }
        action.play();
        this.actions.push(action);
      }
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

    if (this.loopPairs && this.loopPairs.length > 0) {
      this.loopPairs.forEach((pair) => {
        const { clipStartTime, clipEndTime } = pair;
        const blendDuration = Math.min(this.loopBlendDuration, (clipEndTime - clipStartTime) / 2);
        const crossfadeStart = clipEndTime - blendDuration;

        const currentAction = pair.activeIndex === 0 ? pair.actionA : pair.actionB;
        const nextAction = pair.activeIndex === 0 ? pair.actionB : pair.actionA;

        if (currentAction.time >= crossfadeStart) {
          if (!pair.isBlending) {
            pair.isBlending = true;
            const offset = currentAction.time - crossfadeStart;
            nextAction.time = clipStartTime + offset;
            nextAction.enabled = true;
            nextAction.play();
          }

          const blendProgress = Math.min(1.0, (currentAction.time - crossfadeStart) / blendDuration);
          currentAction.setEffectiveWeight(1.0 - blendProgress);
          nextAction.setEffectiveWeight(blendProgress);

          if (currentAction.time >= clipEndTime || blendProgress >= 1.0) {
            currentAction.setEffectiveWeight(0.0);
            currentAction.stop();
            currentAction.time = clipStartTime;

            nextAction.setEffectiveWeight(1.0);
            pair.activeIndex = pair.activeIndex === 0 ? 1 : 0;
            pair.isBlending = false;
          }
        } else if (currentAction.time < clipStartTime) {
          currentAction.time = clipStartTime;
        }
      });
    } else if (this.endTime > 0 && this.endTime > this.startTime) {
      this.actions.forEach((action) => {
        if (action.time >= this.endTime) {
          const duration = this.endTime - this.startTime;
          const overflow = (action.time - this.startTime) % duration;
          action.time = this.startTime + overflow;
        } else if (action.time < this.startTime) {
          action.time = this.startTime;
        }
      });
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
    this.actions = [];
    this.loopPairs = [];
  }
}

