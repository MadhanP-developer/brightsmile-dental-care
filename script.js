// ===== Sticky header + back-to-top =====
const header = document.querySelector('.header');
const toTop = document.getElementById('toTop');
const onScroll = () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 50);
  toTop.classList.toggle('show', y > 600);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// ===== Mobile nav =====
const nav = document.getElementById('nav');
const navToggle = document.getElementById('navToggle');
const closeNav = () => {
  nav.classList.remove('open');
  navToggle.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
};
navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.classList.toggle('open', open);
  navToggle.setAttribute('aria-expanded', String(open));
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));

// ===== Scroll reveal =====
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el, i) => {
  el.style.transitionDelay = `${(i % 4) * 60}ms`;
  io.observe(el);
});

// ===== Counter animations (stats) =====
const counters = document.querySelectorAll('[data-count]');
if (counters.length) {
  const fmt = (n) => n.toLocaleString('en-IN');
  const run = (el) => {
    const target = +el.dataset.count;
    const suffix = el.dataset.suffix || '';
    const dur = 1500;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const cio = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) { run(e.target); cio.unobserve(e.target); } });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));
}

// ===== Active nav highlighting (scrollspy) =====
const navLinks = [...document.querySelectorAll('.nav > a[href^="#"]')];
const spyTargets = navLinks
  .map(a => ({ a, sec: document.querySelector(a.getAttribute('href')) }))
  .filter(t => t.sec);
if (spyTargets.length) {
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = '#' + e.target.id;
        spyTargets.forEach(t => t.a.classList.toggle('active', t.a.getAttribute('href') === id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  spyTargets.forEach(t => spy.observe(t.sec));
}

// ===== Testimonials auto-scroll on mobile =====
(function () {
  const grid = document.getElementById('tGrid');
  if (!grid) return;
  let timer;
  const isMobile = () => window.matchMedia('(max-width:760px)').matches;
  const tick = () => {
    if (!isMobile()) return;
    const max = grid.scrollWidth - grid.clientWidth;
    const next = grid.scrollLeft + grid.clientWidth;
    grid.scrollTo({ left: next > max - 8 ? 0 : next, behavior: 'smooth' });
  };
  const start = () => { stop(); if (isMobile()) timer = setInterval(tick, 3500); };
  const stop = () => clearInterval(timer);
  grid.addEventListener('touchstart', stop, { passive: true });
  grid.addEventListener('touchend', start, { passive: true });
  window.addEventListener('resize', start);
  start();
})();

// ===== Booking form (demo) =====
const bookForm = document.getElementById('bookForm');
const bookNote = document.getElementById('bookNote');
if (bookForm) {
  bookForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!bookForm.checkValidity()) { bookForm.reportValidity(); return; }
    bookNote.hidden = false;
    bookForm.reset();
    bookNote.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
}

// ===== Before / After sliders =====
document.querySelectorAll('[data-ba]').forEach(slider => {
  const range = slider.querySelector('.ba-range');
  const beforeWrap = slider.querySelector('.ba-before-wrap');
  const beforeImg = slider.querySelector('.ba-before');
  const handle = slider.querySelector('.ba-handle');
  const update = (v) => {
    beforeWrap.style.width = v + '%';
    handle.style.left = v + '%';
    beforeImg.style.width = slider.clientWidth + 'px';
  };
  range.addEventListener('input', () => update(range.value));
  window.addEventListener('resize', () => update(range.value));
  update(range.value);
});

// ===== Appointment popup =====
const popup = document.getElementById('popup');
const popupClose = document.getElementById('popupClose');
const popupForm = document.getElementById('popupForm');
const popupNote = document.getElementById('popupNote');
const popupKicker = document.getElementById('popupKicker');

const openPopup = (kicker) => {
  if (kicker && popupKicker) popupKicker.textContent = kicker;
  popup.hidden = false;
  document.body.style.overflow = 'hidden';
  requestAnimationFrame(() => popup.classList.add('show'));
};
const hidePopup = () => {
  popup.classList.remove('show');
  document.body.style.overflow = '';
  setTimeout(() => { popup.hidden = true; }, 350);
  sessionStorage.setItem('bsPopupSeen', '1');
};

// Every appointment CTA opens the popup (nav button, hero/about/booking
// "Book" buttons). Call/WhatsApp/ghost links keep their native action.
document.addEventListener('click', (e) => {
  const cta = e.target.closest('a.btn-primary, a.nav-cta, a.mcta-book, a[href="#book"]');
  if (cta && !cta.closest('#popup')) {
    e.preventDefault();
    openPopup();
  }
});

popupClose.addEventListener('click', hidePopup);
popup.addEventListener('click', (e) => { if (e.target === popup) hidePopup(); });
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !popup.hidden) hidePopup(); });

popupForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!popupForm.checkValidity()) { popupForm.reportValidity(); return; }
  popupNote.hidden = false;
  popupForm.reset();
  setTimeout(hidePopup, 1800);
});

// Timed popup (once per session)
if (!sessionStorage.getItem('bsPopupSeen')) {
  setTimeout(() => { if (popup.hidden) openPopup(); }, 6000);
}

// Exit-intent popup (desktop): show when cursor leaves toward the top
let exitShown = false;
document.addEventListener('mouseout', (e) => {
  if (exitShown || sessionStorage.getItem('bsPopupSeen')) return;
  if (!e.relatedTarget && e.clientY <= 0) {
    exitShown = true;
    openPopup('Wait! Claim Your Free Consultation');
  }
});
