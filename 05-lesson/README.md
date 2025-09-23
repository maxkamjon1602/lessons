## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎓 Lesson 05 — Ortho ↔ Perspective + 2D ⇄ 3D Pairs

> **Goal:** Switch cameras (Perspective/Orthographic), pair 2D and 3D shapes, add orbit controls, and ship a crisp, DPI‑aware scene — all **without build tools**. Each step is a **single HTML file** you can double‑click.

## ✨ What you’ll build
- Two synchronized cameras (Perspective ⇄ Orthographic) with instant hotkey switching.
- Matching 2D HUD quads and 3D meshes that animate together in a single scene graph.
- Manual orbit controls, runtime toggles, and a HUD that stays sharp on HiDPI screens.

## 📦 Files (Step 1 → 7)
- [Step 01 — Scene and 2D shapes](./05-01-Scene-and-2D-shapes.html): Bootstraps `WebGLRenderer`, `Scene`, `PerspectiveCamera`, and renders a square + custom triangle.
- [Step 02 — Add 3D counterparts and lights](./05-02-Add-3D-counterparts-and-lights.html): Mirrors the 2D forms with a cube/pyramid and lights them with Ambient + Directional lighting (ACESFilmic tone mapping).
- [Step 03 — Group and animation](./05-03-Group-and-Animation.html): Parents meshes under a `THREE.Group`, animates via `Clock.getDelta()`, and offsets secondary spins.
- [Step 04 — Orthographic camera and switch](./05-04-Orthographic-camera-and-switch.html): Adds an `OrthographicCamera`, sizes its frustum to the viewport, and maps **1/2** hotkeys to swap cameras.
- [Step 05 — Orbit controls (drag and zoom)](./05-05-Orbit-controls-drag-and-zoom.html): Implements θ/φ/radius orbit math so mouse drag or wheel moves the perspective view.
- [Step 06 — DPR-aware resize](./05-06-DPR-aware-resize.html): Responds to resizes with `window.devicePixelRatio` (clamped) and updates projection matrices.
- [Step 07 — HUD and runtime toggles (final)](./05-07-HUD-and-runtime-toggles.html): Adds a tiny HUD, toggles rotation with **R**, and lets you switch cameras while orbiting.

## 🧠 New concepts
- **DPR-aware rendering:** Clamp `renderer.setPixelRatio()` so HiDPI devices stay crisp without wasting fill rate.
- **Orbit controls from scratch:** Track spherical angles and radius manually for predictable camera motion.
- **Pairing 2D + 3D meshes:** Keep screen-space HUD quads in step with world-space geometry using shared groups.

## 🚀 How to run
1. Open the folder `lesson-05/`.
2. Double‑click **any** HTML file (e.g., `05-07-HUD-and-runtime-toggles.html`).
3. Use a modern browser (Chrome/Edge/Firefox). No npm, no local server needed.

> CDN: We import `three` via ES modules from **unpkg**. If your network blocks CDNs, see the _Troubleshooting_ section below.

## 🎮 Controls
- **Drag** = orbit the camera (Steps 05–07).
- **Wheel** = zoom/dolly via radius changes (Steps 05–07).
- **1** = Perspective camera · **2** = Orthographic camera (Steps 04–07).
- **R** = Toggle rotation on/off (Step 07).

## ⚙️ Performance tips
- Clamp `devicePixelRatio` (e.g., `Math.min(window.devicePixelRatio, 1.5)`) before calling `renderer.setPixelRatio()` to balance sharpness and fill cost.
- Disable rotation (**R**) or switch to the orthographic camera when testing HUD clarity—less motion makes profiling easier.
- Reuse the same `Group` hierarchy so both cameras cull/update once per frame.

## 🧩 Troubleshooting
- **Blocked CDN:** Download `three.module.js` locally and swap the import:
  ```html
  <script type="module">
    import * as THREE from "./three.module.js"; // local fallback
  </script>
  ```
  Grab it from https://unpkg.com/three@0.158.0/build/three.module.js.
- **Orbit feels inverted:** Check the sign on your `deltaPhi` update—negative mouse Y should tilt upward.
- **HUD looks blurry:** Confirm the DPR clamp is applied and call `hudCanvas.width = hudCanvas.clientWidth * dpr` when redrawing.

## 💪 Challenges
- Add a new pair like circle/sphere with its own visibility toggle.
- Extend orbit controls with right-click panning or keyboard WASD.
- Provide a key to reset the camera position and HUD stats.

Made with ❤️ to help you pair 2D overlays with 3D scenes—now with camera swaps and orbiting confidence.
Happy rendering!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
