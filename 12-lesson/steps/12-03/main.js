// 12-lesson/steps/12-03/main.js
import { scene, onTick } from '@core/shared/env.js';
import * as THREE from 'three';
import { Character } from '@step/entities/Character.js'; // Step 03 override (adds jump)

// Visual reference block
const block = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.8 })
);
block.position.set(2.5, 0.5, 0);
block.castShadow = true;
scene.add(block);

// Create hero
const hero = new Character({ scene });

// Simple input: Space / W / ArrowUp to jump
function requestJump() {
  hero.requestJump();
}
function releaseJump() {
  hero.releaseJump();
}
addEventListener('keydown', (e) => {
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    requestJump();
  }
});
addEventListener('keyup', (e) => {
  if (e.code === 'Space' || e.code === 'KeyW' || e.code === 'ArrowUp') {
    releaseJump();
  }
});
// Tap / click to jump (handy for demos)
addEventListener('pointerdown', requestJump);
addEventListener('pointerup', releaseJump);


// Optional debug label (same as step 2)
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

  hero.update(dt);
  label.textContent = `onGround: ${hero.onGround} | coyote: ${hero.coyoteTime.toFixed(2)}s`;
});
