document.addEventListener('DOMContentLoaded', () => {
  const gallery = document.getElementById('gallery');
  if (gallery) {
    importDataAndRender();
  }
});

let cachedProjects = [];

async function importDataAndRender() {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  const source = gallery.dataset.source;
  const inlineData = readInlineProjects();
  try {
    if (source) {
      const response = await fetch(source);
      if (!response.ok) throw new Error('Unable to load projects');
      cachedProjects = await response.json();
    }
  } catch (error) {
    console.warn('Project data request failed, using inline data if available.', error);
    cachedProjects = inlineData ?? [];
  }

  if (!cachedProjects.length && inlineData?.length) {
    cachedProjects = inlineData;
  }

  if (!cachedProjects.length) {
    gallery.innerHTML = '<p role="status">Projects will be published soon.</p>';
    return;
  }

  const tags = [...new Set(cachedProjects.flatMap((p) => p.tags ?? []))];
  renderFilters(tags);
  renderGrid(cachedProjects);
  hookFilter(tags, cachedProjects);
}

function readInlineProjects() {
  const script = document.getElementById('projects-data');
  if (!script) return null;
  try {
    const data = JSON.parse(script.textContent || '[]');
    if (Array.isArray(data)) return data;
    if (Array.isArray(data.projects)) return data.projects;
  } catch (error) {
    console.error('Inline projects data failed to parse', error);
  }
  return null;
}

function renderFilters(tags) {
  const el = document.getElementById('filters');
  if (!el) return;
  if (!tags.length) {
    if (!el.querySelector('.chip')) {
      el.innerHTML = '<span class="filters__empty">Project filters will appear as soon as new installs are published.</span>';
    }
    return;
  }

  const options = ['All', ...tags];
  const current = el.querySelector('.chip.active')?.dataset.tag ?? 'All';
  el.innerHTML = options.map((tag) => {
    const isActive = current === tag;
    return `
      <button class="chip${isActive ? ' active' : ''}" type="button" data-tag="${escapeAttr(tag)}">
        ${escapeHtml(tag)}
      </button>
    `;
  }).join('');
}

function renderGrid(items) {
  const gallery = document.getElementById('gallery');
  if (!gallery) return;
  if (!items.length) {
    gallery.innerHTML = '<p role="status">No projects match this filter yet.</p>';
    return;
  }

  const grouped = items.reduce((map, project) => {
    const category = project.category ?? 'Other Projects';
    if (!map.has(category)) {
      map.set(category, []);
    }
    map.get(category)?.push(project);
    return map;
  }, new Map());

  gallery.innerHTML = Array.from(grouped.entries()).map(([category, projects]) => `
    <section class="gallery__group">
      <h3 class="gallery__group-title">${category}</h3>
      <div class="gallery__group-grid">
        ${projects.map((project) => renderProjectCard(project)).join('')}
      </div>
    </section>
  `).join('');

  gallery.querySelectorAll('button[data-id]').forEach((button) => {
    button.addEventListener('click', openLightbox);
  });
  window.applyMediaFallbacks?.(gallery);
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
    const filtered = selected === 'All' ? projects : projects.filter((p) => (p.tags ?? []).includes(selected));
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
    gallery.appendChild(createBeforeAfter(beforeAfter.before, beforeAfter.after, project.placeholder));
  }

  (project.images ?? []).forEach((entry, index) => {
    const media = normalizeMediaEntry(entry);
    if (media.type === 'video') {
      const video = document.createElement('video');
      video.controls = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.setAttribute('title', `${project.title} installation video`);
      const source = document.createElement('source');
      source.src = media.src;
      source.type = media.mime;
      video.appendChild(source);
      gallery.appendChild(video);
    } else {
      const img = document.createElement('img');
      img.loading = 'lazy';
      img.decoding = 'async';
      setImageSource(img, media.source, media.placeholder ?? project.placeholder);
      img.alt = `${project.title} progress photo ${index + 1}`;
      gallery.appendChild(img);
    }
  });

  window.applyMediaFallbacks?.(gallery);
}

