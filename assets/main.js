const menu = document.querySelector('.menu-btn');
const nav = document.querySelector('.mobile-nav');
if (menu && nav) {
  menu.hidden = false;
  nav.hidden = true;
  const close = () => {
    nav.hidden = true;
    menu.setAttribute('aria-expanded', 'false');
    menu.textContent = '메뉴';
  };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') === 'true';
    menu.setAttribute('aria-expanded', String(!open));
    nav.hidden = open;
    menu.textContent = open ? '메뉴' : '닫기';
  });
  nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !nav.hidden) { close(); menu.focus(); }
  });
}

const rail = document.querySelector('.carousel');
const controls = document.querySelector('.controls');
if (rail && controls) {
  const previous = controls.querySelector('[data-dir="-1"]');
  const next = controls.querySelector('[data-dir="1"]');
  const step = () => rail.querySelector('.card').getBoundingClientRect().width + parseFloat(getComputedStyle(rail).gap || 0);
  const behavior = () => matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth';
  const sync = () => {
    previous.disabled = rail.scrollLeft < 3;
    next.disabled = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 3;
  };
  controls.hidden = false;
  controls.querySelectorAll('[data-dir]').forEach(button => {
    button.addEventListener('click', () => rail.scrollBy({ left: Number(button.dataset.dir) * step(), behavior: behavior() }));
  });
  rail.addEventListener('keydown', event => {
    if (event.target !== rail) return;
    if (['ArrowLeft', 'ArrowRight'].includes(event.key)) {
      event.preventDefault();
      rail.scrollBy({ left: (event.key === 'ArrowRight' ? 1 : -1) * step(), behavior: behavior() });
    }
    if (['Home', 'End'].includes(event.key)) {
      event.preventDefault();
      rail.scrollTo({ left: event.key === 'Home' ? 0 : rail.scrollWidth, behavior: behavior() });
    }
  });
  rail.addEventListener('scroll', sync, { passive: true });
  window.addEventListener('resize', sync);
  sync();
}
