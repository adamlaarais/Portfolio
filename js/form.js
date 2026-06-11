/* form.js — contact form UX: inline validation, honeypot, fetch submission
   with idle/sending/success/error states, and a graceful mailto fallback when
   the PHP endpoint isn't live (dev) or mail isn't configured yet. */

const EMAIL = 'laaraisadam22@gmail.com';
const RE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const statusEl = form.querySelector('[data-form-status]');
  const submitBtn = form.querySelector('[data-submit]');
  const label = submitBtn?.querySelector('.btn__label');
  const fields = Array.from(form.querySelectorAll('input[required], textarea[required]'));

  const setStatus = (state, msg) => {
    if (statusEl) {
      statusEl.className = 'form__status' + (state === 'error' ? ' is-error' : state === 'success' ? ' is-success' : '');
      statusEl.textContent = msg || '';
    }
    if (label) label.textContent = state === 'sending' ? 'Envoi…' : state === 'success' ? 'Envoyé ✓' : 'Envoyer';
    if (submitBtn) submitBtn.disabled = state === 'sending';
  };

  const validate = (f) => {
    let ok = f.value.trim() !== '';
    if (ok && f.type === 'email') ok = RE_EMAIL.test(f.value.trim());
    f.closest('.field')?.classList.toggle('is-invalid', !ok);
    return ok;
  };

  fields.forEach((f) => {
    f.addEventListener('blur', () => { if (f.value) validate(f); });
    f.addEventListener('input', () => {
      if (f.closest('.field')?.classList.contains('is-invalid')) validate(f);
    });
  });

  const mailtoFallback = () => {
    const d = new FormData(form);
    const subject = encodeURIComponent(`Contact portfolio — ${(d.get('prenom') || '')} ${(d.get('nom') || '')}`.trim());
    const body = encodeURIComponent(
      `${d.get('message') || ''}\n\n— ${d.get('prenom') || ''} ${d.get('nom') || ''} (${d.get('email') || ''})`
    );
    window.location.href = `mailto:${EMAIL}?subject=${subject}&body=${body}`;
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: a filled "website" field means a bot — silently ignore.
    if (form.querySelector('input[name="website"]')?.value) return;

    const valid = fields.map(validate).every(Boolean);
    if (!valid) {
      setStatus('error', 'Merci de vérifier les champs en surbrillance.');
      form.querySelector('.field.is-invalid input, .field.is-invalid textarea')?.focus();
      return;
    }

    setStatus('sending', 'Envoi en cours…');
    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      let json = null;
      try { json = await res.json(); } catch (_) { /* non-JSON → fallback */ }

      if (res.ok && json && json.ok) {
        setStatus('success', 'Merci ! Votre message a bien été envoyé.');
        form.reset();
        setTimeout(() => setStatus('idle', ''), 4500);
      } else {
        throw new Error('endpoint-unavailable');
      }
    } catch (_) {
      // Endpoint not live / mail not configured → graceful mailto fallback.
      setStatus('success', 'Ouverture de votre messagerie…');
      mailtoFallback();
      setTimeout(() => setStatus('idle', `Si rien ne s'ouvre, écrivez-moi à ${EMAIL}`), 1800);
    }
  });
}
