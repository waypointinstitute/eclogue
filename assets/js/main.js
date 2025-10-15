const header = document.querySelector('.site-header');
let lastScroll = 0;

if (header) {
  window.addEventListener('scroll', () => {
    const y = window.scrollY || window.pageYOffset;
    const goingDown = y > lastScroll;
    header.classList.toggle('is-compact', y > 80 && goingDown);
    lastScroll = y;
  }, { passive: true });
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

  window.addEventListener('scroll', () => {
    hero.style.backgroundPositionY = `${Math.round((window.scrollY || 0) * 0.25)}px`;
  }, { passive: true });
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

  const closeNav = () => {
    nav.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.removeEventListener('keydown', trap);
    if (previousActive) previousActive.focus();
  };

  toggle.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) {
      previousActive = document.activeElement;
      document.addEventListener('keydown', trap);
      const firstLink = nav.querySelector('a');
      firstLink?.focus();
    } else {
      closeNav();
    }
  });

  nav.addEventListener('click', (event) => {
    if (event.target instanceof HTMLAnchorElement) {
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
