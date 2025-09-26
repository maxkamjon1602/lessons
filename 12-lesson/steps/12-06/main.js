import { scene, onTick, camera, controls } from '@core/shared/env.js';
import * as THREE from 'three';
import { Character } from './character.js';
import { ScreenFade } from './screenfade.js';
import { makeSpikePit, hitsHazard } from './hazard.js';
import { saveCheckpoint } from './save.js';

// ---------- Platforms (thin) ----------
function makeBlock(x, baseY, w = 2, color = 0x90caf9, h = 0.4) {
  const block = new THREE.Mesh(
    new THREE.BoxGeometry(w, h, 1),
    new THREE.MeshStandardMaterial({ color, roughness: 0.7 })
  );
  block.position.set(x, baseY + h * 0.5, 0);
  block.castShadow = true;
  block.receiveShadow = true;
  scene.add(block);
  block.userData = block.userData || {};
  block.userData.box = new THREE.Box3().setFromObject(block);
  return block;
}

const platforms = [
  makeBlock(0, 0, 10, 0xb3e5fc, 0.3), // ground
  makeBlock(5, 3, 2, 0x90caf9, 0.3),
  makeBlock(9, 5, 2, 0x90caf9, 0.3),
  makeBlock(13, 3, 2, 0x90caf9, 0.3),
];

const topYOf   = (b) => b.userData.box.max.y;
const leftXOf  = (b) => b.userData.box.min.x;

