## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](./LICENSE).

---

# 🎨 Lesson 06 — Materials, Textures & Lighting in Three.js

Welcome to **Lesson 06** of the 21‑part WebGL / Three.js learning series!  
This lesson focuses on **Materials**, **Textures**, and **Lighting** to make your 3D objects come alive.

---

## 📚 What You’ll Learn
- The difference between `MeshBasicMaterial`, `MeshStandardMaterial`, and `MeshPhysicalMaterial`
- Controlling **metalness** and **roughness**
- Using **procedural textures** (wood, checkerboard, alpha mask)
- Applying **bump maps** for surface detail
- Creating **transparent / glass objects**
- Adding **environment maps** for reflections
- Combining multiple objects into a polished scene

---

## 🗂 Project Structure
Each step is a **standalone HTML file**. No build tools, no servers — just double‑click and run.

```
lesson-06/
├── 01-Basic-material-types.html
├── 02-Colors-metalness-roughness.html
├── 03-Apply-image-texture-wood-canvas.html
├── 04-Color-plus-bump-map-cube.html
├── 05-Transparency-and-alpha-map-triangle.html
├── 06-Environment-map-reflections.html
└── 07-Final-polish-combined-scene.html
```

---

## 🚀 Quick Start
1. Open the folder `lesson-06/`
2. Double‑click any step (`.html` file)
3. Enjoy interactive WebGL scenes directly in your browser

*(Tested in Chrome, Firefox, and Edge — works offline!)*

---

## 🔎 Step‑by‑Step Guide

### **01 — Basic Material Types**
- Introduces `MeshBasicMaterial` (unlit color) vs. `MeshStandardMaterial` (lit, reacts to lights).

### **02 — Colors, Metalness & Roughness**
- Learn how **color**, **metalness**, and **roughness** define a material’s realism.
- Use keys `C` (cycle color) and `M` (cycle metal/rough presets).

### **03 — Procedural Wood Texture**
- Generate a **wood grain texture** procedurally in Canvas2D and apply it to a plane.

### **04 — Checkerboard + Bump Map**
- Combine a **checker texture** with a **bump map** to add surface relief to a cube.

### **05 — Transparency + Alpha Mask**
- Use `MeshPhysicalMaterial` with `transmission` and a custom **alpha map** to simulate glass.

### **06 — Environment Map Reflections**
- Apply a **procedural cube map** as the scene’s background and reflection source.
- Refine gold material with reflections and clearcoat.

### **07 — Final Polished Scene**
- Bring it all together:
  - **Wooden plane**
  - **Checker cube**
  - **Transparent glass triangle**
  - **Gold pyramid**
- Add **orbit controls**, **multiple lights**, and **camera switch (1 = Perspective, 2 = Ortho)**.

## 💪 Challenges
- Replace the procedural wood texture with a photo texture of your choice.
- Animate metalness or roughness values over time to show material changes.
- Load an HDR environment map instead of the procedural cube map.

---

## 🎮 Controls
- **Drag / Wheel** → orbit around objects  
- **1** → Perspective camera  
- **2** → Orthographic camera  

---

## 🌟 Preview (Final Scene)
![preview](https://dummyimage.com/800x400/0e0e12/ffffff&text=Wood+%7C+Cube+%7C+Glass+%7C+Gold)

---

## ✅ Next Lesson
Up next: **Lesson 07 — Lights and Shadows**  
We’ll explore different types of lights, shadows, and how to use them effectively.

---

👨‍💻 Happy coding, and keep experimenting!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.  
The name and materials are provided strictly for personal educational purposes.  
All rights reserved.
