# 🌌 uz learn try — Interactive Coding Lessons

Welcome to **uz learn try** — the companion codebase for my [YouTube channel](https://www.youtube.com/@uzbeksniperyt) 🎥.  
This repository contains **step-by-step lessons** that teach **3D graphics, interactivity, and creative coding** using [Three.js](https://threejs.org/) and modern web tech.

---

## 🚀 What’s Inside

- 📂 **Incremental lesson folders** — each folder has a standalone `index.html`.  
  You can open them directly in your browser or serve them locally.  
- 🧩 **Small, focused demos** — every step introduces *one new concept* (renderer, camera, shape, UI, animation).  
- 🎬 **YouTube tutorials** — each folder matches a video on my channel, so you can code along.


--- 

# 🌌 The 3D Web Journey — Lessons 1–8
> **56 steps · from first renderer to cinematic camera paths**

<p align="center">
  <img src="https://raw.githubusercontent.com/threejs/three.js/dev/files/icon.png" width="100"/>
</p>

---

## 📂 Project Structure


- 📄 Each **lesson** folder contains **7 standalone HTML files** (`01-…html` → `07-…html`).  
- 🧭 Each step has a **floating overlay**: `Lesson · Step`.  
- ⚡ Open any `.html` directly in your browser — no npm, no build step.  

---

# 📚 Lessons Overview (1–8)

---

## 🟦 Lesson 1 — Intro Scene
**Goal:** First contact with Three.js. Setup renderer, camera, and add simple shapes.

- [01 — Renderer](/01-lesson/step-1.html)  
- [02 — Ortho Camera](/01-lesson/step-2.html)  
- [03 — Square](/01-lesson/step-3.html)  
- [04 — Triangle](/01-lesson/step-4.html)  
- [05 — Toggles](/01-lesson/step-5.html)  
- [06 — Rotate Z](/01-lesson/step-6.html)  
- [07 — Rotate Y](/01-lesson/step-7.html)  

📸 _Learner sees: static → moving 2D primitives with basic rotations._

---

## 🔶 Lesson 2 — Multiple Objects & Grouping
**Goal:** Learn how to combine meshes into groups, move/rotate them together, and contrast with independent meshes.

- [01 — Renderer + Ortho](/02-lesson/01-renderer.html)  
- [02 — Shapes Refresh](/02-lesson/02-shapes.html)  
- [03 — Create Group](/02-lesson/03-group-create.html)  
- [04 — Move Group](/02-lesson/04-group-move.html)  
- [05 — Rotate Group](/02-lesson/05-group-rotate.html)  
- [06 — Group + Individual](/02-lesson/06-group-and-individual.html)  
- [07 — Toggles](/02-lesson/07-toggles.html)  

📸 _Learner sees: groups vs independent objects; group transform differences._

---

## 🟥 Lesson 3 — Transformations & Input
**Goal:** Introduce keyboard and mouse input to manipulate objects.

- [01 — Renderer + Ortho](/03-lesson/01-renderer.html)  
- [02 — Shapes Review](/03-lesson/02-shapes.html)  
- [03 — Arrow Keys Move](/03-lesson/03-keys-move-square.html)  
- [04 — Space Reset](/03-lesson/04-keys-reset-space.html)  
- [05 — Mouse Follow](/03-lesson/05-mouse-follow-triangle.html)  
- [06 — Group Move + Scale](/03-lesson/06-group-move-scale.html)  
- [07 — Final Mini Demo](/03-lesson/07-final-mini-demo.html)  

📸 _Learner sees: interactive movement, reset keys, mouse-follow mechanics._

---

## 🟩 Lesson 4 — Animations & Camera Toggles
**Goal:** Toggle between perspective/ortho, rotate shapes, combine 2D↔3D pairs.

- [01 — Ortho Refresher](/04-lesson/01-ortho-refresher.html)  
- [02 — Shapes Ortho](/04-lesson/02-shapes-ortho.html)  
- [03 — Toggle Cameras](/04-lesson/03-toggle-cameras.html)  
- [04 — Z Depth](/04-lesson/04-z-depth.html)  
- [05 — 2D↔3D Toggle Pairs](/04-lesson/05-paired-toggles.html)  
- [06 — Rotating 3D Pairs](/04-lesson/06-rotating-pairs.html)  
- [07 — Final 2D↔3D Demo](/04-lesson/07-final.html)  

📸 _Learner sees: perspective vs ortho, toggling between 2D and 3D forms._

---

## 🟪 Lesson 5 — Materials
**Goal:** Explore material types — basic, metallic, transparent — and add orbit controls.

- [01 — Scene + 2D Shapes](/05-lesson/01-Scene-and-2D-shapes.html)  
- [02 — 3D Counterparts + Lights](/05-lesson/02-Add-3D-counterparts-and-lights.html)  
- [03 — Group + Animation](/05-lesson/03-Group-and-Animation.html)  
- [04 — Ortho Camera + Switch Keys](/05-lesson/04-Orthographic-camera-and-switch.html)  
- [05 — Orbit Controls (Drag/Wheel)](/05-lesson/05-Orbit-controls-drag-and-zoom.html)  
- [06 — DPR-aware Resize](/05-lesson/06-DPR-aware-resize.html)  
- [07 — HUD + Toggles](/05-lesson/07-HUD-and-runtime-toggles.html)  

📸 _Learner sees: different materials side by side, with orbit & resize responsiveness._

---

## 🟧 Lesson 6 — Extended Materials & Textures
**Goal:** Apply image textures, bump maps, transparency, and environment mapping.

- [01 — Basic Material Types](/06-lesson/01-Basic-material-types.html)  
- [02 — Colors, Metalness, Roughness](/06-lesson/02-Colors-metalness-roughness.html)  
- [03 — Apply Wood Texture](/06-lesson/03-Apply-image-texture-wood-canvas.html)  
- [04 — Color + Bump Map](/06-lesson/04-Color-plus-bump-map-cube.html)  
- [05 — Transparency + Alpha](/06-lesson/05-Transparency-and-alpha-map-triangle.html)  
- [06 — Environment Map Reflections](/06-lesson/06-Environment-map-reflections.html)  
- [07 — Final Polished Scene](/06-lesson/07-Final-polish-combined-scene.html)  

📸 _Learner sees: realistic wood, bumpy surfaces, transparent glass, reflective spheres._

---

## 🟨 Lesson 7 — Lighting & Shadows
**Goal:** Explore lights, shadow types, quality, and shadow materials.

- [01 — Lighting Basics](/07-lesson/01-Lighting-basics.html)  
- [02 — Directional Light Shadows](/07-lesson/02-Directional-shadows.html)  
- [03 — Spotlight Shadows](/07-lesson/03-Spotlight-shadows.html)  
- [04 — Point Light Shadows](/07-lesson/04-Pointlight-shadows.html)  
- [05 — Shadow Quality & Bias](/07-lesson/05-Shadow-quality-and-bias.html)  
- [06 — ShadowMaterial & Hemisphere](/07-lesson/06-ShadowMaterial-and-Hemisphere.html)  
- [07 — Final Lighting Demo](/07-lesson/07-Final.html)  

📸 _Learner sees: multiple light types, shadow tuning, hemisphere light blending._

---

## 🟫 Lesson 8 — Camera Projection Deep Dive
**Goal:** Master camera types, FOV, zoom vs dolly, and cinematic paths.

- [01 — Camera Types (Perspective vs Ortho)](/08-lesson/01-camera-types.html)  
- [02 — FOV & Aspect](/08-lesson/02-fov-and-aspect.html)  
- [03 — Zoom vs Dolly](/08-lesson/03-zoom-vs-dolly.html)  
- [04 — Fit Camera to Object](/08-lesson/04-fit-camera-to-object.html)  
- [05 — Screen ↔ World Coordinates](/08-lesson/05-screen-world-coordinates.html)  
- [06 — Depth of Field Simulation](/08-lesson/06-manual-orbit-and-pan.html)  
- [07 — Cinematic Camera Path](/08-lesson/07-cinematic-camera-path.html)  

📸 _Learner sees: cameras switching, zoom vs dolly contrast, final cinematic fly-through._

---

# 🔬 In-Depth Analysis

### 🧭 Teaching Philosophy
- **Consistency:** Same scaffold → learners focus only on what’s new.  
- **Visible Deltas:** Every step introduces a **clear change**.  
- **Overlay Guidance:** Students never lose orientation (`Lesson · Step`).  

### ⚡ Performance Mindset
- DPR clamped to ≤2 for smooth FPS.  
- Shadows optimized (map size + bias tweaks).  
- Lightweight primitives before models/textures.  

### 📖 Documentation
- Each lesson has a matching **DOCX report** (`/docs/reports/`) explaining:  
  - All **variables** and their default values  
  - All **methods** and their parameters  
  - All **numbers** (e.g., why FOV=75, why bias=-0.0005)  

### 🌍 Endgame Vision
- Lessons 1–8 = **foundation**  
- Lessons 9–18 = **advanced graphics, shaders, particles, postprocessing**  
- Lessons 19–21 = **final open-world interactive project**  

- [Three.js Docs](https://threejs.org/docs/): Official API reference for the entire library
- [Discover three.js](https://discoverthreejs.com/): Project-based tutorials that build real applications step by step
- [Three.js Fundamentals](https://threejsfundamentals.org/): Beginner-friendly explanations of core concepts with interactive examples
- [The Book of Shaders](https://thebookofshaders.com/): Creative guide to writing shaders with GLSL

---

<p align="center">
  🌟 Built with ❤️ and Three.js · <strong>Learn · Try · @maxkamjon.abdumannobov</strong>
</p>
