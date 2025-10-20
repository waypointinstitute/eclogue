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
  document.documentElement.classList.add('supports-reveal');

  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      entry.target.classList.toggle('reveal-in', entry.isIntersecting);
    });
  }, { threshold: 0.1 });

  const observeAll = () => document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));
  observeAll();
  document.addEventListener('reveal:refresh', observeAll);
} else {
  const showAll = () => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('reveal-in'));
  showAll();
  document.addEventListener('reveal:refresh', showAll);
}

declareParallax();
initMobileNav();
autoScrollLinks();
enhanceBeforeAfter();
document.addEventListener('beforeAfter:refresh', enhanceBeforeAfter);
initHeroRotator();

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

  const mq = window.matchMedia('(max-width: 720px)');
  let previousActive = null;

  const handleKeydown = (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeNav();
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = Array.from(nav.querySelectorAll('a, button'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const closeNav = (restoreFocus = true) => {
    const wasOpen = nav.classList.contains('is-open');
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.classList.remove('is-active');
    document.body.classList.remove('nav-open');
    document.removeEventListener('keydown', handleKeydown);
    if (restoreFocus && wasOpen && previousActive instanceof HTMLElement) {
      previousActive.focus();
    }
    previousActive = null;
  };

  const openNav = () => {
    nav.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.classList.add('is-active');
    previousActive = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.classList.add('nav-open');
    document.addEventListener('keydown', handleKeydown);
    const firstLink = nav.querySelector('a');
    firstLink?.focus();
  };

  toggle.addEventListener('click', () => {
    if (nav.classList.contains('is-open')) {
      closeNav();
    } else {
      openNav();
    }
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
      closeNav(false);
    }
  });

  const syncToggle = (event) => {
    const matches = event?.matches ?? mq.matches;
    toggle.hidden = !matches;
    if (!matches) {
      closeNav(false);
    }
  };

  syncToggle();
  if (typeof mq.addEventListener === 'function') {
    mq.addEventListener('change', syncToggle);
  } else if (typeof mq.addListener === 'function') {
    mq.addListener(syncToggle);
  }
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
    if (typeof CSS !== 'undefined' && typeof CSS.supports === 'function' && !CSS.supports('clip-path', 'inset(0 0 0 50%)')) {
      afterLayer.style.clipPath = 'none';
      handle.style.display = 'none';
      wrapper.dataset.enhanced = 'true';
      return;
    }
    wrapper.dataset.enhanced = 'true';
    afterLayer.style.clipPath = 'inset(0 0 0 50%)';
    handle.setAttribute('role', 'slider');
    handle.setAttribute('aria-label', 'Reveal comparison');
    handle.setAttribute('aria-valuemin', '0');
    handle.setAttribute('aria-valuemax', '100');
    handle.setAttribute('aria-valuenow', '50');
    handle.tabIndex = 0;

    let percent = 50;
    let rafId = null;
    let pendingPercent = null;
    let activePointer = null;

    const setPercent = (nextPercent) => {
      percent = Math.min(Math.max(nextPercent, 0), 100);
      afterLayer.style.clipPath = `inset(0 0 0 ${percent}%)`;
      handle.style.left = `${percent}%`;
      handle.setAttribute('aria-valuenow', String(Math.round(percent)));
    };

    const schedulePercent = (nextPercent) => {
      pendingPercent = nextPercent;
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        if (pendingPercent !== null) {
          setPercent(pendingPercent);
          pendingPercent = null;
        }
        rafId = null;
      });
    };

    const updateFromClientX = (clientX) => {
      const bounds = wrapper.getBoundingClientRect();
      if (!bounds.width) return;
      const x = Math.min(Math.max(clientX - bounds.left, 0), bounds.width);
      const next = (x / bounds.width) * 100;
      schedulePercent(next);
    };

    const stopPointer = () => {
      if (activePointer === null) return;
      if (wrapper.hasPointerCapture?.(activePointer)) {
        wrapper.releasePointerCapture(activePointer);
      }
      activePointer = null;
      handle.classList.remove('is-active');
    };

    const startPointer = (event) => {
      if (event.button !== undefined && event.button !== 0) return;
      activePointer = event.pointerId;
      wrapper.setPointerCapture?.(activePointer);
      handle.classList.add('is-active');
      if (typeof handle.focus === 'function') {
        handle.focus({ preventScroll: true });
      }
      updateFromClientX(event.clientX);
    };

    const movePointer = (event) => {
      if (activePointer !== event.pointerId) return;
      updateFromClientX(event.clientX);
    };

    wrapper.style.touchAction = 'pan-y';
    wrapper.addEventListener('pointerdown', startPointer);
    wrapper.addEventListener('pointermove', movePointer);
    wrapper.addEventListener('pointerup', stopPointer);
    wrapper.addEventListener('pointercancel', stopPointer);

    wrapper.addEventListener('click', (event) => {
      if (event.target.closest('.before-after__handle')) return;
      updateFromClientX(event.clientX);
    });

    handle.addEventListener('keydown', (event) => {
      const step = event.shiftKey ? 10 : 5;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
        event.preventDefault();
        setPercent(percent - step);
      } else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
        event.preventDefault();
        setPercent(percent + step);
      } else if (event.key === 'Home') {
        event.preventDefault();
        setPercent(0);
      } else if (event.key === 'End') {
        event.preventDefault();
        setPercent(100);
      }
    });

    const init = () => {
      const bounds = wrapper.getBoundingClientRect();
      if (bounds.width > 0) {
        setPercent(percent);
      } else {
        window.requestAnimationFrame(init);
      }
    };
    window.requestAnimationFrame(init);

    if ('ResizeObserver' in window) {
      const resizeObserver = new ResizeObserver(() => {
        setPercent(percent);
      });
      resizeObserver.observe(wrapper);
    } else {
      window.addEventListener('resize', () => {
        setPercent(percent);
      });
    }
  });
}

function initHeroRotator() {
  if (prefersReduced) return;
  const sections = document.querySelectorAll('[data-hero-rotator]');
  sections.forEach((section) => {
    const slides = Array.from(section.querySelectorAll('[data-hero-slide]'));
    if (slides.length <= 1) return;

    let index = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (index < 0) index = 0;

    const setActive = (nextIndex) => {
      slides[index]?.classList.remove('is-active');
      index = (nextIndex + slides.length) % slides.length;
      slides[index]?.classList.add('is-active');
    };

    let timer = null;

    const stop = () => {
      if (timer) window.clearInterval(timer);
      timer = null;
    };

    const play = () => {
      stop();
      timer = window.setInterval(() => setActive(index + 1), 6000);
    };

    slides.forEach((slide) => {
      slide.addEventListener('mouseenter', stop);
      slide.addEventListener('mouseleave', play);
      slide.addEventListener('touchstart', stop, { passive: true });
      slide.addEventListener('touchend', play);
    });

    section.addEventListener('mouseenter', stop);
    section.addEventListener('mouseleave', play);
    section.addEventListener('touchstart', stop, { passive: true });
    section.addEventListener('touchend', play);

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        stop();
      } else {
        play();
      }
    });

    setActive(index);
    play();
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
