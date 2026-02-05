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

        // Configuration Rain (Clean, No Mouse Interaction)
        let stars = [];
        const numStars = 150;
        const speedMultiplier = 2;

        function resize() {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            initStars();
        }

        function initStars() {
            stars = [];
            for (let i = 0; i < numStars; i++) {
                stars.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    radius: Math.random() * 1.5 + 0.5,
                    speed: Math.random() * speedMultiplier + 1,
                    alpha: Math.random() * 0.5 + 0.3
                });
            }
        }

        function drawStars() {
            ctx.clearRect(0, 0, width, height);
            ctx.fillStyle = BLUE_NEON; // #12C7EC

            stars.forEach(star => {
                ctx.beginPath();
                ctx.globalAlpha = star.alpha;
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                ctx.fill();
            });
            ctx.globalAlpha = 1;
        }

        function updateStars() {
            stars.forEach(star => {
                // Mouvement vertical naturel (Pluie)
                star.y += star.speed;

                // Wrap around (Infinite Loop)
                if (star.y > height) {
                    star.y = 0;
                    star.x = Math.random() * width;
                }
            });
        }

        function animate() {
            drawStars();
            updateStars();
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

            // Wait a bit for the user to see the rain on dark bg
            setTimeout(() => {
                document.body.classList.add('intro-complete');
                if (overlay) {
                    overlay.classList.add('fade-out');
                }
                // Move rain to background as site reveals
                // We delay the z-index change slightly to match fade or just do it?
                // If we do it immediately, stars go behind overlay (which is still fading out) -> disappear
                // So we must keep stars on top until overlay is gone OR
                // Let overlay fade out, revealing site. Stars are ON TOP.
                // Then move stars to back?
                // If stars are on top, they cover text (pointer events none though).
                // Let's keep stars on top during fade, then move to back.
                setTimeout(() => {
                    canvas.style.zIndex = '-2';
                }, 1000); // EQ to Transition duration
            }, 1000); // Reduced from 2500ms to 1000ms
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