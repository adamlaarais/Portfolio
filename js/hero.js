/* hero.js — hero entrance. Built as a GSAP timeline so the loader can
   chain it seamlessly (loader curtain → hero, no cut). The .hero subtree is
   excluded from reveals.js so this module fully owns it.
   No-op under reduced-motion (hero stays statically visible). */

import { splitToLines } from './reveals.js';

let subLines = null;
let prepared = false;

/* Set hero elements to their hidden start states. Call once, just before the
   entrance plays (fonts are ready by then, so SplitType line breaks are final). */
export function setHeroInitial() {
  const { gsap } = window;
  if (!gsap || window.__pfReduced || prepared) return;
  prepared = true;

  const sub = document.querySelector('.hero__sub');
  subLines = sub ? splitToLines(sub) : [];

  gsap.set('.site-header', { opacity: 0, y: -14 });
  gsap.set('.hero__word > span', { yPercent: 115 });
  gsap.set('.hero__tagline', { opacity: 0, y: 16 });
  if (subLines.length > 0) {
    gsap.set(subLines, { yPercent: 120 });
  }
  gsap.set('.hero__social li', { opacity: 0, y: 14 });
  gsap.set('.hero__discover', { opacity: 0 });
  gsap.set('.hero__bracket .bar-v', { scaleY: 0 });
  gsap.set('.hero__bracket .bar-h', { scaleX: 0 });
}

/* Append the hero entrance to a timeline `tl` at `position`. */
export function buildHeroIntro(tl, position = 0) {
  const { gsap } = window;
  if (!gsap || window.__pfReduced) return tl;

  const t = gsap.timeline({ defaults: { ease: 'power3.out' } });
  t.to('.site-header', { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }, 0.4);
  t.to('.hero__tagline', { opacity: 1, y: 0, duration: 0.7 }, 0);
  t.to('.hero__word > span', { yPercent: 0, duration: 1.05, stagger: 0.1, ease: 'power4.out' }, 0.05);
  if (subLines && subLines.length > 0) {
    t.to(subLines, { yPercent: 0, duration: 0.85, stagger: 0.08 }, 0.4);
  }
  t.to('.hero__bracket .bar-v', { scaleY: 1, duration: 0.5 }, 0.45);
  t.to('.hero__bracket .bar-h', { scaleX: 1, duration: 0.5 }, 0.6);
  t.to('.hero__social li', { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.6);
  t.to('.hero__discover', { opacity: 1, duration: 0.7 }, 0.8);

  tl.add(t, position);
  return tl;
}
