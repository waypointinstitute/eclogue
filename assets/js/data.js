document.addEventListener('DOMContentLoaded', () => {
  hydrateTestimonials();
  hydrateFaqs();
});

async function hydrateTestimonials() {
  const container = document.querySelector('[data-testimonials]');
  if (!container) return;
  try {
    const response = await fetch('assets/data/testimonials.json');
    if (!response.ok) throw new Error('Failed to load testimonials');
    const testimonials = await response.json();
    const track = container.querySelector('.testimonials__track');
    track.innerHTML = testimonials.map((item) => `
      <figure class="testimonial reveal">
        <blockquote>“${item.text}”</blockquote>
        <figcaption>— ${item.name}</figcaption>
      </figure>
    `).join('');
    document.dispatchEvent(new Event('testimonials:updated'));
    document.dispatchEvent(new Event('reveal:refresh'));
  } catch (error) {
    console.error(error);
    container.setAttribute('hidden', 'true');
  }
}

async function hydrateFaqs() {
  const container = document.querySelector('[data-faq]');
  if (!container) return;
  try {
    const response = await fetch('assets/data/faqs.json');
    if (!response.ok) throw new Error('Failed to load faqs');
    const faqs = await response.json();
    container.innerHTML = faqs.map((item, index) => `
      <details id="faq-${index}" class="reveal">
        <summary>${item.q}</summary>
        <p>${item.a}</p>
      </details>
    `).join('');
    document.dispatchEvent(new Event('reveal:refresh'));
  } catch (error) {
    console.error(error);
    container.setAttribute('hidden', 'true');
  }
}
