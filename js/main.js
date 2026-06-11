/* main.js — entry point / init orchestrator.
   Init order documented in context.md §6. */

import { initTheme } from './theme.js';
import { renderProjects, initProjects } from './projects.js';
import { initLenis } from './lenis.js';
import { initReveals } from './reveals.js';
import { initLoader } from './loader.js';
import { initForm } from './form.js';
import { initNav } from './nav.js';
import { initCursor, initMagnetic, initDrawOutline } from './cursor.js';
import { initScrollbar } from './scrollbar.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
window.__pfReduced = prefersReduced;

const { gsap, ScrollTrigger } = window;
if (gsap && ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

/* 1 — Theme (initial theme already applied inline in <head>) */
initTheme();

/* 2 — Render project cards from editable data */
renderProjects();

/* 3 — Smooth scroll (no-op under reduced-motion) */
const lenis = initLenis();
initScrollbar(lenis);

/* 4 — Loader → hero entrance (single timeline). Starts counting immediately. */
initLoader();

/* Contact form (validation + states + mailto fallback) */
initForm();

/* Navigation: smooth-scroll anchors, burger menu, back-to-top */
initNav();

const refresh = () => { window.ScrollTrigger && window.ScrollTrigger.refresh(); };

/* 5 — Reveals after fonts settle (SplitType needs final metrics) */
function start() {
  initReveals();
  initProjects();
  initDrawOutline();
  initCursor();
  initMagnetic();
  refresh();
}
if (document.fonts && document.fonts.ready) document.fonts.ready.then(start);
else start();

window.addEventListener('load', refresh);

/* Later steps wire: projects-pin, nav, cursor, form, draw-outline. */
