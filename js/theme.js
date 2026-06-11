/* theme.js — dark/light toggle, persistence, system-pref sync.
   The initial theme is set by an inline <head> script (anti-FOUC).
   This module wires the toggle button and reacts to system changes. */

const KEY = 'pf-theme';
const root = document.documentElement;

export function initTheme() {
  const btn = document.querySelector('[data-theme-toggle]');

  const syncButton = (theme) => {
    if (!btn) return;
    const isLight = theme === 'light';
    btn.setAttribute('aria-pressed', String(isLight));
    btn.setAttribute('aria-label', isLight ? 'Activer le thème sombre' : 'Activer le thème clair');
  };

  const apply = (theme, persist) => {
    root.setAttribute('data-theme', theme);
    syncButton(theme);
    if (persist) { try { localStorage.setItem(KEY, theme); } catch (_) {} }
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme } }));
  };

  // Button already reflects the theme chosen by the inline script.
  syncButton(root.getAttribute('data-theme') || 'dark');

  btn?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    apply(next, true);
  });

  // Follow the OS only while the user hasn't made an explicit choice.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    let stored = null;
    try { stored = localStorage.getItem(KEY); } catch (_) {}
    if (!stored) apply(e.matches ? 'dark' : 'light', false);
  });
}
