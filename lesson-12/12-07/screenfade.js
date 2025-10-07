export class ScreenFade {
  constructor({ color = '#ffffff', zIndex = 50 } = {}) {
    this.el = document.createElement('div');
    Object.assign(this.el.style, {
      position: 'fixed',
      inset: '0',
      background: color,
      opacity: '0',
      pointerEvents: 'none',
      transition: 'opacity 220ms ease',
      zIndex: String(zIndex),
    });
    document.body.appendChild(this.el);
  }
  async flash(opacity = 1, holdMs = 60) {
    this.el.style.opacity = String(opacity);
    await new Promise(r => setTimeout(r, holdMs));
    this.el.style.opacity = '0';
  }
  async fadeIn(ms = 180) { this.el.style.transition = `opacity ${ms}ms ease`; this.el.style.opacity = '1'; await new Promise(r => setTimeout(r, ms)); }
  async fadeOut(ms = 180){ this.el.style.transition = `opacity ${ms}ms ease`; this.el.style.opacity = '0'; await new Promise(r => setTimeout(r, ms)); }
}
