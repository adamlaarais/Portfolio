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


  // --- GESTION DU CURSEUR PERSONNALISÉ (OPTIMISÉ) ---
  const dot = document.querySelector('.cursor-dot');
  const outline = document.querySelector('.cursor-outline');

  // On vérifie si l'utilisateur a une souris
  if (window.matchMedia("(pointer: fine)").matches) {
    
    // 1. Variables pour stocker les positions
    let mouseX = 0;
    let mouseY = 0;
    
    // Position "lissée" du contour
    let outlineX = 0;
    let outlineY = 0;

    // Vitesse du lissage (plus le chiffre est petit, plus la traînée est longue)
    const lerpSpeed = 0.15; 

    // 2. Mettre à jour les coordonnées de la souris (sans toucher au DOM)
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // 3. Créer une boucle d'animation fluide
    function animateCursor() {
        // Le point central suit la souris instantanément
        dot.style.left = `${mouseX}px`;
        dot.style.top = `${mouseY}px`;

        // Le contour "chasse" la position de la souris (interpolation linéaire ou "lerp")
        outlineX += (mouseX - outlineX) * lerpSpeed;
        outlineY += (mouseY - outlineY) * lerpSpeed;

        outline.style.left = `${outlineX}px`;
        outline.style.top = `${outlineY}px`;

        // 4. Demander à répéter à la prochaine frame
        requestAnimationFrame(animateCursor);
    }

    // 5. Lancer la boucle d'animation
    requestAnimationFrame(animateCursor);

    // 6. La gestion du "hover" (agrandissement) ne change pas
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
  // --- FIN GESTION CURSEUR ---

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
  
  // --- GESTION DU FOND ÉTOILÉ ---
  const canvas = document.getElementById('star-background');
  // Vérifie si le canvas existe avant de continuer
  if (canvas) {
    const ctx = canvas.getContext('2d');

    let stars = [];
    let numStars = 100; // Nombre d'étoiles

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
                radius: Math.random() * 2 + 1, // Rayon entre 1 et 3
                vx: (Math.random() - 0.5) * 0.5, // Vitesse x
                vy: (Math.random() - 0.5) * 0.5, // Vitesse y
                color: '#12C7EC' // Couleur bleue du portfolio
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

            // Fait réapparaître les étoiles de l'autre côté
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

    // Initialisation
    setCanvasSize();
    initStars();
    animate();

    // Gérer le redimensionnement de la fenêtre
    window.addEventListener('resize', () => {
        setCanvasSize();
        initStars(); // Réinitialiser les étoiles pour la nouvelle taille
    });
  }
  // --- FIN GESTION FOND ÉTOILÉ ---

});