function createBeforeAfter(beforeSrc, afterSrc, fallback) {
  const wrapper = document.createElement('div');
  wrapper.className = 'before-after';
  wrapper.dataset.dynamic = 'true';

  const beforeImg = document.createElement('img');
  beforeImg.alt = 'Before construction';
  beforeImg.loading = 'lazy';
  beforeImg.decoding = 'async';
  setImageSource(beforeImg, beforeSrc, fallback);
  wrapper.appendChild(beforeImg);

  const afterContainer = document.createElement('div');
  afterContainer.className = 'before-after__after';
  const afterImg = document.createElement('img');
  afterImg.alt = 'After construction';
  afterImg.loading = 'lazy';
  afterImg.decoding = 'async';
  setImageSource(afterImg, afterSrc, fallback);
  afterContainer.appendChild(afterImg);
  wrapper.appendChild(afterContainer);

  const slider = document.createElement('div');
  slider.className = 'before-after__slider';
  slider.setAttribute('aria-hidden', 'true');
  const handleEl = document.createElement('div');
  handleEl.className = 'before-after__handle';
  handleEl.style.left = '50%';
  const knob = document.createElement('div');
  knob.className = 'before-after__knob';
  handleEl.appendChild(knob);
  slider.appendChild(handleEl);
  wrapper.appendChild(slider);

  const afterLayer = wrapper.querySelector('.before-after__after');
  const handle = wrapper.querySelector('.before-after__handle');
  if (!afterLayer || !handle) return wrapper;

  window.applyMediaFallbacks?.(wrapper);
  afterLayer.style.clipPath = 'inset(0 0 0 50%)';

  const applyPosition = (clientX) => {
    const bounds = wrapper.getBoundingClientRect();
    if (!bounds.width) return;
    const x = Math.min(Math.max(clientX - bounds.left, 0), bounds.width);
    const percent = (x / bounds.width) * 100;
    afterLayer.style.clipPath = `inset(0 0 0 ${percent}%)`;
    handle.style.left = `${percent}%`;
  };

  let rafId = null;
  let pendingX = null;

  const schedulePosition = (clientX) => {
    pendingX = clientX;
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(() => {
      if (pendingX !== null) {
        applyPosition(pendingX);
        pendingX = null;
      }
      rafId = null;
    });
  };

  wrapper.style.touchAction = 'none';
  let activePointer = null;

  wrapper.addEventListener('pointerdown', (event) => {
    activePointer = event.pointerId;
    wrapper.setPointerCapture(activePointer);
    schedulePosition(event.clientX);
  });

  wrapper.addEventListener('pointermove', (event) => {
    if (activePointer !== event.pointerId) return;
    schedulePosition(event.clientX);
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
      applyPosition(bounds.left + bounds.width / 2);
    } else {
      window.requestAnimationFrame(init);
    }
  };
  window.requestAnimationFrame(init);

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(() => {
      const bounds = wrapper.getBoundingClientRect();
      if (!bounds.width) return;
      applyPosition(bounds.left + bounds.width / 2);
    });
    resizeObserver.observe(wrapper);
  } else {
    window.addEventListener('resize', () => {
      const bounds = wrapper.getBoundingClientRect();
      if (!bounds.width) return;
      applyPosition(bounds.left + bounds.width / 2);
    });
  }
  return wrapper;
}

function closeLightbox() {
  lightbox.hidden = true;
  document.body.style.overflow = '';
}

function renderProjectCard(project) {
  const tags = escapeAttr((project.tags ?? []).join(','));
  const thumbMarkup = createImageMarkup(project.thumb, project.title, project.placeholder);
  const title = escapeHtml(project.title);
  const summary = escapeHtml(project.summary ?? '');
  return `
    <article class="card reveal" data-tags="${tags}">
      ${thumbMarkup}
      <div class="card__body">
        <h3>${title}</h3>
        <p>${summary}</p>
        <button class="btn btn-ghost" type="button" data-id="${escapeAttr(project.id)}" aria-label="Open ${escapeAttr(project.title)} gallery">View</button>
      </div>
    </article>
  `;
}

