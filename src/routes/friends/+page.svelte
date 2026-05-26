<script>
  import FriendButtons from "$lib/components/FriendButtons.svelte";
</script>

<svelte:head>
  <title>Cool People</title>
  <meta name="description" content="People on the internet I think are cool." />
</svelte:head>

<article class="friends-page">
  <header class="page-header">
    <span class="label">$ friends</span>
    <h1>cool people</h1>
    <p class="subtitle">
      People on the internet I think are cool. They're competing for your
      attention.
    </p>
  </header>

  <FriendButtons />
</article>

<style>
  .page-header {
    margin-bottom: 2rem;
  }

  .subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin: 0.5rem 0 0;
  }
</style>
