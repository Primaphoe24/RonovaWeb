import * as THREE from 'three';

/**
 * Multiple 3-word warning variations for character touch interaction
 */
const TOUCH_PHRASE_POOLS = [
  ['DONT', 'TOUCH', 'ANYTHING!!!'],
  ['GET', 'YOUR', 'HANDS OFF!'],
  ['DO NOT', 'DARE', 'TOUCH ME!'],
  ['BACK', 'AWAY', 'NOW!!!'],
  ['WHAT ARE', 'YOU', 'TOUCHING?!'],
  ['STEP', 'BACK', 'IMMEDIATELY!'],
  ['STOP', 'IT', 'RIGHT NOW!'],
  ['LEAVE', 'ME', 'ALONE!!!'],
];

/**
 * Multiple warning variations for underneath camera angle inspection
 */
const UNDERNEATH_PHRASE_POOLS = [
  ['WHAT', 'ARE', 'YOU', 'DOING?'],
  ['STOP', 'LOOKING', 'UP', 'THERE!'],
  ['SERIOUSLY?', 'WHERE ARE', 'YOU', 'LOOKING?!'],
  ['NO', 'PEEKING', 'FROM', 'BELOW!'],
  ['REALLY?', 'EYES', 'UP', 'HERE!'],
  ['ARE YOU', 'THAT', 'DESPERATE?!'],
  ['GET', 'THAT', 'CAMERA', 'UP!'],
];

export class CharacterTouchHandler {
  constructor(scene, camera, canvas, getTargetObject) {
    this.scene = scene;
    this.camera = camera;
    this.canvas = canvas;
    this.getTargetObject = getTargetObject;

    this.raycaster = new THREE.Raycaster();
    this.pointer = new THREE.Vector2();

    this.isCoolingDown = false;
    this.cooldownDuration = 1500; // 1.5s anti-spam cooldown

    this.isLookingUnderneath = false;
    this.hit3DPoint = null;
    this.touchPhraseIndex = 0;
    this.underneathPhraseIndex = 0;

    this.timer1 = null;
    this.timer2 = null;
    this.timer3 = null;
    this.timerHide = null;
    this.timerReset = null;

    // 1. Create a super lightweight, invisible collision cylinder around character position
    // (Raycasting against 1 simple 8-side cylinder takes 0.001ms vs thousands of GLTF vertex buffers!)
    const triggerGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.85, 8);
    triggerGeo.translate(0, 0.92, 0); // Center around character height
    const triggerMat = new THREE.MeshBasicMaterial({ visible: false });
    this.triggerMesh = new THREE.Mesh(triggerGeo, triggerMat);
    this.scene.add(this.triggerMesh);

    // 2. Pre-create DOM overlay elements ONCE to eliminate DOM creation & Garbage Collection spikes on click
    this.initDOMOverlays();

