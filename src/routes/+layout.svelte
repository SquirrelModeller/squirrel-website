<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Webring from "$lib/components/Webring.svelte";
  import { page } from "$app/state";

  let { children } = $props();
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
