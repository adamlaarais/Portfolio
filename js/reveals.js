/* reveals.js — generic scroll reveals on GSAP ScrollTrigger + SplitType.
   Patterns:
     [data-split]    → text split into masked lines, staggered rise on enter
     [data-stagger]  → children [data-reveal] revealed together, staggered
     [data-reveal]   → standalone fade + rise
     [data-ghost]    → giant section title, slow parallax + micro-scale (scrub)
   The .hero subtree is intentionally skipped (owned by the loader→hero timeline).
   No-op under reduced-motion: initial states are never set, content stays visible. */

const EASE = 'power3.out';

export function splitToLines(el) {
  const { SplitType } = window;
  if (!SplitType) return [];
  const split = new SplitType(el, { types: 'lines', lineClass: 'reveal-line' });
  // Wrap each line in an overflow-hidden mask.
  split.lines.forEach((line) => {
    const mask = document.createElement('span');
    mask.className = 'reveal-line-mask';
    line.parentNode.insertBefore(mask, line);
    mask.appendChild(line);
  });
  return split.lines;
}

export function initReveals() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  if (window.__pfReduced) return; // accessible static fallback

  const inHero = (el) => el.closest('.hero');

  /* 1 — Split text into masked lines */
  document.querySelectorAll('[data-split]').forEach((el) => {
    if (inHero(el)) return;
    const lines = splitToLines(el);
    if (!lines.length) return;
    gsap.set(lines, { yPercent: 120, opacity: 0 });
    gsap.to(lines, {
      yPercent: 0,
      opacity: 1,
      duration: 0.9,
      ease: EASE,
      stagger: 0.08,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
    });
  });

  /* 2 — Stagger groups */
  document.querySelectorAll('[data-stagger]').forEach((group) => {
    if (inHero(group)) return;
    const items = group.querySelectorAll('[data-reveal]');
    if (!items.length) return;
    gsap.set(items, { opacity: 0, y: 30 });
    gsap.to(items, {
      opacity: 1, y: 0,
      duration: 0.8, ease: EASE, stagger: 0.07,
      scrollTrigger: { trigger: group, start: 'top 82%', toggleActions: 'play reverse play reverse' },
    });
  });

  /* 3 — Standalone reveals (outside any stagger group), with per-block variants */
  const variants = {
    up:    { from: { opacity: 0, y: 30 },                       to: { opacity: 1, y: 0 } },
    scale: { from: { opacity: 0, scale: 0.94, y: 18 },          to: { opacity: 1, scale: 1, y: 0 } },
    clip:  { from: { opacity: 0, clipPath: 'inset(0 0 100% 0)' }, to: { opacity: 1, clipPath: 'inset(0 0 0% 0)' } },
  };
  document.querySelectorAll('[data-reveal]').forEach((el) => {
    if (inHero(el) || el.closest('[data-stagger]')) return;
    const v = variants[el.getAttribute('data-reveal')] || variants.up;
    gsap.set(el, v.from);
    gsap.to(el, {
      ...v.to,
      duration: 0.9, ease: EASE,
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play reverse play reverse' },
    });
  });

  /* 4 — Ghost titles: entrance from below + slow parallax + micro-scale, scrubbed */
  document.querySelectorAll('[data-ghost]').forEach((el) => {
    const trigger = el.closest('section, footer') || el;

    // Rise from below on section entry
    gsap.set(el, { opacity: 0, y: 80 });
    gsap.to(el, {
      opacity: 1, y: 0, duration: 1.1, ease: EASE,
      scrollTrigger: { trigger, start: 'top 92%', toggleActions: 'play reverse play reverse' },
    });

    // Parallax scrub (yPercent + scale, stacks with y above)
    gsap.fromTo(el,
      { yPercent: -8, scale: 0.985 },
      {
        yPercent: 14, scale: 1.05, ease: 'none',
        scrollTrigger: { trigger, start: 'top bottom', end: 'bottom top', scrub: 1 },
      }
    );
  });
}
