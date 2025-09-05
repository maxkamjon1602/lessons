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

### **01 — Lighting Basics**
- Adds **AmbientLight** and **DirectionalLight** (no shadows).

### **02 — Directional Shadows**
- Enable renderer.shadowMap.
- Configure light.shadow.camera and bias.

### **03 — Spotlight Shadows**
- Introduce **SpotLight** with cone angle & target.
- Moving target shows dynamic shadows.

### **04 — Point Light Shadows**
- Omni‑directional shadows from a moving **PointLight**.

### **05 — Shadow Quality & Bias**
- Compare low vs. high quality shadows side by side.

### **06 — ShadowMaterial + Hemisphere**
- Shadow‑catcher ground using **ShadowMaterial**.
- Adds soft **HemisphereLight**.

### **07 — Final Polished Scene**
- Mix **Directional + Spot + Point + Hemisphere** lights.
- Interactive camera orbit.
- Toggle lights with keys `1,2,3`.

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

---
👨‍💻 Happy coding and keep experimenting!
