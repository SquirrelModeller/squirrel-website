<script lang="ts">
  import { onMount } from "svelte";
  import mermaid from "mermaid";

  let { chart } = $props<{ chart: string }>();
  let svg = $state("");

  onMount(async () => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    const { svg: rendered } = await mermaid.render(id, chart);
    svg = rendered;
  });
</script>

<div class="mermaid-diagram">
  {#if svg}
    {@html svg}
  {/if}
</div>

<style>
  .mermaid-diagram {
    display: flex;
    justify-content: center;
    margin: 1.5rem 0;
  }
</style>