    this.pointerDownPos = { x: 0, y: 0 };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('pointerup', (e) => {
      // Only trigger on tap/click (distance moved < 8px to ignore camera orbit drags)
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist < 8) {
        this.onClick(e);
      }
    });
  }

  /**
   * Pre-create DOM structures once during initialization for 0 FPS drop
   */
  initDOMOverlays() {
    // Touch warning overlay ("DONT TOUCH ANYTHING!!!")
    this.touchOverlay = document.createElement('div');
    this.touchOverlay.className = 'touch-warning-overlay';

    this.word1 = document.createElement('span');
    this.word1.className = 'touch-warning-word';

    this.word2 = document.createElement('span');
    this.word2.className = 'touch-warning-word';

    this.word3 = document.createElement('span');
    this.word3.className = 'touch-warning-word emphasis';

    this.touchOverlay.appendChild(this.word1);
    this.touchOverlay.appendChild(this.word2);
    this.touchOverlay.appendChild(this.word3);
    document.body.appendChild(this.touchOverlay);

    // Underneath camera angle overlay ("WHAT ARE YOU DOING?")
    this.underneathOverlay = document.createElement('div');
    this.underneathOverlay.className = 'underneath-warning-overlay';
    document.body.appendChild(this.underneathOverlay);
  }

  onClick(event) {
    // DISABLE TOUCH if camera is looking from underneath OR if animation is cooling down
    if (this.isLookingUnderneath || this.isCoolingDown) return;

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    // Raycast fast against the lightweight triggerMesh first (Instant 0.001ms check!)
    let intersects = this.raycaster.intersectObject(this.triggerMesh);

    // Fallback if model is positioned elsewhere
    if (intersects.length === 0) {
      const targetObj = this.getTargetObject();
      if (targetObj) {
        intersects = this.raycaster.intersectObject(targetObj, true);
      }
    }

    if (intersects.length > 0) {
      const hit = intersects[0];
      const hitPoint = hit.point.clone();
      hitPoint.y += 0.25; // Offset slightly above touch position
      this.triggerStaggeredWarning(hitPoint);
    }
  }

  /**
   * Trigger staggered warning using pre-built DOM nodes & cycling warning phrases
   */
  triggerStaggeredWarning(hitPoint) {
    this.isCoolingDown = true;
    this.hit3DPoint = hitPoint;

    // Pick next phrase variation from pool
    const phrase = TOUCH_PHRASE_POOLS[this.touchPhraseIndex];
    this.touchPhraseIndex = (this.touchPhraseIndex + 1) % TOUCH_PHRASE_POOLS.length;

    // Update text content
    this.word1.textContent = phrase[0];
    this.word2.textContent = phrase[1];
    this.word3.textContent = phrase[2];

    // Reset previous states
    this.clearWarningTimers();
    this.word1.classList.remove('show');
    this.word2.classList.remove('show');
    this.word3.classList.remove('show');

    // Position immediately & reveal container
    this.updateOverlayPosition();
    this.touchOverlay.classList.add('visible');

    // Staggered smooth fade-in reveal
    this.timer1 = setTimeout(() => {
      this.word1.classList.add('show');
    }, 40);

    this.timer2 = setTimeout(() => {
      this.word2.classList.add('show');
    }, 220);

    this.timer3 = setTimeout(() => {
      this.word3.classList.add('show');
    }, 400);

    // Hold display then fade out
    this.timerHide = setTimeout(() => {
      if (this.touchOverlay) {
        this.touchOverlay.classList.remove('visible');
      }
    }, 1150);

    // Reset cooldown guard
    this.timerReset = setTimeout(() => {
      this.hit3DPoint = null;
      this.isCoolingDown = false;
    }, this.cooldownDuration);
  }

  clearWarningTimers() {
    if (this.timer1) clearTimeout(this.timer1);
    if (this.timer2) clearTimeout(this.timer2);
    if (this.timer3) clearTimeout(this.timer3);
    if (this.timerHide) clearTimeout(this.timerHide);
    if (this.timerReset) clearTimeout(this.timerReset);
  }

  updateOverlayPosition() {
    if (!this.touchOverlay || !this.hit3DPoint) return;

    // Project 3D hit position to 2D screen space
    const vec = this.hit3DPoint.clone();
    vec.project(this.camera);

    const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;

    this.touchOverlay.style.left = `${x}px`;
    this.touchOverlay.style.top = `${y}px`;
  }

  /**
   * Monitor camera angle for underneath camera inspection
   */
  checkCameraAngle(cameraController) {
    if (!cameraController || !cameraController.controls) return;

    const polarAngle = cameraController.controls.getPolarAngle();
    // Threshold: > 118 degrees (Math.PI * 0.655 rad) indicates underneath viewing angle
    const isUnderneath = polarAngle > (Math.PI * 0.655);

    if (isUnderneath && !this.isLookingUnderneath) {
      this.isLookingUnderneath = true;
      this.showUnderneathWarning();
    } else if (!isUnderneath && this.isLookingUnderneath) {
      this.isLookingUnderneath = false;
      this.hideUnderneathWarning();
    }
  }

  showUnderneathWarning() {
    if (!this.underneathOverlay) return;

    // Pick next phrase variation from underneath pool
    const phrase = UNDERNEATH_PHRASE_POOLS[this.underneathPhraseIndex];
    this.underneathPhraseIndex = (this.underneathPhraseIndex + 1) % UNDERNEATH_PHRASE_POOLS.length;

    // Clear previous children
    this.underneathOverlay.innerHTML = '';

    phrase.forEach((wText, idx) => {
      const span = document.createElement('span');
      const isLast = idx === (phrase.length - 1);
      span.className = isLast ? 'underneath-word question' : 'underneath-word';
      span.textContent = wText;
      this.underneathOverlay.appendChild(span);
    });

    requestAnimationFrame(() => {
      if (this.underneathOverlay) {
        this.underneathOverlay.classList.add('visible');
      }
    });
  }

  hideUnderneathWarning() {
    if (!this.underneathOverlay) return;
    this.underneathOverlay.classList.remove('visible');
  }

  update(cameraController) {
    // Check camera angle for underneath anti-pervert guard
    this.checkCameraAngle(cameraController);

    // Continuously update touch overlay projected screen position
    if (this.hit3DPoint && this.touchOverlay) {
      this.updateOverlayPosition();
    }
  }
}
