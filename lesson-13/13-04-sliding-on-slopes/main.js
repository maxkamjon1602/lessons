// main.js - lesson 13 step 1

import { scene, onTick, camera, controls } from './env.js';
import * as THREE from 'three';
import { Character } from './character.js';
import { ScreenFade } from './screenfade.js';
import { makeSpikePit } from './hazard.js';
import { saveCheckpoint } from './save.js';

// ================= DEBUG COLLIDERS =================
const DEBUG_COLLIDERS = true;

const debug = {
  group: new THREE.Group(),
  // references we keep for live refresh
  boxWires: new Map(),     // Mesh -> LineSegments (its Box3 wire)
  rampExtras: new Map(),   // Ramp Mesh/Group -> {lowLine, highLine, topLine, botLine}
};
scene.add(debug.group);

// materials
const dbgMatFlat   = new THREE.LineBasicMaterial({ color: 0x5ec8ff, transparent: true, opacity: 0.7 }); // blue
const dbgMatRamp   = new THREE.LineBasicMaterial({ color: 0x2ecc71, transparent: true, opacity: 0.85 }); // green
const dbgMatRed    = new THREE.LineBasicMaterial({ color: 0xff5555, transparent: true, opacity: 0.95 }); // red
const dbgMatGrey   = new THREE.LineBasicMaterial({ color: 0x8899aa, transparent: true, opacity: 0.4 });  // grey

function box3WireXY(box, mat) {
  const g = new THREE.BufferGeometry();
  const v = [];
  const min = box.min, max = box.max;
  const pts = [
    [min.x, min.y], [max.x, min.y],
    [max.x, min.y], [max.x, max.y],
    [max.x, max.y], [min.x, max.y],
    [min.x, max.y], [min.x, min.y],
  ];
  pts.forEach(([x, y]) => v.push(x, y, 0));
  g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3));
  return new THREE.LineSegments(g, mat);
}

function vLine(x, y0, y1, mat) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute([x,y0,0,  x,y1,0], 3));
  return new THREE.Line(g, mat);
}

function polyXY(points, mat) {
  const g = new THREE.BufferGeometry();
  const arr = [];
  points.forEach(([x,y]) => arr.push(x,y,0));
  g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
  return new THREE.Line(g, mat);
}

// small flash helper
function flash(lineObj, ms=150, color=0xffdd00) {
  if (!lineObj) return;
  const old = lineObj.material.color.getHex();
  lineObj.material.color.set(color);
  setTimeout(() => lineObj.material.color.set(old), ms);
}

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
  block.userData.updateAABB = () => block.userData.box.setFromObject(block);
  return block;
}

const platforms = [
  makeBlock(0, 0, 30, 0xb3e5fc, 0.3), // ground
  makeBlock(5, 3, 2, 0x90caf9, 0.3),
  makeBlock(9, 5, 2, 0x90caf9, 0.3),
  makeBlock(13, 3, 2, 0x90caf9, 0.3),
  makeBlock(1, 1, 0.5, 0xffc000, 3)
];

