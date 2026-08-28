import {
  EffectComposer,
  EffectPass,
  RenderPass,
  BloomEffect,
  VignetteEffect,
  ChromaticAberrationEffect,
  SMAAEffect,
  SMAAPreset,
  ToneMappingEffect,
  ToneMappingMode,
  BlendFunction,
} from 'postprocessing';
import * as THREE from 'three';

export class PostProcessingPipeline {
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;

    try {
      this.composer = new EffectComposer(renderer, {
        frameBufferType: THREE.HalfFloatType,
      });

      const renderPass = new RenderPass(scene, camera);
      this.composer.addPass(renderPass);

      this.bloomEffect = new BloomEffect({
        intensity: 1.0,
        luminanceThreshold: 0.6,
        luminanceSmoothing: 0.3,
        mipmapBlur: true,
        radius: 0.8,
      });

      this.vignetteEffect = new VignetteEffect({
        offset: 0.35,
        darkness: 0.65,
      });

      this.chromaticAberrationEffect = new ChromaticAberrationEffect({
        offset: new THREE.Vector2(0.0008, 0.0008),
        radialModulation: true,
        modulationOffset: 0.3,
      });

      const passes = [
        this.bloomEffect,
        this.chromaticAberrationEffect,
        this.vignetteEffect,
      ];

      try {
        const smaaEffect = new SMAAEffect({
          preset: SMAAPreset.HIGH,
        });
        passes.push(smaaEffect);
      } catch (smaaErr) {
        console.warn('SMAA initialization skipped:', smaaErr);
      }

      const effectPass = new EffectPass(camera, ...passes);
      this.composer.addPass(effectPass);
    } catch (err) {
      console.warn('Post-processing pipeline failed, using default renderer:', err);
      this.enabled = false;
    }
  }

  render(deltaTime) {
    if (this.enabled && this.composer) {
      this.composer.render(deltaTime);
    } else {
      this.renderer.render(this.scene, this.camera);
    }
  }

  resize(width, height) {
    if (this.enabled && this.composer) {
      this.composer.setSize(width, height);
    }
  }

  dispose() {
    if (this.composer) {
      this.composer.dispose();
    }
  }
}
