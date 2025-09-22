## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 💡 Lesson 07 — Lights & Shadows in Three.js

Welcome to **Lesson 07** of our 21‑part series!  
This lesson covers the fundamentals of **lighting** and **shadows** in real‑time rendering.

---

## 📚 What You’ll Learn
- Different light types (Ambient, Directional, Spot, Point, Hemisphere)
- How to enable and configure **real‑time shadows**
- Shadow map quality settings (`mapSize`, `radius`, `bias`, `normalBias`)
- Using **ShadowMaterial** for ground‑only shadows
- Combining multiple lights into a **polished final scene**

---

## 🗂 Project Structure
Each step is a **standalone HTML file**. No build tools required.

```
lesson-07/
├── 01-Lighting-basics.html
├── 02-Directional-shadows.html
├── 03-Spotlight-shadows.html
├── 04-Pointlight-shadows.html
├── 05-Shadow-quality-and-bias.html
├── 06-ShadowMaterial-and-Hemisphere.html
└── 07-Final-polished-lighting-and-shadows.html
```

---

## 🚀 Quick Start
1. Download this lesson folder.
2. Double‑click any `.html` file.
3. The scene will run directly in your browser (Chrome/Firefox/Edge).

---

## 🔎 Step‑by‑Step Guide

### [Step 01 — Lighting Basics](./07-01-Lighting-basics.html)
- Adds **AmbientLight** and **DirectionalLight** (no shadows).

### [Step 02 — Directional Shadows](./07-02-Directional-shadows.html)
- Enable renderer.shadowMap.
- Configure light.shadow.camera and bias.

### [Step 03 — Spotlight Shadows](./07-03-Spotlight-shadows.html)
- Introduce **SpotLight** with cone angle & target.
- Moving target shows dynamic shadows.

### [Step 04 — Point Light Shadows](./07-04-Pointlight-shadows.html)
- Omni‑directional shadows from a moving **PointLight**.

### [Step 05 — Shadow Quality & Bias](./07-05-Shadow-quality-and-bias.html)
- Compare low vs. high quality shadows side by side.

### [Step 06 — ShadowMaterial + Hemisphere](./07-06-ShadowMaterial-and-Hemisphere.html)
- Shadow‑catcher ground using **ShadowMaterial**.
- Adds soft **HemisphereLight**.

### [Step 07 — Final Polished Scene](./07-07-Final.html)
- Mix **Directional + Spot + Point + Hemisphere** lights.
- Interactive camera orbit.
- Toggle lights with keys `1,2,3`.

## 💪 Challenges
- Animate one of the lights along a path to create moving shadows.
- Add controls to tweak shadow map size or bias at runtime.
- Create a day/night mode by changing light colors and intensities.

---

## 🎮 Controls (Final Scene)
- **Drag / Wheel** → orbit & zoom
- **1** → toggle Directional
- **2** → toggle Spot
- **3** → toggle Point

---

## ✅ Next Lesson
Next: **Lesson 08 — Cameras & Projection**  
We’ll dive deeper into camera types, FOV, aspect ratio, and projection tricks.

👨‍💻 Happy coding and keep experimenting!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.  
The name and materials are provided strictly for personal educational purposes.  
All rights reserved.
