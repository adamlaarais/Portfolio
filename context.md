# context.md — Portfolio one-page · Adam Laarais

> **Source de vérité du projet.** Mise à jour à chaque étape franchie (§ Journal en bas).
> Cible : portfolio one-page développeur web / designer UX-UI, niveau **Awwwards / FWA**.

---

## 1. Mission & barre de qualité

Portfolio one-page, **scroll narratif** (reveal storytelling) + micro-interactions soignées.
Minimaliste, moderne, premium. Pas un template habillé.

**Règles non négociables**
- **Monochrome strict** : noir / blanc / gris. Aucune couleur d'accent. Hiérarchie = contraste + typo + espace.
- **Zéro effet générique** : pas de fade-in basique partout, pas d'ombres lourdes, pas de dégradés criards. Chaque animation a une intention.
- **Le vide est un élément de design.** Beaucoup de respiration.
- **Perf = design** : 60fps au scroll, pas de jank, pas de CLS.
- `prefers-reduced-motion` pleinement respecté : tout reste lisible et accessible sans animation.

---

## 2. Stack technique

- HTML5 sémantique, **JS ES modules** (`type="module"`), **vanilla** (pas de framework, pas de build lourd).
- CSS3 : custom properties (theming), `clamp()` (typo fluide), `@layer` pour l'ordre de cascade.
- **GSAP 3 + ScrollTrigger** (animations + scroll).
- **Lenis** (smooth scroll) synchronisé à ScrollTrigger (`lenis.on('scroll', ScrollTrigger.update)` + `gsap.ticker`).
- **SplitType** (découpe lignes/mots/chars pour reveals).
- **Sora** self-host woff2 (poids 300/400/600/700/800), `font-display: swap`, `preload` du poids principal (400).
- Libs front via **CDN** (jsDelivr, versions épinglées) au début ; bascule locale possible plus tard.
- Contact : endpoint `php/contact.php` (mail/PHPMailer + validation + honeypot) ; soumission `fetch` avec états idle/sending/success/error ; fallback `mailto:` si back non branché.

