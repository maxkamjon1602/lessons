## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎥 Lesson 08 — Cameras & Projection (7 Steps, Standalone)

Each step is a **single HTML file** (no npm). The shared scaffold keeps you oriented while you explore core camera behaviors, and every step adds exactly one new concept on the path to a cinematic fly‑through. Every file shows a **floating overlay** with the current step number.

## ✨ What you’ll build
- Seven bite‑sized camera explorations that compare projection types, field of view, and movement.
- Practical drills for zoom vs dolly, framing helpers, and screen‑to‑world conversions.
- A gentle depth‑of‑field fade you can tune live to mimic focus pulls.
- A restartable cinematic camera path with easing and subtle FOV modulation.

## 📦 Files (Step 1 → 7)
- [Step 01 — Perspective vs Orthographic](./08-01-camera-types.html): Toggle **1/2** to swap projection types and feel scale/foreshortening changes.
- [Step 02 — FOV & Aspect](./08-02-fov-and-aspect.html): Use **[** / **]** to adjust FOV, then resize the window to see aspect ratio tradeoffs.
- [Step 03 — Zoom vs Dolly](./08-03-zoom-vs-dolly.html): Press **Z/X** to zoom (FOV) and **W/S** to dolly; HUD compares distance and FOV.
- [Step 04 — Fit to Object](./08-04-fit-camera-to-object.html): Hit **1/2/3/0** to frame individual meshes or all via `fitCameraToObject`.
- [Step 05 — Screen ↔ World](./08-05-screen-world-coordinates.html): Click the ground to drop 3D markers through pointer → NDC → ray → intersection.
- [Step 06 — Simulated Depth of Field](./08-06-manual-orbit-and-pan.html): Nudge **↑/↓** to shift the focus distance and watch falloff soften.
- [Step 07 — Cinematic Camera Path](./08-07-cinematic-camera-path.html): Press **Space** to play/pause the fly‑through and **R** to restart the eased path.

## 🧠 New concepts
- Contrast **perspective vs orthographic** projection to understand scale and parallel lines.
- Link **FOV and aspect** to how much world you capture and what gets clipped.
- Separate **zoom vs dolly** to feel the difference between lens and positional moves.
- Frame geometry programmatically with **bounding boxes and camera math**.
- Convert **screen picks to world points** for interaction overlays with `Raycaster`.
- Blend easing and focus cues for **cinematic, restartable camera motion**.

## 🧰 Key utilities/reference
- Shared scaffold: antialiased WebGL renderer with pixel ratio clamp, sRGB output + ACES tone mapping, 20×20 ground, PBR sphere/cube/pyramid, ambient (0.35) + directional (1.0 @ 6,10,6), perspective camera (FOV 50°, near 0.1, far 300).
- Pointer controls: minimal orbit/pan/dolly wired to pointer events and wheel for every step.
- `fitCameraToObject(camera, object, frame=1.6)` — computes a bounding box, pans, and offsets for a tight frame.
- `raycaster.setFromCamera(pointer, camera)` — turns normalized pointer coords into a picking ray for intersections.
- `smoothstep` & `easeInOutCubic` — easing helpers for soft focus transitions and the Step 7 camera path.

## 🎹 Controls (common across steps)
- **Mouse**: drag to orbit · **Shift+Drag** to pan · **Wheel** to dolly.
- **Launch**: double-click any `.html` file (Chrome/Firefox/Edge).
- **Step 01**: **1/2** switch between perspective and orthographic views.
- **Step 02**: **[** / **]** widen or tighten the field of view.
- **Step 03**: **Z/X** change FOV · **W/S** dolly forward/back.
- **Step 04**: **1/2/3/0** frame sphere, cube, pyramid, or all meshes.
- **Step 05**: Click the ground plane to place markers via the raycaster.
- **Step 06**: **↑/↓** adjust focus distance for the faux DoF fade.
- **Step 07**: **Space** play/pause the path · **R** restart the move.

## ⚙️ Performance tips & troubleshooting
- **Black screen?** Check the browser console and ensure Three.js loads from unpkg (requires internet access).
- **High-DPI slowdown?** Reduce `Math.min(window.devicePixelRatio, 2)` to something like `1.25`.
- **Markers not appearing?** Make sure pointer coordinates are normalized before calling `raycaster.setFromCamera(pointer, camera)` and that you click the ground plane.
- **Pan not responding?** Hold **Shift** while dragging (or right-click drag where supported).

## ✅ Learning Goals
By the end of Lesson 08, learners can:
- Choose **Perspective vs Orthographic** for the task at hand.
- Control **FOV, aspect, near/far** and understand clipping/precision tradeoffs.
- Explain **zoom vs dolly** and why they feel different.
- **Frame** any object or the whole scene from code.
- Convert between **screen** and **world** coordinates for picking/UI.
- Author **cinematic moves** with simple easing.


## 💪 Challenges
- Add controls to modify the camera's near and far clipping planes at runtime.
- Save and recall favorite camera positions with number keys.
- Toggle a `CameraHelper` to visualize the active camera's frustum.

Made with ❤️ for your camera explorations.
Happy framing!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
