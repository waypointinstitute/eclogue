---
layout: default
title: Posts
permalink: /posts/
---

<div class="grid grid-cols-1 md:grid-cols-3 gap-8 py-8">
  {% assign sorted_posts = site.posts | sort: "date" | reverse %}
  {% for post in sorted_posts %}
    {% include post_card.html post=post %}
  {% endfor %}
</div>