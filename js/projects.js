/* projects.js — editable project data + card rendering.
   Stack / pin scroll animation is wired in step 8 (see initProjects there).

   ┌──────────────────────────────────────────────────────────────┐
   │ TODO (Adam) : pour chaque projet, renseigner `description`,   │
   │ `tags` (2–3 max) et `link`. L'ordre du tableau = l'ordre des  │
   │ cartes. Le titre par défaut vient du nom de fichier.          │
   └──────────────────────────────────────────────────────────────┘ */

export const PROJECTS = [
  {
    title: 'BeeLink',
    image: 'assets/images/projets/BeeLink.png',
    description: "Plateforme collaborative pour apiculteurs dédiée à la visualisation des données de ruches. Intégration d'une base MySQL et d'un système PHP pour l'authentification et la gestion administrative.",
    tags: ['HTML', 'CSS', 'JS', 'PHP / MySQL'],
    link: '',
  },
  {
    title: 'Cursive',
    image: 'assets/images/projets/Cursive.png',
    description: "Conception d'une landing page moderne sur Figma pour une agence digitale, alliant esthétique épurée et expérience utilisateur fluide.",
    tags: ['Figma', 'UI / UX'],
    link: '',
  },
  {
    title: 'DataWatt',
    image: 'assets/images/projets/DataWatt.png',
    description: "Visualisation interactive de données sur les bornes de recharge électriques en France. Design dynamique et intégration d'animations JavaScript sophistiquées.",
    tags: ['HTML', 'CSS', 'JS'],
    link: '',
  },
  {
    title: 'Eze Nettoyage',
    image: 'assets/images/projets/Eze_Nettoyage.png',
    description: "Conception et développement du site vitrine d'une entreprise spécialisée dans les prestations de nettoyage extérieur.",
    tags: ['HTML', 'CSS', 'JS'],
    link: '',
  },
  {
    title: 'Kodex',
    image: 'assets/images/projets/Kodex.png',
    description: "Site de réservation d'escape game avec espaces client et administrateur, gestion des sessions et paiement sécurisé en ligne.",
    tags: ['HTML', 'CSS', 'JS', 'PHP / MySQL'],
    link: '',
  },
];

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => (
  { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]
));

export function renderProjects() {
  const stack = document.querySelector('[data-projects]');
  if (!stack) return [];

  const total = String(PROJECTS.length).padStart(2, '0');

  stack.innerHTML = PROJECTS.map((p, i) => {
    const n = String(i + 1).padStart(2, '0');
    const tags = p.tags && p.tags.length
      ? `<ul class="project-card__tags">${p.tags.map((t) => `<li class="project-card__tag">${esc(t)}</li>`).join('')}</ul>`
      : '';
    const link = p.link
      ? `<a class="project-card__link" href="${esc(p.link)}" target="_blank" rel="noopener" data-cursor>Voir le projet <i class="ico" style="--ico:url(../assets/icons/arrow-up-right.svg)" aria-hidden="true"></i></a>`
      : '';
    return `
      <article class="project-card" data-project data-cursor>
        <div class="project-card__body">
          <span class="project-card__index">${n} / ${total}</span>
          <h3 class="project-card__title">${esc(p.title)}</h3>
          <p class="project-card__desc">${esc(p.description)}</p>
          ${tags}
          ${link}
        </div>
        <div class="project-card__browser glass">
          <div class="project-card__browser-bar">
            <div class="project-card__browser-dots">
              <span class="project-card__browser-dot project-card__browser-dot--close"></span>
              <span class="project-card__browser-dot project-card__browser-dot--minimize"></span>
              <span class="project-card__browser-dot project-card__browser-dot--maximize"></span>
            </div>
            <div class="project-card__browser-address">
              <svg class="project-card__browser-lock" viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2" fill="none" stroke="currentColor" stroke-width="2.5"/><path d="M7 11V7a5 5 0 0 1 10 0v4" fill="none" stroke="currentColor" stroke-width="2.5"/></svg>
              <span>${esc(p.title.toLowerCase().replace(/[\s_]+/g, '-'))}.com</span>
            </div>
            <div class="project-card__browser-action"></div>
          </div>
          <div class="project-card__media">
            <img src="${esc(p.image)}" alt="Aperçu du projet ${esc(p.title)}" loading="lazy" decoding="async" />
          </div>
        </div>
      </article>`;
  }).join('');

  return Array.from(stack.querySelectorAll('[data-project]'));
}

/* Stacked-cards scroll effect (desktop): cards are CSS-sticky; as the next card
   rises to cover the current one, the current recedes (scale + body fade), and
   each image gets a subtle parallax. Mobile / reduced-motion → simple stagger. */
export function initProjects() {
  const { gsap, ScrollTrigger } = window;
  if (!gsap || !ScrollTrigger) return;
  const cards = gsap.utils.toArray('.project-card');
  if (!cards.length) return;

  const reduced = window.__pfReduced;
  const mobile = window.matchMedia('(max-width: 768px)').matches;

  if (reduced || mobile) {
    if (!reduced) {
      cards.forEach((card) => {
        gsap.set(card, { opacity: 0, y: 48 });
        gsap.to(card, {
          opacity: 1, y: 0, duration: 0.85, ease: 'power3.out',
          scrollTrigger: { trigger: card, start: 'top 85%', toggleActions: 'play reverse play reverse' },
        });
      });
    }
    return;
  }

  // Entry animation for the first card (others slide in naturally as sticky cards)
  gsap.set(cards[0], { opacity: 0, y: 60 });
  gsap.to(cards[0], {
    opacity: 1, y: 0, duration: 0.9, ease: 'power3.out',
    scrollTrigger: { trigger: cards[0], start: 'top 85%', toggleActions: 'play reverse play reverse' },
  });

  cards.forEach((card, i) => {
    // recede the current card as the next one covers it
    if (i < cards.length - 1) {
      const next = cards[i + 1];
      gsap.to(card, {
        scale: 0.92, yPercent: -2.5, ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top', scrub: true },
      });
      const body = card.querySelector('.project-card__body');
      if (body) {
        gsap.to(body, {
          opacity: 0.3, ease: 'none',
          scrollTrigger: { trigger: next, start: 'top 55%', end: 'top top', scrub: true },
        });
      }
    }
    // No image parallax to ensure 100% of the screenshot is visible without zoom or cropping.
  });
}
