/* ============================================================
   Исправленный JS — без конфликтов и дублирований
   ============================================================ */

(() => {

  /* ── Progress bar ── */
  const progressBar = document.getElementById('progressBar') || document.getElementById('ubProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total > 0) progressBar.style.width = (window.scrollY / total * 100) + '%';
    }, { passive: true });
  }

  /* ── Reveal on scroll ── */
  const revObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('revealed'); revObs.unobserve(e.target); }
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('[data-reveal]').forEach(el => revObs.observe(el));

  /* ── Subnav active highlight ── */
  const subnavLinks = document.querySelectorAll('.case-subnav-link, .case-subnav-pill a');
  const secObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const id = e.target.id;
      subnavLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + id));
    });
  }, { threshold: 0.22 });
  document.querySelectorAll('.case-section[id]').forEach(s => secObs.observe(s));

  /* ── Lightbox ── */
  // Одна функция openModal/closeModal — без дублирования
  const modal    = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');

  function openModal(src) {
    if (!modal || !modalImg) return;
    modalImg.src = src;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    document.body.classList.remove('no-scroll');
    setTimeout(() => { if (modalImg) modalImg.src = ''; }, 250);
  }

  // Клик по картинкам — все типы карточек
  document.querySelectorAll([
    '.hero-img-wrap',
    '.screen-card',
    '.ba-card',
    '.uikit-card',
    '.ub-product-card img',
    '.ub-screen-card img',
    '.case-img img',
    '.landing-card img',
    '.modal-card img',
    '.fp-card img'
  ].join(', ')).forEach(el => {
    el.style.cursor = 'zoom-in';
    el.addEventListener('click', () => {
      // Если клик по контейнеру — берём img внутри
      const img = el.tagName === 'IMG' ? el : el.querySelector('img');
      if (img) openModal(img.currentSrc || img.src);
    });
  });

  // Кнопка "Expand full" (если есть)
  document.getElementById('expandFull')?.addEventListener('click', () => {
    // Берём src из data-атрибута или из ближайшей картинки
    const btn = document.getElementById('expandFull');
    const src = btn.dataset.src || '/assets/images/unniebox/main%20page.png';
    openModal(src);
  });

  // Закрытие: кнопка data-close, клик по backdrop, Escape
  modal?.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  // Публичный API
  window.openModal  = openModal;
  window.closeModal = closeModal;

  /* ── Mobile menu ── */
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mClose     = document.getElementById('mobileClose');

  burger?.addEventListener('click', () => {
    mobileMenu?.classList.add('open');
    document.body.style.overflow = 'hidden';
  });

  const closeMobileMenu = () => {
    mobileMenu?.classList.remove('open');
    document.body.style.overflow = '';
  };

  mClose?.addEventListener('click', closeMobileMenu);
  mobileMenu?.addEventListener('click', e => { if (e.target === mobileMenu) closeMobileMenu(); });

})();