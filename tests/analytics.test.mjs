import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { build } from 'esbuild';
import { Window } from 'happy-dom';

const result = await build({
  stdin: {
    contents: "export { initAnalytics, track } from './js/analytics.js'; export { initForm } from './js/form.js';",
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, format: 'iife', globalName: 'PortfolioTest',
  define: { 'process.env.POSTHOG_PROJECT_TOKEN': '"phc_test"', 'process.env.POSTHOG_HOST': '"https://example.com"' },
  plugins: [{ name: 'isolated-sdk', setup(builder) {
    builder.onResolve({ filter: /assets\/analytics\/analytics\.js$/ }, () => ({ path: resolve('js/analytics.js') }));
    builder.onResolve({ filter: /^posthog-js$/ }, () => ({ path: 'sdk', namespace: 'mock' }));
    builder.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({ contents: 'export default globalThis.__phMock;' }));
  } }],
});
const html = await readFile('index.html', 'utf8');
const tick = () => new Promise((done) => setTimeout(done, 0));

function setup(demo = true) {
  const window = new Window({ url: `https://adamlaarais.github.io/Portfolio/?email=private@example.com${demo ? '&posthog_demo=1' : ''}`, settings: {
    disableCSSFileLoading: true, disableJavaScriptFileLoading: true, disableJavaScriptEvaluation: true,
  } });
  window.document.write(html);
  const calls = [];
  let options;
  const sdk = {
    init(token, config) { calls.push(['init', token]); options = config; config.loaded(sdk); },
    capture(event, props) { calls.push([event, props]); },
    opt_in_capturing() { calls.push(['opt_in']); },
    opt_out_capturing() { calls.push(['opt_out']); },
    startSessionRecording() { calls.push(['record']); },
    stopSessionRecording() { calls.push(['stop']); },
  };
  window.__phMock = sdk;
  const observers = [];
  window.IntersectionObserver = class {
    constructor(callback) { this.callback = callback; this.targets = []; observers.push(this); }
    observe(element) { this.targets.push(element); }
    disconnect() { this.targets = []; }
  };
  window.eval(result.outputFiles[0].text);
  const api = window.PortfolioTest;
  const click = (selector) => window.document.querySelector(selector).click();
  return { window, calls, api, click, observers, get options() { return options; } };
}

test('Normal visits do not initialize the SDK, including with a legacy accepted choice', async () => {
  const s = setup(false);
  try {
    s.window.localStorage.setItem('pf-analytics-consent-v1', JSON.stringify({choice:'accepted',at:Date.now()}));
    s.api.initAnalytics();
    s.api.track('contact_submit_attempted');
    await tick();
    assert.equal(s.calls.length, 0);
    assert.equal(s.window.document.querySelector('[data-analytics-consent]'), null);
    assert.equal(s.window.document.querySelector('[data-analytics-stop]').hidden, true);
  } finally { await s.window.happyDOM.close(); }
});

test('Explicit demo starts masked replay; stopping removes its URL parameter and disables tracking', async () => {
  const s = setup();
  try {
    s.api.initAnalytics(); await tick();
    assert.equal(s.calls.filter(([name]) => name === 'init').length, 1);
    assert.ok(s.calls.some(([name]) => name === 'record'));
    assert.equal(s.options.session_recording.maskAllInputs, true);
    assert.equal(s.options.session_recording.recordBody, false);
    assert.equal(s.options.persistence, 'memory');
    assert.equal(s.options.session_recording.maskCapturedNetworkRequestFn({}), null);
    const event = s.options.before_send({ properties: { $current_url: s.window.location.href } });
    assert.equal(event.properties.$current_url, 'https://adamlaarais.github.io/Portfolio/');
    s.click('[data-analytics-stop]');
    assert.equal(new URL(s.window.location.href).searchParams.has('posthog_demo'), false);
    assert.ok(s.calls.some(([name]) => name === 'stop'));
    const count = s.calls.length;
    assert.equal(s.api.track('cv_clicked'), false);
    assert.equal(s.calls.length, count);
  } finally { await s.window.happyDOM.close(); }
});

test('Contact visibility is counted once; properties exclude submitted personal data', async () => {
  const s = setup();
  try {
    s.api.initAnalytics(); await tick();
    const observer = s.observers[0];
    const entry = { isIntersecting: true, target: s.window.document.querySelector('#contact') };
    observer.callback([entry]); observer.callback([entry]);
    assert.equal(s.calls.filter(([name]) => name === 'contact_section_viewed').length, 1);
    s.api.track('contact_submit_failed', { http_status: 405, email: 'private@example.com', message: 'private text' });
    assert.deepEqual(JSON.parse(JSON.stringify(s.calls.find(([name]) => name === 'contact_submit_failed')[1])), { demo_mode: true, http_status: 405 });
  } finally { await s.window.happyDOM.close(); }
});

test('Invalid form never sends a request or reports success', async () => {
  const s = setup();
  try {
    s.api.initAnalytics(); await tick(); s.api.initForm();
    let requests = 0; s.window.fetch = async () => { requests++; throw Error('Unexpected network'); };
    s.window.document.querySelector('[data-form]').dispatchEvent(new s.window.Event('submit', { cancelable: true }));
    await tick();
    assert.equal(requests, 0);
    assert.ok(s.calls.some(([name]) => name === 'contact_validation_failed'));
    assert.ok(!s.calls.some(([name]) => name === 'contact_submit_succeeded'));
  } finally { await s.window.happyDOM.close(); }
});

for (const success of [false, true]) {
  test(success ? 'Confirmed service response reports success' : 'Failed endpoint reports failure and mailto request, never success', async () => {
    const s = setup();
    try {
      s.api.initAnalytics(); await tick(); s.api.initForm();
      const doc = s.window.document;
      for (const [name, value] of Object.entries({ nom: 'Test', prenom: 'Demo', email: 'demo@example.com', message: 'Message fictif' })) {
        doc.querySelector(`[name="${name}"]`).value = value;
      }
      s.window.fetch = async () => ({ ok: success, status: success ? 200 : 405, json: async () => ({ ok: success }) });
      doc.querySelector('[data-form]').dispatchEvent(new s.window.Event('submit', { cancelable: true }));
      await tick();
      const names = s.calls.map(([name]) => name);
      assert.ok(names.includes('contact_submit_attempted'));
      assert.equal(names.includes('contact_submit_succeeded'), success);
      assert.equal(names.includes('contact_submit_failed'), !success);
      assert.equal(names.includes('contact_mailto_open_requested'), !success);
      assert.ok(!JSON.stringify(s.calls).includes('demo@example.com'));
      assert.ok(!JSON.stringify(s.calls).includes('Message fictif'));
    } finally { await s.window.happyDOM.close(); }
  });
}
