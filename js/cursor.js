/* cursor.js — desktop pointer interactions (fine pointer + hover only,
   disabled under reduced-motion):
     • initCursor      — lerp-followed solid dot, grows + fades on [data-cursor]
     • initMagnetic    — [data-magnetic] elements drift toward the cursor (≤12px)
     • initDrawOutline — sizes the SVG outline rect per button; CSS draws the
                          stroke on hover/focus (works on all devices). */

const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
const canHoverFx = () => finePointer.matches && !window.__pfReduced && !!window.gsap;

export function initCursor() {
  if (!canHoverFx()) return;
  const dot = document.querySelector('[data-cursor-dot]');
  if (!dot) return;
  const gsap = window.gsap;

  document.documentElement.classList.add('has-cursor');
  gsap.set(dot, { xPercent: -50, yPercent: -50, opacity: 1 });

  let mx = innerWidth / 2, my = innerHeight / 2;
  const pos = { x: mx, y: my };
  addEventListener('mousemove', (e) => { mx = e.clientX; my = e.clientY; }, { passive: true });

  gsap.ticker.add(() => {
    pos.x += (mx - pos.x) * 0.2;
    pos.y += (my - pos.y) * 0.2;
    gsap.set(dot, { x: pos.x, y: pos.y });
  });

  const grow = () => gsap.to(dot, { scale: 2.2, opacity: 0.4, duration: 0.3, ease: 'power3.out' });
  const shrink = () => gsap.to(dot, { scale: 1, opacity: 1, duration: 0.3, ease: 'power3.out' });
  document.querySelectorAll('[data-cursor]').forEach((el) => {
    el.addEventListener('mouseenter', grow);
    el.addEventListener('mouseleave', shrink);
  });

  // hide when the pointer leaves the window
  document.addEventListener('mouseleave', () => gsap.to(dot, { opacity: 0, duration: 0.2 }));
  document.addEventListener('mouseenter', () => gsap.to(dot, { opacity: 1, duration: 0.2 }));
}

export function initMagnetic() {
  if (!canHoverFx()) return;
  const gsap = window.gsap;
  const MAX = 12, STRENGTH = 0.32;

  document.querySelectorAll('[data-magnetic]').forEach((el) => {
    const xTo = gsap.quickTo(el, 'x', { duration: 0.4, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.4, ease: 'power3' });
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      let dx = (e.clientX - (r.left + r.width / 2)) * STRENGTH;
      let dy = (e.clientY - (r.top + r.height / 2)) * STRENGTH;
      const dist = Math.hypot(dx, dy);
      if (dist > MAX) { const k = MAX / dist; dx *= k; dy *= k; }
      xTo(dx); yTo(dy);
    });
    el.addEventListener('mouseleave', () => { xTo(0); yTo(0); });
  });
}

export function initDrawOutline() {
  const SW = 1.5;
  const setup = (btn) => {
    const svg = btn.querySelector('.btn__outline');
    const rect = svg && svg.querySelector('rect');
    if (!rect) return;
    const r = btn.getBoundingClientRect();
    if (r.width < 2 || r.height < 2) return;
    svg.setAttribute('viewBox', `0 0 ${r.width} ${r.height}`);
    svg.setAttribute('preserveAspectRatio', 'none');
    rect.setAttribute('x', SW / 2);
    rect.setAttribute('y', SW / 2);
    rect.setAttribute('width', r.width - SW);
    rect.setAttribute('height', r.height - SW);
    rect.setAttribute('rx', (r.height - SW) / 2); // pill
    rect.setAttribute('pathLength', '1');
  };
  const setupAll = () => document.querySelectorAll('.btn').forEach(setup);
  setupAll();

  let t;
  addEventListener('resize', () => { clearTimeout(t); t = setTimeout(setupAll, 200); }, { passive: true });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(setupAll);
}
