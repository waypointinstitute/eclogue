---
layout: default
title: Books
permalink: /books/
---

<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16" style="background: var(--bg);">
  <h1 class="text-3xl md:text-4xl font-bold mb-8" style="font-family: var(--font-display); color: var(--text);">
    Our Books
  </h1>

  {%- if site.books and site.books != empty -%}
    {%- assign books_sorted = site.books | sort: "order" -%}
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {%- for b in books_sorted -%}
        {%- include book-card.html
          url=b.url
          title=b.title
          author=b.author
          blurb=b.blurb
          cover=b.cover
        -%}
      {%- endfor -%}
    </div>
  {%- else -%}
    <p style="color: var(--text-muted);">No books yet.</p>
  {%- endif -%}
</div>
