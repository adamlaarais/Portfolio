document.addEventListener("DOMContentLoaded", function () {

    const BLUE_NEON = '#12C7EC';

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

    window.addEventListener('scroll', () => {
        if (!header) return;

        if (window.scrollY > lastScrollY && window.scrollY > headerHeight) {
            header.classList.add('hidden');
        } 
        else if (window.scrollY < lastScrollY) {
            header.classList.remove('hidden');
        }
        lastScrollY = window.scrollY;
    });

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
            });
            el.addEventListener('mouseleave', () => {
                outline.style.transform = 'translate(-50%, -50%) scale(1)';
                outline.style.borderColor = BLUE_NEON;
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

    const elementsToAnimate = document.querySelectorAll('.animate-on-scroll');
    const animatedTitles = document.querySelectorAll('.animated-title');
    const roleTags = document.querySelectorAll('.role-tag');

    // Retrait de l'IntersectionObserver pour les éléments .animate-on-scroll
    // Les animations se déclencheront immédiatement au chargement de la page.
    window.addEventListener('load', () => {
        elementsToAnimate.forEach(el => {
            el.classList.add('visible');
        });

        // Déclenchement spécifique pour les rôles (staggered)
        document.querySelectorAll('.bio-content-fusion').forEach(container => {
            container.querySelectorAll('.role-tag').forEach((item, itemIndex) => {
                setTimeout(() => {
                    item.classList.add('visible');
                }, itemIndex * 150);
            });
        });

        // Déclenchement pour les titres
        animatedTitles.forEach(el => {
            el.classList.add('visible');
        });
    });

    const canvas = document.getElementById('star-background');

    if (canvas) {
        const ctx = canvas.getContext('2d');

        let stars = [];
        let numStars = 250;

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
                    vx: (Math.random() - 0.5) * 0.1, 
                    vy: (Math.random() - 0.5) * 0.1, 
                    color: BLUE_NEON,
                    depth: Math.random() * 1 + 0.1
                });
            }
        }

        function drawStars() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = BLUE_NEON;
            ctx.beginPath();
            for (let i = 0; i < stars.length; i++) {
                let star = stars[i];
                ctx.globalAlpha = star.depth;
                ctx.moveTo(star.x, star.y);
                ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
            }
            ctx.fill();
            ctx.globalAlpha = 1; 
        }

        function updateStars() {
            for (let i = 0; i < stars.length; i++) {
                let star = stars[i];

                star.x += star.vx * star.depth;
                star.y += star.vy * star.depth;

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

});