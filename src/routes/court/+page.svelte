<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { loadState, saveState, currentDay } from "$lib/saga/state";
  import {
    applyEffect,
    completeScene,
    getTitle,
    resolveText,
  } from "$lib/saga/engine";
  import { fx } from "$lib/saga/engine";
  import type { SagaState } from "$lib/saga/types";

  type Phase = "intro" | "q1" | "q2" | "q3" | "verdict" | "done";

  let sagaState: SagaState = $state(loadState());
  let phase = $state<Phase>("intro");
  let testimony = $state(0);
  let hasContinuancePenalty = $derived(sagaState.court === "delayed");

  const Q1 = {
    text: '"in your own words. what happened behind the bins."',
    choices: [
      { label: "it was a misunderstanding.", score: 1 },
      { label: "the squirrels started it.", score: -1 },
      { label: "my body was present. i was not.", score: 0, weird: true },
    ],
  };

  const Q2 = {
    text: '"and when informed of the damages, you chose to -" (checks notes) "- bill us. the victims."',
    choices: [
      { label: "that was a miscommunication.", score: 1 },
      { label: "you were there. you know what happened.", score: -1 },
      { label: "technically the bin is fine.", score: -1, weird: true },
    ],
  };

  const Q3 = {
    text: '"do you have anything to add, $title?"',
    choices: [
      { label: "no further statements.", score: 0 },
      { label: "Marvin is a good neighbour.", score: 1 },
      {
        label: "i'd like to address the bin specifically.",
        score: 1,
        weird: true,
      },
    ],
  };

  let currentQ = $derived(
    phase === "q1" ? Q1 : phase === "q2" ? Q2 : phase === "q3" ? Q3 : null,
  );

  let won = $derived(testimony >= 2 || sagaState.weird >= 3);

  function begin() {
    if (hasContinuancePenalty) {
      sagaState = applyEffect(sagaState, fx.money(-30));
      saveState(sagaState);
    }
    phase = "q1";
  }

  function answer(score: number, weird: boolean = false) {
    testimony += score;
    if (weird) {
      sagaState = applyEffect(sagaState, fx.weird());
      saveState(sagaState);
    }
    if (phase === "q1") phase = "q2";
    else if (phase === "q2") phase = "q3";
    else if (phase === "q3") {
      const threshold = hasContinuancePenalty ? 3 : 2;
      const playerWon = testimony >= threshold || sagaState.weird >= 3;
      if (playerWon) {
        sagaState = applyEffect(
          sagaState,
          fx.set({ court: "won", squirrels: "resolved" }),
        );
      } else {
        sagaState = applyEffect(
          sagaState,
          fx.compound(
            fx.money(-80),
            fx.set({ court: "lost", squirrels: "resolved" }),
          ),
        );
      }
      sagaState = completeScene(sagaState, "day7_squirrels_blamed");
      sagaState = { ...sagaState, testimony: 0 };
      saveState(sagaState);
      phase = "verdict";
    }
  }

  function leave() {
    goto("/");
  }

  onMount(() => {
    if (
      !sagaState.court ||
      (sagaState.court !== "pending" && sagaState.court !== "delayed")
    ) {
      goto("/");
    }
  });
</script>

<svelte:head>
  <title>District Court</title>
</svelte:head>

