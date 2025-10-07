// 12-lesson/steps/12-04/main.js
import { scene, onTick } from '@core/shared/env.js';
import * as THREE from 'three';
import { Character } from '@step/entities/Character.js'; // v4 with horizontal move

// Visual reference blocks
const block1 = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.8 })
);
block1.position.set(2.5, 0.5, 0);
block1.castShadow = true;

const block2 = block1.clone();
block2.position.set(-3.5, 0.5, 0);

scene.add(block1, block2);

// Hero
const hero = new Character({ scene });

// Input state
const input = { left: false, right: false, jumpHeld: false };

addEventListener('keydown', (e) => {
  if (e.repeat) return;
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = true;

  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    input.jumpHeld = true;
    hero.requestJump();
  }
});

addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') input.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') input.right = false;

  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    input.jumpHeld = false;
    hero.releaseJump();
  }
});

// (Optional) Mouse/touch jump
addEventListener('pointerdown', () => { input.jumpHeld = true; hero.requestJump(); });
addEventListener('pointerup',   () => { input.jumpHeld = false; hero.releaseJump(); });

// Debug label
const label = document.createElement('div');
label.style.position = 'fixed';
label.style.bottom = '10px';
label.style.left = '10px';
label.style.color = 'black';
label.style.background = 'rgba(255,255,255,0.85)';
label.style.padding = '4px 8px';
label.style.fontFamily = 'monospace';
label.style.fontSize = '13px';
document.body.appendChild(label);

// Tick
let last = performance.now();
onTick(() => {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 1/30);
  last = now;

  hero.update(dt, input);
  label.textContent =
    `onGround:${hero.onGround} | coyote:${hero.coyoteTime.toFixed(2)} | vx:${hero.collider?.velocity?.x?.toFixed?.(2) ?? 0}`;
});
