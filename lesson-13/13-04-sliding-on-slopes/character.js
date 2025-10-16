// character.js - lesson 13 step 1

import * as THREE from 'three';
import { CapsuleCollider } from './Capsule.js';
import { DustBurst } from './dust.js';

export class Character {
  constructor({ scene, shadow = true, checkpoints = [], platforms = [], hazards = [] } = {}) {
    this.scene = scene;
    this.platforms = platforms;
    this.hazards = hazards;
    this._lowEdgeGrace = 0; // frames of skip for ramp low-edge side resolution

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

    // Step 04: slopes
    this._groundPlatform = null; // last platform we’re resting on (for slope metadata)
    this._slopeAngleRad  = 0;    // current ground angle in radians (0 = flat)
    this._slopeDir       = 0;    // +1 rises to right, -1 rises to left (downhill is -_slopeDir)
    this.slopeCritDeg    = 40;   // slide if angle > 40° (full effect)
    this.slopeCrit       = this.slopeCritDeg * Math.PI / 180;
    this.slideAccelBase  = 60;   // baseline along-slope acceleration (units/s^2)

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

  // Returns local {top,bottom,minX,maxX} on a slope platform at world x
  _slopeTopBottomAtX(obj, x) {
    const hasCorners = !!obj.userData?.slopeCorners;
    if (!hasCorners) return null;

    const minX = obj.userData.lowX;
    const maxX = obj.userData.highX;
    const t = (Math.min(maxX - 1e-4, Math.max(minX + 1e-4, x)) - minX) / Math.max(1e-6, maxX - minX);

    // Interpolate along the sloped edges using the precomputed endpoints
    const top = obj.userData.topLow  + (obj.userData.topHigh  - obj.userData.topLow)  * t;
    const bot = obj.userData.botLow  + (obj.userData.botHigh  - obj.userData.botLow)  * t;

    return { top, bottom: bot, minX, maxX };
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

    // Ensure slope metadata is set whenever we're on ground over a sloped slab
    if (this.onGround && (this._slopeAngleRad <= 0 || !this._groundPlatform)) {
      for (const obj of this.platforms) {
        const box = obj.userData?.box; if (!box) continue;
        const ang = obj.userData?.slopeAngleDeg;
        if (typeof ang !== 'number' || ang <= 0) continue;

        const minX0 = box.min.x, maxX0 = box.max.x;
        if (this.collider.position.x < minX0 || this.collider.position.x > maxX0) continue;

        // local top at center X
        const dir   = (obj.userData?.slopeDir === -1) ? -1 : +1;
        const spanX = Math.max(1e-6, maxX0 - minX0);
        const t     = (this.collider.position.x - minX0) / spanX;
        const yLow  = Math.min(box.min.y, box.max.y);
        const yHigh = Math.max(box.min.y, box.max.y);
        const alpha = (dir === +1) ? t : (1 - t);
        const topLocal = yLow + (yHigh - yLow) * alpha;

        const half = this.collider.height * 0.5;
        const feet = this.collider.position.y - half;
        if (Math.abs(feet - (topLocal)) <= 0.04) {
          this._groundPlatform = obj;
          this._slopeAngleRad  = ang * Math.PI / 180;
          this._slopeDir       = dir;
          break;
        }
      }
    }

    const vx0 = this.collider.velocity.x || 0;
    let a = 0;
    if (left && !right)  a = -ax;
    if (right && !left)  a =  ax;

    // Step 04: slope-driven acceleration (additive)
    if (this.onGround && this._slopeAngleRad > 0) {
      const sin = Math.sin(this._slopeAngleRad);
      const downhillDir = -(this._slopeDir || 0); // downhill is opposite to “rises to right/left”
      if (this._slopeAngleRad > this.slopeCrit) {
        // Steep slope → always slide
        a += this.slideAccelBase * sin * downhillDir;
      } else if (a === 0) {
        // Shallow slope → only slide when no player input (friction dominates otherwise)
        a += 0.5 * this.slideAccelBase * sin * downhillDir;
      }
    }

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
    const prevX = this.collider.position.x; // swept test for low-edge entry
    this.collider.position.x += vx * dt;
    this.collider.velocity.x = vx;
    // store for side loop (used above)
    this._prevXForSide = prevX;

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

      // --- FLAT vs SLOPE branch --------------------------------------------
      const hasSlopeMeta = (typeof obj.userData?.slopeAngleDeg === 'number' && obj.userData.slopeAngleDeg > 0);

      // SAFETY: never side-resolve ramps; vertical pass already handles them (land/stand/slide)
      const minX0 = box.min.x, maxX0 = box.max.x;

      if (hasSlopeMeta) {
        const dir   = (obj.userData?.slopeDir === -1) ? -1 : +1; // +1 rises to right
        const r     = this.collider.radius;
        const nudge = 1e-4;

        const minX0 = box.min.x, maxX0 = box.max.x;

        // thickness-inclusive outer planes provided by main.js
        const lowB  = (obj.userData?.lowBarrierX  != null) ? obj.userData.lowBarrierX  : ((dir === +1) ? minX0 : maxX0);
        const highB = (obj.userData?.highBarrierX != null) ? obj.userData.highBarrierX : ((dir === +1) ? maxX0 : minX0);

        const half    = this.collider.height * 0.5;
        const topY    = this.collider.position.y + half;
        const bottomY = this.collider.position.y - half;

        const yBottom = Math.min(box.min.y, box.max.y);
        const yTopHi  = Math.max(box.min.y, box.max.y); // not used for insideY anymore

        const slabH   = obj.userData?.slabH ?? 0;
        const yTopLow = yBottom + slabH;
        const feetNow = this.collider.position.y - half;

        // --- sample local top at current X (matches vertical solver) ---
        const sampleTopAtX = () => {
          const spanX   = Math.max(1e-6, maxX0 - minX0);
          const clamped = Math.min(maxX0 - 1e-4, Math.max(minX0 + 1e-4, this.collider.position.x));
          const t       = (clamped - minX0) / spanX;
          const alpha   = (dir === +1) ? t : (1 - t);
          const rise    = Math.max(0, (yTopHi - yBottom) - slabH);
          return yTopLow + alpha * rise; // local upper surface
        };
        const topLocal = sampleTopAtX();

        // IMPORTANT: insideY must use the *local* top, not the AABB’s highest top.
        const insideY = (topY > yBottom + 0.01) && (bottomY < topLocal - 0.01);

        // swept crossings this frame (using barrier planes)
        const crossedHigh = (dir === +1)
          ? (this._prevXForSide >  highB + r && this.collider.position.x <= highB + r)
          : (this._prevXForSide <  highB - r && this.collider.position.x >= highB - r);

        const crossedLow = (dir === +1)
          ? (this._prevXForSide <  lowB  - r && this.collider.position.x >= lowB  - r)
          : (this._prevXForSide >  lowB  + r && this.collider.position.x <= lowB  + r);

        // ---- HIGH EDGE BARRIER (only if actually under the slope at this X) ----
        if (insideY && crossedHigh) {
          if (feetNow < topLocal - 0.01) { // under the surface → block
            this.collider.position.x = (dir === +1) ? (highB + r + nudge) : (highB - r - nudge);
            this.collider.velocity.x = 0;
            this.wallNormal    = (dir === +1) ? -1 : +1;
            this.wallStickTime = this.wallStickMax;
            hitWallThisFrame   = true;
          }
          window.dispatchEvent(new CustomEvent('dbg-hit', {
            detail: { kind:'ramp-high', platform: obj }
          }));
          continue;
        }

        // ---- LOW EDGE BARRIER (block only when trying to enter *under* the slab) ----
        if (insideY && crossedLow) {
          if (feetNow < yTopLow - 0.02) {   // below the slab at the low edge → block
            this.collider.position.x = (dir === +1) ? (lowB - r - nudge) : (lowB + r + nudge);
            this.collider.velocity.x = 0;
            this.wallNormal    = (dir === +1) ? +1 : -1;
            this.wallStickTime = this.wallStickMax;
            hitWallThisFrame   = true;
          }
          window.dispatchEvent(new CustomEvent('dbg-hit', {
            detail: { kind:'ramp-low', platform: obj }
          }));
          // else: near/above surface ⇒ let vertical solver claim it
          continue;
        }

        // no slope-side action this frame
        continue;
      }
      
      // ---------- FLAT PLATFORMS: swept sides only (no generic teleports) ----------
      if (!hasSlopeMeta) {
        // 1) If we're clearly under the flat slab, never side-resolve this frame
        if (topY <= box.min.y + 0.05) {
          continue;
        }

        // --- Hard skip: if our X lies under any SLOPE footprint, let the slope handle side-blocking ---
        //    (Prevents the flat ground from acting like an early invisible wall near the ramp tip.)
        let underAnySlopeX = false;
        for (const s of this.platforms) {
          const ang = s.userData?.slopeAngleDeg;
          if (typeof ang !== 'number' || ang <= 0) continue; // only ramps
          const sb = s.userData?.box; if (!sb) continue;
          if (this.collider.position.x >= sb.min.x - 1e-4 && this.collider.position.x <= sb.max.x + 1e-4) {
            underAnySlopeX = true;
            break;
          }
        }
        if (underAnySlopeX) {
          continue; // do NOT let the flat side wall block here; slope branch will handle it
        }

        // 2) Swept side test (prevents "stomach-through" but never teleports)
        const faceL = minX0 - this.collider.radius;
        const faceR = maxX0 + this.collider.radius;
        const insideY = (topY > box.min.y + 0.01) && (bottomY < box.max.y - 0.01);
        if (insideY) {
          const crossedL = (this._prevXForSide < faceL) && (this.collider.position.x >= faceL);
          const crossedR = (this._prevXForSide > faceR) && (this.collider.position.x <= faceR);
          if (crossedL || crossedR) {
            const nudge = 1e-4;
            if (crossedL) {
              this.collider.position.x = faceL - nudge;
              this.wallNormal = +1; // wall on right
            } else {
              this.collider.position.x = faceR + nudge;
              this.wallNormal = -1; // wall on left
            }
            this.collider.velocity.x = 0;
            hitWallThisFrame = true;
            this.wallStickTime = this.wallStickMax;
          }
          window.dispatchEvent(new CustomEvent('dbg-hit', {
            detail: { kind:'flat-side', side: crossedL ? 'L' : 'R', platform: obj }
          }));
        }
        // FLAT: done. We do NOT run the generic snap for flats (prevents edge teleports)
        continue;
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

    this._groundPlatform = null;
    this._slopeAngleRad  = 0; this._slopeDir = 0;
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

      // --- ceiling collision (robust, swept) ---
      if (this.collider.velocity.y > 0) {
        const r    = this.collider.radius;
        const half = this.collider.height * 0.5;
        const headPrev = prevY + half;
        const headNow  = this.collider.position.y + half;
        const skin = 0.02;

        for (const p of this.platforms) {
          const box = p.userData?.box; if (!box) continue;

          // Is our capsule horizontally within the slab (with radius padding)?
          const insideX = (
            this.collider.position.x >= box.min.x - r &&
            this.collider.position.x <= box.max.x + r
          );

          // Rising and crossed the slab bottom this frame
          const crossedFromBelow =
            insideX &&
            (headPrev <= box.min.y + skin) &&
            (headNow  >= box.min.y - 1e-6);

          // Or we ended slightly inside the bottom (forgiveness)
          const forgivingClamp =
            insideX &&
            (headNow >= box.min.y) &&
            (headNow <= box.min.y + 0.2);

          if (crossedFromBelow || forgivingClamp) {
            // Snap just below the slab and kill upward velocity
            this.collider.position.y = box.min.y - half - 1e-4;
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
      const feetPrev = prevY - half;
      const feetNow  = this.collider.position.y - half;
      const vy       = this.collider.velocity.y;

      // tolerances
      const skin  = 0.02;  // glue-to-surface tolerance
      const penTol = 0.15; // forgiveness if slightly inside due to spawn/substep

      let snapped = false;
      let bestTop = null;          // { topY, p, slopeRad, slopeDir }
      let bestWasAir = false;      // track for dust FX
      let canSnap    = false;      // any acceptable surface found

      for (const p of this.platforms) {
        const box = p.userData?.box; if (!box) continue;
        const slopeDeg = p.userData?.slopeAngleDeg;

        // Slope-aware top surface (with slab thickness)
        let topY = box.max.y; // default for flats
        const slopeCorners = p.userData?.slopeCorners;
        if (slopeCorners) {
          const tb = this._slopeTopBottomAtX(p, this.collider.position.x);
          if (!tb) continue;
          topY = tb.top;  // <- exact sloped top at our X
        }

        // Center must be within slab width (no radius inflation) to get support
        const minX0 = box.min.x, maxX0 = box.max.x;
        if (this.collider.position.x < minX0 + 1e-4 || this.collider.position.x > maxX0 - 1e-4) continue;

        // --- STEP-ON CLAIM for slopes (handles walking onto the ramp) ---
        // {
        //   const slopeDeg = p.userData?.slopeAngleDeg;
        //   if (typeof slopeDeg === 'number' && slopeDeg > 0) {
        //     const minX0 = box.min.x, maxX0 = box.max.x;
        //     const insideCenter = (this.collider.position.x >= minX0 + 1e-4) && (this.collider.position.x <= maxX0 - 1e-4);
        //     if (insideCenter) {
        //       // local top 'topY' was computed just above (slope-aware, includes slab thickness)
        //       const feetNow = this.collider.position.y - half;
        //       const stepSnap = 0.15;    // how far from the surface we still "step on"
        //       const vy       = this.collider.velocity.y;

        //       // If feet are already near the local top (±stepSnap), claim the surface even if not falling
        //       if (Math.abs(feetNow - topY) <= stepSnap && vy <= 1.0) {
        //         this.collider.position.y = topY + half + 1e-4;
        //         this.collider.velocity.y = 0;

        //         if (!this.onGround) this.coyoteTime = this.maxCoyote;
        //         const wasAir = !this.onGround;
        //         this.onGround = true;
        //         this.airJumpsUsed = 0;

        //         // remember slope you’re on (if you use this elsewhere)
        //         this._groundPlatform = p;
        //         this._slopeAngleRad  = slopeDeg * Math.PI / 180;
        //         this._slopeDir       = (p.userData?.slopeDir === -1) ? -1 : +1;

        //         if (wasAir && (vy < -6)) this.dust?.trigger(this.collider.position.x, topY + 0.05, 0);
        //         snapped = true;
        //         break;
        //       }
        //     }
        //   }
        // }

        // 1) Normal fall crossing
        const crossedFromAbove = (feetPrev > topY + skin) && (feetNow <= topY + skin) && (vy <= 0);
        // 2) Continuous support while walking along the surface
        const resting = (Math.abs(feetNow - topY) <= skin + 1e-4) && (vy <= 0);
        // 3) Slight penetration forgiveness (spawn/edge/substep)
        const forgivingCatch = (feetNow <= topY + skin) && (feetPrev >= topY - penTol) && (vy <= 0);

        if (crossedFromAbove || resting || forgivingCatch) {
          const slopeRad = (typeof slopeDeg === 'number') ? (slopeDeg * Math.PI / 180) : 0;
          const slopeDir = (slopeRad > 0) ? ((p.userData?.slopeDir === -1) ? -1 : +1) : 0;

          // Choose the **highest** acceptable surface; on ties, prefer a slope (so we switch onto the ramp)
          if (
            bestTop === null ||
            topY > bestTop.topY ||
            (Math.abs(topY - bestTop.topY) <= 1e-5 && slopeRad > (bestTop.slopeRad || 0))
          ) {
            bestTop = { topY, p, slopeRad, slopeDir };
            canSnap = true;
            bestWasAir = !this.onGround;   // for dust effect later
          }

          // DO NOT snap/break here—evaluate all platforms first
          continue;
        }
      }

      if (canSnap && bestTop) {
        const topY = bestTop.topY;
        this.collider.position.y = topY + half + 1e-4;
        this.collider.velocity.y = 0;

        if (!this.onGround) this.coyoteTime = this.maxCoyote;
        this.onGround = true;
        this.wallStickTime = 0;
        this.wallNormal = 0;
        this.airJumpsUsed = 0;

        window.dispatchEvent(new CustomEvent('dbg-hit', {
          detail: { kind:'ramp-top-claim', platform: bestTop.p }
        }));

        // Remember ground platform + slope meta for slide logic
        this._groundPlatform = bestTop.p;
        this._slopeAngleRad  = bestTop.slopeRad || 0;
        this._slopeDir       = (this._slopeAngleRad > 0) ? bestTop.slopeDir : 0;

        if (bestWasAir && (vy < -6)) {
          this.dust?.trigger(this.collider.position.x, topY + 0.05, 0);
        }
        snapped = true;
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
