---
layout: default
title: Books
permalink: /books/
---

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
  {% assign sorted_books = site.books | sort: "title" %}
  {% for book in sorted_books %}
    {% include book_card.html book=book %}
  {% endfor %}
</div>