// === 45° Ramp with exact rotated corners ===
{
  const w = 6, h = 0.5, z = 2;
  const angleDeg = 45;
  const angleRad = angleDeg * Math.PI / 180;
  const slopeDir = +1;                      // +1 rises to right

  // Place LOW–LEFT foot of the ramp here:
  const leftX   = -8;
  const bottomY = -0.25;
  const centerZ = 0;

  // Parent group (pivot at low–left foot)
  const ramp = new THREE.Group();
  ramp.position.set(leftX, bottomY, centerZ);

  // Visual mesh: translate so its low–left foot is at local (0,0,0), then rotate
  const visGeo = new THREE.BoxGeometry(w, h, z);
  visGeo.translate(w/2, h/2, 0);
  const visual = new THREE.Mesh(visGeo, new THREE.MeshStandardMaterial({ color: 0x556B8A }));
  visual.rotation.z = (slopeDir === +1 ? +angleRad : -angleRad);
  ramp.add(visual);

  // --- Compute exact rotated corners in WORLD space (thin & exact) ---
  const local = [
    new THREE.Vector3(0, 0, 0),   // low-left  (LL)
    new THREE.Vector3(w, 0, 0),   // low-right (LR)
    new THREE.Vector3(0, h, 0),   // top-left  (TL)
    new THREE.Vector3(w, h, 0),   // top-right (TR)
  ];
  const toWorld = new THREE.Matrix4()
    .makeRotationZ(visual.rotation.z)
    .setPosition(leftX, bottomY, centerZ);

  const corners = local.map(v => v.clone().applyMatrix4(toWorld));

  // Tight AABB for broadphase only (still axis-aligned, but exact hull)
  const box = new THREE.Box3().setFromPoints(corners);

  // Sort by x to get low/high faces and top/bottom lines
  const sorted = corners.slice().sort((a,b)=>a.x - b.x);
  const lowPair  = [sorted[0], sorted[1]];     // the two left-most corners (low face)
  const highPair = [sorted[2], sorted[3]];     // the two right-most corners (high face)

  const yTopLow    = Math.max(lowPair[0].y,  lowPair[1].y);
  const yBottomLow = Math.min(lowPair[0].y,  lowPair[1].y);
  const yTopHigh   = Math.max(highPair[0].y, highPair[1].y);
  const yBottomHigh= Math.min(highPair[0].y, highPair[1].y);

  // Save everything needed for narrowphase
  ramp.userData.slopeAngleDeg = angleDeg;
  ramp.userData.slopeDir      = slopeDir;
  ramp.userData.slopeCorners  = corners;          // 4 exact corners
  ramp.userData.lowX          = Math.min(...corners.map(c=>c.x));  // inner face center x
  ramp.userData.highX         = Math.max(...corners.map(c=>c.x));
  ramp.userData.lowBarrierX   = ramp.userData.lowX;                // outer planes (thin)
  ramp.userData.highBarrierX  = ramp.userData.highX;
  ramp.userData.box           = box;             // broadphase only

  // For quick top/bottom interpolation
  ramp.userData.topLow    = yTopLow;
  ramp.userData.topHigh   = yTopHigh;
  ramp.userData.botLow    = yBottomLow;
  ramp.userData.botHigh   = yBottomHigh;

  // Keep custom updater (recompute if you ever move/rotate later)
  ramp.userData.updateAABB = () => {
    const m = new THREE.Matrix4()
      .makeRotationZ(visual.rotation.z)
      .setPosition(ramp.position.x, ramp.position.y, ramp.position.z);
    const cs = local.map(v => v.clone().applyMatrix4(m));
    ramp.userData.slopeCorners = cs;
    ramp.userData.box.setFromPoints(cs);
    const srt = cs.slice().sort((a,b)=>a.x - b.x);
    const lp  = [srt[0], srt[1]];
    const hp  = [srt[2], srt[3]];
    ramp.userData.lowX  = Math.min(cs[0].x, cs[1].x, cs[2].x, cs[3].x);
    ramp.userData.highX = Math.max(cs[0].x, cs[1].x, cs[2].x, cs[3].x);
    ramp.userData.lowBarrierX  = ramp.userData.lowX;
    ramp.userData.highBarrierX = ramp.userData.highX;
    ramp.userData.topLow    = Math.max(lp[0].y,  lp[1].y);
    ramp.userData.botLow    = Math.min(lp[0].y,  lp[1].y);
    ramp.userData.topHigh   = Math.max(hp[0].y,  hp[1].y);
    ramp.userData.botHigh   = Math.min(hp[0].y,  hp[1].y);
  };

  scene.add(ramp);
  platforms.push(ramp);

  if (DEBUG_COLLIDERS) {
    // wipe
    debug.group.clear();
    debug.boxWires.clear();
    debug.rampExtras.clear();

    // Box wire for EVERY platform
    for (const p of platforms) {
      const box = p.userData?.box; if (!box) continue;
      const mat = (p.userData?.slopeCorners) ? dbgMatRamp : dbgMatFlat;
      const w = box3WireXY(box, mat);
      debug.group.add(w);
      debug.boxWires.set(p, w);

      // For ramps: draw barrier planes + local top/bottom polylines
      if (p.userData?.slopeCorners) {
        const b = p.userData.box;
        const lowB  = p.userData.lowBarrierX  ?? b.min.x;
        const highB = p.userData.highBarrierX ?? b.max.x;

        // vertical span to draw lines through (use box y’s)
        const y0 = Math.min(b.min.y, b.max.y);
        const y1 = Math.max(b.min.y, b.max.y);

        const lowLine  = vLine(lowB,  y0, y1, dbgMatRed);
        const highLine = vLine(highB, y0, y1, dbgMatRed);

        // local top/bottom polylines (what the solver should use)
        const N = 32;
        const minX = Math.min(...p.userData.slopeCorners.map(c=>c.x));
        const maxX = Math.max(...p.userData.slopeCorners.map(c=>c.x));
        // compute endpoints for low/high inner edges
        const cs = p.userData.slopeCorners.slice().sort((a,b)=>a.x-b.x);
        const lowPair  = [cs[0], cs[1]];
        const highPair = [cs[2], cs[3]];
        const lerp = (a,b,x) => {
          const t = (x - a.x) / Math.max(1e-6, b.x - a.x);
          return a.y + (b.y - a.y) * Math.min(1, Math.max(0, t));
        };

        const topPts=[], botPts=[];
        for (let i=0;i<=N;i++){
          const x = minX + (maxX-minX)* (i/N);
          const yTop = Math.max( lerp(lowPair[0],lowPair[1],x), lerp(highPair[0],highPair[1],x) );
          const yBot = Math.min( lerp(lowPair[0],lowPair[1],x), lerp(highPair[0],highPair[1],x) );
          topPts.push([x,yTop]);
          botPts.push([x,yBot]);
        }
        const topLine = polyXY(topPts, dbgMatRamp);
        const botLine = polyXY(botPts, dbgMatGrey);

        debug.group.add(lowLine, highLine, topLine, botLine);
        debug.rampExtras.set(p, {lowLine, highLine, topLine, botLine});
      }
    }
  }
}

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
const hero = new Character({ scene, checkpoints, platforms, hazards });
// after creating `platforms` and before hero.respawn()
const ground = platforms[0];
const b = ground.userData.box;
const halfH = hero.collider.height * 0.5;