function createImageMarkup(source, alt, placeholder) {
  const data = normalizeImageSource(source, { placeholder });
  const attributes = [
    'loading="lazy"',
    'decoding="async"',
    `alt="${escapeAttr(alt)}"`
  ];

  if (data.src) {
    attributes.push(`src="${escapeAttr(data.src)}"`);
  } else if (data.placeholder) {
    attributes.push(`src="${escapeAttr(data.placeholder)}"`);
  } else {
    attributes.push('src=""');
  }

  if (data.fallback) {
    attributes.push(`data-fallback="${escapeAttr(data.fallback)}"`);
  }
  if (data.placeholder) {
    attributes.push(`data-placeholder="${escapeAttr(data.placeholder)}"`);
  }

  return `<img ${attributes.join(' ')}>`;
}

function setImageSource(img, source, placeholder) {
  if (!img) return;
  const data = normalizeImageSource(source, { placeholder });
  if (data.placeholder) {
    img.dataset.placeholder = data.placeholder;
  }
  if (data.fallback) {
    img.dataset.fallback = data.fallback;
  }

  if (data.src) {
    img.src = data.src;
    if (img.complete && !img.naturalWidth) {
      window.requestAnimationFrame(() => {
        if (!img.naturalWidth) {
          img.dispatchEvent(new Event('error'));
        }
      });
    }
  } else if (data.fallback) {
    img.src = data.fallback;
  } else if (data.placeholder) {
    img.src = data.placeholder;
  }
}

function normalizeImageSource(source, defaults = {}) {
  const fallbackValue = typeof defaults.fallback === 'string' ? defaults.fallback : null;
  const placeholderValue = typeof defaults.placeholder === 'string' ? defaults.placeholder : fallbackValue;

  if (!source) {
    return {
      src: null,
      fallback: fallbackValue,
      placeholder: placeholderValue
    };
  }

  if (typeof source === 'string') {
    return {
      src: source,
      fallback: fallbackValue,
      placeholder: placeholderValue
    };
  }

  if (typeof source === 'object') {
    return {
      src: source.src ?? source.jpeg ?? null,
      fallback: source.fallback ?? source.heic ?? fallbackValue,
      placeholder: source.placeholder ?? placeholderValue
    };
  }

  return {
    src: null,
    fallback: fallbackValue,
    placeholder: placeholderValue
  };
}

function normalizeMediaEntry(entry) {
  if (!entry) {
    return { type: 'image', source: null, placeholder: null };
  }

  if (typeof entry === 'string') {
    const lower = entry.toLowerCase();
    if (lower.endsWith('.mp4') || lower.endsWith('.webm')) {
      return {
        type: 'video',
        src: entry,
        mime: lower.endsWith('.webm') ? 'video/webm' : 'video/mp4',
        placeholder: null
      };
    }
    return { type: 'image', source: entry, placeholder: null };
  }

  if (typeof entry === 'object') {
    if (entry.type === 'video') {
      const videoSrc = entry.src ?? entry.url ?? '';
      const lower = typeof videoSrc === 'string' ? videoSrc.toLowerCase() : '';
      const mime = entry.mime ?? (lower.endsWith('.webm') ? 'video/webm' : 'video/mp4');
      return { type: 'video', src: videoSrc, mime, placeholder: entry.placeholder ?? null };
    }

    const src = entry.src ?? entry.jpeg ?? entry.url ?? '';
    const fallback = entry.fallback ?? entry.heic ?? null;
    const placeholder = entry.placeholder ?? null;
    const lower = typeof src === 'string' ? src.toLowerCase() : '';
    if (lower && (lower.endsWith('.mp4') || lower.endsWith('.webm'))) {
      return {
        type: 'video',
        src,
        mime: lower.endsWith('.webm') ? 'video/webm' : 'video/mp4',
        placeholder
      };
    }

    return {
      type: 'image',
      source: { src, fallback, placeholder },
      placeholder
    };
  }

  return { type: 'image', source: entry, placeholder: null };
}

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;');
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;');
}
