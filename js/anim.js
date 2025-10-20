document.addEventListener("DOMContentLoaded", function () {

  // --- GESTION DU MENU MOBILE ---
  const hamburger = document.querySelector('.hamburger-menu');
  const mobileNav = document.querySelector('.mobile-nav');
  const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

  hamburger.addEventListener('click', function() {
    this.classList.toggle('is-active');
    mobileNav.classList.toggle('is-active');
    document.body.classList.toggle('menu-open');
  });

  mobileNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('is-active');
        mobileNav.classList.remove('is-active');
        document.body.classList.remove('menu-open');
    });
  });

  // --- GESTION DE LA NAVIGATION LATÉRALE (SIDE NAV) ---
  const sections = document.querySelectorAll('.full-page-section');
  const dots = document.querySelectorAll('.dot');
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        dots.forEach(dot => dot.classList.remove('active'));
        const sectionId = entry.target.id;
        const activeDot = document.querySelector(`.dot[data-section="${sectionId}"]`);
        if (activeDot) {
          activeDot.classList.add('active');
        }
      }
    });
  }, {
    root: document.querySelector('.main-container'),
    threshold: 0.5
  });

  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // --- GESTION DU CURSEUR PERSONNALISÉ ---
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (window.matchMedia("(pointer: fine)").matches) {
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        dot.style.left = `${clientX}px`;
        dot.style.top = `${clientY}px`;
        setTimeout(() => {
            outline.style.left = `${clientX}px`;
            outline.style.top = `${clientY}px`;
        }, 80);
    });

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .hamburger-menu');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.6)';
            outline.style.borderColor = '#fff';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = '#12C7EC';
        });
    });
  }

  // --- ANIMATION DES ÉLÉMENTS AU SCROLL ---
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    root: document.querySelector('.main-container'),
    threshold: 0.2
  });

  elementsToAnimate.forEach(el => {
    animationObserver.observe(el);
  });
  
});