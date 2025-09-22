## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎨 Lesson 06 — Materials, Textures & Lighting in Three.js

Welcome to **Lesson 06** of the 21‑part WebGL / Three.js learning series!
This lesson focuses on **materials**, **textures**, and **lighting** to make your 3D objects come alive.

## ✨ What you’ll build
- A **material showcase** that isolates the core PBR sliders — color, metalness, roughness, and clearcoat — so you can compare shading models side by side.
- **Texture-driven studies** that synthesize wood grain, checker/bump pairs, and alpha masks directly in Canvas2D before sending them into three.js.
- A **final polished scene** that places the wood plane, checker cube, glass triangle, and reflective gold pyramid under multi-lighting with orbit controls and camera toggles.

---

## 🧠 New concepts
- **Material properties**: compare `MeshBasicMaterial`, `MeshStandardMaterial`, and `MeshPhysicalMaterial`, and tune metalness, roughness, clearcoat, and transmission for believable responses.
- **Texture workflows**: generate procedural wood, checkerboards, bump maps, and alpha masks to drive color, depth cues, and transparency in one pass.
- **Environment mapping**: build a custom cube map, feed it through `PMREMGenerator`, and use it as both scene background and reflection source for polished renders.

---

## 📦 Files (Step 1 → 7)
- [Step 01 — Basic Material Types](./06-01-Basic-material-types.html): Contrast **unlit** (`MeshBasicMaterial`) versus **lit** (`MeshStandardMaterial`) shading — no extra controls, just watch the lighting response.
- [Step 02 — Colors, Metalness & Roughness](./06-02-Colors-metalness-roughness.html): Cycle palettes with **C** and metal/rough presets with **M** to feel how PBR parameters change the sheen.
- [Step 03 — Procedural Wood Texture](./06-03-Apply-image-texture-wood-canvas.html): Spin a plane coated in Canvas2D-generated wood grain; tweak the code to adjust anisotropy or repeat.
- [Step 04 — Checkerboard + Bump Map](./06-04-Color-plus-bump-map-cube.html): Inspect how a paired color map + bump map fakes relief — rotate automatically for grazing-angle highlights.
- [Step 05 — Transparency + Alpha Mask](./06-05-Transparency-and-alpha-map-triangle.html): Observe glass transmission, thickness, and `alphaMap` falloff on a spinning triangle.
- [Step 06 — Environment Map Reflections](./06-06-Environment-map-reflections.html): Build a procedural cube map, run it through `PMREMGenerator`, and study reflection intensity.
- [Step 07 — Final Polished Scene](./06-07-Final-polish-combined-scene.html): Orbit the combined scene and switch cameras (**1** = Perspective, **2** = Ortho) while each hero asset animates slowly.

---

## 🚀 Quick Start
1. Open the folder `lesson-06/`
2. Double‑click any step (`.html` file)
3. Enjoy interactive WebGL scenes directly in your browser

*(Tested in Chrome, Firefox, and Edge — works offline!)*

---
## 💪 Challenges
- Replace the procedural wood texture with a photo texture of your choice.
- Animate metalness or roughness values over time to show material changes.
- Load an HDR environment map instead of the procedural cube map.

---

## 🎮 Controls (common across steps)
- **Mouse drag / wheel** → orbit + dolly in the Step 07 scene (auto-rotation carries the rest).
- **C** → cycle material colors (Step 02).
- **M** → cycle metalness / roughness presets (Step 02).
- **1 / 2** → Perspective ↔ Orthographic cameras (Step 07).
- **Click the canvas first** if hotkeys do not respond — browser focus is required.

---

## ⚙️ Performance tips
- Clamp `renderer.setPixelRatio()` to **~1.5–2.0** (see Step 07 helper) to avoid oversampling on 4K/Retina displays.
- The procedural **environment map** requires PMREM prefiltering; reuse a single generator/texture instead of rebuilding per frame.
- Lower texture resolutions (e.g., 256² wood/alpha maps) when targeting low-powered GPUs — procedural generators make this trivial.
- Disable `antialias` on the renderer and rely on post-process AA if you integrate these steps into a heavier pipeline later.

---

## 🧩 Troubleshooting
- **Scene looks flat?** Ensure `scene.environment` is set to the PMREM texture — background alone will not drive reflections.
- **Glass stays opaque?** Confirm `transparent: true`, `depthWrite: false`, and that your `alphaMap` has white/black contrast (Step 05 sample shows the pattern).
- **Orbit controls stutter?** Reduce the Step 07 DPR clamp or temporarily disable environment map generation to benchmark baseline performance.
- **Hotkeys ignored?** Click back into the canvas or tab, then press the shortcut again; browsers block key events when the page loses focus.

---

## 🖼️ Optional preview
> Capture your own render of Step 07 once you finish polishing the scene.

![Placeholder preview — replace with your capture](https://dummyimage.com/800x400/0e0e12/ffffff&text=Wood+%7C+Cube+%7C+Glass+%7C+Gold)

---

## ✅ Next Lesson
Up next: **Lesson 07 — Lights and Shadows**
We’ll explore different types of lights, shadows, and how to use them effectively.

---

Made with ❤️ for your materials & textures upgrade.
Happy shading!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.  
The name and materials are provided strictly for personal educational purposes.  
All rights reserved.
