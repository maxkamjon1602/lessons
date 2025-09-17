## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# Lesson 4 — First Taste of 3D (Fixed, Structured, and Demo-Ready) 🎲📐

This lesson moves from **2D (orthographic)** canvases to a **true 3D** scene using Three.js. You’ll switch cameras, place objects at different depths, and toggle between **2D shapes** and their **3D counterparts** using a clean visibility system built on **groups**.

---

## Overview
- **Goal:** Understand how a scene looks under **OrthographicCamera** vs **PerspectiveCamera**, how **Z (depth)** affects appearance, and how to swap **2D shapes** for matching **3D models**.
- **Key Concepts:** camera projections, world centering, frustum resizing, depth, groups, paired toggles, render loop.
- **Prereqs:** Lesson 1–3 (renderer, shapes, animation loop, input).

---

## Project Layout
```
lesson-04-increments-fixed/
├── 01-ortho-refresher        # centered orthographic camera + axes helper
├── 02-shapes-ortho           # 2D square & triangle centered (z=0)
├── 03-toggle-cameras         # button to switch Ortho ↔ Perspective
├── 04-z-depth                # place shapes at different Z values
├── 05-paired-toggles         # group2D/group3D + checkboxes for pairs
├── 06-rotating-pairs         # like 05 + rotation in Perspective only
└── 07-final                  # polished demo (camera toggle + pairs + rotation)
```

**File policy:** Each step is a single, self‑contained `.html` file (no bundler needed). All scripts use ESM from the official Three.js CDN.

## 💪 Challenges
- Replace the pyramid with a custom model loaded via `GLTFLoader`.
- Add a UI control to switch materials or colors on the 3D shapes.
- Enable a gentle rotation for the 2D group when in Orthographic view.

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

## Controls
- **Camera:** *Camera: ORTHO/PERSPECTIVE* (toggle button)
- **Pairs:** *Square/Cube*, *Triangle/Pyramid* (checkboxes)
- **Rotation:** *Rotate 3D: ON/OFF* (Perspective mode only)

---

## Troubleshooting
- **I see 2D and 3D at the same time in Ortho** → Make sure `syncVisibility()` is called after **camera toggle** and **resize**.
- **Nothing appears** → Ensure canvas is full-size and the camera looks at `(0,0,0)`; check that `setClearColor` isn’t hiding everything.
- **Blurry visuals** on HiDPI → We limit `renderer.setPixelRatio(Math.min(devicePixelRatio, 2))`. Increase carefully; it costs GPU time.
- **Rotation doesn’t run** in Ortho → By design. Enable an idle animation if needed.

---

## Extending the Lesson
- Add lights + PBR materials (DirectionalLight, MeshStandardMaterial) after Step 06.
- Replace pyramid with a real **tetrahedron** or **imported glTF**.
- Add an **OrbitControls** step to let learners inspect the scene interactively.
- Animate **depth** (move models along Z) to show near/far clipping. 

---

## License
All materials in this repository can only be used for personal educational purposes. Any other activity is strictly prohibited.

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.  
The name and materials are provided strictly for personal educational purposes.  
All rights reserved.
