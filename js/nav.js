/* nav.js — navigation behaviours:
   - smooth-scroll for in-page anchor links (via Lenis, native fallback)
   - back-to-top button
   - mobile burger menu (open/close, focus, scroll lock, Escape) */

import { scrollTo, lockScroll, unlockScroll, getLenis } from './lenis.js';

export function initNav() {
  const burger = document.querySelector('[data-burger]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  const header = document.querySelector('[data-header]');

  /* --- Header scroll-hide behaviour (GSAP-driven to avoid CSS/inline conflict) --- */
  if (header && !window.__pfReduced && window.gsap) {
    const gsap = window.gsap;
    let lastY = 0;
    let hidden = false;

    const onScroll = ({ scroll } = {}) => {
      const y = scroll ?? window.scrollY;
      const delta = y - lastY;
      if (y > 100 && delta > 4 && !hidden) {
        hidden = true;
        gsap.to(header, { y: '-110%', duration: 0.45, ease: 'power3.inOut', overwrite: true });
      } else if ((delta < -4 || y < 60) && hidden) {
        hidden = false;
        gsap.to(header, { y: 0, duration: 0.5, ease: 'power3.out', overwrite: true });
      }
      lastY = y;
    };

    const lenis = getLenis();
    if (lenis) lenis.on('scroll', onScroll);
    else window.addEventListener('scroll', () => onScroll(), { passive: true });
  }

  const setMobile = (open) => {
    if (!mobileNav || !burger) return;
    mobileNav.classList.toggle('is-open', open);
    mobileNav.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    if (open) lockScroll(); else unlockScroll();

    /* Stagger-in the nav links when opening */
    if (open && window.gsap && !window.__pfReduced) {
      const links = mobileNav.querySelectorAll('.mobile-nav__list a');
      const foot = mobileNav.querySelector('.mobile-nav__foot');
      window.gsap.set([...links, foot].filter(Boolean), { opacity: 0, y: 36 });
      window.gsap.to(links, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out', delay: 0.08 });
      if (foot) window.gsap.to(foot, { opacity: 1, y: 0, duration: 0.45, ease: 'power3.out', delay: 0.42 });
    }
  };
  const closeMobile = () => setMobile(false);

  burger?.addEventListener('click', () => {
    setMobile(!mobileNav.classList.contains('is-open'));
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileNav?.classList.contains('is-open')) {
      closeMobile();
      burger?.focus();
    }
  });

  // In-page anchor links → smooth scroll
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const id = a.getAttribute('href');
    if (!id || id.length < 2) return;
    a.addEventListener('click', (e) => {
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      closeMobile();
      scrollTo(target, { offset: 0 });
      history.replaceState(null, '', id);
    });
  });

  // Back-to-top
  document.querySelectorAll('[data-scroll-top]').forEach((btn) => {
    btn.addEventListener('click', () => scrollTo(0));
  });
}
