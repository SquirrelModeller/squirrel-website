<script lang="ts">
  import { onMount, onDestroy } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import {
    loadState,
    saveState,
    currentDay,
    keyTimeRemaining,
    pickStory,
  } from "$lib/saga/state";
  import {
    findNextScene,
    applyEffect,
    completeScene,
    resolveText,
  } from "$lib/saga/engine";
  import { raccoons, getYelpReview, pickKeyPage } from "$lib/stories/raccoons";
  import type { SagaState, Scene, Choice } from "$lib/saga/types";

  const STORIES: Record<string, typeof raccoons> = { raccoons };

  let sagaState: SagaState = $state(loadState());
  let open: boolean = $state(false);
  let scene: Scene | null = $state(null as Scene | null);
  let reaction: string[] = $state([]);
  let reactionIndex: number = $state(0);
  let showingReaction: boolean = $state(false);
  let pendingNavigate: string | null = $state(null);
  let keyTimer: number = $state(600);
  let keyInterval: ReturnType<typeof setInterval> | null = null;

  const isBlogPost = (path: string) => /^\/blog\/[^/]+\/?$/.test(path);

  // suppress on court always; suppress on blog posts until formalities are done
  let suppressed: boolean = $derived(
    (page.url.pathname as string) === "/court" ||
      (isBlogPost(page.url.pathname) &&
        !sagaState.completedScenes.includes("day0_cookies")),
  );

  function getStory() {
    return STORIES[sagaState.story ?? "raccoons"] ?? raccoons;
  }

  function getScene() {
    if (!sagaState.story) return null;
    return findNextScene(sagaState, getStory().scenes);
  }

  function tryOpen() {
    if (suppressed || sagaState.sessionClosed) return;
    const today = new Date().toISOString().slice(0, 10);
    if (sagaState.narrativeDayAdvancedAt === today) return;
    const s = getScene();
    if (!s) return;

    // key scene special setup
    if (s.id === "day2_key" && !sagaState.keyFound) {
      if (!sagaState.keyPage) {
        sagaState = {
          ...sagaState,
          keyPage: pickKeyPage(),
          keyStartedAt: new Date().toISOString(),
        };
        saveState(sagaState);
      }
      startKeyTimer();
    }

    scene = s;
    open = true;
  }

  function startKeyTimer() {
    keyTimer = Math.round(keyTimeRemaining(sagaState));
    if (keyInterval) clearInterval(keyInterval);
    keyInterval = setInterval(() => {
      keyTimer = Math.round(keyTimeRemaining(sagaState));
      if (keyTimer <= 0 && keyInterval) {
        clearInterval(keyInterval);
        keyInterval = null;
      }
    }, 1000);
  }

  function formatTimer(secs: number): string {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function getChoices(s: Scene) {
    // for the key scene, only show relevant choices based on keyFound and timer
    if (s.id === "day2_key") {
      const timedOut = keyTimer <= 0;
      return s.choices
        .filter((c) => c.condition?.(sagaState) ?? true)
        .filter((c) => {
          if (c.condition) return c.condition(sagaState);
          return true;
        })
        .filter((c) => {
          // hide "found key" choices if key not found, hide "timed out" choices if key found
          if (
            (c.label === "here. try not to lose it again." ||
              c.label === "you owe me.") &&
            !sagaState.keyFound
          )
            return false;
          if (
            (c.label === "pay the locksmith." ||
              c.label === "he can sleep in the hallway. one night.") &&
            (sagaState.keyFound || !timedOut)
          )
            return false;
          return true;
        });
    }
    return s.choices.filter((c) => !c.condition || c.condition(sagaState));
  }

  async function choose(choice: Choice) {
    if (!scene) return;

    const newState = applyEffect(
      completeScene(sagaState, scene.id),
      choice.effect,
    );
    sagaState = newState;
    saveState(sagaState);

    if (keyInterval) {
      clearInterval(keyInterval);
      keyInterval = null;
    }

    pendingNavigate = choice.navigate ?? null;

    if (choice.reaction.length > 0) {
      reaction = choice.reaction;
      reactionIndex = 0;
      showingReaction = true;
    } else {
      afterReaction();
    }
  }

  function advanceReaction() {
    if (reactionIndex < reaction.length - 1) {
      reactionIndex++;
    } else {
      afterReaction();
    }
  }

  function afterReaction() {
    showingReaction = false;
    reaction = [];
    reactionIndex = 0;

    const nav = pendingNavigate;
    pendingNavigate = null;

    // check if another scene is available at the current narrative day
    const next = getScene();
    const hasNext = next !== null && next.id !== scene?.id;

    if (!hasNext) {
      // no more scenes today, advance narrative day, gate it behind tomorrow's date
      const today = new Date().toISOString().slice(0, 10);
      sagaState = {
        ...sagaState,
        narrativeDay: sagaState.narrativeDay + 1,
        narrativeDayAdvancedAt: today,
      };
      saveState(sagaState);
    }

    if (nav) {
      open = false;
      goto(nav);
      return;
    }

    if (hasNext) {
      scene = next;
      setTimeout(() => {
        if (next.id === "day2_key" && !sagaState.keyFound) startKeyTimer();
      }, 100);
    } else {
      open = false;
      scene = null;
    }
  }

  function dismiss() {
    sagaState = { ...sagaState, sessionClosed: true };
    open = false;
    scene = null;
    if (keyInterval) clearInterval(keyInterval);
  }

  function onStorage(e: StorageEvent) {
    if (e.key === "saga_sagaState" && e.newValue) {
      try {
        const fresh = JSON.parse(e.newValue);
        if (fresh.keyFound && !sagaState.keyFound) {
          sagaState = { ...sagaState, keyFound: true, sessionClosed: false };
          saveState(sagaState);
          scene = getScene();
          open = true;
        }
      } catch {
        /* */
      }
    }
  }

  onMount(() => {
    // assign story on first visit
    if (!sagaState.story) {
      sagaState = {
        ...sagaState,
        story: pickStory(),
        startDate: new Date().toISOString().slice(0, 10),
      };
      saveState(sagaState);
    }

    window.addEventListener("storage", onStorage);
    setTimeout(tryOpen, 1400);
  });

  onDestroy(() => {
    window.removeEventListener("storage", onStorage);
    if (keyInterval) clearInterval(keyInterval);
  });

  // yelp review text for day10 scene
  let yelpReview = $derived(
    scene !== null && scene.id === "day10_yelp"
      ? getYelpReview(sagaState.spite)
      : null,
  );

  let isBrawl = $derived(
    scene !== null && scene.brawl === true && !showingReaction,
  );
  let isKeyScene = $derived(
    scene !== null && scene.id === "day2_key" && !showingReaction,
  );
  let keyTimedOut = $derived(keyTimer <= 0 && !sagaState.keyFound);
</script>

{#if open && scene && !suppressed}
  <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
  <div class="saga-backdrop" onclick={dismiss}></div>

  <div
    class="saga-popup"
    class:brawl={isBrawl}
    role="dialog"
    aria-modal="true"
    aria-label="Cookie saga"
  >
    <button class="saga-close" onclick={dismiss} aria-label="Dismiss">×</button>

    {#if showingReaction}
      <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
      <div class="saga-reaction" onclick={advanceReaction}>
        <p>{reaction[reactionIndex]}</p>
        {#if reactionIndex < reaction.length - 1}
          <span class="saga-continue">tap to continue</span>
        {:else}
          <span class="saga-continue">tap to continue</span>
        {/if}
      </div>
    {:else}
      <div class="saga-text">
        {#each resolveText(scene.text, sagaState).split("\n") as line}
          {#if line === ""}
            <br />
          {:else}
            <p>{line}</p>
          {/if}
        {/each}

        {#if yelpReview}
          <div class="yelp-stars">
            {"⭐".repeat(yelpReview.stars)}{"☆".repeat(5 - yelpReview.stars)}
          </div>
          <p class="yelp-text">"{yelpReview.text}"</p>
        {/if}

        {#if isKeyScene && !sagaState.keyFound}
          <div
            class="key-timer"
            class:urgent={keyTimer < 60}
            class:expired={keyTimedOut}
          >
            {#if keyTimedOut}
              <span>time's up.</span>
            {:else}
              <span>time remaining: {formatTimer(keyTimer)}</span>
            {/if}
          </div>
        {/if}
      </div>

      <div class="saga-choices" class:jitter={isBrawl}>
        {#each getChoices(scene) as choice}
          <button class="saga-choice" onclick={() => choose(choice)}>
            {typeof choice.label === "function"
              ? choice.label(sagaState)
              : choice.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
{/if}

<style>
  .saga-backdrop {
    position: fixed;
    inset: 0;
    z-index: 9000;
  }

  .saga-popup {
    position: fixed;
    bottom: 1.5rem;
    right: 1.5rem;
    z-index: 9001;
    width: min(340px, calc(100vw - 2rem));
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 1.25rem 1.25rem 1rem;
    animation: saga-enter 0.25s ease;
  }

  @keyframes saga-enter {
    from {
      opacity: 0;
      transform: translateY(12px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .saga-popup.brawl {
    animation:
      saga-enter 0.25s ease,
      saga-shake 0.5s ease 0.3s;
  }

  @keyframes saga-shake {
    0% {
      transform: translateX(0);
    }
    15% {
      transform: translateX(-6px) rotate(-1deg);
    }
    30% {
      transform: translateX(6px) rotate(1deg);
    }
    45% {
      transform: translateX(-5px) rotate(-1deg);
    }
    60% {
      transform: translateX(5px) rotate(0.5deg);
    }
    75% {
      transform: translateX(-3px);
    }
    90% {
      transform: translateX(3px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .saga-close {
    position: absolute;
    top: 0.6rem;
    right: 0.75rem;
    background: none;
    border: none;
    color: var(--text-muted);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0.1rem 0.3rem;
    line-height: 1;
    opacity: 0.6;
    transition: opacity 0.15s;
  }

  .saga-close:hover {
    opacity: 1;
  }

  .saga-text p {
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0 0 0.1rem;
    color: var(--text);
    white-space: pre-wrap;
  }

  .saga-text br {
    display: block;
    margin: 0.4rem 0;
    content: "";
  }

  .saga-reaction {
    cursor: pointer;
    padding: 0.25rem 0;
  }

  .saga-reaction p {
    font-size: 0.875rem;
    line-height: 1.6;
    margin: 0 0 0.5rem;
    color: var(--text-muted);
    font-style: italic;
  }

  .saga-continue {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--accent);
    opacity: 0.7;
    letter-spacing: 0.05em;
  }

  .saga-choices {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
    margin-top: 1rem;
  }

  .saga-choices.jitter .saga-choice {
    animation: choice-jitter 0.4s ease 0.6s both;
  }

  .saga-choices.jitter .saga-choice:nth-child(2) {
    animation-delay: 0.65s;
  }
  .saga-choices.jitter .saga-choice:nth-child(3) {
    animation-delay: 0.7s;
  }

  @keyframes choice-jitter {
    0% {
      transform: translateX(0);
    }
    20% {
      transform: translateX(-4px);
    }
    40% {
      transform: translateX(4px);
    }
    60% {
      transform: translateX(-2px);
    }
    80% {
      transform: translateX(2px);
    }
    100% {
      transform: translateX(0);
    }
  }

  .saga-choice {
    text-align: left;
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.45rem 0.75rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--text);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
    line-height: 1.4;
  }

  .saga-choice:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, var(--bg-subtle));
  }

  .key-timer {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--accent);
    margin-top: 0.75rem;
    padding: 0.4rem 0.6rem;
    border: 1px dashed var(--accent);
    border-radius: var(--radius-sm);
    opacity: 0.8;
  }

  .key-timer.urgent {
    color: #e05a5a;
    border-color: #e05a5a;
  }
  .key-timer.expired {
    color: var(--text-muted);
    border-color: var(--border);
    opacity: 0.6;
  }

  .yelp-stars {
    font-size: 0.9rem;
    margin: 0.5rem 0 0.25rem;
  }

  .yelp-text {
    font-size: 0.8rem !important;
    color: var(--text-muted) !important;
    font-style: italic;
  }

  @media (max-width: 480px) {
    .saga-popup {
      bottom: 0;
      right: 0;
      width: 100%;
      border-radius: var(--radius) var(--radius) 0 0;
    }
  }
</style>
