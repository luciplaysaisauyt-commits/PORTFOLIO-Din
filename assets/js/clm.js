// nav height CSS var
const nav = document.getElementById('topnav');
if (nav) {
  const setNavH = () => {
    document.documentElement.style.setProperty('--navH', nav.offsetHeight + 'px');
  };
  setNavH();
  window.addEventListener('resize', setNavH);
}

(() => {
  // progress bar
  const bar = document.getElementById('progressBar');
  if (bar) {
    window.addEventListener('scroll', () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) return;
      bar.style.width = (window.scrollY / total * 100) + '%';
    }, { passive: true });
  }

  // scroll reveal
  const ro = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('revealed');
      ro.unobserve(e.target);
    });
  }, { threshold: 0.07 });
  document.querySelectorAll('[data-reveal]').forEach((el) => ro.observe(el));

  // subnav + toc active state
  const tocLinks = document.querySelectorAll('.case-toc a');
  const subLinks = document.querySelectorAll('.subnav-pill a, .case-subnav-pill a');

  if (tocLinks.length || subLinks.length) {
    const secObs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const id = e.target.id;
        [...tocLinks, ...subLinks].forEach((l) => {
          l.classList.toggle('active', l.getAttribute('href') === '#' + id);
        });
      });
    }, { threshold: 0.2 });
    document.querySelectorAll('.case-section[id]').forEach((s) => secObs.observe(s));
  }

  // lightbox
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');

  if (modal && modalImg) {
    // auto-bind clickable images
    document.querySelectorAll('.screen-card img, .ba-card img, .hero-img-wrap img, .uikit-img img').forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      });
    });

    // close handlers
    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

  // legacy support for onclick="openLightbox(...)" in HTML
  window.openLightbox = function (src) {
    const full = (src.startsWith('/') || src.startsWith('http')) ? src : '/images/clm/' + src;
    if (modalImg && modal) {
      modalImg.src = full;
      modal.classList.add('open');
      modal.setAttribute('aria-hidden', 'false');
      document.body.classList.add('no-scroll');
    }
  };

})();