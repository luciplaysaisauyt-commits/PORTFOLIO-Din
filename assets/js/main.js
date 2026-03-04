/* ============================================================
   MAIN.JS — shared across all pages
   ============================================================ */
(() => {

  const isTouch = (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) || ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ── PAGE ENTER ANIMATION HOOK ──
  window.addEventListener('load', () => {
    document.body.classList.add('is-loaded');
  });

  // ── MOBILE MENU ──
  const burger     = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileClose= document.getElementById('mobileClose');

  if (burger && mobileMenu)
    burger.addEventListener('click', () => mobileMenu.classList.add('open'));
  if (mobileClose && mobileMenu)
    mobileClose.addEventListener('click', () => mobileMenu.classList.remove('open'));
  if (mobileMenu)
    mobileMenu.addEventListener('click', e => {
      if (e.target === mobileMenu) mobileMenu.classList.remove('open');
    });

  // ── NAV SHRINK ON SCROLL ──
  const nav = document.getElementById('topnav');
  if (nav) {
    const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    onScroll();
  }

  // ── CONTACT FORM POPUP ──
  const form       = document.getElementById('contactForm');
  const popup      = document.getElementById('popup');
  const popupClose = document.getElementById('popupClose');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const btn = form.querySelector('.send-btn');
      btn.textContent = 'Sending...';
      btn.disabled = true;

      const data = {
        firstName: document.getElementById('firstName').value,
        lastName:  document.getElementById('lastName').value,
        email:     document.getElementById('email').value,
        message:   document.getElementById('message').value
      };

      try {
        const res = await fetch('/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (res.ok) {
          form.reset();
          if (popup) popup.classList.add('show');
        } else {
          alert('Send error. Please try again.');
        }
      } catch (err) {
        alert('Connection error. Check your internet.');
      } finally {
        btn.innerHTML = `Send Message <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"/></svg>`;
        btn.disabled = false;
      }
    });
  }

  if (popupClose && popup) {
    popupClose.addEventListener('click', () => popup.classList.remove('show'));
    popup.addEventListener('click', e => {
      if (e.target === popup) popup.classList.remove('show');
    });
  }

  // ── NEWSLETTER ──
  const nlForm  = document.getElementById('newsletterForm');
  const nlEmail = document.getElementById('newsletterEmail');
  if (nlForm) {
    nlForm.addEventListener('submit', e => {
      e.preventDefault();
      if (nlEmail) nlEmail.value = '';
    });
  }

  // ── SCROLL-TO-TOP ──
  const scrollBtn = document.getElementById('scrollTop');
  if (scrollBtn) {
    window.addEventListener('scroll', () => {
      scrollBtn.style.display = window.scrollY > 300 ? 'block' : 'none';
    });
    scrollBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // ── FADE-UP (.fu -> .vis) ──
  const fuEls = document.querySelectorAll('.fu');
  if (fuEls.length) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fuEls.forEach(el => io.observe(el));
  }

  // ── FADE-UP (.fade-up -> .visible) ──
  const fadeEls = document.querySelectorAll('.fade-up');
  if (fadeEls.length) {
    const io2 = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('visible'); io2.unobserve(e.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach(el => io2.observe(el));
  }

  // ── COUNTER ANIMATION ──
  function animateCounter(el) {
    const target = parseFloat(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const dur    = 1800;
    const start  = performance.now();
    const isFloat= target % 1 !== 0;
    function tick(now) {
      const p   = Math.min((now - start) / dur, 1);
      const val = (1 - Math.pow(1 - p, 3)) * target;
      el.textContent = (isFloat ? val.toFixed(1) : Math.floor(val)) + suffix;
      if (p < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
  const counterEls = document.querySelectorAll('[data-target]');
  if (counterEls.length) {
    const cio = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { animateCounter(e.target); cio.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    counterEls.forEach(el => cio.observe(el));
  }

  // ── CUSTOM CURSOR ── (fixed: starts off-screen)
  const cursor     = document.getElementById('dinCursor');
  const cursorRing = document.getElementById('dinCursorRing');
  if (cursor && cursorRing && !isTouch) {
    let mx = -999, my = -999, rx = -999, ry = -999;
    let moved = false;

    cursor.style.left = '-999px';
    cursor.style.top  = '-999px';
    cursorRing.style.left = '-999px';
    cursorRing.style.top  = '-999px';

    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cursor.style.left = mx + 'px';
      cursor.style.top  = my + 'px';
      if (!moved) {
        moved = true;
        cursor.style.opacity = '1';
        cursorRing.style.opacity = '1';
      }
    });

    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';

    (function animRing() {
      rx += (mx - rx) * 0.09;
      ry += (my - ry) * 0.09;
      cursorRing.style.left = rx + 'px';
      cursorRing.style.top  = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }

  /* ============================================================
   CASE SUBNAV UNIVERSAL
   ============================================================ */
  (() => {
    const nav = document.getElementById("topnav");

    const setNavH = () => {
      if (!nav) return;
      document.documentElement.style.setProperty("--navH", nav.offsetHeight + "px");
    };

    setNavH();
    window.addEventListener("resize", setNavH);

    const subnav = document.querySelector("[data-case-subnav]");
    if (!subnav) return;

    document.body.classList.add("has-case-subnav");

    const setSubnavH = () => {
      document.documentElement.style.setProperty("--caseSubnavH", subnav.offsetHeight + "px");
    };

    setSubnavH();
    window.addEventListener("resize", setSubnavH);

    const subLinks = subnav.querySelectorAll("a[href^='#']");
    const sections = document.querySelectorAll(".case-section[id]");

    if (subLinks.length && sections.length) {
      const secObs = new IntersectionObserver((entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const id = e.target.id;
          subLinks.forEach((l) => {
            l.classList.toggle("active", l.getAttribute("href") === "#" + id);
          });
        });
      }, { threshold: 0.2 });

      sections.forEach((s) => secObs.observe(s));
    }

    subLinks.forEach((a) => {
      a.addEventListener("click", (e) => {
        const href = a.getAttribute("href");
        if (!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--navH")) || 0;
        const subH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--caseSubnavH")) || 0;

        const offset = navH + subH + 24;
        const y = target.getBoundingClientRect().top + window.scrollY - offset;

        window.scrollTo({ top: y, behavior: "smooth" });
      });
    });
  })();

  window.caseSubscribe = function(form){
    const input = form.querySelector('input[type="email"]');
    const btn = form.querySelector('button[type="submit"]');

    if (!input || !btn) return;

    if (!input.value || !input.value.includes('@')) {
      input.style.borderColor = 'rgba(255,80,80,0.7)';
      setTimeout(() => { input.style.borderColor = ''; }, 1500);
      return;
    }

    input.value = '';
    const orig = btn.textContent;
    btn.textContent = 'Done ✓';
    btn.style.background = 'rgba(34,197,94,0.95)';
    btn.style.borderColor = 'rgba(34,197,94,0.95)';

    setTimeout(() => {
      btn.textContent = orig;
      btn.style.background = '';
      btn.style.borderColor = '';
    }, 2500);
  };

})();


/* ============================================================
   LIGHTBOX
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('imgModal');
  const modalImg = document.getElementById('imgModalSrc');
  if (!modal || !modalImg) return;

  const openModal = (src, alt = '') => {
    modalImg.src = src;
    modalImg.alt = alt;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalImg.src = '';
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  };

  document.addEventListener('click', e => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) { closeModal(); return; }

    const target = e.target.closest('[data-lightbox]');
    if (!target) return;

    if (target.tagName === 'IMG') {
      openModal(target.currentSrc || target.src, target.alt || '');
      return;
    }

    const src = target.getAttribute('data-src') || target.getAttribute('href');
    if (src) openModal(src, target.getAttribute('aria-label') || '');
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });
});

// Mark JS as loaded
document.documentElement.classList.add('js-ready');

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
    document.querySelectorAll('.screen-card img, .ba-card img, .hero-img-wrap img, .uikit-img img').forEach((img) => {
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', () => {
        modalImg.src = img.src;
        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.classList.add('no-scroll');
      });
    });

    const closeModal = () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden', 'true');
      document.body.classList.remove('no-scroll');
    };

    modal.querySelectorAll('[data-close]').forEach((el) => el.addEventListener('click', closeModal));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  }

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