import * as THREE from 'three';
import { createScene } from './src/scene.js';
import { ModelLoader } from './src/modelLoader.js';
import { CameraController } from './src/cameraController.js';
import { ParticleSystem } from './src/particles.js';
import { PostProcessingPipeline } from './src/postProcessing.js';
import { TypewriterManager } from './src/typewriterManager.js';
import { CharacterTouchHandler } from './src/touch3DText.js';

const isMobileDevice = typeof window !== 'undefined' && (window.innerWidth <= 768 || /Android|iPhone|iPad|iPod/i.test(navigator.userAgent));

const CONFIG = {
  models: {
    character: {
      path: '/models/character.glb',
      position: [0, 0.15, 0],
      scale: 1,
      rotation: [0, 0, 0],
      startTime: 1.0,
      endTime: 0.0,
      loopBlendDuration: 0.35,
    },
  },
  renderer: {
    pixelRatio: Math.min(window.devicePixelRatio, isMobileDevice ? 1.5 : 2.0),
    antialias: false,
    toneMapping: THREE.ACESFilmicToneMapping,
    toneMappingExposure: 1.1,
  },
};

let renderer, camera, cameraController, typewriterManager, characterTouchHandler;
let sceneData, modelLoader, particles, postProcessing;
let clock, elapsedTime = 0;
let frameCount = 0, fpsTime = 0;

async function init() {
  const canvas = document.getElementById('three-canvas');
  const loadingScreen = document.getElementById('loading-screen');

  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: CONFIG.renderer.antialias,
    powerPreference: 'high-performance',
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(CONFIG.renderer.pixelRatio);
  renderer.toneMapping = CONFIG.renderer.toneMapping;
  renderer.toneMappingExposure = CONFIG.renderer.toneMappingExposure;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  updateLoading(15);

  sceneData = createScene();
  const { scene } = sceneData;

  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );

  updateLoading(30);

  cameraController = new CameraController(camera, canvas);

  updateLoading(45);

  particles = new ParticleSystem(scene);

  updateLoading(60);

  postProcessing = new PostProcessingPipeline(renderer, scene, camera);

  updateLoading(75);

  modelLoader = new ModelLoader(scene);

  characterTouchHandler = new CharacterTouchHandler(
    scene,
    camera,
    canvas,
    () => modelLoader.model || window.__characterSlot
  );

  try {
    await modelLoader.load(
      CONFIG.models.character.path,
      {
        position: CONFIG.models.character.position,
        scale: CONFIG.models.character.scale,
        rotation: CONFIG.models.character.rotation,
        startTime: CONFIG.models.character.startTime,
        endTime: CONFIG.models.character.endTime,
        loopBlendDuration: CONFIG.models.character.loopBlendDuration,
      },
      (progress) => {
        const mapped = 75 + (progress * 0.25);
        updateLoading(mapped);
      }
    );
  } catch (err) {
    console.info('Character slot ready at /models/character.glb. Upload your GLB file into public/models/character.glb');
    window.__characterSlot = createCharacterSlot(scene);
    updateLoading(95);
  }

  updateLoading(100);

  setupCameraUI();
  setupMusicPlayer();

  setTimeout(() => {
    loadingScreen.classList.add('hidden');
    document.getElementById('ui-overlay').classList.add('visible');
  }, 600);

  window.addEventListener('resize', onResize);
  document.addEventListener('selectstart', (e) => e.preventDefault());

  clock = new THREE.Clock();
  animate();
}

function setupMusicPlayer() {
  const btn = document.getElementById('music-btn');
  if (!btn) return;

  const audio = new Audio('/audio/bg.mp3');
  audio.loop = true;
  audio.volume = 0.5;

  let playing = false;

  const tryPlay = () => {
    audio.play().then(() => {
      playing = true;
      btn.classList.remove('muted');
    }).catch(() => {
      playing = false;
      btn.classList.add('muted');
    });
  };

  tryPlay();

  const unlockAndPlay = () => {
    if (!playing) {
      tryPlay();
    }
    document.removeEventListener('click', unlockAndPlay);
    document.removeEventListener('keydown', unlockAndPlay);
  };
  document.addEventListener('click', unlockAndPlay);
  document.addEventListener('keydown', unlockAndPlay);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (playing) {
      audio.pause();
      playing = false;
      btn.classList.add('muted');
    } else {
      audio.play().then(() => {
        playing = true;
        btn.classList.remove('muted');
      });
    }
  });
}

