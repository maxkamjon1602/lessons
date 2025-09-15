
# 🎓 Lesson 05 — Ortho ↔ Perspective + 2D ⇄ 3D Pairs

> **Goal:** Switch cameras (Perspective/Orthographic), pair 2D and 3D shapes, add orbit controls, and ship a crisp, DPI‑aware scene — all **without build tools**. Each step is a **single HTML file** you can double‑click.

---

## 🗂 What’s inside

```
lesson-05/
├─ 01-Scene-and-2D-shapes.html
├─ 02-Add-3D-counterparts-and-lights.html
├─ 03-Group-and-Animation.html
├─ 04-Orthographic-camera-and-switch.html
├─ 05-Orbit-controls-drag-and-zoom.html
├─ 06-DPR-aware-resize.html
└─ 07-HUD-and-runtime-toggles.html   ← final
```

---

## 🚀 How to run (any step)

1. Open the folder `lesson-05/`
2. Double‑click **any** HTML file (e.g., `07-HUD-and-runtime-toggles.html`)
3. Use a modern browser (Chrome/Edge/Firefox). No npm, no server.

> CDN: We import `three` via ES modules from **unpkg**. If your network blocks CDNs, see the _Offline Use_ note below.

---

## 🧭 7 Steps (quick guide)

### 01 — Scene and 2D shapes
Create a WebGLRenderer + Scene + PerspectiveCamera. Draw a **square** (PlaneGeometry) and a **triangle** (custom BufferGeometry).

### 02 — Add 3D counterparts and lights
Add a **cube** + **pyramid** (MeshStandardMaterial) and light them with **Ambient** + **Directional** lights. Tone mapping: **ACESFilmic**.

### 03 — Group + animation
Put all meshes in a `THREE.Group`. Rotate the group and add secondary rotations on cube/pyramid. Use `Clock.getDelta()`.

### 04 — Orthographic camera + hotkeys
Add **OrthographicCamera** with viewport‑sized frustum. Hotkeys: **1** = Perspective, **2** = Ortho.

### 05 — Orbit controls (drag + wheel)
Minimal orbit controller (θ/φ + radius). Drag to orbit, wheel to zoom.

### 06 — DPR‑aware resize
Resize the canvas using **devicePixelRatio** (clamped) and update camera projection matrices.

### 07 — HUD + runtime toggles (final)
Tiny FPS HUD. Runtime flags: toggle rotation (**R**), switch cameras (**1/2**).

## 💪 Challenges
- Add a new pair like circle/sphere with its own visibility toggle.
- Extend orbit controls with right-click panning or keyboard WASD.
- Provide a key to reset the camera position and HUD stats.

---

## ⌨️ Controls (Step 05–07)
- **Drag** = orbit camera
- **Wheel** = zoom
- **1** = Perspective camera
- **2** = Orthographic camera
- **R** = Toggle rotation (Step 07)

---

## 🧱 Offline use (optional)
If a lab blocks CDNs, download `three.module.js` and replace:

```html
<script type="module">
  import * as THREE from "./three.module.js"; // local
</script>
```

Get it from: https://unpkg.com/three@0.158.0/build/three.module.js

---

## ✅ Learning checklist
- [ ] Renderer/Scene/Camera setup
- [ ] Unlit vs Lit materials
- [ ] Group transforms for animation
- [ ] Perspective ↔ Orthographic switching
- [ ] Minimal orbit controller
- [ ] Crisp HiDPI rendering (DPR-aware)
- [ ] Small HUD + runtime toggles
