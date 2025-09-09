---
layout: default
title: Books
permalink: /books/
---

<div class="min-h-screen py-16" style="background-color: var(--bg);">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h1 class="text-4xl md:text-5xl font-bold mb-6"
          style="font-family: var(--font-display); color: var(--text);">
        Our Catalog
      </h1>
      <p class="text-lg max-w-2xl mx-auto"
         style="color: var(--text-muted);">
        Explore our curated collection of fantasy and science fiction.
      </p>
    </div>

    <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-10">
      {% assign sorted_books = site.books | sort: "-pub_date" %}
      {% for book in sorted_books %}
        {% include book_card.html book=book %}
      {% endfor %}
    </div>
  </div>
</div>
