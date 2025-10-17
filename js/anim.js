document.addEventListener("DOMContentLoaded", function () {

  // --- GESTION DU CURSEUR PERSONNALISÉ ---
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  // N'active le curseur que sur les appareils non tactiles
  if (window.matchMedia("(pointer: fine)").matches) {
    
    window.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        
        // Le point suit la souris instantanément
        dot.style.left = `${clientX}px`;
        dot.style.top = `${clientY}px`;
        
        // L'outline a un léger délai pour un effet de "traînée"
        setTimeout(() => {
            outline.style.left = `${clientX}px`;
            outline.style.top = `${clientY}px`;
        }, 80);
    });

    // Agrandit le curseur au survol des éléments interactifs
    const interactiveElements = document.querySelectorAll('a, button, input, textarea');
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
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      // Si l'élément est dans le viewport, on ajoute la classe 'visible'
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, {
    threshold: 0.1 // L'animation se déclenche quand 10% de l'élément est visible
  });

  elementsToAnimate.forEach(el => {
    observer.observe(el);
  });
  
});