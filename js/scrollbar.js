/* scrollbar.js — custom minimal scrollbar synced to Lenis */

export function initScrollbar(lenis) {
  const track = document.createElement('div');
  track.id = 'custom-scrollbar';
  const thumb = document.createElement('div');
  thumb.id = 'custom-scrollbar-thumb';
  track.appendChild(thumb);
  document.body.appendChild(track);

  function update(progress) {
    thumb.style.height = `${progress * 100}%`;
  }

  if (lenis) {
    lenis.on('scroll', ({ progress }) => update(progress));
  } else {
    window.addEventListener('scroll', () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      update(max > 0 ? window.scrollY / max : 0);
    }, { passive: true });
  }
}
