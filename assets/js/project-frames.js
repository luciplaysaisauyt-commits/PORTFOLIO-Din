/* ============================================================
   PROJECT-FRAMES.JS v2.1
   Lightbox с зумом, паном и pinch.
   ФИКС: MutationObserver больше не вызывает бесконечный цикл.
   ============================================================ */
(function () {
  'use strict';

  /* ── Стили — вшиты один раз ── */
  if (!document.getElementById('pf-styles')) {
    const css = document.createElement('style');
    css.id = 'pf-styles';
    css.textContent = `
      .pf-modal {
        display:none; position:fixed; inset:0; z-index:99000;
        align-items:center; justify-content:center; padding:16px;
      }
      .pf-modal.is-open { display:flex; animation:pfIn .22s ease; }
      @keyframes pfIn { from{opacity:0} to{opacity:1} }

      .pf-modal__backdrop {
        position:absolute; inset:0;
        background:rgba(0,0,0,.92);
        backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px);
        cursor:zoom-out;
      }
      .pf-modal__card {
        position:relative; z-index:1;
        display:flex; flex-direction:column;
        width:min(96vw,1280px); max-height:94vh;
        border-radius:14px; overflow:hidden;
        border:1px solid rgba(255,255,255,.12);
        box-shadow:0 40px 120px rgba(0,0,0,.9);
        background:#0c0c0c;
        animation:pfSlide .28s cubic-bezier(.4,0,.2,1);
      }
      @keyframes pfSlide {
        from{transform:translateY(16px) scale(.97);opacity:0}
        to{transform:none;opacity:1}
      }
      .pf-modal__bar {
        display:flex; align-items:center; gap:6px;
        padding:9px 12px; flex-shrink:0;
        background:rgba(0,0,0,.7);
        border-bottom:1px solid rgba(255,255,255,.07);
        user-select:none;
      }
      .pf-bar-hint {
        font-size:11px; color:rgba(255,255,255,.28);
        font-family:'Space Mono',monospace;
        margin-right:auto; display:none;
      }
      @media(min-width:640px){ .pf-bar-hint{display:block} }
      .pf-btn {
        width:32px; height:32px; border-radius:8px;
        border:1px solid rgba(255,255,255,.16);
        background:rgba(255,255,255,.06);
        color:rgba(255,255,255,.82);
        font-size:18px; line-height:1; cursor:pointer;
        display:flex; align-items:center; justify-content:center;
        transition:background .15s,border-color .15s,transform .1s;
        flex-shrink:0;
      }
      .pf-btn:hover{background:rgba(255,255,255,.14);border-color:rgba(255,255,255,.32);transform:scale(1.08)}
      .pf-btn:active{transform:scale(.94)}
      .pf-btn--close:hover{background:rgba(255,50,50,.22);border-color:rgba(255,50,50,.45)}
      .pf-zoom-val {
        font-family:'Space Mono',monospace; font-size:12px;
        color:rgba(255,255,255,.5); min-width:46px; text-align:center;
      }
      .pf-modal__vp {
        flex:1; min-height:0; overflow:hidden; position:relative;
        display:flex; align-items:center; justify-content:center;
        cursor:grab; background:#0c0c0c;
      }
      .pf-modal__vp.dragging{cursor:grabbing}
      .pf-modal__img {
        display:block; max-width:100%; max-height:100%;
        width:auto; height:auto; object-fit:contain;
        transform-origin:center center;
        transition:transform .12s ease;
        user-select:none; pointer-events:none;
      }
      .pf-modal__img.ntrans{transition:none!important}
      .pf-modal__vp::before {
        content:''; position:absolute;
        width:32px; height:32px; border-radius:50%;
        border:2px solid rgba(255,255,255,.12);
        border-top-color:rgba(255,255,255,.6);
        animation:pfSpin .7s linear infinite;
        opacity:0; transition:opacity .2s; pointer-events:none;
      }
      .pf-modal__vp.loading::before{opacity:1}
      @keyframes pfSpin{to{transform:rotate(360deg)}}
    `;
    document.head.appendChild(css);
  }

  /* ── Модал — вставляем один раз, ОТКЛЮЧАЯ observer на время вставки ── */
  if (!document.getElementById('pfModal')) {
    /* Временно отключаем observer перед вставкой */
    _observing = false;
    document.body.insertAdjacentHTML('beforeend', `
      <div class="pf-modal" id="pfModal" aria-hidden="true" role="dialog" aria-modal="true">
        <div class="pf-modal__backdrop" id="pfBackdrop"></div>
        <div class="pf-modal__card">
          <div class="pf-modal__bar">
            <span class="pf-bar-hint">scroll to zoom · drag to pan · dblclick to reset</span>
            <button class="pf-btn" id="pfZoomOut" title="Zoom out (-)">−</button>
            <span   class="pf-zoom-val" id="pfZoomVal">100%</span>
            <button class="pf-btn" id="pfZoomIn"  title="Zoom in (+)">+</button>
            <button class="pf-btn" id="pfReset"   title="Reset (0)">⊡</button>
            <button class="pf-btn pf-btn--close" id="pfClose" aria-label="Close (Esc)">✕</button>
          </div>
          <div class="pf-modal__vp" id="pfVp">
            <img class="pf-modal__img" id="pfImg" src="" alt="Preview" draggable="false">
          </div>
        </div>
      </div>
    `);
    _observing = true;
  }

  /* ── DOM refs ── */
  const modal    = document.getElementById('pfModal');
  const img      = document.getElementById('pfImg');
  const vp       = document.getElementById('pfVp');
  const backdrop = document.getElementById('pfBackdrop');
  const closeBtn = document.getElementById('pfClose');
  const zoomInB  = document.getElementById('pfZoomIn');
  const zoomOutB = document.getElementById('pfZoomOut');
  const resetB   = document.getElementById('pfReset');
  const zoomLbl  = document.getElementById('pfZoomVal');

  /* ── Zoom state ── */
  let sc = 1, tx = 0, ty = 0;
  const MIN = 0.4, MAX = 8, STEP = 0.35;

  function clamp(v, a, b) { return Math.min(Math.max(v, a), b); }

  function apply(anim) {
    if (anim === false) img.classList.add('ntrans');
    img.style.transform = `translate(${tx}px,${ty}px) scale(${sc})`;
    zoomLbl.textContent = Math.round(sc * 100) + '%';
    if (anim === false) requestAnimationFrame(() => img.classList.remove('ntrans'));
  }

  function zoom(newSc, cx, cy) {
    const r  = vp.getBoundingClientRect();
    const ox = cx !== undefined ? cx - r.left : r.width  / 2;
    const oy = cy !== undefined ? cy - r.top  : r.height / 2;
    const f  = clamp(newSc, MIN, MAX) / sc;
    tx = ox + (tx - ox) * f;
    ty = oy + (ty - oy) * f;
    sc = clamp(newSc, MIN, MAX);
    apply();
  }

  function reset() { sc = 1; tx = 0; ty = 0; apply(); }

  /* ── Buttons ── */
  zoomInB.onclick  = () => zoom(sc + STEP);
  zoomOutB.onclick = () => zoom(sc - STEP);
  resetB.onclick   = reset;

  /* ── Wheel ── */
  vp.addEventListener('wheel', e => {
    e.preventDefault();
    zoom(sc + (e.deltaY < 0 ? STEP : -STEP), e.clientX, e.clientY);
  }, { passive: false });

  /* ── Double click ── */
  vp.addEventListener('dblclick', e => {
    sc > 1.2 ? reset() : zoom(2.8, e.clientX, e.clientY);
  });

  /* ── Mouse drag ── */
  let drag = false, dsx = 0, dsy = 0, dtx = 0, dty = 0;
  vp.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    drag = true; dsx = e.clientX; dsy = e.clientY; dtx = tx; dty = ty;
    vp.classList.add('dragging'); e.preventDefault();
  });
  window.addEventListener('mousemove', e => {
    if (!drag) return;
    tx = dtx + e.clientX - dsx;
    ty = dty + e.clientY - dsy;
    apply(false);
  });
  window.addEventListener('mouseup', () => { drag = false; vp.classList.remove('dragging'); });

  /* ── Touch pinch + drag ── */
  let ptd = null, tdt = { x:0, y:0 }, tt = { x:0, y:0 };

  function tdist(t) { return Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY); }
  function tmid(t)  { return { x:(t[0].clientX + t[1].clientX)/2, y:(t[0].clientY + t[1].clientY)/2 }; }

  vp.addEventListener('touchstart', e => {
    if (e.touches.length === 2) {
      ptd = tdist(e.touches);
    } else {
      tdt = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      tt  = { x: tx, y: ty };
    }
  }, { passive: true });

  vp.addEventListener('touchmove', e => {
    if (e.touches.length === 2) {
      e.preventDefault();
      const d = tdist(e.touches), m = tmid(e.touches);
      if (ptd) zoom(sc * (d / ptd), m.x, m.y);
      ptd = d;
    } else if (e.touches.length === 1 && sc > 1) {
      e.preventDefault();
      tx = tt.x + e.touches[0].clientX - tdt.x;
      ty = tt.y + e.touches[0].clientY - tdt.y;
      apply(false);
    }
  }, { passive: false });

  vp.addEventListener('touchend', () => { ptd = null; });

  /* ── Open / Close ── */
  function open(src, alt) {
    reset();
    vp.classList.add('loading');
    img.src = '';
    img.alt = alt || '';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    img.onload  = () => vp.classList.remove('loading');
    img.onerror = () => vp.classList.remove('loading');
    img.src = src;
    closeBtn.focus();
  }

  function close() {
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    setTimeout(() => { img.src = ''; reset(); }, 280);
  }

  /* ── Bind .pf cards ── */
  function bindCards() {
    /* Ищем только те карточки что ещё не привязаны */
    document.querySelectorAll('.pf:not([data-pf-bound])').forEach(card => {
      card.setAttribute('data-pf-bound', '1');
      card.addEventListener('click', () => {
        const i = card.querySelector('img');
        if (i && i.src) open(i.src, i.alt);
      });
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
      });
    });
  }

  /* ── Close handlers ── */
  backdrop.addEventListener('click', close);
  closeBtn.addEventListener('click', close);
  document.addEventListener('keydown', e => {
    if (!modal.classList.contains('is-open')) return;
    if (e.key === 'Escape') close();
    if (e.key === '+' || e.key === '=') zoom(sc + STEP);
    if (e.key === '-') zoom(sc - STEP);
    if (e.key === '0') reset();
  });

  /* ── Первичная привязка ── */
  bindCards();

  /* ── MutationObserver — БЕЗОПАСНЫЙ вариант ──
     _observing флаг предотвращает рекурсию:
     когда сам project-frames.js вставляет модал — observer не срабатывает.
     Throttle через requestAnimationFrame — не вызывает bindCards 100 раз подряд.
  ── */
  var _observing = true;
  var _rafPending = false;

  var observer = new MutationObserver(function(mutations) {
    /* Пропускаем если observer временно отключён */
    if (!_observing) return;

    /* Проверяем — есть ли среди добавленных нод хоть одна .pf без data-pf-bound */
    var hasNewCards = false;
    for (var i = 0; i < mutations.length; i++) {
      var nodes = mutations[i].addedNodes;
      for (var j = 0; j < nodes.length; j++) {
        var n = nodes[j];
        if (n.nodeType !== 1) continue;
        /* Сам модал — игнорируем */
        if (n.id === 'pfModal' || n.id === 'pf-styles') continue;
        /* Ищем .pf внутри добавленного элемента */
        if (n.classList && n.classList.contains('pf') && !n.dataset.pfBound) {
          hasNewCards = true; break;
        }
        if (n.querySelector && n.querySelector('.pf:not([data-pf-bound])')) {
          hasNewCards = true; break;
        }
      }
      if (hasNewCards) break;
    }

    if (!hasNewCards) return;

    /* Throttle через rAF — вызываем bindCards максимум 1 раз за кадр */
    if (_rafPending) return;
    _rafPending = true;
    requestAnimationFrame(function() {
      _rafPending = false;
      bindCards();
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  /* ── Публичный API ── */
  window.projectFrames = { open, close, rebind: bindCards, zoom, reset };

})();