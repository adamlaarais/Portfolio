/* PostHog: classroom demo only; normal portfolio visits never load the SDK.
   This source reads build-time environment variables; GitHub Pages serves
   the generated ESM bundle in assets/analytics/. */
const DEMO_PARAM = 'posthog_demo';
const CV_FLAG = 'portfolio-demo-cv-label';
const CTA_FLAG = 'portfolio-demo-contact-cta';
const PH_APP = 'https://eu.posthog.com/project/352470';
const EVENT_PROPERTIES = {
  cv_clicked: [],
  section_viewed: ['section'],
  contact_section_viewed: [],
  project_viewed: ['project_name'],
  project_link_clicked: ['project_name'],
  contact_link_clicked: ['channel'],
  contact_form_started: [],
  contact_validation_failed: ['invalid_field_count'],
  contact_submit_attempted: [],
  contact_submit_failed: ['http_status', 'reason'],
  contact_submit_succeeded: [],
  contact_mailto_open_requested: [],
  demo_error_requested: [],
  feature_cta_clicked: [],
};
let demoActive = false;
let sdk = null;
let loading = null;
let queue = [];
let observer = null;
let initialized = false;
const seen = new Set();

export function isDemoActive() { return demoActive; }

// Fixed messages only: never forward form values or arbitrary exception text.
export function reportDemoError(source, httpStatus = 0) {
  if (!demoActive || !sdk || !['intentional', 'contact_form'].includes(source)) return false;
  const error = new Error(source === 'intentional'
    ? 'PortfolioDemoError: erreur volontaire pour la présentation'
    : 'PortfolioContactError: service de contact indisponible');
  error.name = source === 'intentional' ? 'PortfolioDemoError' : 'PortfolioContactError';
  sdk.captureException(error, { demo_mode: true, source, http_status: Number(httpStatus) || 0,
    is_intentional: source === 'intentional' });
  return true;
}

function setDemoStatus(message) {
  const el = document.querySelector('[data-demo-status]');
  if (el) el.textContent = message;
}

function applyFlags() {
  if (!demoActive || !sdk) return;
  const variant = sdk.getFeatureFlag(CV_FLAG);
  const label = document.querySelector('a[href$="CV-Adam-Laarais.pdf"] > span');
  if (label) label.textContent = variant === 'test' ? 'Découvrir mon profil' : 'Mon CV';
  const variantStatus = document.querySelector('[data-demo-variant]');
  if (variantStatus) variantStatus.textContent = variant === 'control' || variant === 'test'
    ? `${variant === 'control' ? 'A · Mon CV' : 'B · Découvrir mon profil'} (tirage 50/50)`
    : 'Variante indisponible · libellé par défaut';
  const enabled = sdk.isFeatureEnabled(CTA_FLAG) === true;
  const cta = document.querySelector('[data-demo-cta]');
  if (cta) cta.hidden = !enabled;
  const flagStatus = document.querySelector('[data-demo-flag]');
  if (flagStatus) flagStatus.textContent = enabled ? 'Bouton contact : activé' : 'Bouton contact : désactivé';
}

