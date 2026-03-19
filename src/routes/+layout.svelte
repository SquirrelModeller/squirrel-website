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
