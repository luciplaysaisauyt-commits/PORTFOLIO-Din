
    const progressBar = document.getElementById('progressBar');
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      progressBar.style.width = (h.scrollTop / (h.scrollHeight - h.clientHeight) * 100) + '%';
    }, { passive: true });

    /* ── Reveal on scroll ── */
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('revealed'); io.unobserve(e.target); } });
    }, { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));

    /* ── Subnav active highlight ── */
    const sections = document.querySelectorAll('.case-section');
    const navLinks = document.querySelectorAll('.case-subnav-link');
    window.addEventListener('scroll', () => {
      let current = '';
      sections.forEach(s => { if (window.scrollY + 120 >= s.offsetTop) current = s.id; });
      navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + current));
    }, { passive: true });

    /* ── Lightbox ── */
    const modal   = document.getElementById('imgModal');
    const modalImg = document.getElementById('imgModalSrc');

    document.querySelectorAll('.hero-img-wrap, .screen-card, .ba-card, .uikit-card').forEach(el => {
      el.addEventListener('click', () => {
        const img = el.querySelector('img');
        if (!img) return;
        modalImg.src = img.src;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
      });
    });

    function closeModal() {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
      setTimeout(() => { modalImg.src = ''; }, 250);
    }

    document.querySelectorAll('[data-close]').forEach(el => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

    /* ── Mobile menu ── */
    const burger     = document.getElementById('burger');
    const mobileMenu = document.getElementById('mobileMenu');
    const mClose     = document.getElementById('mobileClose');

    burger.addEventListener('click', () => mobileMenu.classList.add('open'));
    mClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
    mobileMenu.addEventListener('click', e => { if (e.target === mobileMenu) mobileMenu.classList.remove('open'); });