// ---------- Checkpoints ----------
function makeCheckpoint(x, topY) {
  const geo = new THREE.SphereGeometry(0.3, 16, 16);
  const mat = new THREE.MeshStandardMaterial({ emissive: 0x008866, emissiveIntensity: 0.6, color: 0x333333 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, topY + 0.3, 0);
  mesh.castShadow = true;
  scene.add(mesh);
  return mesh;
}

const cp1 = makeCheckpoint(leftXOf(platforms[0]) + 1.0, topYOf(platforms[0]));
const cp2 = makeCheckpoint(platforms[1].position.x,      topYOf(platforms[1]));
const cp3 = makeCheckpoint(platforms[2].position.x,      topYOf(platforms[2]));
const cp4 = makeCheckpoint(platforms[3].position.x,      topYOf(platforms[3]));
const checkpoints = [cp1, cp2, cp3, cp4];

// ---------- Hazards ----------
const hazards = [
  makeSpikePit({ centerX:  3,  topY: topYOf(platforms[0]), width: 2, count: 3 }),
  makeSpikePit({ centerX: 11,  topY: topYOf(platforms[1]), width: 2, count: 4 }),
];
for (const h of hazards) scene.add(h);

// ---------- Hero ----------
const hero = new Character({ scene, checkpoints, platforms });
const defaultSpawn = { x: -10, y: 1.0, z: 0 };
hero.setCheckpoint(defaultSpawn);
hero.respawn();

// ---------- Input ----------
const input = { left: false, right: false, jumpHeld: false, camLeft: false, camRight: false, camUp: false, camDown: false };
addEventListener('keydown', (e) => {
  if (e.repeat) return;
  switch (e.code) {
    case 'KeyA': input.left = true; break;
    case 'KeyD': input.right = true; break;
    case 'Space':
    case 'KeyW': input.jumpHeld = true; hero.requestJump(); break;
    case 'ArrowLeft':  input.camLeft = true; break;
    case 'ArrowRight': input.camRight = true; break;
    case 'ArrowUp':    input.camUp = true; break;
    case 'ArrowDown':  input.camDown = true; break;
  }
});
addEventListener('keyup', (e) => {
  switch (e.code) {
    case 'KeyA': input.left = false; break;
    case 'KeyD': input.right = false; break;
    case 'Space':
    case 'KeyW': input.jumpHeld = false; hero.releaseJump(); break;
    case 'ArrowLeft':  input.camLeft = false; break;
    case 'ArrowRight': input.camRight = false; break;
    case 'ArrowUp':    input.camUp = false; break;
    case 'ArrowDown':  input.camDown = false; break;
  }
});

// ---------- Mouse for camera + fighting ----------
let mouseDownLeft = false;
let mouseDownRight = false;
addEventListener('mousedown', (e) => {
  if (e.button === 0) {
    mouseDownLeft = true;
    hero.doAttack();   // <-- NEW: trigger attack
  }
  if (e.button === 2) {
    mouseDownRight = true;
    // reserved for future (secondary attack)
  }
});
addEventListener('mouseup', (e) => {
  if (e.button === 0) mouseDownLeft = false;
  if (e.button === 2) mouseDownRight = false;
});
addEventListener('contextmenu', (e) => e.preventDefault());


// ---------- Debug ----------
const label = document.createElement('div');
Object.assign(label.style, {
  position: 'fixed', bottom: '10px', left: '10px',
  color: 'black', background: 'rgba(255,255,255,0.85)',
  padding: '4px 8px', fontFamily: 'monospace', fontSize: '13px'
});
document.body.appendChild(label);

// ---------- Camera Setup ----------
if (controls) {

  controls.enabled = true;
  controls.enableDamping = true;
  controls.enablePan = false;
  controls.enableZoom = false;

  // Keep fixed radius
  const radius = 10;
  controls.minDistance = radius;
  controls.maxDistance = radius;

  // Yaw limits ±45°
  controls.minAzimuthAngle = -Math.PI / 4;
  controls.maxAzimuthAngle =  Math.PI / 4;

  // Pitch limits: +15° up, −75° down (relative to horizon)
  const deg = (d) => d * Math.PI / 180;
  controls.minPolarAngle = Math.PI/2 - deg(15);
  controls.maxPolarAngle = Math.PI/2 + deg(75);

  // Hero's current world position as starting target
  const target = new THREE.Vector3(
    hero.mesh.position.x,
    hero.mesh.position.y + 1.2,
    hero.mesh.position.z
  );

  // Initial offset: 30° elevation, *azimuth = 0* so camera.x === hero.x
  const elev30 = deg(30);
  const sph = new THREE.Spherical(radius, Math.PI/2 - elev30, 0); // polar, azimuth
  const offset = new THREE.Vector3().setFromSpherical(sph);
  camera.position.copy(target).add(offset);
  controls.target.copy(target);

  // Ensure azimuth is exactly zero (removes any tiny initial skew)
  // const currentAz = controls.getAzimuthalAngle();
  // controls.rotateLeft(-currentAz);
  controls.update();
}

// Default 30° elevation, azimuth 0
const deg = (d) => d * Math.PI / 180;
const defaultPolar   = Math.PI/2 - deg(30);  // 30° up
const defaultAzimuth = 0;

// Track last target to translate camera with the hero (keeps camera x in sync)
let prevTarget = new THREE.Vector3(hero.mesh.position.x, hero.mesh.position.y + 1.2, hero.mesh.position.z);
const camKeyStep = 0.02;
function nudgeCameraByKeys() {
  if (input.camLeft)  camAz += camStep;
  if (input.camRight) camAz -= camStep;
  if (input.camUp)    camPol = Math.max(controls.minPolarAngle, camPol - camStep);
  if (input.camDown)  camPol = Math.min(controls.maxPolarAngle, camPol + camStep);
}


// Glue camera to player each frame:
// 1) compute new target at hero,
// 2) translate camera by the same delta,
// 3) set controls.target and update.
// keep camAz and camPol as globals above this function:
let camAz = 0;
let camPol = Math.PI/2 - (Math.PI/180)*30; // default 30° up
const camStep = 1.5 * Math.PI/180; // ~1.5° per arrow press/frame

function updateCamera(dt) {
  if (!controls) return;

  const newTarget = new THREE.Vector3(
    hero.mesh.position.x,
    hero.mesh.position.y + 1.2,
    hero.mesh.position.z
  );

  const delta = newTarget.clone().sub(prevTarget);
  camera.position.add(delta);

  controls.target.copy(newTarget);
  prevTarget.copy(newTarget);

  // --- Arrow keys adjust angles ---
  nudgeCameraByKeys();

  // --- Reset logic when idle ---
  const idle = !input.camLeft && !input.camRight && !input.camUp && !input.camDown && !mouseDownLeft && !mouseDownRight;
  if (idle) {
    const lerp = 2.0 * dt;
    const defaultAz = 0;
    const defaultPol = Math.PI/2 - (Math.PI/180)*30;
    camAz = THREE.MathUtils.lerp(camAz, defaultAz, lerp);
    camPol = THREE.MathUtils.lerp(camPol, defaultPol, lerp);
  }

  // --- Apply spherical transform ---
  const radius = controls.getDistance ? controls.getDistance() : controls.minDistance;
  const offset = new THREE.Vector3().setFromSphericalCoords(radius, camPol, camAz);
  camera.position.copy(controls.target).add(offset);

  controls.update();
}

// ---------- FX ----------
const fade = new ScreenFade({ color: '#ffffff' });
let shakeUntil = 0;
function addShake(timeMs = 200) { shakeUntil = performance.now() + timeMs; }

// ---------- Tick ----------
let last = performance.now();
onTick(() => {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 1/30);
  last = now;

  for (const p of platforms) p.userData.box.setFromObject(p);
  hero.update(dt, input);

  // --- inside onTick, after hero.update(dt, input) ---
  for (const cp of checkpoints) {
    const dx = Math.abs(hero.mesh.position.x - cp.position.x);
    const dy = Math.abs(hero.mesh.position.y - cp.position.y);
    // allow ~0.6 units horizontally, ~0.7 vertically
    if (dx <= 0.6 && dy <= 0.7) {
      const rp = { x: cp.position.x, y: cp.position.y + 1.0, z: 0 };
      hero.setCheckpoint(rp, cp);
      saveCheckpoint(rp);
    }
  }

  // Hazard check uses feet, not center
  const feetPoint = new THREE.Vector3(hero.mesh.position.x, hero.bottomY + 0.05, hero.mesh.position.z);
  const hazardHit = (hero.invuln <= 0) && hitsHazard(feetPoint, hazards, 0.25);
  if (hazardHit) {
    fade.flash(1, 80);
    addShake(220);
    hero.respawn();
  }

  // Update camera
  updateCamera(dt);

  // Debug
  label.textContent =
    `onGround:${hero.onGround} | camAz:${controls.getAzimuthalAngle().toFixed(2)} | camPol:${controls.getPolarAngle().toFixed(2)}`;
});
