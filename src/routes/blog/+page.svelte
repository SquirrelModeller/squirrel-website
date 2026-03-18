<script>
  let { data } = $props();
</script>

<span class="label">$ blog</span>
<h1>Blog</h1>

<ul>
  {#each data.posts as post}
    <li>
      <a href={`/blog/${post.slug}`}>{post.title}</a>
      — {post.date}
    </li>
  {/each}
</ul>
