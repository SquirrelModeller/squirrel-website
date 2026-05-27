<script lang="ts">
  import { page } from '$app/state'
  import { loadState, saveState } from '$lib/saga/state'

  const normalize = (p: string) => p.replace(/\/$/, '') || '/'

  let sagaState = $derived.by(() => {
    // re-read on every navigation
    void page.url.pathname
    return loadState()
  })

  let visible = $derived(
    sagaState.keyPage !== null &&
    !sagaState.keyFound &&
    normalize(page.url.pathname) === normalize(sagaState.keyPage)
  )

  function findKey() {
    const state = loadState()
    const updated = { ...state, keyFound: true }
    saveState(updated)
    // fire storage event so CookieSaga picks it up across tabs/same page
    window.dispatchEvent(new StorageEvent('storage', {
      key: 'saga_state',
      newValue: JSON.stringify(updated)
    }))
    visible = false
  }
</script>

{#if visible}
  <button class="key" onclick={findKey} aria-label="A small key" title="🔑">
    🔑
  </button>
{/if}

<style>
  .key {
    position: fixed;
    bottom: 6rem;
    left: 1.5rem;
    background: none;
    border: none;
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.25rem;
    z-index: 8999;
    animation: key-float 2.5s ease-in-out infinite;
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
    opacity: 0.85;
  }

  .key:hover {
    opacity: 1;
    animation: key-float 2.5s ease-in-out infinite, key-pulse 0.3s ease;
  }

  @keyframes key-float {
    0%, 100% { transform: translateY(0) rotate(-5deg); }
    50%       { transform: translateY(-5px) rotate(5deg); }
  }

  @keyframes key-pulse {
    0%   { transform: scale(1); }
    50%  { transform: scale(1.3); }
    100% { transform: scale(1); }
  }
</style>
