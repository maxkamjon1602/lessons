## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 💡 Lesson 07 — Lights & Shadows in Three.js

Welcome to **Lesson 07** of our 21-part series! This chapter focuses on crafting believable lighting, tuning shadow quality, and shipping a polished, fully-interactive showcase.

## ✨ What you’ll build
- A **step-by-step lighting pipeline** that layers Ambient → Directional → Spot → Point → Hemisphere lights while turning on shadows along the way.
- A toolbox for **shadow map tuning** (size, blur radius, bias, normal bias) so you can balance sharpness vs performance.
- A final scene where **multiple lights mix together**, shadows stay grounded with `ShadowMaterial`, and hotkeys let you toggle contributions in real time.

## 🚀 Quick start
1. Download this lesson folder.
2. Double-click any `.html` file (Chrome / Firefox / Edge).
3. Every step is standalone—no build tools or server required.

---

## 📦 Files (Step 1 → 7)
- [Step 01 — Lighting Basics](./07-01-Lighting-basics.html): Ambient + Directional lighting foundation, no shadows yet.
- [Step 02 — Directional Shadows](./07-02-Directional-shadows.html): Enable `renderer.shadowMap`, size the frustum, and dial in bias.
- [Step 03 — Spotlight Shadows](./07-03-Spotlight-shadows.html): Animate a `SpotLight` target to watch cone-shaped shadows respond.
- [Step 04 — Point Light Shadows](./07-04-Pointlight-shadows.html): Add an omni light with cube shadow maps for all directions.
- [Step 05 — Shadow Quality & Bias](./07-05-Shadow-quality-and-bias.html): Compare map sizes, blur radius, and bias side-by-side.
- [Step 06 — ShadowMaterial & Hemisphere](./07-06-ShadowMaterial-and-Hemisphere.html): Use `ShadowMaterial` as a catcher while Hemisphere fills indirect light.
- [Step 07 — Final Polished Scene](./07-07-Final.html): Blend all lights together, polish materials, and ship runtime toggles.

---

## 🧠 New concepts
- **Light families:** Ambient for base fill, Directional for sun-like casts, Spot for focused cones, Point for omni highlights, Hemisphere for sky/ground tint.
- **Shadow settings:** Enable shadows per light/mesh, adjust `shadow.mapSize`, soften with `shadow.radius`, and fight acne using `bias` / `normalBias`.
- **ShadowMaterial:** Transparent ground plane that only renders contact shadows, keeping the scene lightweight and believable.

---

## 🎹 Controls (final scene & highlights)
- **Mouse:** Drag to orbit · Wheel to dolly.
- **Directional light:** Press **1** to toggle the sun-style rim lighting.
- **Spotlight:** Press **2** to toggle the moving cone and its dynamic shadow.
- **Point light:** Press **3** to toggle the omni accent light.
- **Shadow focus (Step 05):** Hot-reload the file to compare low vs high map sizes and bias presets.

---

## ⚙️ Performance tips
- Start shadow maps at **1024²**; upscale to 2048² only when the scene truly needs sharper edges.
- Tweak **`light.shadow.bias`** (±0.001) and **`normalBias`** (0.0–1.0) to remove acne without causing floating “Peter Pan” shadows.
- Limit secondary lights that cast shadows—use Hemisphere or Ambient for fill instead of another expensive shadow map.

---

## 🧩 Troubleshooting
- **No shadows rendering?** Confirm `renderer.shadowMap.enabled = true` and set `castShadow`/`receiveShadow` on the light + meshes.
- **Shadows look offset or flicker?** Reduce camera far distance for that light and fine-tune `bias`/`normalBias` until the surface contact stabilises.
- **Jagged edges?** Increase `shadow.mapSize` or clamp the camera closer to the subject so the texels cover more screen space.

---

## 💪 Challenges
- Animate one of the lights along a path to create moving shadows.
- Add controls to tweak shadow map size or bias at runtime.
- Create a day/night mode by changing light colors and intensities.

Made with ❤️ for your Lesson 06 → 07 lighting upgrade.
Happy rendering!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