const defaultSpawn = {
  x: b.min.x + 0.1,                 // a little inset from the left edge
  y: b.max.y + halfH + 0.01,        // feet exactly on top
  z: 0
};
// const defaultSpawn = { x: -10, y: 1.0, z: 0 };
hero.setCheckpoint(defaultSpawn);
hero.respawn();

// --- Jump Timers HUD (Step 01 new UI) ---
const hud = document.createElement('div');
hud.id = 'jumpsHUD';
hud.innerHTML = `
  <div class="jh-row">
    <span class="jh-label">Coyote</span>
    <div class="jh-bar"><div class="jh-fill" id="jh-coyote"></div></div>
    <span class="jh-val" id="jh-coyote-val">0ms</span>
  </div>
  <div class="jh-row">
    <span class="jh-label">Buffer</span>
    <div class="jh-bar"><div class="jh-fill" id="jh-buffer"></div></div>
    <span class="jh-val" id="jh-buffer-val">0ms</span>
  </div>
  <div class="jh-note" id="jh-note">—</div>
`;
document.body.appendChild(hud);
const jhCoy = document.getElementById('jh-coyote');
const jhBuf = document.getElementById('jh-buffer');
const jhValC = document.getElementById('jh-coyote-val');
const jhValB = document.getElementById('jh-buffer-val');
const jhNote = document.getElementById('jh-note');

// flash when a jump happens, showing source + if buffered
window.addEventListener('jump-source', (e) => {
  const { source, buffered } = e.detail || {};
  jhNote.textContent = `${source || 'unknown'}${buffered ? ' + buffer' : ''}`;
  hud.classList.remove('flash-ground','flash-coyote','flash-unknown');
  hud.classList.add(`flash-${source || 'unknown'}`);
  setTimeout(()=>hud.classList.remove('flash-ground','flash-coyote','flash-unknown'), 180);
});

// update bars each frame via onTick (no changes to your main loop)
onTick(() => {
  const c = Math.max(0, Math.min(1, hero.coyoteTime / (hero.maxCoyote || 1)));
  const b = Math.max(0, Math.min(1, hero.bufferClock / (hero.bufferTime || 1)));
  jhCoy.style.width = (c*100).toFixed(0) + '%';
  jhBuf.style.width = (b*100).toFixed(0) + '%';
  jhValC.textContent = Math.round((hero.coyoteTime || 0) * 1000) + 'ms';
  jhValB.textContent = Math.round((hero.bufferClock || 0) * 1000) + 'ms';
});

