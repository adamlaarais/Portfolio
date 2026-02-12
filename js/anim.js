document.addEventListener("DOMContentLoaded", function () {

    const BLUE_NEON = '#12C7EC';

    const hamburger = document.querySelector('.hamburger-menu');
    const mobileNav = document.querySelector('.mobile-nav');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    if (hamburger) {
        hamburger.addEventListener('click', function () {
            this.classList.toggle('is-active');
            mobileNav.classList.toggle('is-active');
            document.body.classList.toggle('menu-open');
        });
    }

    if (mobileNavLinks) {
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('is-active');
                mobileNav.classList.remove('is-active');
                document.body.classList.remove('menu-open');
            });
        });
    }

    const scrollbarThumb = document.getElementById('scrollbar-thumb');

    function updateScrollbar() {
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrolled = window.scrollY;
        const scrollPercent = (scrolled / scrollHeight) * 100;
        const thumbHeight = Math.min(100, Math.max(0, scrollPercent));

        if (scrollbarThumb) {
            scrollbarThumb.style.height = `${thumbHeight}%`;
        }
    }

    window.addEventListener('scroll', updateScrollbar);
    updateScrollbar();

    const header = document.querySelector('header');
    let lastScrollY = window.scrollY;
    const headerHeight = header ? header.offsetHeight : 70;

    /* Scroll effect disabled
    window.addEventListener('scroll', () => {
        if (header) {
            if (window.scrollY > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        }
    });
    */

    const dot = document.querySelector('.cursor-dot');
    const outline = document.querySelector('.cursor-outline');

    if (window.matchMedia && window.matchMedia("(pointer: fine)").matches && dot && outline) {

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

        const interactiveElements = document.querySelectorAll('a, button, input, textarea, .hamburger-menu, .skill-icon, .dot, .role-tag');
        interactiveElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                outline.style.transform = 'translate(-50%, -50%) scale(1.6)';
                outline.style.borderColor = '#fff';
                dot.style.backgroundColor = '#fff';
            });
            el.addEventListener('mouseleave', () => {
                outline.style.transform = 'translate(-50%, -50%) scale(1)';
                outline.style.borderColor = BLUE_NEON;
                dot.style.backgroundColor = BLUE_NEON;
            });
        });
    }

    function initializeProjectSlider(containerElement) {
        const sliderWrapper = containerElement.querySelector('.project-slider-wrapper');
        const slider = containerElement.querySelector('.project-slider');
        const prevButton = containerElement.querySelector('.slider-prev');
        const nextButton = containerElement.querySelector('.slider-next');
        const dotsContainer = containerElement.querySelector('.slider-dots-container');

        if (!slider || !slider.firstElementChild || !prevButton || !nextButton) return;

        const totalSlides = slider.children.length;
        let currentIndex = 0;

        function updateSlider() {
            const slideWidth = slider.firstElementChild.clientWidth;
            slider.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
            updateDots();
        }

        function createDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('span');
                dot.classList.add('dot');
                dot.setAttribute('data-index', i);
                dot.addEventListener('click', () => {
                    currentIndex = i;
                    updateSlider();
                });
                dotsContainer.appendChild(dot);
            }
        }

        function updateDots() {
            if (!dotsContainer) return;
            dotsContainer.querySelectorAll('.dot').forEach((dot, index) => {
                dot.classList.toggle('active', index === currentIndex);
            });
        }

        function goToNextSlide() {
            currentIndex = (currentIndex + 1) % totalSlides;
            updateSlider();
        }

        function goToPrevSlide() {
            currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
            updateSlider();
        }

        createDots();
        updateSlider();

        nextButton.addEventListener('click', goToNextSlide);
        prevButton.addEventListener('click', goToPrevSlide);

        window.addEventListener('resize', updateSlider);
        window.addEventListener('load', updateSlider);
    }

    const allProjectContainers = document.querySelectorAll('.project-card');
    allProjectContainers.forEach(container => {
        initializeProjectSlider(container);
    });

    /* --- Animation au défilement (Scroll Animation) --- */
    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll, .project-separator');
    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    };

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    elementsToAnimate.forEach(el => {
        observer.observe(el);
    });
    /* --- Fin Animation au défilement --- */

    const canvas = document.getElementById('star-background');

    if (canvas) {
        const ctx = canvas.getContext('2d');
        let width, height;

        // Étoiles filantes
        let shootingStars = [];

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
        }

        function createShootingStar() {
            const x = Math.random() * width;
            const y = -20; // Part d'en haut de l'écran
            const length = Math.random() * 120 + 100; // Grandes lignes
            const speed = Math.random() * 5 + 4;
            const angle = Math.PI / 2; // Exactement vertical (90°)
            
            shootingStars.push({
                x: x,
                y: y,
                length: length,
                speed: speed,
                angle: angle,
                alpha: 1,
                fadeSpeed: 0.012
            });
        }

        function drawShootingStars() {
            shootingStars.forEach((star, index) => {
                ctx.save();
                
                // Gradient pour la traînée
                const gradient = ctx.createLinearGradient(
                    star.x,
                    star.y,
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                gradient.addColorStop(0, `rgba(255, 255, 255, ${star.alpha})`);
                gradient.addColorStop(0.5, `rgba(18, 199, 236, ${star.alpha * 0.6})`);
                gradient.addColorStop(1, 'rgba(18, 199, 236, 0)');
                
                ctx.beginPath();
                ctx.strokeStyle = gradient;
                ctx.lineWidth = 2;
                ctx.shadowBlur = 10;
                ctx.shadowColor = BLUE_NEON;
                ctx.moveTo(star.x, star.y);
                ctx.lineTo(
                    star.x - Math.cos(star.angle) * star.length,
                    star.y - Math.sin(star.angle) * star.length
                );
                ctx.stroke();
                
                // Point lumineux à la tête
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#fff';
                ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.restore();
            });
        }

        function updateShootingStars() {
            // Mise à jour des étoiles existantes
            shootingStars.forEach((star, index) => {
                star.x += Math.cos(star.angle) * star.speed;
                star.y += Math.sin(star.angle) * star.speed;
                star.alpha -= star.fadeSpeed;
                
                // Supprimer si hors écran ou invisible
                if (star.alpha <= 0 || star.x > width || star.y > height) {
                    shootingStars.splice(index, 1);
                }
            });
            
            // Créer de nouvelles étoiles aléatoirement
            if (Math.random() < 0.035) { // 3.5% de chance chaque frame
                createShootingStar();
            }
        }

        function draw() {
            ctx.clearRect(0, 0, width, height);
            ctx.globalAlpha = 1;
            drawShootingStars();
        }

        function update() {
            updateShootingStars();
        }

        function animate() {
            draw();
            update();
            requestAnimationFrame(animate);
        }

        function handleScrollFade() {
            const scrollY = window.scrollY;
            const windowHeight = window.innerHeight;
            let opacity = Math.max(0, 1 - (scrollY / (windowHeight * 0.8)));
            canvas.style.opacity = opacity;
        }

        // Initialize Canvas Style for Intro
        canvas.style.display = 'block';
        canvas.style.zIndex = '10001'; // On top of Intro Overlay (9998)

        function handleIntro() {
            const overlay = document.getElementById('intro-overlay');
            const bg = document.getElementById('loader-background');
            const starCanvas = document.getElementById('star-background');

            // 1. Reveal Stars immediately (progressive fade-in on black bg)
            // They are layer 2 (z-10000) so they appear ON TOP of black bg (z-9999)
            if (starCanvas) {
                // Force reflow
                void starCanvas.offsetWidth;
                starCanvas.style.opacity = 0.6; // Subtle fade in to not be too bright yet
            }

            // Wait for loader duration
            setTimeout(() => {
                document.body.classList.add('intro-complete');

                // Fade out UI
                if (overlay) {
                    overlay.classList.add('fade-out');
                }

                // Fade out Black Background
                if (bg) {
                    bg.classList.add('fade-out');
                }

                // Full brightness for stars
                if (starCanvas) {
                    starCanvas.style.opacity = 1;
                }

                // Move stars to background after transitions
                setTimeout(() => {
                    canvas.style.zIndex = '-2';
                    // Remove loader elements from DOM or hide completely if needed
                    if (bg) bg.style.display = 'none';
                    if (overlay) overlay.style.display = 'none';
                }, 1000);
            }, 2500);
        }

        // Event Listeners (No mouse listeners here)
        window.addEventListener('resize', resize);
        window.addEventListener('scroll', handleScrollFade);

        resize();
        animate();
        // handleScrollFade(); // Don't fade out initially

        handleIntro();
    }
});