// 12-lesson/core/shared/ui.js
const badge = document.getElementById('step-badge');
if (badge) {
  const lesson = badge.getAttribute('data-lesson') ?? '?';
  const step = badge.getAttribute('data-step') ?? '?';
  badge.textContent = `Lesson ${lesson} · Step ${step}`;
}