### Décisions notables (à signaler)
- **Répertoire de build** : `C:\Users\laara\OneDrive\Documents\Portfolio` (dépôt git, assets réels). `…\STAGE` = rapport de stage, hors périmètre.
- **Logo theme-aware** : un seul fichier `LOGO_NOIR.png` (signature « A »), inversé via `filter: invert(1)` en thème dark. `LOGO_BLANC.png` conservé en secours. Évite de gérer 2 sources.
- **Police** : Sora (le brief l'impose) remplace l'ancien Montserrat (supprimé du repo).
- **Icônes** : inline SVG `currentColor` (Simple Icons pour technos, Lucide pour UI). Inliné dans le markup → monochrome strict + theme-aware + zéro requête réseau.
- **Projets** : 5 captures 16:9 réelles → `assets/images/projets/`. Titres dérivés du nom de fichier, descriptions en `<!-- TODO desc -->`. `Eze_Nettoyage.png` = 2,2 Mo → à compresser (perf).

---

## 3. Design system

### 3.1 Couleurs — 2 thèmes (dark par défaut)
```css
/* DARK (défaut, :root) */
--bg              : #0a0a0a;
--bg-elev         : #111111;
--surface-glass   : rgba(255,255,255,0.045);
--surface-glass-2 : rgba(255,255,255,0.075);   /* hover / dense */
--border          : rgba(255,255,255,0.10);
--border-strong   : rgba(255,255,255,0.18);
--text            : #f4f4f4;
--text-muted      : #9a9a9a;
--text-faint      : #6a6a6a;
--ghost-title     : rgba(255,255,255,0.045);   /* titres géants de section */
--ghost-shadow    : rgba(0,0,0,0.55);          /* ombre basse sous ghost */
--cursor          : #f4f4f4;

/* LIGHT ([data-theme="light"]) */
--bg              : #f3f3f1;
--bg-elev         : #ffffff;
--surface-glass   : rgba(0,0,0,0.035);
--surface-glass-2 : rgba(0,0,0,0.06);
--border          : rgba(0,0,0,0.10);
--border-strong   : rgba(0,0,0,0.20);
--text            : #0a0a0a;
--text-muted      : #5a5a5a;
--text-faint      : #8a8a8a;
--ghost-title     : rgba(0,0,0,0.05);
--ghost-shadow    : rgba(0,0,0,0.10);
--cursor          : #0a0a0a;
```
Transition de thème ~`.4s` ease sur `background-color`/`color`. Choix persistant en `localStorage` (`pf-theme`). 1er chargement : `prefers-color-scheme`. Anti-FOUC : script inline dans `<head>` pose `data-theme` avant le CSS.

### 3.2 Typographie (Sora, fluide via clamp)
| rôle | taille | poids | détails |
|---|---|---|---|
| Ghost de section | `clamp(4rem,14vw,13rem)` | 800 | uppercase, `letter-spacing:-.04em`, `--ghost-title` |
| Hero name | `clamp(3rem,12.5vw,12rem)` | 800 | outline/ghost, uppercase |
| H2 réels | `clamp(1.6rem,3vw,2.6rem)` | 700 | `letter-spacing:-.02em` |
| Lead / intro | `clamp(1.05rem,1.6vw,1.35rem)` | 400 | lh 1.5 |
| Body | `clamp(.95rem,1.1vw,1.05rem)` | 400 | lh 1.6, `--text-muted` |
| Label / mono | `.72rem` | 600 | uppercase, `letter-spacing:.18em` |

### 3.3 Glass
`background: var(--surface-glass)` + `backdrop-filter: blur(16px) saturate(1.1)` + `1px solid var(--border)` + radius large. Subtil. Fallback `@supports not (backdrop-filter)` → `--bg-elev` opaque.

### 3.4 Radius & spacing
- Cards `--radius-card: 22px`. Boutons **pill** `--radius-pill: 999px` (ligne unique tenue). Inputs/petits `--radius-sm: 12px`.
- Échelle spacing (`--space-*`) : 4 / 8 / 16 / 24 / 40 / 64 / 96 / 160.
- Séparation de sections : `--section-gap: clamp(8rem,14vh,14rem)`.
- Gouttière de page : `--gutter: clamp(1.25rem,5vw,5rem)`. Largeur max contenu : `--maxw: 1320px`.

### 3.5 Easings & durées (tokens)
```css
--ease-out   : cubic-bezier(0.16, 1, 0.3, 1);   /* signature premium (expo-like) */
--ease-inout : cubic-bezier(0.65, 0, 0.35, 1);
--dur-micro  : .2s;   --dur-ui : .4s;   --dur-reveal : .9s;   --dur-page : 1.2s;
/* stagger reveals : 0.05–0.09s */
```

---

## 4. Composants & micro-interactions transverses

- **Bouton draw-outline (signature)** : fond `--surface-glass-2`, pas de bordure visible au repos. Hover → contour SVG `<rect rx>` qui se dessine (`stroke-dasharray`/`-dashoffset` animé GSAP), fond s'estompe légèrement. Unhover → trait se rétracte. **Magnétique** (suit le curseur ≤12px) sur desktop pointer fin. Usage : MON CV, ENVOYER, back-to-top.
- **Nav « mot qui se tourne »** : 2 copies empilées du label dans un masque `overflow:hidden` ; hover → `translateY(-100%)` `--ease-out`.
- **Curseur custom** (desktop `pointer:fine` only) : 1 rond plein, suivi en **lerp**, couleur `--cursor`. Natif masqué (`cursor:none`). Sur `[data-cursor]` → grossit ~2,2× + opacité 1→.4. Off tactile + reduced-motion (natif rétabli).
- **Reveals scroll** : défaut `opacity:0; translateY(24px)` → reveal `ScrollTrigger start: top 85%`. Texte long → SplitType par lignes masquées + stagger. Varier (translate / clip-path / scale) selon bloc. États initiaux posés en **JS** (gsap.set) → contenu visible si no-JS/reduced-motion.
- **Titres ghost** : grand mot centré, `--ghost-title`, ombre basse (pseudo-élément dégradé), **parallax** (défile plus lentement) + mini scale au scroll. Toujours **derrière** le contenu (`z-index`), jamais en concurrence de lecture.

---

## 5. Structure de page (sections)

1. **Loader** : plein écran `--bg`, compteur % bas-gauche (0→100, vraie progression assets+fonts), ligne de progression fine. À 100% → sortie clip-path/curtain qui remonte → enchaîne **timeline unique** sur l'entrée hero. Scroll bloqué (Lenis `stop()`), réactivé à la fin.
2. **Hero** : header fixe (monogramme g. / nav centre / toggle thème d.) ; nom géant `ADAM LAARAIS` ghost centré ; phrase d'intro (reveal lignes) ; colonne droite GitHub+LinkedIn + texte vertical `DÉCOUVRIR` + indicateur scroll qui pulse ; bracket « L » bas-gauche (tracé animé). Entrée : nom monte+fade, lignes staggered, icônes fade, bracket se dessine.
3. **À propos** : ghost `A PROPOS`. Card glass centrée (paragraphe + bouton MON CV draw-outline → ouvre PDF onglet). Texte révélé au scroll (SplitType lignes). Card entre en scale/opacity.
4. **Skills** : ghost `SKILLS`. 2 familles — **Dév web** : HTML, CSS, JavaScript, PHP, SQL, WordPress · **Design UX-UI** : Figma, Adobe, Canva. Layout **bento** (cards tailles variées), icône + label, glass. Reveal staggered (clip-path/translate). Hover : élévation + bord renforcé + micro-mouvement icône. Pas de couleur.
5. **Projets** (pièce maîtresse) : ghost `PROJETS`. **Cards empilées pinnées** (ScrollTrigger pin) : la suivante glisse par-dessus pendant que la précédente recule (`scale .95` + opacité/blur léger), scrubbé. Image dominante (`object-fit:cover`, lazy, parallax léger), titre, desc 1-2 lignes (TODO), tags discrets, lien. Données = tableau JS depuis les fichiers réels. Mobile : simplifie le pin → stagger.
6. **Contact** : ghost `CONTACT`. Gauche : intro + rows glass Email/LinkedIn/GitHub (icône + handle + `↗`, hover flèche diagonale + row s'éclaire). Droite : form glass (Nom, Prénom, Email, Message), underline animée au focus, validation inline, ENVOYER draw-outline + états. Endpoint PHP/fallback.
7. **Footer** : `© 2026 Adam Laarais — Tous droits réservés.` ; back-to-top draw-outline (Lenis smooth, flèche monte au hover) ; grand mot ghost `ADAM`, parallax léger fin de page.

---

## 6. Conventions JS (ordre d'init)

`js/main.js` orchestre. Modules ES, un seul point d'entrée.
```
0. (inline <head>) thème anti-FOUC + classe .js sur <html>
1. theme.js      → toggle, persistance, morph soleil/lune
2. GSAP + plugins → gsap.registerPlugin(ScrollTrigger) ; gsap.ticker.lagSmoothing(0)
3. lenis.js      → 1 instance ; sync ScrollTrigger ; OFF si reduced-motion (scroll natif)
4. loader.js     → promesse de progression ; au 100% lance timeline hero ; libère le scroll
5. reveals.js    → helpers SplitType + ScrollTrigger (après fonts ready)
6. projects.js   → pin stack (desktop) / stagger (mobile)
7. nav.js        → burger mobile + scroll-to (Lenis), flip déjà en CSS
8. cursor.js     → cursor + magnétisme (desktop fine pointer only)
9. form.js       → validation + fetch + états
10. ScrollTrigger.refresh() après load fonts+images (anti-CLS/décalage)
```
- **`prefersReduced`** = `matchMedia('(prefers-reduced-motion: reduce)').matches` : gate central (Lenis, reveals scrub, cursor, magnétisme, parallax). Contenu visible par défaut.
- `will-change` ciblé, retiré après l'anim. Anime uniquement `transform`/`opacity`.
- 1 seul `requestAnimationFrame`/ticker (celui de GSAP pilote Lenis).

---

## 7. Arbre de fichiers (réel)
```
Portfolio/
├── index.html
├── context.md
├── assets/
│   ├── fonts/        sora-300|400|600|700|800.woff2   ✅ self-host
│   ├── images/       LOGO_NOIR.png, LOGO_BLANC.png
│   │   └── projets/  BeeLink, Cursive, DataWatt, Eze_Nettoyage, Kodex (.png)
│   ├── icons/        (réservé ; icônes inlinées dans le markup)
│   └── cv/           CV-Adam-Laarais.pdf   ✅
├── css/   reset · variables · base · components · sections · responsive
├── js/    main · lenis · loader · theme · cursor · nav · reveals · projects · form
└── php/   contact.php
```

---

## 8. Responsive
Breakpoints : `≤480`, `≤768`, `≤1024`, `≥1440`.
- Nav → burger animé (overlay plein écran glass, liens staggered).
- Skills bento → 2 puis 1 colonne.
- Projets → pin simplifié / stagger si jank.
- Contact → colonnes empilées.
- Curseur custom + magnétisme → off tactile.
- Hero : tailles ghost recalibrées (pas de débordement).

---

## 9. Ordre de construction (impératif) — état
1. ✅ context.md (ce fichier)
2. ✅ Tokens CSS + reset + Sora + theming + toggle
3. ✅ Layout statique de toutes les sections (sans anim) + responsive
4. ✅ Lenis + helpers reveals
5. ✅ Loader → hero (timeline unique)
6. ✅ À propos
7. ✅ Skills bento
8. ✅ Projets stack pinné
9. ✅ Contact + PHP
10. ✅ Footer + back-to-top + ghost ADAM
11. ✅ Draw-outline + nav flip + curseur + magnétisme
12. ✅ Passe finale a11y/perf/responsive/polish

---

## 10. Checklist d'acceptation
- [x] Loader % bas-gauche → transition fluide hero, scroll bloqué pendant loader.
- [x] Dark/light togglé, persistant (localStorage), transition animée, contraste AA 2 thèmes.
- [x] Smooth scroll Lenis synchro ScrollTrigger, aucun jank (1 ticker, lagSmoothing 0).
- [x] Ghosts centrés, parallax + ombre basse, derrière le contenu.
- [x] À propos révélé au scroll (lignes SplitType), card glass (scale), bouton CV ouvre le PDF.
- [x] Skills : 2 familles, icônes monochromes (mask currentColor), reveals staggered.
- [x] Projets : cards empilées (sticky + recede scrub), image dominante, 1 card / image (titre = nom fichier, desc complétées).
- [x] Contact : form + états idle/sending/success/error + validation + endpoint PHP/fallback mailto, rows sociaux animés.
- [x] Footer : back-to-top smooth (Lenis) + ghost ADAM parallax.
- [x] Draw-outline (SVG stroke dashoffset), nav flip, curseur custom + magnétisme (desktop fine-pointer only).
- [x] `prefers-reduced-motion` géré (Lenis off, reveals/curseur/magnétisme off, projets statiques, contenu visible).
- [x] Responsive vérifié 375 / 578 / 768 / 1280 / 1512 — 0 overflow horizontal.
- [x] transform/opacity only, sticky GPU, ScrollTrigger.refresh post fonts+load, will-change ciblé. (⚠ `Eze_Nettoyage.png` 2,2 Mo à compresser.)
- [x] HTML sémantique (h1 unique, header/nav/main/section/footer), focus-visible, alt/aria.

> **Note vérification** : le preview headless tourne en onglet caché → rAF gelé, donc les anims GSAP/Lenis ne *jouent* pas et `preview_screenshot` timeout. Toute la logique a été vérifiée déterministiquement (scrub `globalTimeline`, `scroll`+`ScrollTrigger.update`, lecture computed styles). Le mouvement se joue normalement en navigateur réel.

## 13. TODO restants (Adam)
- **Liens** : confirmer les handles GitHub/LinkedIn (`adamlaarais` supposé) dans `index.html`.
- **Formulaire** : sur un serveur PHP, passer `$MAIL_ENABLED = true` dans `php/contact.php` (sinon fallback mailto actif).
- **Perf** : compresser/convertir `assets/images/projets/Eze_Nettoyage.png` (2,2 Mo → webp/avif idéalement).
- **CV** : `assets/cv/CV-Adam-Laarais.pdf` est une copie de `pdf/CV_LAARAIS_ADAM.pdf` — garder à jour.

---

## 11. Données de contenu (réf.)

**À propos** — « Actuellement étudiant en deuxième année de BUT MMI à l'IUT de Mulhouse, je me passionne pour la création d'expériences web où le développement précis rencontre un design minimaliste et intuitif. Autonome et rigoureux, je cherche activement à mettre mes compétences en application et à contribuer concrètement à des projets stimulants, afin d'acquérir une expérience professionnelle significative. »

**Contact (intro)** — « Que ce soit pour une idée de site, une mission d'intégration, un projet étudiant ou une piste d'alternance, je serais ravi d'en discuter avec vous. Laissez un message via le formulaire ou contactez-moi par e-mail — je reviens vers vous sous quelques jours ouvrés. »

**Projets** (titre dérivé du fichier ; desc = TODO Adam) : BeeLink · Cursive · DataWatt · Eze Nettoyage · Kodex.

**Liens** (handles à confirmer par Adam) : GitHub, LinkedIn, Email `laaraisadam22@gmail.com`.

---

## 12. Journal
- **2026-06-11** — Exploration terminée. Repo Portfolio = slate quasi vierge (index.html vide, 5 captures projets + 2 logos + CV). Structure `assets/`/`css/`/`js/`/`php/` créée, captures déplacées, CV copié. Sora 300–800 woff2 self-host téléchargés. context.md rédigé. → étape 2.
- **2026-06-11** — Étape 12 OK → **build complet**. Reduced-motion : ajout règle responsive (projets `static`, loader caché, pulse off) en plus des gardes JS. Fix overflow : `html{overflow-x:clip}` (sticky-safe, vérifié que le stack pinné fonctionne toujours) pour contenir le débordement des ghosts géants. Sweep responsive 375/578/768/1280/1512 → 0 overflow, layouts corrects, nav↔burger OK, toggle thème OK, 0 erreur console. a11y : h1 unique, sémantique, focus-visible, alt/aria, skip-link. Voir §13 pour les TODO restants d'Adam.
- **2026-06-11** — Étapes 10 & 11 OK. nav.js : smooth-scroll ancres (Lenis), burger (toggle + aria + scroll lock + Escape), back-to-top. Footer : ghost ADAM parallax ([data-ghost]), flèche back-to-top monte au hover. cursor.js (fine-pointer + non-reduced only) : curseur rond lerp (ticker) qui grossit ×2.2 + opacité .4 sur `[data-cursor]` ; magnétisme `[data-magnetic]` (≤12px, quickTo) sur CV/Envoyer/back-to-top ; draw-outline : rect SVG dimensionné en px par bouton (`pathLength=1`, `rx`=h/2 pill, non-scaling-stroke), caché au repos (`dashoffset:1`), tracé au hover/focus via transition CSS `stroke-dashoffset`. Bouton repos `--surface-glass-2`, hover `--surface-glass` (estompe). Vérifié : rects dimensionnés (viewBox px, pathLength 1, offset 1 au repos), has-cursor actif, 3 magnétiques. → étape 12.
- **2026-06-11** — Étape 9 OK. form.js : validation inline (champs requis + format email, re-validation à l'`input`), honeypot `website`, états idle/sending/success/error (label bouton + `[data-form-status]`), `fetch` POST → `php/contact.php` ; si non-JSON/échec (dev Node ou mail off) → **fallback mailto: propre**. php/contact.php : validation + honeypot + anti-injection en-têtes + switch `$MAIL_ENABLED` (false → 501 → front bascule mailto ; bloc mail() + bloc PHPMailer/SMTP commentés). Vérifié : submit vide → 4 champs invalides + message ; email invalide → 1 seul ; correction à l'input → nettoyé. Rows sociales : hover (flèche ↗ diagonale + row éclaircie) + reveal stagger (déjà en place). → étape 10.
- **2026-06-11** — Étape 8 OK. **Choix documenté** : stack via **CSS `position:sticky`** (top 12vh) piloté par ScrollTrigger pour le recul (scale 1→0.92 + yPercent + fade du body) plutôt que `pin:true` → 60fps, pas de pin-spacer/jank, même rendu « cartes empilées » que le brief. Parallax image léger (yPercent ±6, scale 1.14 pour couvrir les bords). Mobile/reduced ≤768 : cartes `static` + reveal stagger simple. Vérifié à 1280 : carte 0 sticky, recul scrubbé 1→0.96→0.92 quand la carte 1 la recouvre ; à 578 : fallback statique + 5 triggers stagger. → étape 9.
- **2026-06-11** — Étapes 6 & 7 OK (l'essentiel venait déjà du système de reveals générique + layout statique). Ajout de **variantes de reveal** dans reveals.js (`up`/`scale`/`clip`) pour varier l'intention par bloc ; carte À propos = `data-reveal="scale"` (vérifié : repos `scale .94 / opacity 0`). Bouton MON CV → `assets/cv/CV-Adam-Laarais.pdf` `target=_blank` (vérifié). Ghost A PROPOS = parallax ScrollTrigger (vérifié). **Déviation documentée (Skills)** : au lieu d'un bento à cailloux de tailles aléatoires, 2 *groupes* (entête large pleine largeur + grille uniforme 3 col de skill-cards) → plus propre, gapless, responsive (2 col ≤768) ; variété de taille via entête vs cards. Hover skill-card = élévation + bord renforcé + micro-mouvement icône (CSS). Icônes Simple Icons monochromes via mask `currentColor`. → étape 8.
- **2026-06-11** — Étapes 4 & 5 OK. Lenis (1 instance, sync ScrollTrigger via gsap.ticker, `lagSmoothing(0)`, off si reduced-motion) + `window.__lenis` (debug). reveals.js : `[data-split]` (SplitType lignes masquées), `[data-stagger]`, `[data-reveal]`, `[data-ghost]` (parallax scrub) — saute `.hero`, no-op si reduced-motion. Loader : compteur % réel (images 80% + fonts 20%), curtain `yPercent:-100`, **timeline unique** loader→hero (setHeroInitial + buildHeroIntro chaînés), scroll lock (Lenis stop + `html.loading{overflow:hidden}`), 1×/session (sessionStorage), fallback 7 s. hero.js = entrée (nom masqué qui monte, tagline, sub lignes, bracket 2 barres `.bar-v/.bar-h` qui se tracent, social, discover).
  **⚠️ CONTRAINTE PREVIEW MAJEURE** : le preview headless tourne la page en onglet **caché** (`document.hidden=true`) → `requestAnimationFrame` ne se déclenche jamais → **le ticker GSAP reste à frame 0** (aucune anim GSAP/Lenis ne joue, screenshots timeout). En navigateur réel (onglet visible) tout joue normalement (GSAP reprend proprement sur `visibilitychange`). **Méthode de vérif adoptée** : scrub déterministe via `gsap.globalTimeline.totalTime(t)` pour les anims temporelles (loader/hero vérifiés → état final correct), et `scroll + ScrollTrigger.update()` + lecture de `trigger.progress`/transforms pour les anims scroll. La fluidité/timing se valide par revue de code.
- **2026-06-11** — Étape 3 OK. index.html complet (loader, hero, about, skills 2 groupes/9 cards, projets via projects.js, contact + form honeypot, footer). sections.css + responsive.css (≤480/≤768/≤1024/≥1440). Icônes = mask CSS `background:currentColor` + `mask:var(--ico)` ; **piège résolu** : `url()` dans une custom property se résout relativement au CSS consommateur (Chrome) → chemins racine-absolus `/assets/icons/…`. projects.js = données éditables (5 captures, titres OK, desc `TODO`) + render. Vérifié : structure sémantique complète (snapshot), responsive 1280 (3 col skills / 2 col contact / nav) & 375 (2 col / 1 col / burger), **0 overflow horizontal**, 0 erreur console, fonts loaded. NB : `preview_screenshot` indisponible dans cet env (timeout systématique, pipeline de capture) → vérif via snapshot + inspect (computed styles). → étape 4.
- **2026-06-11** — Étape 2 OK. 6 fichiers CSS (@layer reset/tokens/base/components/sections/responsive). Header permanent (monogramme inversé via `filter:invert(var(--logo-invert))`, nav flip masquée, toggle soleil/lune morph mask SVG). theme.js + anti-FOUC. Serveur statique `STAGE/serve-portfolio.js` (port 3500, lancé via `.claude/launch.json` "portfolio"). Vérifié au preview : Sora chargée, toggle dark↔light fonctionnel, libs GSAP/Lenis/SplitType OK, nav flip clippée. NB : `localStorage` sandboxé dans le preview (persistance non testable ici, fonctionne en réel). NB perf : `preview_screenshot` timeout quand le ticker GSAP tourne → vérif via inspect/snapshot. → étape 3.
