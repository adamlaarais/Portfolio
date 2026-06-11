/* lenis.js — single smooth-scroll instance, synced to GSAP ScrollTrigger.
   Disabled entirely under reduced-motion (native scroll, no rAF loop). */

let lenis = null;

export function initLenis() {
  const { gsap, ScrollTrigger, Lenis } = window;

  if (window.__pfReduced || !Lenis || !gsap || !ScrollTrigger) {
    return null; // native scroll; ScrollTrigger falls back to window scroll
  }

  lenis = new Lenis({
    duration: 1.1,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
    smoothWheel: true,
    smoothTouch: false,
    touchMultiplier: 1.6,
  });

  // Keep ScrollTrigger in sync with Lenis' virtual scroll.
  lenis.on('scroll', ScrollTrigger.update);

  // Drive Lenis from GSAP's ticker (single rAF for the whole app).
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  window.__lenis = lenis; // handy for debugging / programmatic scroll
  return lenis;
}

export function getLenis() { return lenis; }

export function lockScroll() {
  if (lenis) lenis.stop();
  else document.documentElement.style.overflow = 'hidden';
}

export function unlockScroll() {
  if (lenis) lenis.start();
  else document.documentElement.style.overflow = '';
}

export function scrollTo(target, opts = {}) {
  if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.15, ...opts });
    return;
  }
  const el = typeof target === 'string' ? document.querySelector(target) : target;
  const behavior = window.__pfReduced ? 'auto' : 'smooth';
  if (typeof target === 'number') window.scrollTo({ top: target, behavior });
  else if (el?.scrollIntoView) el.scrollIntoView({ behavior, block: 'start' });
}