<div class="court-wrap">
  <div class="court-card">
    {#if phase === "intro"}
      <div class="court-header">
        <p class="court-label mono">case no. 0047</p>
        <h1>
          Squirrels v. You<br /><span class="subtitle"
            >(and Also Technically Marvin)</span
          >
        </h1>
        <p class="court-sub">
          DISTRICT COURT OF THE GREATER CLOSET JURISDICTION
        </p>
      </div>

      <div class="court-body">
        <p>the court is in session.</p>
        <p>
          the judge is a very old pigeon. he has been on the bench for eleven
          years. he seems impartial. he went to school with Marvin. these facts
          coexist.
        </p>

        {#if hasContinuancePenalty}
          <div class="penalty-notice">
            <p>the continuance has expired. the case resumes.</p>
            <p>the squirrel in the blazer has brought a second folder.</p>
            <p>
              additional damages have been assessed during the delay: emotional
              distress, $30. the bin has been moved again.
            </p>
            <p class="mono muted">($30 has been deducted.)</p>
          </div>
        {/if}

        <p>
          <em>{getTitle(sagaState)}, you are hereby invited to testify.</em>
        </p>
      </div>

      <button class="court-btn" onclick={begin}>approach the stand</button>
    {:else if phase === "q1" || phase === "q2" || phase === "q3"}
      {#if currentQ}
        <div class="court-header">
          <p class="court-label mono">
            {phase === "q1"
              ? "the judge"
              : phase === "q2"
                ? "squirrel plaintiff"
                : "the judge"}
          </p>
        </div>

        <div class="court-body">
          <p class="court-question">{resolveText(currentQ.text, sagaState)}</p>
          {#if phase === "q2"}
            <p class="muted court-aside">
              Phyllis passes the folder forward. the judge reviews it briefly.
            </p>
          {/if}
          {#if phase === "q3"}
            <p class="muted court-aside">
              Marvin testifies briefly. he is charming. the judge softens
              visibly. this helps you somewhat.
            </p>
          {/if}
        </div>

        <div class="court-choices">
          {#each currentQ.choices as choice}
            <button
              class="court-choice"
              onclick={() => answer(choice.score, choice.weird)}
            >
              {choice.label}
            </button>
          {/each}
        </div>
      {/if}
    {:else if phase === "verdict"}
      <div class="court-header">
        <p class="court-label mono">verdict</p>
      </div>

      <div class="court-body">
        {#if won}
          <p>the judge deliberates for six minutes.</p>
          <p>
            he rules in your favour on a technicality involving the bin's
            placement relative to a local ordinance from 1987. nobody fully
            understands the ruling. it stands.
          </p>
          <p class="muted">
            case dismissed. Marvin shook your hand outside. the squirrel in the
            blazer took his jacket off. it was a very warm day.
          </p>
        {:else}
          <p>the judge deliberates for two minutes.</p>
          <p>
            you are found liable. damages assessed at $120. the bin is to be
            returned to its original position within a reasonable timeframe.
            nobody defines reasonable.
          </p>
          <p class="muted">
            Marvin paid $40 of it immediately, in cash. you don't know where he
            got it. you didn't ask.
          </p>
        {/if}
      </div>

      <button class="court-btn" onclick={leave}>return home</button>
    {/if}
  </div>
</div>

<style>
  :global(body) {
    background: var(--bg);
  }

  .court-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem 1.5rem;
    background: var(--bg);
  }

  .court-card {
    width: 100%;
    max-width: 52ch;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    padding: 2.5rem 2rem;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .court-header {
    border-bottom: 1px solid var(--border);
    padding-bottom: 1rem;
  }

  .court-label {
    font-size: 0.7rem;
    color: var(--accent);
    letter-spacing: 0.08em;
    text-transform: uppercase;
    margin: 0 0 0.5rem;
  }

  h1 {
    font-family: var(--font-heading);
    font-size: clamp(1.3rem, 3vw, 1.75rem);
    font-weight: 400;
    margin: 0 0 0.5rem;
    line-height: 1.2;
    letter-spacing: -0.01em;
  }

  .subtitle {
    font-size: 0.8em;
    color: var(--text-muted);
  }

  .court-sub {
    font-family: var(--font-mono);
    font-size: 0.65rem;
    color: var(--text-muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    margin: 0;
  }

  .court-body {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .court-body p {
    margin: 0;
    font-size: 0.9375rem;
    line-height: 1.7;
    color: var(--text);
  }

  .court-body em {
    font-style: italic;
    color: var(--text-muted);
  }

  .court-question {
    font-size: 1rem !important;
    font-style: italic;
    color: var(--text) !important;
  }

  .court-aside {
    font-size: 0.8rem !important;
  }

  .penalty-notice {
    background: color-mix(in srgb, var(--accent) 8%, transparent);
    border: 1px solid color-mix(in srgb, var(--accent) 25%, transparent);
    border-radius: var(--radius-sm);
    padding: 0.75rem 1rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .penalty-notice p {
    font-size: 0.85rem !important;
    margin: 0;
  }

  .court-choices {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .court-choice {
    text-align: left;
    background: var(--bg-subtle);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.6rem 0.9rem;
    font-family: var(--font-body);
    font-size: 0.9rem;
    color: var(--text);
    cursor: pointer;
    transition:
      border-color 0.15s,
      background 0.15s;
    line-height: 1.4;
  }

  .court-choice:hover {
    border-color: var(--accent);
    background: color-mix(in srgb, var(--accent) 6%, var(--bg-subtle));
  }

  .court-btn {
    font-family: var(--font-mono);
    font-size: 0.8rem;
    letter-spacing: 0.04em;
    background: var(--text);
    color: var(--bg);
    border: none;
    border-radius: var(--radius-sm);
    padding: 0.65rem 1.25rem;
    cursor: pointer;
    align-self: flex-start;
    transition: opacity 0.15s;
  }

  .court-btn:hover {
    opacity: 0.8;
  }

  .muted {
    color: var(--text-muted) !important;
  }
  .mono {
    font-family: var(--font-mono);
  }
</style>
