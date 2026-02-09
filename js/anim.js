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

        // Configuration Vagues Néon Améliorées
        let time = 0;
        const waves = [
            { amplitude: 100, frequency: 0.002, speed: 0.015, opacity: 0.08, yOffset: 0.2, blur: 20 },
            { amplitude: 80, frequency: 0.0025, speed: 0.02, opacity: 0.12, yOffset: 0.35, blur: 18 },
            { amplitude: 70, frequency: 0.003, speed: 0.025, opacity: 0.15, yOffset: 0.5, blur: 15 },
            { amplitude: 60, frequency: 0.0035, speed: 0.03, opacity: 0.18, yOffset: 0.65, blur: 12 },
            { amplitude: 50, frequency: 0.004, speed: 0.035, opacity: 0.22, yOffset: 0.8, blur: 10 }
        ];

        // Particules flottantes
        let particles = [];
        const numParticles = 30;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initParticles();
        }

        function initParticles() {
            particles = [];
            for (let i = 0; i < numParticles; i++) {
                particles.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 2 + 1,
                    speedX: (Math.random() - 0.5) * 0.5,
                    speedY: (Math.random() - 0.5) * 0.5,
                    alpha: Math.random() * 0.3 + 0.2
                });
            }
        }

        function drawWaves() {
            ctx.clearRect(0, 0, width, height);

            waves.forEach((wave, index) => {
                // Vague principale
                ctx.beginPath();
                ctx.strokeStyle = BLUE_NEON;
                ctx.lineWidth = 2.5;
                ctx.globalAlpha = wave.opacity;
                ctx.shadowBlur = wave.blur;
                ctx.shadowColor = BLUE_NEON;

                for (let x = 0; x <= width; x += 3) {
                    const y = wave.yOffset * height + 
                             Math.sin(x * wave.frequency + time * wave.speed) * wave.amplitude +
                             Math.sin(x * wave.frequency * 2 + time * wave.speed * 1.5) * (wave.amplitude * 0.3);
                    
                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }

                ctx.stroke();
                ctx.shadowBlur = 0;
            });

            // Particules
            ctx.shadowBlur = 8;
            ctx.shadowColor = BLUE_NEON;
            particles.forEach(particle => {
                ctx.beginPath();
                ctx.globalAlpha = particle.alpha;
                ctx.fillStyle = BLUE_NEON;
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.shadowBlur = 0;

            ctx.globalAlpha = 1;
        }

        function updateWaves() {
            time += 1;
            
            // Mise à jour des particules
            particles.forEach(particle => {
                particle.x += particle.speedX;
                particle.y += particle.speedY;

                // Wrap around
                if (particle.x < 0) particle.x = width;
                if (particle.x > width) particle.x = 0;
                if (particle.y < 0) particle.y = height;
                if (particle.y > height) particle.y = 0;
            });
        }

        function animate() {
            drawWaves();
            updateWaves();
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