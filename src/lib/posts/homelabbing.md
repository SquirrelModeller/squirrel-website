---
title: Life with homelabbing
date: 2026-03-27
---

<script>
  import Mermaid from '$lib/components/Mermaid.svelte';
</script>

I am just here to show off my cool diagram, and test RRSS as a daemon.

<Mermaid chart={`
flowchart TD
  A[Start] --> B{Decision}
  B -->|Yes| C[Do thing]
  B -->|No| D[Don't]
`} />
