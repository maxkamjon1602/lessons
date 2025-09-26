// 12-lesson/steps/12-03/overrides/entities/Character.js
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
    this.jumpStrength = 6.7; // initial upward velocity
    this.gravityUp    = 15;  // hold jump while rising
    this.gravityCut   = 26;  // released early while rising
    this.gravityFall  = 34;  // falling down (snappy)

    // State
    this.onGround   = false;
    this.jumpHeld   = false;   // true while the button is held
    this.coyoteTime = 0;
    this.maxCoyote  = 0.12;

    // Jump buffering
    this.bufferTime  = 0.10;
    this.bufferClock = 0;
    this._jumpQueued = false;

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
    this.jumpHeld = true;   // pressed this frame
  }
  releaseJump() {
    this.jumpHeld = false;  // released -> switch to gravityCut if still rising
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
    // Integrate vertical
    this.applyVerticalGravity(dt);
    const nextY = this.collider.position.y + this.collider.velocity.y * dt;

    const half = this.collider.height * 0.5;
    const groundY = 0.0 + half; // top of ground at y=0

    if (nextY - half <= 0.0) {
      // Landed
      this.collider.position.y = groundY;
      this.collider.velocity.y = 0;
      if (!this.onGround) this.coyoteTime = this.maxCoyote;
      this.onGround = true;
      // Do not auto-change jumpHeld here; release is driven by input
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

    // Sync mesh
    this.mesh.position.set(this.collider.position.x, this.collider.position.y, this.collider.position.z);
  }

  update(dt /* no horizontal in step 3 */) {
    // Decrement jump buffer
    if (this.bufferClock > 0) {
      this.bufferClock = Math.max(0, this.bufferClock - dt);
      if (this.bufferClock === 0) this._jumpQueued = false;
    }

    // Try to start a jump (uses coyote/buffer)
    this.tryConsumeJump();

    // Vertical integration + ground resolve (gravity profile depends on jumpHeld)
    this.resolveGroundAndIntegrate(dt);
  }
}
