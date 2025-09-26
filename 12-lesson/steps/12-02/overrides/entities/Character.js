// 12-lesson/steps/12-02/overrides/entities/Character.js
import * as THREE from 'three';
import { CapsuleCollider } from '@core/utils/Capsule.js';

export class Character {
  constructor({ scene, shadow = true } = {}) {
    this.collider = new CapsuleCollider({ radius: 0.4, height: 1.6, position: { x: 0, y: 1.0, z: 0 } });
    this.gravity = 15;
    this.onGround = false;
    this.coyoteTime = 0;
    this.maxCoyote = 0.12;
    this.velocity = new THREE.Vector3(0, 0, 0); // horizontal hooks

    const mat = new THREE.MeshStandardMaterial({ color: 0x3388ff, roughness: 0.5, metalness: 0.05 });
    const geo = new THREE.CapsuleGeometry(this.collider.radius, this.collider.height - 2 * this.collider.radius, 8, 16);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = shadow;
    this.mesh.position.set(this.collider.position.x, this.collider.position.y, this.collider.position.z);

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    nose.position.set(0, 0.2, this.collider.radius + 0.05);
    nose.rotation.x = Math.PI * 0.5;
    this.mesh.add(nose);

    scene.add(this.mesh);
  }

  resolveGround(dt) {
    this.collider.velocity.y -= this.gravity * dt;
    const nextY = this.collider.position.y + this.collider.velocity.y * dt;
    const half = this.collider.height * 0.5;
    const groundY = 0.0 + half;

    if (nextY - half <= 0.0) {
      this.collider.position.y = groundY;
      this.collider.velocity.y = 0;
      if (!this.onGround) this.coyoteTime = this.maxCoyote;
      this.onGround = true;
    } else {
      this.collider.position.y = nextY;
      if (this.onGround) {
        this.onGround = false;
        this.coyoteTime = this.maxCoyote;
      } else {
        this.coyoteTime = Math.max(0, this.coyoteTime - dt);
      }
    }

    this.mesh.position.set(this.collider.position.x, this.collider.position.y, this.collider.position.z);
  }

  update(dt) {
    this.resolveGround(dt);
    // Horizontal motion will use this.velocity.x/z in the next steps
  }
}
