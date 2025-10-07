// hazard.js
import * as THREE from 'three';

/** Spike pit that clearly sits ON the platform top (visible, no z-fight). */
export function makeSpikePit({ centerX, topY, width = 2, count = 5, pitHeight = 0.14 }) {
  const group = new THREE.Group();

  // Base slightly below platform top -> rim impression (won't hide spikes)
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(width, pitHeight, 1),
    new THREE.MeshStandardMaterial({ color: 0x9c1b1b, roughness: 0.75 })
  );
  base.position.set(0, -(pitHeight * 0.65) - 0.001, 0);
  group.add(base);

  // Spikes clearly above platform
  const spikeH = 0.9;
  const spacing = width / count;
  const cone = new THREE.ConeGeometry(spacing * 0.45, spikeH, 20);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xff2d2d, emissive: 0x330000, emissiveIntensity: 0.25, roughness: 0.45
  });

  for (let i = 0; i < count; i++) {
    const spike = new THREE.Mesh(cone, mat);
    spike.position.set(-width/2 + spacing * (i + 0.5), spikeH * 0.5 + 0.02, 0);
    spike.castShadow = true;
    group.add(spike);
  }

  // place so local y=0 equals platform top; tiny nudge avoids z-fight
  group.position.set(centerX, topY + 0.001, 0);

  // AABB for hit test
  group.userData.aabb = new THREE.Box3().setFromObject(group);
  group.userData.updateAABB = () => group.userData.aabb.setFromObject(group);
  return group;
}

/** Tight hazard hit test (only around spike height). */
export function hitsHazard(point, hazards, pad = 0.28) {
  for (const h of hazards) {
    h.userData.updateAABB?.();
    const box = h.userData.aabb; if (!box) continue;

    const expanded = box.clone();
    expanded.min.x -= pad; expanded.max.x += pad;
    expanded.min.z -= pad; expanded.max.z += pad;

    // only at spike height
    const yTol = 0.05;
    expanded.min.y -= yTol; expanded.max.y += yTol;

    if (expanded.containsPoint(point)) return true;
  }
  return false;
}
