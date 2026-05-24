<script lang="ts">
  import Giscus from "$lib/components/Giscus.svelte";
  let { data } = $props();
  const Post = $derived(data.component);
</script>

<svelte:head>
  <title>{data.metadata.title}</title>
  <meta name="description" content={data.metadata.excerpt} />

  <meta property="og:title" content={data.metadata.title} />
  <meta property="og:description" content={data.metadata.excerpt} />
  <meta property="og:type" content="article" />
  <meta property="og:image" content={data.metadata.thumbnail} />
</svelte:head>

<header class="page-header">
  <a href="/blog" class="back-link">← blog</a>

  <div class="post-meta">
    {#if data.metadata.date}
      <span class="mono muted" style="font-size: 0.75rem">
        {new Date(data.metadata.date).toISOString().slice(0, 10)}
      </span>
    {/if}
    {#each data.metadata.tags as tag}
      <span class="post-tag">{tag}</span>
    {/each}
  </div>
  <h1>{data.metadata.title ?? "Untitled post"}</h1>
</header>
<hr />

<article class="post-content">
  <Post />
</article>

<Giscus />

{#if data.prev || data.next}
  <nav class="post-nav">
    <div class="nav-post">
      {#if data.prev}
        <span class="label">← prev</span>
        <a href="/blog/{data.prev.slug}">{data.prev.title}</a>
      {/if}
    </div>
    <div class="nav-post right">
      {#if data.next}
        <span class="label">next →</span>
        <a href="/blog/{data.next.slug}">{data.next.title}</a>
      {/if}
    </div>
  </nav>
{/if}

<style>
  @import "../blog.css";
</style>
