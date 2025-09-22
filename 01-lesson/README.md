## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎨 Lesson 01 — From Blank Canvas to Interactive Shapes

Welcome! This lesson walks through a progressive Three.js build: you will start with a blank canvas and finish with interactive, animated 2D shapes you can toggle and spin.

## ✨ What you’ll build
- A pixel-aligned **orthographic scene** rendered with `WebGLRenderer`.
- A white square and cyan triangle you can show/hide with DOM controls.
- Buttons that toggle **Z-axis** and **Y-axis** rotation using a smooth `requestAnimationFrame` loop.

## 📦 Files (Step 1 → 7)
- [Step 01 — Renderer](./01-01-renderer.html): Initialize the renderer, dark background, and RAF loop.
- [Step 02 — Orthographic Camera](./01-02-ortho-camera.html): Add the scene and pixel-perfect orthographic camera with resize handling.
- [Step 03 — Square](./01-03-square.html): Draw the first square and reposition it using top-left style coordinates.
- [Step 04 — Triangle](./01-04-triangle.html): Create a custom triangle with `Shape` + `ShapeGeometry`.
- [Step 05 — Toggles](./01-05-toggles.html): Wire checkbox UI to mesh visibility flags.
- [Step 06 — Rotate Z](./01-06-rotate-z.html): Add a button-driven Z rotation that updates every frame.
- [Step 07 — Rotate Y](./01-07-rotate-y.html): Layer in Y rotation controls while keeping Z rotation optional.

## 🧠 New concepts
- Learn the **core workflow** of Three.js: renderer → camera → scene → mesh.
- Use an **orthographic camera** for pixel-based coordinates.
- Create simple **2D shapes**: square (PlaneGeometry) and triangle (ShapeGeometry).
- Connect **DOM controls** (checkboxes + buttons) to Three.js objects.
- Animate objects with **rotation on Z and Y axes**.
- Practice **incremental builds**: rerun and see each feature in isolation.

## 🎹 Controls
| UI element | Steps | What it does | Hotkey |
| --- | --- | --- | --- |
| `Square` checkbox | 5 → 7 | Toggles the square mesh via `mesh.visible`. | — (click/tap) |
| `Triangle` checkbox | 5 → 7 | Toggles the triangle mesh via `mesh.visible`. | — (click/tap) |
| `Rotate Z` button | 6 → 7 | Flips a `rotatingZ` flag so each frame adds `0.01` radians on Z. | — (button only) |
| `Rotate Y` button | 7 | Flips a `rotatingY` flag to spin both shapes in depth. | — (button only) |

## 🗂 Step breakdown

### [Step 01 — Renderer](./01-01-renderer.html)
- Create a WebGL renderer linked to `<canvas>`.
- Match device pixel ratio for crisp rendering.
- Clear the screen with a dark background color.
- Start the animation loop with `requestAnimationFrame`.

> 👉 **Key idea:** Renderer = paintbrush. Right now it only clears the screen.

---

### [Step 02 — Orthographic Camera](./01-02-ortho-camera.html)
- Add a scene container.
- Create an **OrthographicCamera** that maps `(0,0)` top-left to `(w,h)` bottom-right.
- Rebuild the camera on resize for consistent pixel mapping.

> 👉 **Key idea:** Orthographic = no perspective distortion, perfect for 2D-like placement.

---

### [Step 03 — Square](./01-03-square.html)
- Create a white square using `PlaneGeometry`.
- Offset position so `(x,y)` feels like the **top-left corner**.
- Use `DoubleSide` to avoid disappearing on rotation.

> 👉 **Key idea:** Geometry is centered, so we adjust placement.

---

### [Step 04 — Triangle](./01-04-triangle.html)
- Define a custom path with `Shape` → `lineTo` → `closePath`.
- Convert the path with `ShapeGeometry`.
- Place the mesh using the top-left corner of the bounding box.

> 👉 **Key idea:** Any 2D polygon can be drawn as a path and used as geometry.

---

### [Step 05 — Toggles](./01-05-toggles.html)
- Add checkboxes in HTML.
- Link checkbox state → `mesh.visible`.
- Initialize with both shapes visible.

> 👉 **Key idea:** Connect simple DOM elements directly to scene objects.

---

### [Step 06 — Rotate Z](./01-06-rotate-z.html)
- Add a button for **Z-axis spin**.
- Toggle a `rotatingZ` flag on click.
- In the loop: `mesh.rotation.z += 0.01`.

> 👉 **Key idea:** Frame loop updates enable smooth animation. Z spin = rotate in screen plane.

---

### [Step 07 — Rotate Y](./01-07-rotate-y.html)
- Add a button for **Y-axis rotation**.
- Toggle a `rotatingY` flag on click.
- In the loop: `mesh.rotation.y += 0.01`.

> 👉 **Key idea:** Even with an orthographic camera, 3D transforms like depth rotation still work.

## 🛠️ Import-map or setup notes
- Each step loads Three.js from `https://unpkg.com/three@0.160.0/`. If you prefer an **import map**, pin the same version for both `three` and any helper modules.
- Serve the HTML files via a static server (or enable local file access for modules) so the `<script type="module">` imports resolve correctly.
- `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))` balances clarity with performance—keep the clamp if you target high-DPI displays.

## ⚙️ Performance tips
- Reuse a single renderer and call `renderer.setSize` only when the canvas dimensions actually change to avoid extra GPU work.
- The orthographic camera is rebuilt on resize; keep that logic so `(0,0)` stays at the top-left even after responsive layout changes.
- Animations rely on `requestAnimationFrame`; avoid mixing in `setInterval` so you stay in sync with the browser’s refresh rate.

## 🧩 Troubleshooting
- If modules fail to load (blank canvas, console 404s), verify your server allows ES module imports or add an import map that points to the CDN.
- Shapes invisible? Ensure the checkboxes dispatch an initial change event so `mesh.visible` updates (Steps 5 → 7 already do this for you).
- Seeing the back face pop? Keep `material.side = THREE.DoubleSide` on both geometries to prevent culling when they rotate.

## 💪 Challenges
- Add a `CircleGeometry` as a third shape and hook it into the visibility toggles.
- Create a slider that controls the rotation speed for the Z/Y spin buttons.
- Introduce a keyboard shortcut to reset all rotations to zero.

Made with ❤️ for your Lesson 01 canvas adventure.
Happy rendering!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
