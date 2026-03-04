/* ============================================================
   GALLERY.JS — filter, scroll reveal, drag
   ============================================================ */
(function () {

  // ── Scroll Reveal ──
  const fuEls = document.querySelectorAll('.fu');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('vis'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    fuEls.forEach(el => io.observe(el));
  } else {
    fuEls.forEach(el => el.classList.add('vis'));
  }

  // ── Card click ──
  document.querySelectorAll('.wcard[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });

  // ── Filter buttons ──
  const filterBtns = document.querySelectorAll('.gl-filter-btn');
  const cards      = document.querySelectorAll('.wcard[data-cat]');
  const listItems  = document.querySelectorAll('.gl-item[data-cat]');
  const countEl    = document.getElementById('glCount');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      let visible = 0;

      cards.forEach(card => {
        const show = filter === 'all' || card.dataset.cat === filter;
        card.style.display = show ? '' : 'none';
        if (show) visible++;
      });

      listItems.forEach(item => {
        const show = filter === 'all' || item.dataset.cat === filter;
        item.style.display = show ? '' : 'none';
      });

      if (countEl) countEl.textContent = visible;
    });
  });

  // ── Drag scroll on track ──
  const wrap = document.getElementById('glWrap');
  if (wrap) {
    let isDragging = false, startX = 0, startScroll = 0;

    wrap.addEventListener('mousedown', e => {
      isDragging = true;
      startX = e.pageX;
      startScroll = wrap.scrollLeft;
      wrap.style.cursor = 'grabbing';
    });

    wrap.addEventListener('mousemove', e => {
      if (!isDragging) return;
      wrap.scrollLeft = startScroll - (e.pageX - startX);
    });

    ['mouseup', 'mouseleave'].forEach(ev =>
      wrap.addEventListener(ev, () => {
        isDragging = false;
        wrap.style.cursor = 'grab';
      })
    );
  }

})();
