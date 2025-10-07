// dust.js - lesson 13 step 1

import * as THREE from 'three';

export class DustBurst {
  constructor(scene) {
    this.scene = scene;
    this.pool = [];
    this.clock = 0;

    const tex = new THREE.TextureLoader().load('data:image/svg+xml;utf8,\
<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64">\
<circle cx="32" cy="32" r="28" fill="white"/></svg>');
    this.mat = new THREE.SpriteMaterial({ map: tex, color: 0x777777, transparent: true, opacity: 0.9, depthWrite: false });
  }

  _spawn(x, y, z) {
    const s = this.pool.pop() || new THREE.Sprite(this.mat.clone());
    s.scale.set(0.6, 0.6, 0.6);
    s.position.set(x, y, z);
    s.material.opacity = 0.9;
    s.userData.vx = (Math.random()*2-1) * 0.8;
    s.userData.vy = Math.random() * 1.2 + 0.4;
    s.userData.life = 0.35;
    this.scene.add(s);
    return s;
  }

  trigger(x, y, z) {
    for (let i = 0; i < 6; i++) this._spawn(x, y, z);
  }

  update(dt) {
    this.scene.children.forEach((obj) => {
      if (!(obj.isSprite && obj.material && obj.userData?.life)) return;
      obj.userData.life -= dt;
      obj.position.x += obj.userData.vx * dt;
      obj.position.y += obj.userData.vy * dt;
      obj.material.opacity = Math.max(0, obj.userData.life / 0.35);
      if (obj.userData.life <= 0) {
        this.scene.remove(obj);
        this.pool.push(obj);
      }
    });
  }
}
