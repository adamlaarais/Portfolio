/* PostHog: classroom demo only; normal portfolio visits never load the SDK.
   This source reads build-time environment variables; GitHub Pages serves
   the generated ESM bundle in assets/analytics/. */
const DEMO_PARAM = 'posthog_demo';
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
};
let demoActive = false;
let sdk = null;
let loading = null;
let queue = [];
let observer = null;
let initialized = false;
const seen = new Set();

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
      capture_performance: false,
      capture_dead_clicks: false,
      disable_surveys: true,
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
        instance.capture('$pageview', { demo_mode: true });
        instance.startSessionRecording();
        for (const [event, props] of queue) instance.capture(event, props);
        queue = [];
        observeContent();
      },
    });
  }).catch(() => { queue = []; }).finally(() => { loading = null; });
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
}

export function initAnalytics() {
  if (initialized) return;
  initialized = true;
  demoActive = new URL(window.location.href).searchParams.get(DEMO_PARAM) === '1';
  // A remembered choice or another tab cannot activate a normal visit.
  if (!demoActive) return;
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
