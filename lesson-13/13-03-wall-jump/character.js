// character.js - lesson 13 step 1

import * as THREE from 'three';
import { CapsuleCollider } from './Capsule.js';
import { DustBurst } from './dust.js';

export class Character {
  constructor({ scene, shadow = true, checkpoints = [], platforms = [], hazards = [] } = {}) {
    this.scene = scene;
    this.platforms = platforms;
    this.hazards = hazards;

    // Collider
    this.collider = new CapsuleCollider({
      radius: 0.4, height: 1.6, position: { x: 0, y: 1.0, z: 0 }
    });

    // Hollow Knight–style jump/grav
    this.jumpStrength = 10.4;
    this.gravityUp    = 17;
    this.gravityCut   = 26;
    this.gravityFall  = 34;

    this.onGround   = false;
    this.jumpHeld   = false;
    this.coyoteTime = 0;
    this.maxCoyote  = 0.12;
    this.bufferTime  = 0.10;
    this.bufferClock = 0;
    this._jumpQueued = false;
    // Step 02: double-jump caps
    this.maxAirJumps  = 1;  // allow one mid-air jump
    this.airJumpsUsed = 0;  // used air jumps since last landing

    // Step 03: wall jump
    this.wallNormal    = 0;    // -1: wall on left, +1: wall on right, 0: none
    this.wallStickMax  = 0.15; // seconds of “stick” window after a side collision
    this.wallStickTime = 0;    // countdown
    this.wallJumpVx    = 6.5;  // horizontal impulse (world units / s)
    this.wallJumpVyMul = 1.05; // multiply jumpStrength slightly on wall jump

    // Horizontal
    this.maxSpeed    = 6.0;
    this.accelGround = 40.0;
    this.accelAir    = 38.0;
    this.dampGround  = 12.0;
    this.dampAir     = 2.0;

    // Respawn & checkpoints
    this.respawnPoint = { x: 0, y: 1.0, z: 0 };
    this.checkpoints  = checkpoints;
    this.activeCheckpoint = null;

    // Invulnerability after respawn
    this.invuln = 0;
    this.invulnMax = 1.0;

    // Visual
    const mat = new THREE.MeshStandardMaterial({ color: 0x3388ff });
    const geo = new THREE.CapsuleGeometry(this.collider.radius, this.collider.height - 2*this.collider.radius, 8, 16);
    this.mesh = new THREE.Mesh(geo, mat);
    this.mesh.castShadow = shadow;
    this.mesh.position.copy(this.collider.position);
    this.facingDir = 1; // start facing right
    this.mesh.rotation.y = Math.PI / 2; // face +X at start

    const nose = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.25, 12), new THREE.MeshStandardMaterial({ color: 0xffffff }));
    nose.position.set(0, 0.2, this.collider.radius + 0.05);
    nose.rotation.x = Math.PI * 0.5;
    this.mesh.add(nose);
    
    // --- Attack state ---
    this.attackCooldown = 0;
    this.attackMax = 0.28;       // a bit snappier
    this.attacking = false;
    this.attackQueue = 0;        // how many clicks buffered
    this.attackQueueMax = 3;     // cap so it can't explode

    // Debug attack hitbox
    const boxGeo = new THREE.BoxGeometry(1.2, 1.0, 0.5);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0xff3333, transparent: true, opacity: 0.35 });
    this.attackHitbox = new THREE.Mesh(boxGeo, boxMat);
    this.attackHitbox.visible = false;
    scene.add(this.attackHitbox);

    scene.add(this.mesh);

    // FX
    this.dust = new DustBurst(scene);

    // Landing detection helpers
    this._wasOnGround = false;
    this._lastVy = 0;
  }

  // convenience for checkpoint logic + hazard hit test
  get bottomY() { 
    return this.collider.position.y - this.collider.height * 0.5; 
  }

  // Input
  requestJump() { this._jumpQueued = true; this.bufferClock = this.bufferTime; this.jumpHeld = true; }
  releaseJump() { 
    this.jumpHeld = false;
    // extra cut for very short taps
    if (this.collider.velocity.y > 0) {
      this.collider.velocity.y *= 0.6;
    } 
  }

  // Jump helpers
  tryConsumeJump() {
    // Ground/coyote first…
    const canGroundJump = (this.onGround || this.coyoteTime > 0);
    // …otherwise allow exactly one mid-air jump
    const canAirJump = (!this.onGround && this.coyoteTime <= 0 && (this.airJumpsUsed < this.maxAirJumps));

    if (this._jumpQueued && (canGroundJump || canAirJump)) {
      // Tell HUD what triggered the jump (Step 01 HUD hook)
      const source = canGroundJump ? (this.onGround ? 'ground' : 'coyote') : 'air';
      const buffered = this.bufferClock > 0;
      window.dispatchEvent(new CustomEvent('jump-source', { detail: { source, buffered } }));

      this.collider.velocity.y = this.jumpStrength;
      this.onGround = false;
      this.coyoteTime = 0;
      this._jumpQueued = false;
      this.bufferClock = 0;

      if (canAirJump) {
        this.airJumpsUsed += 1; // consume the mid-air jump
      }
      return true;
    }
    return false;
  }

  applyVerticalGravity(dt) {
    const vy = this.collider.velocity.y || 0;
    if (vy > 0) {
      this.collider.velocity.y -= (this.jumpHeld ? this.gravityUp : this.gravityCut) * dt;
    } else {
      this.collider.velocity.y -= this.gravityFall * dt;
    }
  }

  // Horizontal
  integrateHorizontal(dt, input) {
    const left  = !!input?.left;
    const right = !!input?.right;
    const ax    = (this.onGround ? this.accelGround : this.accelAir);

    const vx0 = this.collider.velocity.x || 0;
    let a = 0;
    if (left && !right)  a = -ax;
    if (right && !left)  a =  ax;

    let vx = vx0 + a * dt;

    // air turn assist: if pushing opposite to current velocity in air, apply extra brake
    if (!this.onGround && a !== 0 && Math.sign(vx0) !== Math.sign(a)) {
      const turnBrake = 50.0;                      // strong instant counter
      const brake = Math.min(Math.abs(vx0), turnBrake * dt) * Math.sign(vx0);
      vx -= brake; // reduce old momentum quickly
    }

    const damp = (this.onGround ? this.dampGround : this.dampAir);
    if (a === 0) {
      const sign = Math.sign(vx);
      const mag = Math.max(0, Math.abs(vx) - damp * dt);
      vx = sign * mag;
    }

    vx = Math.min(this.maxSpeed, Math.max(-this.maxSpeed, vx));
    this.collider.position.x += vx * dt;
    this.collider.velocity.x = vx;

    // ---- ALWAYS face sideways along X (not camera) ----
    if (Math.abs(vx) > 0.01) {
      this.facingDir = (vx > 0) ? 1 : -1;
    }
    // +X = -90°, -X = +90° around Y
    this.mesh.rotation.y = (this.facingDir === 1) ? Math.PI / 2 :  -Math.PI / 2;

    // --- Side collision vs platforms (2D X/Y AABB) ---
    const half = this.collider.height * 0.5;
    const bottomY = this.collider.position.y - half;
    const topY    = this.collider.position.y + half;
    let hitWallThisFrame = false; // NEW: reset per frame
    // (rest of your collision code unchanged)

    for (const obj of this.platforms) {
      obj.userData?.updateAABB?.();
      const box = obj.userData?.box;
      if (!box) continue;

      // vertical overlap check
      const margin = 0.002;
      const overlapY = (topY > box.min.y + margin) && (bottomY < box.max.y - margin);

      // skip when clearly under or above
      const headBelow = topY <= box.min.y + margin;
      const feetAbove = bottomY >= box.max.y - margin;
      if (!overlapY || headBelow || feetAbove) continue;

      // horizontal penetration
      const minX = box.min.x - this.collider.radius;
      const maxX = box.max.x + this.collider.radius;
      if (this.collider.position.x >= minX && this.collider.position.x <= maxX) {
        const distL = Math.abs(this.collider.position.x - minX);
        const distR = Math.abs(maxX - this.collider.position.x);

        // Snap to nearest face
        const snapToLeftFace = (distL < distR);
        this.collider.position.x = snapToLeftFace ? minX : maxX;
        this.collider.velocity.x = 0;

        // NEW: Step 03 — mark wall and start stick window
        hitWallThisFrame = true;                       // <-- declare this (see step 2)
        this.wallNormal    = snapToLeftFace ? (+1) : (-1); // +1 = wall on right, -1 = wall on left
        this.wallStickTime = this.wallStickMax;
      }
    }
    // NEW: if no side hit this frame, decay the stick timer
    if (!hitWallThisFrame) {
      this.wallStickTime = Math.max(0, this.wallStickTime - dt);
      if (this.wallStickTime === 0) this.wallNormal = 0;
    }
    this.mesh.position.x = this.collider.position.x;
  }

  // Checkpoint API
  setCheckpoint(vec3, mesh) {
    this.respawnPoint = { x: vec3.x, y: vec3.y, z: vec3.z };
    this.activeCheckpoint = mesh ?? this.activeCheckpoint;
    if (this.activeCheckpoint) {
      this.activeCheckpoint.material.emissive = new THREE.Color(0x00ff66);
      this.activeCheckpoint.material.emissiveIntensity = 1.2;
      this.activeCheckpoint.scale.set(1.2, 1.2, 1.2);
    }
  }

  respawn() {
    this.collider.setPosition(this.respawnPoint.x, this.respawnPoint.y, this.respawnPoint.z);
    this.collider.velocity.y = 0;
    this.invuln = this.invulnMax;
    this.airJumpsUsed = 0;
    this._jumpQueued = false;
    this.bufferClock = 0;
    this.coyoteTime = 0;

    this.wallStickTime = 0;
    this.wallNormal = 0;
  }

  // Vertical + ground
  resolveGroundAndIntegrate(dt) {
    this.applyVerticalGravity(dt);

    const prevY = this.collider.position.y;
    const nextY = this.collider.position.y + this.collider.velocity.y * dt;    
    const half = this.collider.height * 0.5;
    {
      // integrate to nextY (airborne for now)
      this.collider.position.y = nextY;
      if (this.onGround) {
        this.onGround = false;
        this.coyoteTime = this.maxCoyote;
      } else {
        this.coyoteTime = Math.max(0, this.coyoteTime - dt);
      }

      // --- ceiling collision (stop upward motion) ---
      if (this.collider.velocity.y > 0) {
        const radius = this.collider.radius;
        const half   = this.collider.height * 0.5;
        const headY  = this.collider.position.y + half;

        for (const p of this.platforms) {
          const box = p.userData?.box; if (!box) continue;
          const insideX = (
            this.collider.position.x >= box.min.x - radius &&
            this.collider.position.x <= box.max.x + radius
          );
          const hitCeiling = insideX && headY >= box.min.y && headY <= box.min.y + 0.05;
          if (hitCeiling) {
            this.collider.position.y = box.min.y - half;
            this.collider.velocity.y = 0;
            break;
          }
        }
      }

      // --- ceiling collision vs hazard base (block from below, but don't behave like platforms) ---
      if (this.collider.velocity.y > 0 && this.hazards?.length) {
        const radius = this.collider.radius;
        const half   = this.collider.height * 0.5;
        const headPrev = prevY + half;
        const headNow  = this.collider.position.y + half;

        for (const h of this.hazards) {
          h.userData?.updateAABB?.();
          const box = h.userData?.aabb;
          // Use explicit ceilY if present; otherwise, use the group's world Y (local y=0 is platform top)
          const ceilY = (h.userData?.ceilY != null) ? h.userData.ceilY : h.position.y;
          if (!box || ceilY == null) continue;

          const insideX = (this.collider.position.x >= box.min.x - radius) &&
                          (this.collider.position.x <= box.max.x + radius);

          const crossedBase = insideX && headPrev < ceilY && headNow >= ceilY;
          if (crossedBase) {
            this.collider.position.y = ceilY - half;
            this.collider.velocity.y = 0;
            break;
          }
        }
      }


      // --- robust platform top support (no jump-through) ---
      const radius = this.collider.radius;
      const feetPrev = prevY - half;
      const feetNow  = this.collider.position.y - half;
      const vy       = this.collider.velocity.y;

      // tolerances
      const skin  = 0.02;  // glue-to-surface tolerance
      const penTol = 0.15; // forgiveness if slightly inside due to spawn/substep

      let snapped = false;
      for (const p of this.platforms) {
        const box = p.userData?.box; if (!box) continue;

        const topY = box.max.y;
        const minX = box.min.x - radius;
        const maxX = box.max.x + radius;
        const insideX = (this.collider.position.x >= minX) && (this.collider.position.x <= maxX);
        if (!insideX) continue;

        // 1) Normal fall crossing
        const crossedFromAbove = (feetPrev > topY + skin) && (feetNow <= topY + skin) && (vy <= 0);
        // 2) Continuous support while walking along the surface
        const resting = (Math.abs(feetNow - topY) <= skin + 1e-4) && (vy <= 0);
        // 3) Slight penetration forgiveness (spawn/edge/substep)
        const forgivingCatch = (feetNow <= topY + skin) && (feetPrev >= topY - penTol) && (vy <= 0);

        if (crossedFromAbove || resting || forgivingCatch) {
          this.collider.position.y = topY + half + 1e-4;
          this.collider.velocity.y = 0;

          if (!this.onGround) this.coyoteTime = this.maxCoyote;
          const wasAir = !this.onGround;
          this.onGround = true;
          this.wallStickTime = 0;
          this.wallNormal = 0;

          this.airJumpsUsed = 0; // Step 02: refresh mid-air allowance on landing

          if (wasAir && (vy < -6)) this.dust.trigger(this.collider.position.x, topY + 0.05, 0);
          snapped = true;
          break;
        }
      }

      if (!snapped) {
        // didn’t land on any platform this frame → airborne
        if (this.onGround) {
          this.onGround = false;
          this.coyoteTime = this.maxCoyote;
        }
      }
    }

    // Sync mesh & flags
    this.mesh.position.copy(this.collider.position);
    this._wasOnGround = this.onGround;
    this._lastVy = this.collider.velocity.y;
  }

  // fire immediately if possible, otherwise queue it
  doAttack() {
    if (this.attackCooldown > 0) {
      if (this.attackQueue < this.attackQueueMax) this.attackQueue++;
      return;
    }
    this._fireAttack();
  }

  _fireAttack() {
    this.attacking = true;
    this.attackCooldown = this.attackMax;

    const dir = this.facingDir; // <- use facing, not camera

    this.attackHitbox.position.set(
      this.collider.position.x + dir * (this.collider.radius + 0.6),
      this.collider.position.y,
      this.collider.position.z
    );
    this.attackHitbox.visible = true;
    this.attackHitbox.material.opacity = 0.6;
    this.attackHitbox.material.emissive = new THREE.Color(0xff4444);
    this.attackHitbox.material.emissiveIntensity = 0.8;

    setTimeout(() => {
      this.attackHitbox.material.opacity = 0.35;
      this.attackHitbox.material.emissiveIntensity = 0.0;
    }, 100);

    this.dust.trigger(this.attackHitbox.position.x, this.attackHitbox.position.y, 0);
  }

  update(dt, input) {
    // Blink during invuln
    if (this.invuln > 0) {
      this.invuln = Math.max(0, this.invuln - dt);
      const blink = (Math.sin(performance.now() * 0.02) * 0.5 + 0.5) * 0.5 + 0.25;
      this.mesh.material.transparent = true;
      this.mesh.material.opacity = 0.6 + 0.4 * blink;
    } else {
      this.mesh.material.opacity = 1;
      this.mesh.material.transparent = false;
    }

    // Jump buffer
    if (this.bufferClock > 0) {
      this.bufferClock = Math.max(0, this.bufferClock - dt);
      if (this.bufferClock === 0) this._jumpQueued = false;
    }

    // Step 03: Wall jump has PRIORITY over generic consumption
    let consumedThisFrame = false;
    if (this._jumpQueued && !this.onGround && this.coyoteTime <= 0 && this.wallStickTime > 0) {
      const n = (this.wallNormal || (this.facingDir>=0?+1:-1)); // +1 = wall on right

      // vertical impulse (slightly stronger than normal jump)
      this.collider.velocity.y = this.jumpStrength * this.wallJumpVyMul;
      // horizontal impulse away from wall
      this.collider.velocity.x = -n * this.wallJumpVx;

      // consume intent & stick; do NOT touch airJumpsUsed here
      this._jumpQueued   = false;
      this.bufferClock   = 0;
      this.coyoteTime    = 0;
      this.wallStickTime = 0;
      this.onGround      = false;

      // flip facing away from wall (optional)
      this.facingDir = (n > 0) ? -1 : 1;

      // HUD flash
      window.dispatchEvent(new CustomEvent('jump-source', { detail: { source:'wall', buffered:false } }));

      if (this.dust) this.dust.trigger(this.collider.position.x, this.collider.position.y - 0.05, 0);
      consumedThisFrame = true;
    }

    // If no wall jump happened, try ground/coyote/air jump consumption
    if (!consumedThisFrame) {
      this.tryConsumeJump();
    }

    this.resolveGroundAndIntegrate(dt);
    this.integrateHorizontal(dt, input);
    this.dust.update(dt);

    // --- Attack cooldown logic ---
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
      if (this.attackCooldown <= this.attackMax - 0.1) {
        this.attackHitbox.visible = false; // hide quickly
      }
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 0;
        this.attacking = false;
        if (this.attackQueue > 0) {   // consume buffered clicks ASAP
          this.attackQueue--;
          this._fireAttack();
        }
      }
    }
  }
}
