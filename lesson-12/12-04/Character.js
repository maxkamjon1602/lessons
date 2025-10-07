// 12-lesson/steps/12-04/overrides/entities/Character.js
import * as THREE from 'three';
import { CapsuleCollider } from '@core/utils/Capsule.js';

export class Character {
  constructor({ scene, shadow = true } = {}) {
    // Collider
    this.collider = new CapsuleCollider({
      radius: 0.4,
      height: 1.6,
      position: { x: 0, y: 1.0, z: 0 }
    });

    // Jump + gravity (Hollow Knight style)
    this.jumpStrength = 6.7;
    this.gravityUp    = 15;  // rising + held
    this.gravityCut   = 26;  // rising + released
    this.gravityFall  = 34;  // falling

    // State
    this.onGround   = false;
    this.jumpHeld   = false;
    this.coyoteTime = 0;
    this.maxCoyote  = 0.12;

    // Jump buffering
    this.bufferTime  = 0.10;
    this.bufferClock = 0;
    this._jumpQueued = false;

    // Horizontal motion
    this.maxSpeed    = 6.0;
    this.accelGround = 40.0;
    this.accelAir    = 20.0;
    this.dampGround  = 12.0;
    this.dampAir     = 1.0;

    // Visual
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

  // ===== Input hooks =====
  requestJump() {
    this._jumpQueued = true;
    this.bufferClock = this.bufferTime;
    this.jumpHeld = true;
  }
  releaseJump() {
    this.jumpHeld = false;
  }

  // ===== Core logic =====
  tryConsumeJump() {
    const canJump = this.onGround || this.coyoteTime > 0;
    if (this._jumpQueued && canJump) {
      this.collider.velocity.y = this.jumpStrength;
      this.onGround = false;
      this.coyoteTime = 0;
      this._jumpQueued = false;
      this.bufferClock = 0;
      return true;
    }
    return false;
  }

  applyVerticalGravity(dt) {
    const vy = this.collider.velocity.y || 0;
    if (vy > 0) {
      // Rising
      this.collider.velocity.y -= (this.jumpHeld ? this.gravityUp : this.gravityCut) * dt;
    } else {
      // Falling
      this.collider.velocity.y -= this.gravityFall * dt;
    }
  }

  resolveGroundAndIntegrate(dt) {
    // Apply gravity & integrate vertical
    this.applyVerticalGravity(dt);
    const nextY = this.collider.position.y + this.collider.velocity.y * dt;

    const half = this.collider.height * 0.5;
    const groundY = 0.0 + half;

    if (nextY - half <= 0.0) {
      // Landed
      this.collider.position.y = groundY;
      this.collider.velocity.y = 0;
      if (!this.onGround) this.coyoteTime = this.maxCoyote;
      this.onGround = true;
    } else {
      // Airborne
      this.collider.position.y = nextY;
      if (this.onGround) {
        this.onGround = false;
        this.coyoteTime = this.maxCoyote;
      } else {
        this.coyoteTime = Math.max(0, this.coyoteTime - dt);
      }
    }

    // Sync mesh vertical
    this.mesh.position.y = this.collider.position.y;
  }

  integrateHorizontal(dt, input) {
    const left  = !!input?.left;
    const right = !!input?.right;
    const ax    = (this.onGround ? this.accelGround : this.accelAir);

    const vx0 = this.collider.velocity.x || 0;

    let a = 0;
    if (left && !right)  a = -ax;
    if (right && !left)  a =  ax;

    let vx = vx0 + a * dt;

    const damp = (this.onGround ? this.dampGround : this.dampAir);
    if (a === 0) {
      const sign = Math.sign(vx);
      const mag  = Math.max(0, Math.abs(vx) - damp * dt);
      vx = sign * mag;
    }

    vx = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, vx));

    this.collider.position.x += vx * dt;
    this.collider.velocity.x = vx;

    if (Math.abs(vx) > 0.01) {
      this.mesh.rotation.y = (vx > 0) ? 0 : Math.PI;
    }
    this.mesh.position.x = this.collider.position.x;
  }

  update(dt, input) {
    // Buffer window
    if (this.bufferClock > 0) {
      this.bufferClock = Math.max(0, this.bufferClock - dt);
      if (this.bufferClock === 0) this._jumpQueued = false;
    }

    // Try to start a jump (coyote/buffer aware)
    this.tryConsumeJump();

    // Vertical & ground
    this.resolveGroundAndIntegrate(dt);

    // Horizontal
    this.integrateHorizontal(dt, input);
  }
}