function createCharacterSlot(scene) {
  const group = new THREE.Group();
  
  const ringGeo = new THREE.RingGeometry(0.8, 0.95, 64);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xff2d55,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.35,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  group.add(ring);

  const discGeo = new THREE.CircleGeometry(0.8, 64);
  const discMat = new THREE.MeshBasicMaterial({
    color: 0xff2d55,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.06,
  });
  const disc = new THREE.Mesh(discGeo, discMat);
  disc.rotation.x = -Math.PI / 2;
  disc.position.y = 0.015;
  group.add(disc);

  scene.add(group);
  return group;
}

function setupCameraUI() {
  typewriterManager = new TypewriterManager();
  const buttons = document.querySelectorAll('.cam-btn');
  const drawer = document.getElementById('camera-drawer');
  const toggleBtn = document.getElementById('cam-toggle-btn');

  const hintDrawer = document.getElementById('hint-drawer');
  const hintToggleBtn = document.getElementById('hint-toggle-btn');

  if (toggleBtn && drawer) {
    toggleBtn.addEventListener('click', () => {
      drawer.classList.toggle('collapsed');
    });
  }

  if (hintToggleBtn && hintDrawer) {
    hintToggleBtn.addEventListener('click', () => {
      hintDrawer.classList.toggle('collapsed');
    });
  }

  if (cameraController) {
    cameraController.onUserInteract = () => {
      if (typewriterManager) {
        typewriterManager.hide();
      }
      buttons.forEach((b) => {
        b.classList.remove('active');
        b.classList.remove('shimmer-trigger');
      });
      const defaultBtn = document.getElementById('cam-default');
      if (defaultBtn) {
        defaultBtn.classList.add('active');
      }
    };
  }

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      const camName = btn.dataset.cam;

      buttons.forEach((b) => {
        b.classList.remove('active');
        b.classList.remove('shimmer-trigger');
      });
      btn.classList.add('active');

      void btn.offsetWidth;
      btn.classList.add('shimmer-trigger');

      if (typewriterManager) {
        typewriterManager.hide();
      }

      if (camName === 'orbit') {
        cameraController.startAutoOrbit();
      } else if (camName === 'default') {
        cameraController.goToPreset('default', 2);
      } else {
        cameraController.goToPreset(camName, 2, () => {
          if (cameraController.currentPreset === camName && typewriterManager) {
            typewriterManager.showPreset(camName);
          }
        });
      }
    });
  });
}

function updateLoading(percent) {
  const percentText = document.getElementById('loader-percent');
  const rounded = Math.min(100, Math.max(0, Math.round(percent)));

  if (percentText) {
    percentText.textContent = `${rounded}%`;
  }

  const bars = [
    { rectId: 'clip-left-rect',   totalH: 80  },
    { rectId: 'clip-center-rect', totalH: 110 },
    { rectId: 'clip-right-rect',  totalH: 80  },
  ];

  const fillRatio = rounded / 100;

  bars.forEach(({ rectId, totalH }) => {
    const rect = document.getElementById(rectId);
    if (rect) {
      const newY = totalH * (1 - fillRatio);
      rect.setAttribute('y', newY);
      rect.setAttribute('height', totalH - newY + totalH);
    }
  });
}


function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  renderer.setSize(width, height);
  cameraController.resize(width, height);
  postProcessing.resize(width, height);
}

function animate() {
  requestAnimationFrame(animate);

  const deltaTime = clock.getDelta();
  elapsedTime += deltaTime;

  cameraController.update(deltaTime);
  modelLoader.update();
  particles.update(elapsedTime, deltaTime, camera, modelLoader ? modelLoader.model : null);

  if (characterTouchHandler) {
    characterTouchHandler.update(cameraController);
  }

  if (window.__characterSlot) {
    const opacity = 0.25 + Math.sin(elapsedTime * 2) * 0.15;
    window.__characterSlot.children[0].material.opacity = opacity;
  }

  postProcessing.render(deltaTime);

  frameCount++;
  fpsTime += deltaTime;
  if (fpsTime >= 1.0) {
    const fps = Math.round(frameCount / fpsTime);
    const fpsEl = document.getElementById('fps-counter');
    if (fpsEl) fpsEl.textContent = `${fps} FPS`;
    frameCount = 0;
    fpsTime = 0;
  }
}

init().catch((err) => {
  console.error('Failed to initialize:', err);
});
