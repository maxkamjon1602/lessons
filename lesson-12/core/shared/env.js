// 12-lesson/core/shared/env.js
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('app');

// Renderer (bright, crisp)
export const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

// Scene (bright background)
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf5f7fb);

// Ortho side-ish camera
export const camera = new THREE.OrthographicCamera(-8, 8, 4.5, -4.5, 0.1, 100);
camera.position.set(8, 6, 10);
camera.lookAt(0, 1.2, 0);

// Controls for demoing
export const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1.2, 0);

// Bright lights
const hemi = new THREE.HemisphereLight(0xffffff, 0xdde0e3, 1.0);
scene.add(hemi);

const dir = new THREE.DirectionalLight(0xffffff, 1.2);
dir.position.set(5, 10, 6);
dir.castShadow = true;
dir.shadow.mapSize.set(1024, 1024);
dir.shadow.bias = -0.0002;
scene.add(dir);

// Ground
const groundMat = new THREE.MeshStandardMaterial({ color: 0xeeeeee, roughness: 0.9, metalness: 0.0 });
const groundGeo = new THREE.BoxGeometry(40, 0.5, 8);
export const ground = new THREE.Mesh(groundGeo, groundMat);
ground.position.set(0, -0.25, 0);
ground.receiveShadow = true;
scene.add(ground);

// Tick helpers
let _cbs = [];
export function onTick(cb) { _cbs.push(cb); }

function tick(t) {
  controls.update();
  for (const cb of _cbs) cb(t);
  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Resize
addEventListener('resize', () => {
  const aspect = innerWidth / innerHeight;
  const viewHeight = 4.5;
  camera.left = -viewHeight * aspect;
  camera.right =  viewHeight * aspect;
  camera.top = viewHeight;
  camera.bottom = -viewHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