// --- Pointer Mode (toggled by KeyP) ---
let pointerMode = false;           // false = legacy (LMB=hit, RMB=orbit); true = new behavior
let dragActive = false;
let dragStartX = 0;
let midDown = false;               // track wheel (middle mouse) state; while down → OrbitControls enabled

function setPointerMode(on){
  pointerMode = !!on;
  // reset any transient input
  input.left = input.right = false;
  hero.releaseJump();              // ensure no jump is held
  // enable orbit only if middle button is currently held in pointer mode
  controls.enabled = pointerMode ? !!midDown : false;
}

function pressAttack() { hero.doAttack(); }

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
    case 'KeyJ' : pressAttack(); break;
    case 'KeyP':
      setPointerMode(!pointerMode); console.log(`[PointerMode] ${pointerMode ? 'ON' : 'OFF'}`); break;
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
// Track for camera-idle logic (if you use those flags)
// ---------- Mouse / touch -> ATTACK (same path as KeyJ) ----------
let mouseDownLeft = false, mouseDownRight = false; // still used by camera-idle logic

// Fire from same function used by KeyJ
const attackFromPointer = (e) => {
  if (pointerMode) {
    // In pointer mode:
    //  - LMB = hit
    //  - MMB = OrbitControls (no hit)
    //  - RMB = jump (handled elsewhere)
    if (e.type !== 'touchstart' && e.button === 1) return; // wheel → orbit, do not attack
    if (e.type !== 'touchstart' && e.button === 2) return; // right → jump, do not attack
  } else {
    // Legacy: ignore RMB only; everything else can attack
    if (e.type !== 'touchstart' && e.button === 2) return;
  }
  pressAttack();
  if (e.cancelable) e.preventDefault();
};

// Track button state for your idle camera logic
const onPD = (e) => { if (e.button === 0) mouseDownLeft = true;  if (e.button === 2) mouseDownRight = true; };
const onPU = (e) => { if (e.button === 0) mouseDownLeft = false; if (e.button === 2) mouseDownRight = false; };

// --- PointerMode pointer handlers ---
function pointerModeDown(e){
  if (!pointerMode) return;

  // Prevent native RMB menu & middle-click autoscroll
  if (e.cancelable) e.preventDefault();

  // Track drag start (any button drag drives left/right)
  dragActive = true;
  dragStartX = e.clientX;

  if (e.button === 2) {
    // RMB → jump
    input.jumpHeld = true;
    hero.requestJump();
  } else if (e.button === 1) {
    // MMB → OrbitControls temporarily ON while held
    midDown = true;
    controls.enabled = true;
  }
}

function pointerModeMove(e){
  if (!pointerMode || !dragActive) return;
  const dx = e.clientX - dragStartX;
  const thresh = 6; // pixels to avoid jitter
  if (dx >  thresh) { input.right = true;  input.left = false; }
  else if (dx < -thresh) { input.left = true; input.right = false; }
  else { input.left = input.right = false; }
}

function pointerModeUp(e){
  if (!pointerMode) return;

  if (e.button === 2) {
    // release RMB jump
    input.jumpHeld = false;
    hero.releaseJump();
  } else if (e.button === 1) {
    // stop orbit on wheel release
    midDown = false;
    controls.enabled = false;
  }

  // stop drag → neutral movement
  dragActive = false;
  input.left = input.right = false;
}

// Bind in CAPTURE phase so nothing (including OrbitControls) can swallow it
const bindTargets = [window, document];
if (controls && controls.domElement) bindTargets.push(controls.domElement);

