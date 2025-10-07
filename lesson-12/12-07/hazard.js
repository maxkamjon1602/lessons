// hazard.js
import * as THREE from 'three';

/** Spike cluster that sits on the platform top (no visible base). */
export function makeSpikePit({ centerX, topY, width = 2, count = 5, spikeH = 0.9 }) {
  const group = new THREE.Group();

  // --- Spikes (visual only) ---
  const spacing = width / count;
  const coneGeo = new THREE.ConeGeometry(spacing * 0.45, spikeH, 20);
  const coneMat = new THREE.MeshStandardMaterial({
    color: 0xff2d2d, emissive: 0x330000, emissiveIntensity: 0.25, roughness: 0.45
  });

  for (let i = 0; i < count; i++) {
    const spike = new THREE.Mesh(coneGeo, coneMat);
    spike.position.set(-width/2 + spacing * (i + 0.5), spikeH * 0.5, 0);
    spike.castShadow = true;
    group.add(spike);
  }

  // Position so local y=0 equals platform top
  group.position.set(centerX, topY + 0.001, 0);

  // --- Invisible collider: full rectangular block covering the cones ---
  // This makes spikes solid from sides AND from below (no jump-through).
  const collBox = new THREE.Mesh(
    new THREE.BoxGeometry(width, spikeH, 1),
    new THREE.MeshStandardMaterial({ visible: false })
  );
  collBox.position.set(0, spikeH * 0.5, 0);
  group.add(collBox);

  // Collision data
  group.userData.box = new THREE.Box3().setFromObject(collBox); // used for side/solid collisions
  group.userData.ceilY = topY + 0.001;                          // used to block jumps from below

  // For kill tests (broad-phase)
  group.userData.aabb = new THREE.Box3().setFromObject(group);
  group.userData.updateAABB = () => {
    group.userData.box.setFromObject(collBox);
    group.userData.aabb.setFromObject(group);
  };

  return group;
}

/** Broad "touch" test: AABB (expanded) vs point; we'll switch to capsule in main.js. */
export function hitsHazard(point, hazards, pad = 0.0) {
  for (const h of hazards) {
    h.userData.updateAABB?.();
    const box = h.userData?.aabb; if (!box) continue;
    const expanded = box.clone();
    expanded.min.x -= pad; expanded.max.x += pad;
    expanded.min.y -= pad; expanded.max.y += pad;
    expanded.min.z -= pad; expanded.max.z += pad;
    if (expanded.containsPoint(point)) return true;
  }
  return false;
}
