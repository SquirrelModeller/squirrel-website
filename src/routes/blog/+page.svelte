<script>
  let { data } = $props();

  /**
   * @param {string | number | Date} dateStr
   */
  function formatDate(dateStr) {
    return new Date(dateStr).toISOString().slice(0, 10);
  }
</script>

<header class="page-header">
  <span class="label">$ blog</span>
  <h1>Blog</h1>
</header>

<ul class="posts">
  {#each data.posts as post}
    <li>
      <a href={`/blog/${post.slug}`} class="post-card">
        {#if post.thumbnail}
          <div class="post-thumb">
            <img src={post.thumbnail} alt={post.thumbnail_alt ?? ""} />
          </div>
        {/if}
        <div class="post-body">
          <div class="post-meta">
            <span class="post-date mono muted">{formatDate(post.date)}</span>
            {#each post.tags as tag}
              <span class="post-tag">{tag}</span>
            {/each}
          </div>
          <p class="post-title">{post.title}</p>
          {#if post.excerpt}
            <p class="post-excerpt muted">{post.excerpt}</p>
          {/if}
        </div>
        <span class="post-arrow">→</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  @import "./blog.css";

  .page-header {
    margin-bottom: 2rem;
  }
</style>
