## License
This project is licensed under the **UZ Learn Try Personal Education License (UT-PEL) v1.0**.  
**Not** open source. **Personal self-learning only.** No redistribution, no public hosting, no derivatives, no commercial or instructional use, and no AI/data-mining. See [LICENSE](./LICENSE).


# Lesson 3 — User Input & Motion 🎮🖱️

Bring your shapes to life! In Lesson 3 we connect **keyboard** and **mouse** input to motion and feedback on the canvas.

---

## ✨ What You’ll Learn
- Handle **keyboard events** (`keydown`, `keyup`) to move objects.
- Use **mouse position** to drive motion.
- Convert browser coordinates → **scene (pixel) coordinates** with an orthographic camera.
- Implement **hover detection** for square & triangle (AABB and barycentric tests).
- Combine multiple inputs at once (keyboard + mouse).
- Keep motion stable using **delta-time** (`dt`) in the animation loop.

---

## 📂 Structure
```
lesson-03-increments/
├── 01-renderer/               # refresher: renderer + ortho
├── 02-shapes/                 # square + triangle (review)
├── 03-keys-move-square/       # arrow keys move square
├── 04-keys-reset-space/       # space resets square
├── 05-mouse-follow-triangle/  # mouse moves triangle
├── 06-hover-highlight/        # hover changes color
└── 07-combine-inputs/         # everything together
```

## 💪 Challenges
- Add WASD keys to move the triangle independently of the square.
- Hold **Shift** to temporarily boost movement speed.
- Use the mouse wheel to scale shapes up or down.

---

## 🧭 Controls
| Step | Keyboard | Mouse |
|-----:|---------|-------|
| 03   | Arrow keys move the square | — |
| 04   | Arrow keys + **Space** resets square | — |
| 05   | — | Triangle follows cursor |
| 06   | — | Hover over shapes to highlight |
| 07   | Arrow keys + **Space** | Triangle follows cursor |

---

## 🧠 Key Concepts

### 1) Delta-Time Movement
Use the real time between frames so objects move at the same speed regardless of framerate:
```js
let last = performance.now();
function tick(now){
  const dt = Math.min(0.05, (now-last)/1000); last = now;
  square.position.x += SPEED * dt;
}
```
*Why:* at 30fps or 144fps, distance per second stays consistent.

### 2) Scene Coordinates from Mouse
We map the browser’s `clientX/clientY` to scene pixels by subtracting the canvas’ bounding box:
```js
function getMouseScenePos(e){
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
```
With our orthographic camera `(0..w, 0..h)`, these are **already** world units.

### 3) Hover Tests
- **Square**: use an **axis-aligned bounding box** (AABB).
- **Triangle**: use a **barycentric** point-in-triangle test.

```js
// Square AABB
const left = square.position.x - size/2;
const top  = square.position.y - size/2;
const inside = (x>=left && x<=left+size && y>=top && y<=top+size);
```

```js
// Barycentric test in triangle's local space
// A=(w/2,0), B=(0,h), C=(w,h)
```

### 4) Clamping to the View
Keep shapes inside the viewport:
```js
const maxX = cam.right - size/2, minX = cam.left + size/2;
square.position.x = Math.max(minX, Math.min(maxX, square.position.x));
```

---

## 🚀 How to Run
All files are supported on most modern browsers.

---

## 🧩 Troubleshooting
- **Nothing moves on key press** → The page may not have focus; click once in the page. Also check `e.key` names (`ArrowLeft`, etc.).  
- **Mouse position offset** → Ensure you subtract `canvas.getBoundingClientRect()` and not `window.scrollX/scrollY`.  
- **Jitter on movement** → Clamp `dt` (e.g., to `0.05`) to ignore long frame pauses.

---
