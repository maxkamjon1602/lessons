import * as THREE from 'three';

export class DustBurst {
  constructor(scene, { count = 24, life = 0.35 } = {}) {
    this.scene = scene;
    this.life = life;
    this.t = 0;

    const geom = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      positions[i3+0] = 0; positions[i3+1] = 0; positions[i3+2] = 0;
      const angle = Math.random() * Math.PI;
      const speed = 1.5 + Math.random() * 1.0;
      velocities[i3+0] = Math.cos(angle) * speed;
      velocities[i3+1] = Math.random() * 1.2;
      velocities[i3+2] = (Math.random() - 0.5) * 0.5;
    }
    geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geom.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const mat = new THREE.PointsMaterial({ size: 0.06, color: 0x999999 });
    this.points = new THREE.Points(geom, mat);
    this.points.frustumCulled = false;
    this.points.visible = false;
    scene.add(this.points);
  }

  trigger(x, y, z = 0) {
    this.points.position.set(x, y, z);
    this.t = 0;
    this.points.visible = true;
  }

  update(dt) {
    if (!this.points.visible) return;
    this.t += dt;
    const pos = this.points.geometry.getAttribute('position');
    const vel = this.points.geometry.getAttribute('velocity');

    for (let i = 0; i < pos.count; i++) {
      const i3 = i * 3;
      vel.array[i3+1] -= 9 * dt;
      pos.array[i3+0] += vel.array[i3+0] * dt;
      pos.array[i3+1] += vel.array[i3+1] * dt;
      pos.array[i3+2] += vel.array[i3+2] * dt;
    }
    pos.needsUpdate = true;

    this.points.material.opacity = Math.max(0, 1 - this.t / this.life);
    this.points.material.transparent = true;

    if (this.t >= this.life) this.points.visible = false;
  }
}