function mountDemoControls() {
  const controls = document.createElement('details');
  controls.className = 'demo-controls';
  controls.innerHTML = `
    <summary>Démo PostHog</summary>
    <div class="demo-controls__body">
      <p class="demo-controls__eyebrow">Présentation · 10 minutes</p>
      <h2>Du parcours à l’analyse</h2>
      <p class="demo-controls__intro">Navigation enregistrée, champs masqués. Projets sans animations pour un replay plus lisible.</p>
      <p class="demo-controls__status" role="status" data-demo-status>Connexion à PostHog…</p>
      <div class="demo-controls__links">
        <a href="${PH_APP}/dashboard/1120085" target="_blank" rel="noopener">Tableau de bord ↗</a>
        <a href="${PH_APP}/replay" target="_blank" rel="noopener" data-demo-replay>Replays ↗</a>
      </div>
      <div class="demo-controls__step"><b>01 · Parcours et conversion</b>
        <div class="demo-controls__actions"><a href="#about">Voir le CV</a><a href="#projets">Voir les projets</a>
        <button type="button" data-demo-form>Préparer le formulaire</button></div>
        <small>Puis cliquer sur Envoyer : le vrai service PHP échoue sur GitHub Pages. Aucun e-mail n’est envoyé.</small>
      </div>
      <div class="demo-controls__step"><b>02 · Test A/B et fonctionnalité</b>
        <p data-demo-variant>Chargement du test A/B…</p><p data-demo-flag>Chargement du bouton contact…</p>
        <div class="demo-controls__actions"><a href="${PH_APP}/experiments/113651" target="_blank" rel="noopener">Test A/B ↗</a>
        <a href="${PH_APP}/feature-flags/364080" target="_blank" rel="noopener">Feature flag ↗</a>
        <button type="button" data-demo-refresh>Actualiser les variantes</button></div>
        <small>Activer/désactiver le flag dans PostHog, puis actualiser ici. Le test A/B reste aléatoire.</small>
      </div>
      <div class="demo-controls__step"><b>03 · Erreurs et retour utilisateur</b>
        <div class="demo-controls__actions"><button type="button" data-demo-error>Générer une erreur</button>
        <button type="button" data-demo-survey>Donner mon avis</button></div>
        <small>L’erreur est volontaire et ne bloque pas le site. Le sondage collecte uniquement une note.</small>
      </div>
      <div class="demo-controls__actions demo-controls__footer">
        <button type="button" data-demo-new>Nouvelle session</button>
        <button type="button" data-demo-stop>Arrêter la démo</button>
      </div>
    </div>`;
  document.body.append(controls);
  const cta = document.createElement('p');
  cta.className = 'demo-cta';
  cta.dataset.demoCta = '';
  cta.hidden = true;
  cta.innerHTML = '<a class="btn" href="#contact">Un projet en tête ? Parlons-en ↗</a>';
  document.querySelector('.about__card')?.append(cta);
  cta.querySelector('a').addEventListener('click', () => track('feature_cta_clicked'));
  controls.querySelector('[data-demo-error]').addEventListener('click', () => {
    track('demo_error_requested');
    setDemoStatus(reportDemoError('intentional') ? 'Erreur volontaire capturée. Ouvrir Error Tracking dans PostHog.' : 'PostHog n’est pas encore prêt. Réessayer après la connexion.');
  });
  controls.querySelector('[data-demo-refresh]').addEventListener('click', () => {
    if (!sdk) return setDemoStatus('PostHog n’est pas encore prêt.');
    sdk.reloadFeatureFlags();
    setDemoStatus('Mise à jour demandée à PostHog…');
  });
  controls.querySelector('[data-demo-form]').addEventListener('click', () => {
    const form = document.querySelector('[data-form]');
    if (!form) return;
    for (const [name, value] of Object.entries({ nom: 'Demo', prenom: 'Presentation', email: 'demo@example.com', message: 'Message fictif pour la présentation PostHog.' })) {
      const field = form.elements.namedItem(name);
      if (!field) continue;
      field.value = value;
      field.dispatchEvent(new Event('input', { bubbles: true }));
    }
    controls.open = false;
    document.querySelector('#contact')?.scrollIntoView();
  });
  controls.querySelector('[data-demo-new]').addEventListener('click', () => window.location.reload());
  controls.querySelector('[data-demo-stop]').addEventListener('click', stopDemo);
  document.querySelectorAll('[data-project-name] img').forEach((img) => { img.loading = 'eager'; });
}

export function track(event, properties = {}) {
  if (!demoActive || !Object.hasOwn(EVENT_PROPERTIES, event)) return false;
  const safe = { demo_mode: true };
  for (const key of EVENT_PROPERTIES[event]) {
    const value = properties[key];
    if (typeof value === 'number' && Number.isFinite(value)) safe[key] = value;
    if (typeof value === 'string') safe[key] = value.slice(0, 120);
  }
  if (sdk) {
    try { sdk.capture(event, safe); } catch (_) { /* analytics must not break the site */ }
  } else if (queue.length < 50) queue.push([event, safe]);
  return true;
}

function observeContent() {
  if (observer || !('IntersectionObserver' in window)) return;
  observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || !demoActive) continue;
      const element = entry.target;
      const project = element.getAttribute('data-project-name');
      const key = project ? `project:${project}` : element.id;
      if (seen.has(key)) continue;
      seen.add(key);
      if (project) track('project_viewed', { project_name: project });
      else {
        track('section_viewed', { section: element.id });
        if (element.id === 'contact') track('contact_section_viewed');
      }
    }
  }, { threshold: 0.15 });
  document.querySelectorAll('main section[id], [data-project-name]').forEach((el) => observer.observe(el));
}

