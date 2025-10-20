const header = document.querySelector('.site-header');
let lastScroll = 0;
let headerIsCompact = false;
let headerTicking = false;

if (header) {
  const updateHeader = () => {
    const y = window.scrollY || window.pageYOffset;
    const diff = y - lastScroll;
    let nextCompact = headerIsCompact;

    if (y <= 120) {
      nextCompact = false;
    } else if (diff > 6) {
      nextCompact = true;
    } else if (diff < -6) {
      nextCompact = false;
    }

    if (nextCompact !== headerIsCompact) {
      header.classList.toggle('is-compact', nextCompact);
      headerIsCompact = nextCompact;
    }

    lastScroll = y;
    headerTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (!headerTicking) {
      window.requestAnimationFrame(updateHeader);
      headerTicking = true;
    }
  }, { passive: true });

  updateHeader();
}

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let revealObserver = null;

if (!prefersReduced && 'IntersectionObserver' in window) {
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('reveal-in', entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  const observeAll = () => document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  observeAll();
  document.addEventListener('reveal:refresh', observeAll);
}

declareParallax();
initMobileNav();
autoScrollLinks();
enhanceBeforeAfter();
document.addEventListener('beforeAfter:refresh', enhanceBeforeAfter);

function declareParallax() {
  const hero = document.querySelector('[data-parallax]');
  if (!hero || prefersReduced) return;

  let rafId = null;

  const update = () => {
    hero.style.backgroundPositionY = `${Math.round((window.scrollY || 0) * 0.25)}px`;
    rafId = null;
  };

  window.addEventListener('scroll', () => {
    if (rafId !== null) return;
    rafId = window.requestAnimationFrame(update);
  }, { passive: true });

  update();
}

function initMobileNav() {
  const toggle = document.querySelector('.mobile-toggle');
  const nav = document.querySelector("nav[aria-label='Primary']");
  if (!toggle || !nav) return;

  let focusable = [];
  let previousActive = null;

  const trap = (event) => {
    if (event.key !== 'Tab') return;
    focusable = nav.querySelectorAll('a, button');
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  };

@@ -88,93 +124,123 @@ function initMobileNav() {
      closeNav();
    }
  });
}

function autoScrollLinks() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (event) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;
      event.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
    });
  });
}

function enhanceBeforeAfter() {
  document.querySelectorAll('.before-after:not([data-dynamic])').forEach((wrapper) => {
    if (wrapper.dataset.enhanced === 'true') return;
    const afterLayer = wrapper.querySelector('.before-after__after');
    const handle = wrapper.querySelector('.before-after__handle');
    if (!afterLayer || !handle) return;
    wrapper.dataset.enhanced = 'true';
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
  });
}

// Testimonials slider autoplay
const testimonialTrack = document.querySelector('.testimonials__track');
if (testimonialTrack) {
  let index = 0;
  let timer = null;

  const cards = () => Array.from(testimonialTrack.children);

  const setSlide = (nextIndex) => {
    const items = cards();
    if (!items.length) return;
    index = (nextIndex + items.length) % items.length;
    const cardWidth = items[0].getBoundingClientRect().width + 24;
    testimonialTrack.style.transform = `translateX(-${index * cardWidth}px)`;
  };

  const stop = () => {
    if (timer) window.clearInterval(timer);
    timer = null;
  };

  const play = () => {
    stop();
    if (!cards().length) return;
    timer = window.setInterval(() => setSlide(index + 1), 5500);
  };

  const initSlider = () => {
    if (!cards().length) return;
    setSlide(0);
    play();
  };

  testimonialTrack.addEventListener('mouseenter', stop);
  testimonialTrack.addEventListener('mouseleave', play);
  testimonialTrack.addEventListener('touchstart', stop, { passive: true });
  testimonialTrack.addEventListener('touchend', play);
  window.addEventListener('resize', () => setSlide(index));
  document.addEventListener('testimonials:updated', () => {
    index = 0;
    setSlide(0);
    play();
  });

  initSlider();
}

// FAQ hash toggling support
if (window.location.hash) {
  const openDetail = document.querySelector(window.location.hash);
  if (openDetail instanceof HTMLDetailsElement) {
    openDetail.open = true;
    openDetail.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth' });
  }
}
