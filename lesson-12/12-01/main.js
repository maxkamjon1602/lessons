// 12-lesson/steps/12-01/main.js
import { scene, onTick } from '@core/shared/env.js';
import { Character } from '@core/entities/Character.js';
import * as THREE from 'three';

// Visual block for scale
const block = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0xffb703, roughness: 0.8 })
);
block.position.set(2.5, 0.5, 0);
block.castShadow = true;
scene.add(block);

// Character (v1)
const hero = new Character({ scene });

// Tick
let last = performance.now();
onTick(() => {
  const now = performance.now();
  const dt = Math.min((now - last) / 1000, 1/30);
  last = now;
  hero.update(dt);
});
