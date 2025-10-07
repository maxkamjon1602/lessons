// Capsule.js — lesson 13 step 1
export class CapsuleCollider {
  constructor({ radius = 0.4, height = 1.2, position = { x:0, y:1.0, z:0 } } = {}) {
    this.radius = radius;
    this.height = Math.max(height, radius * 2.0);
    this.position = { ...position };
    this.velocity = { x:0, y:0, z:0 };
  }
  get bottomY() { return this.position.y - (this.height * 0.5); }
  get topY()    { return this.position.y + (this.height * 0.5); }
  translate(dx, dy, dz){ this.position.x += dx; this.position.y += dy; this.position.z += dz; }
  setPosition(x,y,z){ this.position.x=x; this.position.y=y; this.position.z=z; }
}
