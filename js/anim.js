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

  // --- GESTION DE LA BARRE DE PROGRESSION DU SCROLL ---
  const scrollbarThumb = document.getElementById('scrollbar-thumb');
  
  function updateScrollbar() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrolled = window.scrollY;
    const scrollPercent = (scrolled / scrollHeight) * 100;
    
    // Assure que la valeur reste entre 0 et 100
    const thumbHeight = Math.min(100, Math.max(0, scrollPercent)); 
    
    scrollbarThumb.style.height = `${thumbHeight}%`;
  }

  // Met à jour la barre au chargement et au scroll
  window.addEventListener('scroll', updateScrollbar);
  updateScrollbar(); // Appel initial


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
    threshold: 0.1
  });

  elementsToAnimate.forEach(el => {
    animationObserver.observe(el);
  });
  
});