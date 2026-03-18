<script lang="ts">
  import "../app.css";
  import Navbar from "$lib/components/Navbar.svelte";
  import Webring from "$lib/components/Webring.svelte";

  let { children } = $props();
</script>

<Navbar />

<main>
  {@render children()}
</main>

<footer>
  <Webring />
</footer>

<style>
  main {
    /* width: min(100% - 2rem, var(--max-width)); */
    padding: 4rem 1.5rem;
  }
</style>
