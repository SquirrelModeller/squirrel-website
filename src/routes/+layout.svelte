<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Webring from "$lib/components/Webring.svelte";
  import CookieSaga from "$lib/components/CookieSaga.svelte";
  import KeyHunt from "$lib/components/KeyHunt.svelte";
  import { page } from "$app/state";
  import { browser } from "$app/environment";
  import { loadState, saveState } from "$lib/saga/state";

  let { children } = $props();

  function skipDay() {
    const s = loadState();
    saveState({ ...s, narrativeDay: (s.narrativeDay ?? 0) + 1, sessionClosed: false });
    window.location.reload();
  }

  function resetSaga() {
    localStorage.removeItem('saga_state');
    window.location.reload();
  }
</script>

<svelte:head>
  <link rel="canonical" href={page.url.href} />
  <link
    rel="alternate"
    type="application/rss+xml"
    title="SquirrelModeller Blog"
    href="https://squirrel.talosvault.net/rss.xml"
  />
</svelte:head>

<Navbar />

<main>
  {@render children()}
</main>

<footer>
  <Webring />
</footer>

{#if browser}
  <CookieSaga />
  <KeyHunt />
  <div class="dev-tools">
    <button class="skip-day" onclick={skipDay}>+day</button>
    <button class="skip-day" onclick={resetSaga}>reset</button>
  </div>
{/if}

<style>
  .dev-tools {
    position: fixed;
    bottom: 1rem;
    left: 1rem;
    z-index: 9999;
    display: flex;
    gap: 0.4rem;
  }

  .skip-day {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    background: var(--bg-subtle);
    border: 1px dashed var(--border);
    color: var(--text-muted);
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    opacity: 0.5;
    transition: opacity 0.15s;
  }
  .skip-day:hover { opacity: 1; }
</style>
