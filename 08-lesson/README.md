## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎥 Lesson 08 — Cameras & Projection (7 Steps, Standalone)

Each step is a **single HTML file** (no npm). All files share the same **scene scaffold** so learners stay oriented; each step adds exactly one new camera concept. Every file shows a **floating overlay** with the current step number.

## 🧭 Common Controls
- Drag = orbit &nbsp;·&nbsp; **Shift+Drag** = pan &nbsp;·&nbsp; Wheel = dolly
- All steps run by double-clicking the `.html` file in your browser (Chrome/Firefox/Edge).

---

## 🗂 Steps Overview
1. [Step 01 — Perspective vs Orthographic](./08-01-camera-types.html) — swap cameras with **1/2** and see how scale/foreshortening changes.
2. [Step 02 — FOV & Aspect](./08-02-fov-and-aspect.html) — use **[** / **]** to change FOV; resize the window to see aspect impact.
3. [Step 03 — Zoom vs Dolly](./08-03-zoom-vs-dolly.html) — **Z/X** changes FOV; **W/S** moves the camera in/out; HUD shows FOV vs Distance.
4. [Step 04 — Fit to Object](./08-04-fit-camera-to-object.html) — key **1/2/3/0** frames Sphere/Cube/Pyramid/All using a robust `fitCameraToObject` utility.
5. [Step 05 — Screen ↔ World](./08-05-screen-world-coordinates.html) — click the ground to drop 3D markers via `Raycaster` (screen → NDC → ray → intersection).
6. [Step 06 — Simulated Depth of Field](./08-06-manual-orbit-and-pan.html) — **↑/↓** adjusts focus distance; objects away from focus gently fade.
7. [Step 07 — Cinematic Camera Path](./08-07-cinematic-camera-path.html) — press **Space** to play/pause a fly‑through; **R** to restart; subtle FOV ease.

## 💪 Challenges
- Add controls to modify the camera's near and far clipping planes at runtime.
- Save and recall favorite camera positions with number keys.
- Toggle a `CameraHelper` to visualize the active camera's frustum.

---

## 🧱 Shared Scaffold (all steps)
- **Renderer:** antialiased WebGL, capped pixel ratio for perf, sRGB output + ACES tone mapping.
- **Scene:** ground plane (20×20), subtle grid, sphere/cube/pyramid with PBR materials.
- **Lights:** Ambient (0.35) + Directional (1.0, at 6,10,6).
- **Camera:** Perspective (FOV 50°, near 0.1, far 300).
- **Controls:** minimal orbit/pan/dolly implemented with pointer events and wheel.

---

## 💡 Key Utilities
- `fitCameraToObject(camera, object, frame=1.6)` — computes bounding box and sets pan & distance for a tight frame.
- `raycaster.setFromCamera(pointer, camera)` — converts a click to a 3D picking ray.
- `smoothstep` & `easeInOutCubic` — smooth, cinematic camera motion (Step 7).

---

## 🧩 Troubleshooting
- **Black screen?** Check browser console for errors; ensure you have internet access to load Three.js from unpkg.
- **Very slow on high‑DPI displays?** Lower pixel ratio by changing `Math.min(window.devicePixelRatio, 2)` to `1.25`.
- **Mouse pan not working?** Hold **Shift** while dragging (or right‑click drag where supported).

---

## ✅ Learning Goals
By the end of Lesson 08, learners can:
- Choose **Perspective vs Orthographic** for the task at hand.
- Control **FOV, aspect, near/far** and understand clipping/precision tradeoffs.
- Explain **zoom vs dolly** and why they feel different.
- **Frame** any object or the whole scene from code.
- Convert between **screen** and **world** coordinates for picking/UI.
- Author **cinematic moves** with simple easing.

---

## 📎 Files (1-per-step)
- `08-01-camera-types.html`
- `08-02-fov-and-aspect.html`
- `08-03-zoom-vs-dolly.html`
- `08-04-fit-camera-to-object.html`
- `08-05-screen-world-coordinates.html`
- `08-06-manual-orbit-and-pan.html`
- `08-07-cinematic-camera-path.html`

Happy coding! ✨

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.  
The name and materials are provided strictly for personal educational purposes.  
All rights reserved.
