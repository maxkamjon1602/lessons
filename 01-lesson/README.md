## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](./LICENSE).

---

# Lesson 01 — From Blank Canvas to Interactive Shapes 🎨✨

This lesson introduces **Three.js** step by step, building from a blank canvas to interactive, animated 2D shapes.

---

## 🎯 Objectives
- Learn the **core workflow** of Three.js: renderer → camera → scene → mesh.  
- Use an **orthographic camera** for pixel-based coordinates.  
- Create simple **2D shapes**: square (PlaneGeometry) and triangle (ShapeGeometry).  
- Connect **DOM controls** (checkboxes + buttons) to Three.js objects.  
- Animate objects with **rotation on Z and Y axes**.  
- Practice **incremental builds**: rerun and see each feature in isolation.

---

## 📂 Project Structure
Each step is a self-contained mini-project. Open `index.html` in your browser or run a static server.

```
lesson-01-increments/
├── 01-renderer/      # Setup renderer and dark background
├── 02-ortho-camera/  # Add orthographic camera in pixel units
├── 03-square/        # Draw first square
├── 04-triangle/      # Add custom triangle
├── 05-toggles/       # Checkboxes to show/hide shapes
├── 06-rotate-z/      # Button to spin around Z axis
└── 07-rotate-y/      # Button to spin in depth around Y axis
```

---

## 🗂 Step Breakdown

### Step 01 — Renderer
- Create a WebGL renderer linked to `<canvas>`.
- Match device pixel ratio for crisp rendering.
- Clear screen with a dark background color.
- Start animation loop with `requestAnimationFrame`.

👉 **Key idea:** Renderer = paintbrush. Right now it only clears the screen.

---

### Step 02 — Orthographic Camera
- Add a scene container.
- Create an **OrthographicCamera** that maps `(0,0)` top-left to `(w,h)` bottom-right.
- Rebuild camera on resize for consistent pixel mapping.

👉 **Key idea:** Orthographic = no perspective distortion, perfect for 2D-like placement.

---

### Step 03 — Square
- Create a white square using `PlaneGeometry`.
- Offset position so `(x,y)` feels like the **top-left corner**.
- Use `DoubleSide` to avoid disappearing on rotation.

👉 **Key idea:** Geometry is centered, so we adjust placement.

---

### Step 04 — Triangle
- Define a custom path with `Shape` → `lineTo` → `closePath`.
- Convert with `ShapeGeometry`.
- Place using top-left corner of bounding box.

👉 **Key idea:** Any 2D polygon can be drawn as a path and used as geometry.

---

### Step 05 — Toggles
- Add checkboxes in HTML.
- Link checkbox state → `mesh.visible`.
- Initialize with both visible.

👉 **Key idea:** Connect simple DOM elements directly to scene objects.

---

### Step 06 — Rotate Z
- Add a button for **Z-axis spin**.
- Toggle `rotatingZ` flag on click.
- In loop: `mesh.rotation.z += 0.01`.

👉 **Key idea:** Frame loop updates enable smooth animation. Z spin = rotate in screen plane.

---

### Step 07 — Rotate Y
- Add a button for **Y-axis rotation**.
- Toggle `rotatingY` flag on click.
- In loop: `mesh.rotation.y += 0.01`.

👉 **Key idea:** Even with orthographic camera, 3D transforms like depth rotation still work.

---

## 💪 Challenges
- Add a `CircleGeometry` as a third shape and hook it into the visibility toggles.
- Create a slider that controls the rotation speed for the Z/Y spin buttons.
- Introduce a keyboard shortcut to reset all rotations to zero.

