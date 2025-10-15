document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    importDataAndRender();
  }
});

let cachedProjects = [];

async function importDataAndRender() {
  const gallery = document.getElementById('gallery');
  const source = gallery?.dataset.source;
  if (!source) return;
  try {
    const response = await fetch(source);
    if (!response.ok) throw new Error('Unable to load projects');
    cachedProjects = await response.json();
    const tags = [...new Set(cachedProjects.flatMap((p) => p.tags))];
    renderFilters(tags);
    renderGrid(cachedProjects);
    hookFilter(tags, cachedProjects);
  } catch (error) {
    console.error(error);
    gallery.innerHTML = '<p role="status">Projects will be published soon.</p>';
  }
}

function renderFilters(tags) {
  const el = document.getElementById('filters');
  if (!el) return;
  el.innerHTML = ['All', ...tags].map((tag, index) => `
    <button class="chip${index === 0 ? ' active' : ''}" data-tag="${tag}">
      ${tag}
    </button>
  `).join('');
}

function renderGrid(items) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  gallery.innerHTML = items.map((project) => `
    <article class="card reveal" data-tags="${project.tags.join(',')}">
      <img loading="lazy" src="${project.thumb}" alt="${project.title}">
      <div class="card__body">
        <h3>${project.title}</h3>
        <p>${project.summary ?? ''}</p>
        <button class="btn btn-ghost" data-id="${project.id}" aria-label="Open ${project.title} gallery">View</button>
      </div>
    </article>
  `).join('');

  gallery.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', openLightbox);
  });
  document.dispatchEvent(new Event('reveal:refresh'));
}

function hookFilter(tags, projects) {
  const filterRoot = document.getElementById('filters');
  if (!filterRoot) return;
  filterRoot.addEventListener('click', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLButtonElement) || !target.dataset.tag) return;
    filterRoot.querySelectorAll('.chip').forEach((chip) => chip.classList.remove('active'));
    target.classList.add('active');
    const selected = target.dataset.tag;
    const filtered = selected === 'All' ? projects : projects.filter((p) => p.tags.includes(selected));
    renderGrid(filtered);
  });
}

const lightbox = createLightbox();

function openLightbox(event) {
  const button = event.currentTarget;
  if (!(button instanceof HTMLElement)) return;
  const projectId = button.dataset.id;
  if (!projectId) return;
  const project = cachedProjects.find((item) => item.id === projectId);
  if (!project) return;
  populateLightbox(project);
  lightbox.hidden = false;
  document.body.style.overflow = 'hidden';
  lightbox.querySelector('button.close')?.focus();
}

function createLightbox() {
  const overlay = document.createElement('aside');
  overlay.className = 'lightbox';
  overlay.hidden = true;
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.innerHTML = `
    <div class="lightbox__content">
      <button class="close" type="button" aria-label="Close project">×</button>
      <h2 class="lightbox__title"></h2>
      <p class="lightbox__summary"></p>
      <div class="lightbox__gallery"></div>
    </div>
  `;
  document.body.appendChild(overlay);

  overlay.addEventListener('click', (event) => {
    if (event.target === overlay) {
      closeLightbox();
    }
  });

  overlay.querySelector('button.close')?.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !overlay.hidden) {
      closeLightbox();
    }
  });

  return overlay;
}

function populateLightbox(project) {
  const title = lightbox.querySelector('.lightbox__title');
  const summary = lightbox.querySelector('.lightbox__summary');
  const gallery = lightbox.querySelector('.lightbox__gallery');
  if (!title || !summary || !gallery) return;

  title.textContent = project.title;
  summary.textContent = project.summary ?? '';
  gallery.innerHTML = '';

  const beforeAfter = project.beforeAfter;
  if (beforeAfter?.before && beforeAfter?.after) {
    gallery.appendChild(createBeforeAfter(beforeAfter.before, beforeAfter.after));
  }

  (project.images ?? []).forEach((src) => {
    const img = document.createElement('img');
    img.loading = 'lazy';
    img.src = src;
    img.alt = `${project.title} detail`;
    gallery.appendChild(img);
  });
}

function createBeforeAfter(beforeSrc, afterSrc) {
  const wrapper = document.createElement('div');
  wrapper.className = 'before-after';
  wrapper.dataset.dynamic = 'true';
  wrapper.innerHTML = `
    <img src="${beforeSrc}" alt="Before construction">
    <div class="before-after__after">
      <img src="${afterSrc}" alt="After construction">
    </div>
    <div class="before-after__slider" aria-hidden="true">
      <div class="before-after__handle" style="left: 50%">
        <div class="before-after__knob"></div>
      </div>
    </div>
  `;

  const afterLayer = wrapper.querySelector('.before-after__after');
  const handle = wrapper.querySelector('.before-after__handle');
  if (!afterLayer || !handle) return wrapper;
  afterLayer.style.clipPath = 'inset(0 0 0 50%)';
  const setPosition = (clientX) => {
    const bounds = wrapper.getBoundingClientRect();
    if (!bounds.width) return;
    const x = Math.min(Math.max(clientX - bounds.left, 0), bounds.width);
    const percent = (x / bounds.width) * 100;
    afterLayer.style.clipPath = `inset(0 0 0 ${percent}%)`;
    handle.style.left = `${percent}%`;
  };

  wrapper.style.touchAction = 'none';
  let activePointer = null;

  wrapper.addEventListener('pointerdown', (event) => {
    activePointer = event.pointerId;
    wrapper.setPointerCapture(activePointer);
    setPosition(event.clientX);
  });

  wrapper.addEventListener('pointermove', (event) => {
    if (activePointer !== event.pointerId) return;
    setPosition(event.clientX);
  });

  const release = (event) => {
    if (activePointer !== event.pointerId) return;
    if (wrapper.hasPointerCapture(activePointer)) {
      wrapper.releasePointerCapture(activePointer);
    }
    activePointer = null;
  };

  wrapper.addEventListener('pointerup', release);
  wrapper.addEventListener('pointercancel', release);
  const init = () => {
    const bounds = wrapper.getBoundingClientRect();
    if (bounds.width > 0) {
      setPosition(bounds.left + bounds.width / 2);
    } else {
      window.requestAnimationFrame(init);
    }
  };
  window.requestAnimationFrame(init);
  return wrapper;
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}
