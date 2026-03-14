/* ============================================================
   projects.js — ЕДИНЫЙ источник всех проектов
   /assets/js/projects.js
============================================================ */

const PROJECTS = [
  {
    id:       1,
    title:    "CLM\nMafia Platform",
    category: "UI UX Redesign",
    filter:   "ui-ux",
    type:     "Case Study",
    year:     "2024",
    desc:     "Full redesign of Mafia platform with ratings, tournaments, clubs and admin panel.",
    tags:     ["Figma", "Design System", "Case Study"],
    listTags: ["UI UX", "Redesign"],
    href:     "portfolio/clm.html",
    bg:       "wbg7",
    featured: true,
  },
  {
    id:       2,
    title:    "Unnie Box\nLanding Page",
    category: "UI Web Design",
    filter:   "web",
    type:     "UI Design",
    year:     "2024",
    desc:     "Korean beauty subscription box landing page focused on trust, conversion, and delight.",
    tags:     ["Figma", "UI Kit", "Landing"],
    listTags: ["Web", "Landing"],
    href:     "portfolio/unnie-box.html",
    bg:       "wbg1",
    featured: true,
  },
  {
    id:       3,
    title:    "Avion\nFurniture Platform",
    category: "UI Web Design",
    filter:   "web",
    type:     "UI Design",
    year:     "2024",
    desc:     "A modern furniture ecommerce platform focused on clean UI and a premium shopping experience.",
    tags:     ["Figma", "UI Kit", "E-commerce"],
    listTags: ["Web", "E-commerce"],
    href:     "portfolio/avion.html",
    bg:       "wbg6",
    featured: true,
  },
  {
    id:       4,
    title:    "MSCHF\nPlatform",
    category: "UI Web Design",
    filter:   "web",
    type:     "UI Design",
    year:     "2024",
    desc:     "Full redesign concept for MSCHF — the internet's most chaotic drop-culture brand. Bold yellow/black editorial system.",
    tags:     ["Figma", "Drop Culture", "Brand System"],
    listTags: ["Web", "Brand"],
    href:     "portfolio/mschf.html",
    bg:       "wbg-mschf",
    featured: true,
  },
];


/* ─────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────── */
const pad = n => String(n).padStart(2, '0');

function cardHTML(p, i) {
  const num       = pad(i + 1);
  const titleHtml = p.title.replace('\n', '<br>');
  const tagsHtml  = p.tags.map(t => `<span>${t}</span>`).join('');

  return `
  <article class="wcard" data-href="${p.href}" data-cat="${p.filter}">
    <div class="wcard-bg ${p.bg}">
      <div class="wcard-mock">
        <div class="wmock-bar"><span></span><span></span><span></span></div>
        <div class="wmock-body">
          <div class="ml a"></div><div class="ml l"></div>
          <div class="ml m"></div><div class="ml s"></div>
        </div>
      </div>
    </div>
    <div class="wcard-veil"></div>
    <div class="wcard-num">${num}</div>
    <footer class="wcard-foot">
      <div class="wcard-cat">${p.category}</div>
      <h3 class="wcard-title">${titleHtml}</h3>
    </footer>
    <div class="wcard-reveal">
      <p>${p.desc}</p>
      <div class="rtags">${tagsHtml}</div>
      <div class="rlink">Open case study
        <div class="rarrow">
          <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 17L17 7M17 7H7M17 7v10"/>
          </svg>
        </div>
      </div>
    </div>
  </article>`;
}

function listItemHTML(p, i) {
  const num      = pad(i + 1);
  const listTags = p.listTags.map(t => `<span>${t}</span>`).join('');
  return `
  <a class="gl-item" href="${p.href}" data-cat="${p.filter}">
    <span class="gl-item-num">${num}</span>
    <div class="gl-item-info">
      <div class="gl-item-tags">${listTags}</div>
      <h3>${p.title.replace('\n', ' ')}</h3>
    </div>
    <span class="gl-item-type">${p.type}</span>
    <span class="gl-item-year">${p.year}</span>
    <div class="gl-item-arrow">
      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 17L17 7M17 7H7M17 7v10"/>
      </svg>
    </div>
  </a>`;
}

function bindCardClicks(container) {
  container.querySelectorAll('.wcard[data-href]').forEach(card => {
    card.addEventListener('click', () => {
      window.location.href = card.dataset.href;
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   ГЛАВНАЯ — #wTrack
───────────────────────────────────────────────────────────── */
function buildHomeCards() {
  const track   = document.getElementById('wTrack');
  const totalEl = document.getElementById('wTotal');
  if (!track) return;

  const items = PROJECTS.filter(p => p.featured);
  track.innerHTML = items.map((p, i) => cardHTML(p, i)).join('');
  if (totalEl) totalEl.textContent = pad(items.length);
  bindCardClicks(track);
}


/* ─────────────────────────────────────────────────────────────
   ГАЛЕРЕЯ — #glTrack + #glList
───────────────────────────────────────────────────────────── */
function buildGallery() {
  const track   = document.getElementById('glTrack');
  const list    = document.getElementById('glList');
  const countEl = document.getElementById('glCount');
  const heroN   = document.querySelector('.gl-count-n');
  if (!track && !list) return;

  if (track) {
    track.innerHTML = PROJECTS.map((p, i) => cardHTML(p, i)).join('');
    bindCardClicks(track);
  }
  if (list) {
    list.innerHTML = PROJECTS.map((p, i) => listItemHTML(p, i)).join('');
  }

  const total = PROJECTS.length;
  if (countEl) countEl.textContent = total;
  if (heroN)   heroN.textContent   = pad(total);

  /* ── Фильтры ── */
  document.querySelectorAll('.gl-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.gl-filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;

      if (track) {
        track.querySelectorAll('.wcard').forEach(card => {
          card.style.display = (filter === 'all' || card.dataset.cat === filter) ? '' : 'none';
        });
      }
      if (list) {
        list.querySelectorAll('.gl-item').forEach(item => {
          item.style.display = (filter === 'all' || item.dataset.cat === filter) ? '' : 'none';
        });
      }
      const visible = filter === 'all'
        ? PROJECTS.length
        : PROJECTS.filter(p => p.filter === filter).length;
      if (countEl) countEl.textContent = visible;
    });
  });
}


/* ─────────────────────────────────────────────────────────────
   ЗАПУСК
───────────────────────────────────────────────────────────── */
function initProjects() {
  buildHomeCards();
  buildGallery();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProjects);
} else {
  initProjects();
}