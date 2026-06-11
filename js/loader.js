/* loader.js — intro loader with a real-progress % counter,
   then a single GSAP timeline: count→100 → counter out → loader fade → hero entrance.
   Scroll is locked while the loader is up. Shown once per session. */

import { lockScroll, unlockScroll } from './lenis.js';
import { setHeroInitial, buildHeroIntro } from './hero.js';

export function initLoader() {
  const { gsap } = window;
  const root = document.documentElement;
  const loader = document.querySelector('[data-loader]');
  const reduced = window.__pfReduced;
  const active = root.classList.contains('loading') && loader && gsap && !reduced;

  // A — reduced motion or GSAP missing: static, just make sure scroll is free.
  if (reduced || !gsap) {
    root.classList.remove('loading');
    unlockScroll();
    return;
  }

  // B — loader skipped (already seen this session): play the hero entrance only.
  if (!active) {
    root.classList.remove('loading');
    unlockScroll();
    const run = () => { setHeroInitial(); buildHeroIntro(gsap.timeline(), 0); };
    if (document.fonts?.ready) document.fonts.ready.then(run); else run();
    return;
  }

  // C — full loader.
  lockScroll();
  try { sessionStorage.setItem('pf-loaded', '1'); } catch (_) {}

  const countEl = loader.querySelector('[data-loader-count]');
  const state = { shown: 0 };

  // Real progress = images loaded (80%) + fonts ready (20%).
  const imgs = Array.from(document.images);
  const total = imgs.length || 1;
  let done = 0;
  imgs.forEach((img) => {
    if (img.complete) { done++; return; }
    const bump = () => { done++; };
    img.addEventListener('load', bump, { once: true });
    img.addEventListener('error', bump, { once: true });
  });

  const render = () => {
    if (countEl) countEl.textContent = Math.round(state.shown * 100);
  };
  const tick = () => {
    const fonts = document.fonts && document.fonts.status === 'loaded' ? 1 : 0;
    const real = Math.min(0.99, (done / total) * 0.8 + fonts * 0.2);
    state.shown += (real - state.shown) * 0.03;
    render();
  };
  gsap.ticker.add(tick);

  let finished = false;
  const finish = () => {
    if (finished) return;
    finished = true;
    gsap.ticker.remove(tick);
    setHeroInitial();

    const tl = gsap.timeline();

    // 1 — count reaches 100 %
    tl.to(state, { shown: 1, duration: 0.9, ease: 'power2.out', onUpdate: render });

    // 2 — counter slides out
    tl.to('.loader__meta', { opacity: 0, y: -12, duration: 0.4, ease: 'power2.in' }, '+=0.15');

    // 3 — loader (+ canvas inside) fades out; wave-bg underneath is the same pattern so the
    //     blend is seamless. onComplete fires at opacity 0 so no CSS display snap.
    tl.to(loader, {
      opacity: 0,
      duration: 0.7,
      ease: 'power2.inOut',
      onComplete: () => {
        root.classList.remove('loading');
        unlockScroll();
        window.ScrollTrigger && window.ScrollTrigger.refresh();
      },
    }, '+=0.05');

    // 4 — hero elements animate in while loader is fading
    buildHeroIntro(tl, '-=0.5');
  };

  if (document.readyState === 'complete') setTimeout(finish, 150);
  else window.addEventListener('load', () => setTimeout(finish, 150), { once: true });
  setTimeout(finish, 7000); // safety fallback so the loader can never trap the page
}
