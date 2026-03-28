<script lang="ts">
  import { onMount } from "svelte";
  import mermaid from "mermaid";

  let { chart } = $props<{ chart: string }>();
  let container: HTMLDivElement;
  let svg = $state("");

  /**
   * Synchronous hash, must produce the same value as hashChart() in scripts/render-mermaid.js.
   * Uses djb2
   */
  function hashChart(str: string): string {
    const s = str.trim();
    let h = 5381;
    for (let i = 0; i < s.length; i++) {
      h = ((h << 5) + h) ^ s.charCodeAt(i);
      h = h >>> 0;
    }
    return h.toString(16).padStart(8, "0");
  }

  const fallbackSrc = `/generated/mermaid/${hashChart(chart)}.svg`;

  onMount(async () => {
    mermaid.initialize({ startOnLoad: false, theme: "default" });
    const id = `mermaid-${Math.random().toString(36).slice(2)}`;
    const { svg: rendered } = await mermaid.render(id, chart);
    svg = rendered;
  });
</script>

<div class="mermaid-diagram" bind:this={container}>
  <img class="fallback" src={fallbackSrc} alt="Diagram" class:hidden={!!svg} />
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

  .fallback {
    max-width: 50%;
    height: auto;
  }
  .fallback.hidden {
    display: none;
  }
</style>
