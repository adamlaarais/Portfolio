document.addEventListener("DOMContentLoaded", function() {
  const elements = document.querySelectorAll('.animate-on-scroll');

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible'); // ajoute la classe visible
        observer.unobserve(entry.target); // arrête d’observer cet élément
      }
    });
  }, { threshold: 0.1 }); // déclenche quand 10% de l’élément est visible

  elements.forEach(el => observer.observe(el));
});

document.addEventListener('DOMContentLoaded', () => {
  const cursor = document.querySelector('.custom-cursor');

  document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
  });
});
