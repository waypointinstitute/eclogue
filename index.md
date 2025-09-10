---
layout: default
title: Home
---

<section class="parallax" style="height: min(58vh, 640px);">
  <img src="{{ '/assets/hero/base-fantasy.webp'  | relative_url }}" alt="" class="hero-base">
  <img src="{{ '/assets/hero/fg-fantasy.webp'    | relative_url }}" alt="" class="parallax-layer fg"   data-depth="0.10">
  <img src="{{ '/assets/hero/mid-fantasy.webp'   | relative_url }}" alt="" class="parallax-layer mid"  data-depth="0.05">
  <img src="{{ '/assets/hero/stars-fantasy.webp' | relative_url }}" alt="" class="parallax-layer stars" data-depth="0.02">

  <div class="hero-overlay">
    <h1 class="hero-title display">Eclogue Press</h1>
    <p class="hero-tagline">Lean, independent SFF—honoring the old while building the new.</p>
    <div class="hero-cta">
      <a class="btn btn-primary link-ink" href="{{ '/posts/' | relative_url }}">Read the latest</a>
      <a class="btn btn-ghost link-glow" href="{{ '/about/' | relative_url }}">About the press</a>
      <a class="btn btn-ghost" href="{{ '/books/' | relative_url }}">Our books</a>
    </div>
  </div>
</section>


<!-- MISSION (scroll reveal) -->
<section class="py-16 reveal">
  <div class="max-w-6xl mx-auto px-4 lg:px-8">
    <div class="card p-8">
      <h2 class="display text-3xl mb-4">Our Mission</h2>
      <p class="text-lg muted">
        We publish science fiction & fantasy that balances classic craft with new ideas. Small, nimble, human—no fluff, just great stories.
      </p>
    </div>
  </div>
</section>

<!-- LATEST POSTS -->
<section class="py-16">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <div class="section-head">
      <h2 class="display text-3xl">Latest Posts</h2>
      <a class="muted" href="{{ '/posts/' | relative_url }}">All posts →</a>
    </div>

    {%- assign latest = site.posts | where: "published", true | slice: 0, 3 -%}
    {%- if latest and latest != empty -%}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {%- for post in latest -%}
          {%- include post-card.html
            url=post.url
            title=post.title
            date=post.date
            author=post.author
            excerpt=post.excerpt
            cover=post.cover
            tags=post.tags
          -%}
        {%- endfor -%}
      </div>
    {%- else -%}
      <p class="muted">No posts yet.</p>
    {%- endif -%}
  </div>
</section>

<!-- FEATURED BOOK (optional: mark one book `featured: true` in /_books/*.md ) -->
<section class="py-16 reveal">
  <div class="max-w-7xl mx-auto px-4 lg:px-8">
    <div class="section-head">
      <h2 class="display text-3xl">Featured Book</h2>
      <a class="muted" href="{{ '/books/' | relative_url }}">Browse all →</a>
    </div>

    {%- assign featured = site.books | where: "featured", true | sort: "order" | first -%}
    {%- if featured -%}
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div class="card p-6">
          {%- include book-card.html
            url=featured.url
            title=featured.title
            author=featured.author
            blurb=featured.blurb
            cover=featured.cover
          -%}
        </div>
        <div class="card p-6">
          <p class="text-lg">
            {{ featured.description | default: featured.blurb }}
          </p>
          {%- if featured.isbn -%}
            <p class="muted mb-2">ISBN: {{ featured.isbn }}</p>
          {%- endif -%}
          {%- if featured.pub_date -%}
            <p class="muted">Publishes {{ featured.pub_date | date: "%B %-d, %Y" }}</p>
          {%- endif -%}
        </div>
      </div>
    {%- else -%}
      <p class="muted">No featured title yet. Add <code>featured: true</code> in a book’s front-matter.</p>
    {%- endif -%}
  </div>
</section>
