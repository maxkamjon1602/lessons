// physics.js - lesson 13 step 1

// Very small tile physics (2D: x,y). Visuals are 3D; physics stays 2D.
export class Tilemap {
  constructor(data){
    this.w = data.width; this.h = data.height; this.t = data.tiles;
    this.tileSize = data.tileSize || 16;
  }
  isSolidAt(px, py){
    const tx = Math.floor(px/this.tileSize);
    const ty = Math.floor(py/this.tileSize);
    if(tx<0||ty<0||tx>=this.w||ty>=this.h) return true; // out of bounds solid
    return this.t[ty*this.w+tx]===1;
  }
}

// Simple AABB sweep against tiles (separable axis)
export function integratePlayer(p, tilemap, dt, cfg){
  // Horizontal
  p.pos.x += p.vel.x*dt;
  p.collideX = false;
  const halfW = p.halfW, halfH = p.halfH;
  for(const sy of [-halfH+1, 0, halfH-1]){
    const y = p.pos.y + sy;
    if(tilemap.isSolidAt(p.pos.x + Math.sign(p.vel.x)*halfW, y)){
      p.pos.x = Math.floor((p.pos.x + Math.sign(p.vel.x)*halfW)/tilemap.tileSize)*tilemap.tileSize
                - Math.sign(p.vel.x)*halfW - Math.sign(p.vel.x);
      p.vel.x = 0;
      p.collideX = true;
    }
  }

  // Vertical
  p.vel.y += cfg.gravity*dt;
  p.pos.y += p.vel.y*dt;

  // Check down/up
  p.onGround = false;
  if(p.vel.y>=0){ // moving down
    if(tilemap.isSolidAt(p.pos.x - halfW + 1, p.pos.y + halfH) ||
       tilemap.isSolidAt(p.pos.x + halfW - 1, p.pos.y + halfH)){
      p.pos.y = Math.floor((p.pos.y + halfH)/tilemap.tileSize)*tilemap.tileSize - halfH;
      p.vel.y = 0;
      p.onGround = true;
    }
  }else{ // moving up
    if(tilemap.isSolidAt(p.pos.x - halfW + 1, p.pos.y - halfH) ||
       tilemap.isSolidAt(p.pos.x + halfW - 1, p.pos.y - halfH)){
      p.pos.y = Math.floor((p.pos.y - halfH)/tilemap.tileSize + 1)*tilemap.tileSize + halfH;
      p.vel.y = 0;
    }
  }
}
