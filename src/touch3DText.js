import * as THREE from 'three';

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
    this.cooldownDuration = 1500;

    this.isLookingUnderneath = false;
    this.hit3DPoint = null;
    this.touchPhraseIndex = 0;
    this.underneathPhraseIndex = 0;

    this.timer1 = null;
    this.timer2 = null;
    this.timer3 = null;
    this.timerHide = null;
    this.timerReset = null;

    const triggerGeo = new THREE.CylinderGeometry(0.65, 0.65, 1.85, 8);
    triggerGeo.translate(0, 0.92, 0);
    const triggerMat = new THREE.MeshBasicMaterial({ visible: false });
    this.triggerMesh = new THREE.Mesh(triggerGeo, triggerMat);
    this.scene.add(this.triggerMesh);

    this.initDOMOverlays();

    this.pointerDownPos = { x: 0, y: 0 };

    this.canvas.addEventListener('pointerdown', (e) => {
      this.pointerDownPos = { x: e.clientX, y: e.clientY };
    });

    this.canvas.addEventListener('pointerup', (e) => {
      const dist = Math.hypot(e.clientX - this.pointerDownPos.x, e.clientY - this.pointerDownPos.y);
      if (dist < 8) {
        this.onClick(e);
      }
    });
  }

  initDOMOverlays() {
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

    this.underneathOverlay = document.createElement('div');
    this.underneathOverlay.className = 'underneath-warning-overlay';
    document.body.appendChild(this.underneathOverlay);
  }

  onClick(event) {
    if (this.isLookingUnderneath || this.isCoolingDown) return;

    const rect = this.canvas.getBoundingClientRect();
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    this.raycaster.setFromCamera(this.pointer, this.camera);

    let intersects = this.raycaster.intersectObject(this.triggerMesh);

    if (intersects.length === 0) {
      const targetObj = this.getTargetObject();
      if (targetObj) {
        intersects = this.raycaster.intersectObject(targetObj, true);
      }
    }

    if (intersects.length > 0) {
      const hit = intersects[0];
      const hitPoint = hit.point.clone();
      hitPoint.y += 0.25;
      this.triggerStaggeredWarning(hitPoint);
    }
  }

  triggerStaggeredWarning(hitPoint) {
    this.isCoolingDown = true;
    this.hit3DPoint = hitPoint;

    const phrase = TOUCH_PHRASE_POOLS[this.touchPhraseIndex];
    this.touchPhraseIndex = (this.touchPhraseIndex + 1) % TOUCH_PHRASE_POOLS.length;

    this.word1.textContent = phrase[0];
    this.word2.textContent = phrase[1];
    this.word3.textContent = phrase[2];

    this.clearWarningTimers();
    this.word1.classList.remove('show');
    this.word2.classList.remove('show');
    this.word3.classList.remove('show');

    this.updateOverlayPosition();
    this.touchOverlay.classList.add('visible');

    this.timer1 = setTimeout(() => {
      this.word1.classList.add('show');
    }, 40);

    this.timer2 = setTimeout(() => {
      this.word2.classList.add('show');
    }, 220);

    this.timer3 = setTimeout(() => {
      this.word3.classList.add('show');
    }, 400);

    this.timerHide = setTimeout(() => {
      if (this.touchOverlay) {
        this.touchOverlay.classList.remove('visible');
      }
    }, 1150);

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

    const vec = this.hit3DPoint.clone();
    vec.project(this.camera);

    const x = (vec.x * 0.5 + 0.5) * window.innerWidth;
    const y = (-(vec.y * 0.5) + 0.5) * window.innerHeight;

    this.touchOverlay.style.left = `${x}px`;
    this.touchOverlay.style.top = `${y}px`;
  }

  checkCameraAngle(cameraController) {
    if (!cameraController || !cameraController.controls) return;

    const polarAngle = cameraController.controls.getPolarAngle();
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

    const phrase = UNDERNEATH_PHRASE_POOLS[this.underneathPhraseIndex];
    this.underneathPhraseIndex = (this.underneathPhraseIndex + 1) % UNDERNEATH_PHRASE_POOLS.length;

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
    this.checkCameraAngle(cameraController);

    if (this.hit3DPoint && this.touchOverlay) {
      this.updateOverlayPosition();
    }
  }
}
