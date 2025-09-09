(function () {
  const $grid = document.getElementById('post-grid');
  const $no = document.getElementById('no-results');
  const $search = document.getElementById('post-search');
  const $tags = document.getElementById('tag-buttons');

  let activeTag = 'all';
  let term = '';

  function normalize(s) { return (s || '').toLowerCase(); }

  function matches(card) {
    // tag match
    const tags = card.dataset.tags || '';
    const tagOk = (activeTag === 'all') || tags.split(',').includes(activeTag);

    if (!tagOk) return false;

    // text match (title/excerpt/author inside the card)
    if (!term) return true;
    const text = normalize(card.innerText);
    return text.includes(term);
  }

  function applyFilter() {
    const cards = Array.from($grid.querySelectorAll('.post-card'));
    let visible = 0;

    cards.forEach(card => {
      if (matches(card)) {
        card.style.display = '';
        visible++;
      } else {
        card.style.display = 'none';
      }
    });

    $no.classList.toggle('hidden', visible !== 0);
  }

  // search
  $search.addEventListener('input', (e) => {
    term = normalize(e.target.value);
    applyFilter();
  });

  // tag buttons
  $tags.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-tag]');
    if (!btn) return;

    activeTag = btn.dataset.tag;

    // visual state
    for (const b of $tags.querySelectorAll('button[data-tag]')) {
      if (b.dataset.tag === activeTag) {
        b.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();
        b.style.color = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
        b.style.border = 'none';
      } else {
        b.style.backgroundColor = getComputedStyle(document.documentElement).getPropertyValue('--surface').trim();
        b.style.color = getComputedStyle(document.documentElement).getPropertyValue('--text').trim();
        b.style.border = `1px solid ${getComputedStyle(document.documentElement).getPropertyValue('--border').trim()}`;
      }
    }

    applyFilter();
  });

  // initial
  applyFilter();
})();
