## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](../LICENSE).

---

# 🎯 Lesson 02 — Grouping Shapes

Welcome! This lesson levels up your Lesson 01 primitives into a **hierarchical scene** where multiple meshes share transforms through a parent `THREE.Group`.

## ✨ What you’ll build
- Compose a square and triangle into a **single group** so they translate together.
- Layer **shared + individual rotations** to see how local vs world space interact.
- Add lightweight UI toggles that let you compare **group motion** against **per-mesh motion** live.

## 📦 Files (Step 1 → 7)
- [Step 01 — Renderer + Ortho Camera](./02-01-renderer.html): Rebuilds the renderer/camera baseline with an orthographic view sized to the canvas.
- [Step 02 — Shapes Refresh](./02-02-shapes.html): Draws the square + triangle meshes and positions them in screen space.
- [Step 03 — Create Group](./02-03-group-create.html): Wraps both meshes in a `THREE.Group` and adds it to the scene graph.
- [Step 04 — Move Group](./02-04-group-move.html): Demonstrates translating the parent group to move every child together.
- [Step 05 — Rotate Group](./02-05-group-rotate.html): Introduces a button that toggles a shared spin for the entire group.
- [Step 06 — Group + Individual Animations](./02-06-group-and-individual.html): Keeps the group spin toggle and layers counter-rotations on each child mesh.
- [Step 07 — Toggles: Group vs Items](./02-07-toggles.html): Adds dual buttons so you can enable/disable parent vs child rotations independently.

## 🧠 New concepts
- **Scene graph grouping**: `THREE.Group` lets you collect meshes so you can move, rotate, or scale them with one parent transform.
- **Shared transforms**: Applying rotation/position on the group updates every child in its local space—great for rigid assemblies.
- **Simultaneous animations**: Parent and child animations combine, illustrating how local rotations accumulate on top of group motion.

## 🎹 Controls (progressive)
- **UI buttons (Steps 5–7)**: Click **Rotate Group** to toggle the parent’s spin. In Step 7, use **Rotate Items** to pause/resume each mesh’s individual motion.
- **Window resize**: The orthographic camera recalculates on resize so the group stays centered without extra input.
- **Focus tip**: Buttons grab focus after you click them—press `Tab` or `Shift+Tab` to move focus away if you plan to test keyboard interactions.

## 🧩 Troubleshooting
- **Group won’t rotate**: Confirm the animation loop updates `group.rotation.z` and that the toggle state flips the boolean controlling it.
- **Only one mesh moves**: Make sure both meshes are added via `group.add(...)`; applying transforms directly to a mesh bypasses the shared parent.
- **Buttons feel unresponsive**: Check that the `<button>` elements sit inside the `#controls` overlay and aren’t covered by the canvas (z-order).

## ⚙️ Performance & usage tips
- Keep animations smooth by updating **group transforms once per frame** and reusing meshes; avoid recreating geometry in the loop.
- When testing toggles, let the button retain focus so pressing **Space/Enter** quickly re-triggers the click handler—handy for comparisons.
- Re-centering the group? Adjust the group’s `position` instead of each child so offsets remain consistent across steps.

Made with ❤️ for your Lesson 01 → 02 grouping journey.
Happy grouping!

---

## Trademark Notice

**UZ LEARN TRY™** is the brand identity of this project.
The name and materials are provided strictly for personal educational purposes.
All rights reserved.
