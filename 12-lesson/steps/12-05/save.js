const KEY = 'lesson12_step05_checkpoint';

export function saveCheckpoint(vec3) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ x: vec3.x, y: vec3.y, z: vec3.z }));
  } catch {}
}

export function loadCheckpoint(defaultVec3) {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultVec3;
    const p = JSON.parse(raw);
    return { x: p.x ?? defaultVec3.x, y: p.y ?? defaultVec3.y, z: p.z ?? defaultVec3.z };
  } catch {
    return defaultVec3;
  }
}
