document.addEventListener("DOMContentLoaded", function () {

  const BLUE_NEON = '#12C7EC';

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
    
    const thumbHeight = Math.min(100, Math.max(0, scrollPercent)); 
    
    scrollbarThumb.style.height = `${thumbHeight}%`;
  }

  window.addEventListener('scroll', updateScrollbar);
  updateScrollbar(); 


  // --- GESTION SMART SCROLL DU HEADER ---
  const header = document.querySelector('header');
  let lastScrollY = window.scrollY;
  const headerHeight = header.offsetHeight;

  window.addEventListener('scroll', () => {
      if (window.scrollY > lastScrollY && window.scrollY > headerHeight) {
          header.classList.add('hidden');
      } 
      else if (window.scrollY < lastScrollY) {
          header.classList.remove('hidden');
      }
      lastScrollY = window.scrollY;
  });
  // --- FIN GESTION SMART SCROLL ---

  // --- GESTION DU CURSEUR PERSONNALISÉ (OPTIMISÉ) ---
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  if (window.matchMedia("(pointer: fine)").matches) {
    
    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;
    const lerpSpeed = 0.15; 

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    function animateCursor() {
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;

        outlineX += (mouseX - outlineX) * lerpSpeed;
        outlineY += (mouseY - outlineY) * lerpSpeed;

        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;

        requestAnimationFrame(animateCursor);
    }

    requestAnimationFrame(animateCursor);

    const interactiveElements = document.querySelectorAll('a, button, input, textarea, .hamburger-menu');
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1.6)';
            outline.style.borderColor = '#fff';
        });
        el.addEventListener('mouseleave', () => {
            outline.style.transform = 'translate(-50%, -50%) scale(1)';
            outline.style.borderColor = BLUE_NEON;
        });
    });
  }
  // --- FIN GESTION CURSEUR ---

  // --- LOGIQUE TYPEWRITER POUR SECTION A PROPOS ---
  function typewriter(element, speed = 30) {
      const text = element.getAttribute('data-text-full');
      element.textContent = ''; 
      element.style.opacity = 1;

      let i = 0;
      function typing() {
          if (i < text.length) {
              element.textContent = text.substring(0, i + 1) + '▍'; 
              i++;
              setTimeout(typing, speed); 
          } else {
              element.textContent = text; 
          }
      }
      typing();
  }
  
  // Prépare le texte pour le typewriter et le cascade
  const bioTextParagraphs = document.querySelectorAll('.bio-text-column p');
  bioTextParagraphs.forEach(p => {
      p.setAttribute('data-text-full', p.innerHTML); // Stocke le contenu HTML original
      p.innerHTML = ''; // Vide le contenu
  });
  
  // --- ANIMATION DES ÉLÉMENTS AU SCROLL (STAGGERED & TITRES ANIMÉS) ---
  const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
  const animatedTitles = document.querySelectorAll('.animated-title');
  const projectSlides = document.querySelectorAll('.project-slide');

  // Observer principal pour l'apparition des éléments (avec effet staggered/cascade)
  const animationObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        
        entry.target.classList.add('visible');
        
        // Logique spécifique pour la section À Propos (Typewriter)
        if (entry.target.classList.contains('bio-content-fusion')) {
            bioTextParagraphs.forEach((p, pIndex) => {
               // Typewriter sur la première phrase, cascade simple pour les autres (pour éviter la lenteur)
               if (pIndex === 0) {
                    setTimeout(() => {
                        typewriter(p, 25);
                    }, pIndex * 600); 
               } else {
                   setTimeout(() => {
                       p.innerHTML = p.getAttribute('data-text-full');
                       p.classList.add('visible');
                   }, 600 + (pIndex * 300));
               }
           });
           
           // Anime les mots-clés
           const keywords = entry.target.querySelectorAll('.keyword-item');
           keywords.forEach((keyword, kIndex) => {
                keyword.style.setProperty('--animation-delay', `${0.8 + kIndex * 0.1}s`);
           });
           
        } else {
          // Staggered général pour les autres blocs animate-on-scroll
          entry.target.style.transitionDelay = `${index * 0.1}s`; 
        }
        
        // Arrête l'observation après la première apparition
        animationObserver.unobserve(entry.target); 
      }
    });
  }, {
    threshold: 0.1
  });

  // Observer pour les titres de section (Effet de remplissage néon)
  const titleObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            titleObserver.unobserve(entry.target);
        }
    });
  }, {
    threshold: 0.8 
  });
  
  // Observer pour les slides de projets (Déclenche l'animation de l'image et du texte descriptif via CSS)
  const projectObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
        } else {
             entry.target.classList.remove('visible');
        }
    });
  }, {
    threshold: 0.4 
  });


  elementsToAnimate.forEach(el => {
    el.style.transitionDelay = '0s'; 
    animationObserver.observe(el);
  });
  
  animatedTitles.forEach(el => {
      titleObserver.observe(el);
  });

  projectSlides.forEach(el => {
      projectObserver.observe(el);
  });
  // --- FIN ANIMATION SCROLL --- 


  // --- GESTION DU FOND ÉTOILÉ ---
  const canvas = document.getElementById('star-background');
  
  if (canvas) {
    const ctx = canvas.getContext('2d');

    let stars = [];
    let numStars = 100; 

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function initStars() {
        stars = [];
        for (let i = 0; i < numStars; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                radius: Math.random() * 2 + 1, 
                vx: (Math.random() - 0.5) * 0.5, 
                vy: (Math.random() - 0.5) * 0.5, 
                color: BLUE_NEON
            });
        }
    }

    function drawStars() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(3, 83, 99, 1)'
        ctx.beginPath();
        for (let i = 0; i < stars.length; i++) {
            let star = stars[i];
            ctx.moveTo(star.x, star.y);
            ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        }
        ctx.fill();
    }

    function updateStars() {
        for (let i = 0; i < stars.length; i++) {
            let star = stars[i];

            star.x += star.vx;
            star.y += star.vy;

            if (star.x < 0) star.x = canvas.width;
            if (star.x > canvas.width) star.x = 0;
            if (star.y < 0) star.y = canvas.height;
            if (star.y > canvas.height) star.y = 0;
        }
    }

    function animate() {
        drawStars();
        updateStars();
        requestAnimationFrame(animate);
    }

    setCanvasSize();
    initStars();
    animate();

    window.addEventListener('resize', () => {
        setCanvasSize();
        initStars(); 
    });
  }
  // --- FIN GESTION FOND ÉTOILÉ ---

});