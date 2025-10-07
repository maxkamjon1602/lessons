## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎲 Lesson 04 — First Taste of 3D (Fixed, Structured, and Demo-Ready)

Welcome! This lesson transitions your orthographic sandbox into a true **3D showcase**. You will juggle **perspective and orthographic cameras**, pair **2D shapes** with **3D twins**, and keep everything perfectly in sync across toggles and resize events.

## ✨ What you’ll build
- A scene that swaps between **OrthographicCamera ↔ PerspectiveCamera** while staying centered and resize-safe.
- Paired **2D/3D groups** whose visibility stays synchronized through a shared toggle system.
- A polished final demo that highlights **depth**, **rotation in 3D**, and quick UI controls for comparing projections.

## 📦 Files (Step 1 → 7)
- [Step 01 — Ortho Refresher](./04-01-ortho-refresher.html): Rebuild the centered orthographic camera with axes helpers.
- [Step 02 — Shapes Ortho](./04-02-shapes-ortho.html): Add the square and triangle at the origin to prep for depth moves.
- [Step 03 — Toggle Cameras](./04-03-toggle-cameras.html): Wire a button to flip Orthographic ↔ Perspective on demand.
- [Step 04 — Z Depth](./04-04-z-depth.html): Offset shapes along Z to show how depth changes each projection.
- [Step 05 — Paired Toggles](./04-05-paired-toggles.html): Group 2D/3D pairs and sync checkbox visibility.
- [Step 06 — Rotating Pairs](./04-06-rotating-pairs.html): Keep the synced toggles and add rotation that runs in Perspective only.
- [Step 07 — Final](./04-07-final.html): Ship the polished demo with camera toggle, paired groups, and focused animation.

**File policy:** Each step lives in a single, self-contained `.html` file (no bundler). All scripts pull ESM modules from the official three.js CDN.

## 🧠 New concepts
- **Projection swap:** Compare orthographic vs perspective projections while keeping the scene aligned around `(0,0,0)`.
- **Depth awareness:** Push content along **Z** and rebuild cameras on resize to preserve framing.
- **Group visibility sync:** Pair meshes in `group2D`/`group3D` and flip them together through shared UI state.

---

## How It Works (Architecture)
### 1) Centered World Coordinates
Both cameras target the **origin (0,0,0)**. Ortho frustum uses `(-w/2..w/2, -h/2..h/2)` so (0,0) is the center of the canvas. Perspective keeps the same look target to make toggling intuitive.

### 2) Resize-Safe Cameras
On resize we:
1. Update renderer size in **CSS pixels** (`renderer.setSize(clientWidth, clientHeight, false)`).
2. Recreate **the current camera type** with the new width/height.
3. Keep the camera **looking at the origin** and **sync visibility** again.

### 3) Groups & Paired Toggles
- `group2D` holds **square** and **triangle**.
- `group3D` holds **cube** and **pyramid**.
- Only one group is visible:
  - **ORTHO** → show `group2D`
  - **PERSPECTIVE** → show `group3D`
- Checkboxes always control the **pair**:
  - “Square/Cube” affects the left pair in whichever group is active.
  - “Triangle/Pyramid” affects the right pair.

### 4) Rotation Policy
Rotation only runs for **3D** in **Perspective** to highlight depth perception. (You can enable a subtle idle wiggle in Ortho if you want motion everywhere.)

---

## 🎹 Controls (common across steps)
- **Camera toggle:** Switches between Orthographic ↔ Perspective cameras.
- **Pair toggles:** *Square/Cube* and *Triangle/Pyramid* checkboxes control both versions of each shape.
- **Rotation toggle (Step 06+):** *Rotate 3D: ON/OFF* enables the perspective-only animation.

## ⚙️ Performance tips
- Clamp device pixel ratio with `renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))` to stay sharp without wasting GPU time.
- Recreate only the active camera on resize and reuse scene objects to avoid GC thrash.
- Pause rotations when the 3D group is hidden to keep idle CPU/GPU usage minimal.

## 🧩 Troubleshooting
- **I see 2D and 3D at the same time in Ortho:** Call `syncVisibility()` after every camera toggle and resize.
- **Nothing appears:** Ensure the canvas fills its container, the active camera looks at `(0,0,0)`, and `scene.add` contains the right group.
- **Rotation doesn’t run in Ortho:** This is by design—rotation is tied to the Perspective branch. Enable a dedicated Ortho idle motion if desired.

---

## Extending the Lesson
- Add lights + PBR materials (DirectionalLight, MeshStandardMaterial) after Step 06.
- Replace pyramid with a real **tetrahedron** or **imported glTF**.
- Add an **OrbitControls** step to let learners inspect the scene interactively.
- Animate **depth** (move models along Z) to show near/far clipping.


## 💪 Challenges
- Replace the pyramid with a custom model loaded via `GLTFLoader`.
- Add a UI control to switch materials or colors on the 3D shapes.
- Enable a gentle rotation for the 2D group when in Orthographic view.

Made with ❤️ for your 2D → 3D jump.
Happy building!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
