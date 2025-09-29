import * as THREE from 'three';

/** Spike pit that sits on top of a platform, with a proper collision box */
export function makeSpikePit({ centerX, topY, width = 2, count = 5, pitHeight = 0.14 }) {
  const group = new THREE.Group();

  // --- Base (rim impression) ---
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, pitHeight, 1),
    new THREE.MeshStandardMaterial({ color: 0x9c1b1b, roughness: 0.75 })
  );
  base.position.set(0, -(pitHeight * 0.65) - 0.001, 0);
  group.add(base);

  // --- Spikes ---
  const spikeH = 0.9;
  const spacing = width / count;
  const cone = new THREE.ConeGeometry(spacing * 0.45, spikeH, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff2d2d,
    emissive: 0x330000,
    emissiveIntensity: 0.25,
    roughness: 0.45,
  });

  for (let i = 0; i < count; i++) {
    const spike = new THREE.Mesh(cone, mat);
    spike.position.set(-width / 2 + spacing * (i + 0.5), spikeH * 0.5 + 0.02, 0);
    spike.castShadow = true;
    group.add(spike);
  }

  // --- Position hazard group so y=0 = platform top ---
  group.position.set(centerX, topY + 0.001, 0);

  // --- Invisible collider (matches full spike pit width/height) ---
  const collBox = new THREE.Mesh(
    new THREE.BoxGeometry(width, spikeH, 1),
    new THREE.MeshStandardMaterial({ visible: false }) // invisible hitbox
  );
  collBox.position.set(0, spikeH * 0.5, 0); // centered on spikes
  group.add(collBox);

  // --- AABBs for collision ---
  group.userData.box = new THREE.Box3().setFromObject(collBox);   // used for side collisions
  group.userData.aabb = new THREE.Box3().setFromObject(group);    // used for hit test
  group.userData.updateAABB = () => {
    group.userData.box.setFromObject(collBox);
    group.userData.aabb.setFromObject(group);
  };

  // --- Top plane (for blocking from below) ---
  group.userData.ceilY = topY + 0.001;

  return group;
}

/** Tight hazard hit test (only around spike height). */
export function hitsHazard(point, hazards, pad = 0.28) {
  for (const h of hazards) {
    h.userData.updateAABB?.();
    const box = h.userData?.aabb; if (!box) continue;

    const expanded = box.clone();
    expanded.min.x -= pad; expanded.max.x += pad;
    expanded.min.z -= pad; expanded.max.z += pad;

    // only around spike height
    const yTol = 0.05;
    expanded.min.y -= yTol; expanded.max.y += yTol;

    if (expanded.containsPoint(point)) return true;
  }
  return false;
}