for (const t of bindTargets) {
  t.addEventListener('pointerdown', attackFromPointer, { capture: true, passive: false });
  t.addEventListener('mousedown',   attackFromPointer, { capture: true, passive: false });
  t.addEventListener('click',       attackFromPointer, { capture: true, passive: false });
  t.addEventListener('touchstart',  attackFromPointer, { capture: true, passive: false });

  t.addEventListener('pointerdown', onPD, { capture: true });
  t.addEventListener('pointerup',   onPU, { capture: true });

  // PointerMode input: movement by drag, RMB jump, MMB orbit
  t.addEventListener('pointerdown', pointerModeDown, { capture: true, passive: false });
  t.addEventListener('pointermove', pointerModeMove, { capture: true, passive: false });
  t.addEventListener('pointerup',   pointerModeUp,   { capture: true, passive: false });
  t.addEventListener('pointercancel', pointerModeUp, { capture: true, passive: false });
  // Avoid autoscroll / context menu interfering when in pointer mode
  t.addEventListener('contextmenu', (e)=>{ if(pointerMode) e.preventDefault(); }, { capture: true });

}

// Disable left-click on OrbitControls so it never competes with attack
if (controls) {
  controls.mouseButtons = {
    LEFT: null,          // no action on LMB
    MIDDLE: null,
    RIGHT: THREE.MOUSE.ROTATE
  };
  controls.touches = {
    ONE: THREE.TOUCH.NONE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };
}

// Keep context menu suppressed so RMB rotate is clean
window.addEventListener('contextmenu', (e) => e.preventDefault(), { capture: true });



// ---------- Debug ----------
const label = document.createElement('div');
label.style.pointerEvents = 'none';
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

  // Initial offset: 30° elevation, azimuth 0
  const elev30 = deg(30);
  const sph = new THREE.Spherical(radius, Math.PI/2 - elev30, 0);
  const offset = new THREE.Vector3().setFromSpherical(sph);
  camera.position.copy(target).add(offset);
  controls.target.copy(target);

  controls.update();

  // ✅ NEW: free left mouse for attack, only right mouse rotates
  controls.mouseButtons = {
    LEFT: null,
    MIDDLE: null,
    RIGHT: THREE.MOUSE.ROTATE
  };
  controls.touches = {
    ONE: THREE.TOUCH.NONE,
    TWO: THREE.TOUCH.DOLLY_PAN
  };
}