async function start() {
  if (sdk) {
    sdk.opt_in_capturing();
    sdk.startSessionRecording();
    observeContent();
    return;
  }
  if (loading) return loading;
  loading = import('posthog-js').then(({ default: posthog }) => {
    if (!demoActive) return;
    posthog.init(process.env.POSTHOG_PROJECT_TOKEN, {
      api_host: process.env.POSTHOG_HOST,
      defaults: '2026-08-30',
      autocapture: false,
      capture_pageview: false,
      capture_pageleave: false,
      capture_exceptions: false,
      capture_performance: true,
      capture_dead_clicks: true,
      enable_heatmaps: true,
      disable_surveys: false,
      disable_session_recording: true,
      opt_out_capturing_by_default: true,
      person_profiles: 'never',
      persistence: 'memory',
      cross_subdomain_cookie: false,
      enable_recording_console_log: false,
      session_recording: {
        maskAllInputs: true,
        maskTextSelector: '[data-form-status]',
        recordBody: false,
        recordHeaders: false,
        maskCapturedNetworkRequestFn: () => null,
      },
      before_send: (event) => {
        if (!demoActive) return null;
        for (const key of ['$current_url', '$referrer']) {
          if (!event.properties?.[key]) continue;
          try {
            const url = new URL(event.properties[key]);
            event.properties[key] = url.origin + url.pathname;
          } catch (_) { delete event.properties[key]; }
        }
        return event;
      },
      loaded: (instance) => {
        sdk = instance;
        if (!demoActive) { instance.opt_out_capturing(); return; }
        instance.opt_in_capturing();
        instance.register({ demo_mode: true });
        instance.capture('$pageview', { demo_mode: true });
        instance.startSessionRecording();
        instance.onFeatureFlags(() => {
          if (!demoActive) return;
          applyFlags();
          setDemoStatus('PostHog connecté · démo prête');
        });
        const replayLink = document.querySelector('[data-demo-replay]');
        if (replayLink) replayLink.href = instance.get_session_replay_url();
        for (const [event, props] of queue) instance.capture(event, props);
        queue = [];
        observeContent();
      },
    });
  }).catch(() => { queue = []; setDemoStatus('Connexion impossible. Vérifier le réseau ou le bloqueur de suivi.'); }).finally(() => { loading = null; });
  return loading;
}

function stopDemo() {
  demoActive = false;
  queue = [];
  observer?.disconnect();
  observer = null;
  sdk?.stopSessionRecording();
  sdk?.opt_out_capturing();
  const url = new URL(window.location.href);
  url.searchParams.delete(DEMO_PARAM);
  window.history.replaceState(window.history.state, '', url);
  const stopButton = document.querySelector('[data-analytics-stop]');
  if (stopButton) stopButton.hidden = true;
  document.querySelector('.demo-controls')?.remove();
  document.querySelector('[data-demo-cta]')?.remove();
  const label = document.querySelector('a[href$="CV-Adam-Laarais.pdf"] > span');
  if (label) label.textContent = 'Mon CV';
}

export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  demoActive = new URL(window.location.href).searchParams.get(DEMO_PARAM) === '1';
  // A remembered choice or another tab cannot activate a normal visit.
  if (!demoActive) return;
  mountDemoControls();
  const stopButton = document.querySelector('[data-analytics-stop]');
  if (stopButton) {
    stopButton.hidden = false;
    stopButton.addEventListener('click', stopDemo);
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('a');
    if (!link) return;
    const href = link.getAttribute('href') || '';
    if (/\.pdf(?:[?#]|$)/i.test(href)) track('cv_clicked');
    if (link.classList.contains('project-card__link')) {
      track('project_link_clicked', { project_name: link.closest('[data-project-name]')?.dataset.projectName });
    }
    if (href.startsWith('mailto:')) track('contact_link_clicked', { channel: 'email' });
    else if (href.includes('linkedin.com/')) track('contact_link_clicked', { channel: 'linkedin' });
    else if (href.includes('github.com/')) track('contact_link_clicked', { channel: 'github' });
  });
  void start();
}