if (controls) {
  controls.addEventListener('change', () => {
    camAz  = controls.getAzimuthalAngle();
    camPol = controls.getPolarAngle();
  });
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

// Kill if character capsule touches a hazard's collider box
function capsuleTouchesBox(hero, box, radiusScale = 0.9) {
  const r = (hero.collider?.radius ?? 0.4) * radiusScale;
  const half = hero.collider?.height ? hero.collider.height * 0.5 : 0.8;

  // expand the box by radius in X and a tiny amount in Y
  const minX = box.min.x - r, maxX = box.max.x + r;
  const minY = box.min.y - r * 0.6, maxY = box.max.y + r * 0.6;

  const cx = hero.collider.position.x;
  const topY = hero.collider.position.y + half;
  const botY = hero.collider.position.y - half;

  const overlapX = (cx >= minX) && (cx <= maxX);
  const overlapY = !(topY < minY || botY > maxY);
  return overlapX && overlapY;
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

  for (const p of platforms) {
    if (p.userData?.updateAABB) p.userData.updateAABB();
    else if (p.userData?.box)   p.userData.box.setFromObject(p);
  }

  if (DEBUG_COLLIDERS) {
    // refresh box wires to match live Box3
    for (const [p, wire] of debug.boxWires.entries()) {
      const box = p.userData?.box; if (!box) continue;
      const pos = wire.geometry.attributes.position;
      const min = box.min, max = box.max;
      const verts = [
        min.x,min.y,0,  max.x,min.y,0,
        max.x,min.y,0,  max.x,max.y,0,
        max.x,max.y,0,  min.x,max.y,0,
        min.x,max.y,0,  min.x,min.y,0,
      ];
      pos.array.set(verts); pos.needsUpdate = true;
    }

    // refresh ramp top/bottom + barrier lines
    for (const [p, extra] of debug.rampExtras.entries()) {
      const b = p.userData?.box; if (!b) continue;
      const {lowLine, highLine, topLine, botLine} = extra;

      // barrier lines
      const lowB  = p.userData.lowBarrierX  ?? b.min.x;
      const highB = p.userData.highBarrierX ?? b.max.x;
      const y0 = Math.min(b.min.y, b.max.y);
      const y1 = Math.max(b.min.y, b.max.y);

      lowLine.geometry.attributes.position.array.set([lowB,y0,0, lowB,y1,0]);
      lowLine.geometry.attributes.position.needsUpdate = true;
      highLine.geometry.attributes.position.array.set([highB,y0,0, highB,y1,0]);
      highLine.geometry.attributes.position.needsUpdate = true;

      // top/bottom polylines
      const cs = p.userData.slopeCorners; if (!cs) continue;
      const sorted = cs.slice().sort((a,b)=>a.x-b.x);
      const lowPair  = [sorted[0],sorted[1]];
      const highPair = [sorted[2],sorted[3]];
      const lerp = (a,b,x)=>{ const t=(x-a.x)/Math.max(1e-6,b.x-a.x); return a.y+(b.y-a.y)*Math.min(1,Math.max(0,t)); };

      const N = 32, minX = Math.min(...cs.map(c=>c.x)), maxX = Math.max(...cs.map(c=>c.x));
      const makeVerts = (isTop)=>{
        const pts=[];
        for(let i=0;i<=N;i++){
          const x = minX + (maxX-minX)*(i/N);
          const yTop = Math.max( lerp(lowPair[0],lowPair[1],x), lerp(highPair[0],highPair[1],x) );
          const yBot = Math.min( lerp(lowPair[0],lowPair[1],x), lerp(highPair[0],highPair[1],x) );
          pts.push(x, isTop? yTop : yBot, 0);
        }
        return pts;
      };
      topLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(makeVerts(true), 3));
      botLine.geometry.setAttribute('position', new THREE.Float32BufferAttribute(makeVerts(false), 3));
    }
  }

 // before hero.update(dt, input);
  // if (pendingAttack) {
  //   pendingAttack = false;
  //   hero.doAttack();   // Character's internal queue handles cooldown
  // }

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

      // --- NEW: FX when checkpoint is activated ---
      cp.material.emissive.setHex(0x00ff66);
      cp.material.emissiveIntensity = 1.5;
      cp.scale.set(1.5, 1.5, 1.5);
      setTimeout(() => cp.scale.set(1.0, 1.0, 1.0), 250);
    }
  }

  // Kill on any capsule touch against each hazard's collider box
  let hazardHit = false;
  if (hero.invuln <= 0) {
    for (const h of hazards) {
      h.userData?.updateAABB?.(); // refresh boxes if provided
      const killBox = h.userData?.box || h.userData?.aabb;
      if (!killBox) continue;
      if (capsuleTouchesBox(hero, killBox)) { hazardHit = true; break; }
    }
  }
  if (hazardHit) {
    fade.flash(1, 120);
    addShake(300);
    hero.respawn();
  }

  // Update camera
  updateCamera(dt);

  // fall out of level
  if (hero.mesh.position.y < -10) {
    fade.flash(1, 80);
    hero.respawn();
  }

  // Debug
  label.textContent =
    `onGround:${hero.onGround} | facing:${hero.facingDir} | attacking:${hero.attacking} | camAz:${controls.getAzimuthalAngle().toFixed(2)} | camPol:${controls.getPolarAngle().toFixed(2)} | onGround:${hero.onGround} | facing:${hero.facingDir} | ... | Pmode:${pointerMode?'ON':'OFF'}`;
});

// Listen to debug events emitted by character.js and flash the offender
window.addEventListener('dbg-hit', (e)=>{
  if (!DEBUG_COLLIDERS) return;
  const d = e.detail || {};
  if (d.kind === 'flat-side' && d.platform) {
    const wire = debug.boxWires.get(d.platform);
    flash(wire);
  }
  if (d.kind === 'ramp-high' && d.platform) {
    const extra = debug.rampExtras.get(d.platform);
    if (extra?.highLine) flash(extra.highLine);
  }
  if (d.kind === 'ramp-low' && d.platform) {
    const extra = debug.rampExtras.get(d.platform);
    if (extra?.lowLine) flash(extra.lowLine);
  }
  if (d.kind === 'ramp-top-claim' && d.platform) {
    const extra = debug.rampExtras.get(d.platform);
    if (extra?.topLine) flash(extra.topLine, 120, 0x00ffaa);
  }
});
