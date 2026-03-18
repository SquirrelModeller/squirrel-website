<script>
  const name = "Squirrel Modeller";
  const tagline = "Computer science student";

  let finished = $state(false);

  /**
   * @param {HTMLSpanElement} node
   */
  function typewriter(node, { speed = 0.5 } = {}) {
    const text = node.textContent ?? "";
    node.textContent = "";

    const duration = text.length * (100 / speed);
    /** @type {number} */
    let start;

    /** @param {number} time */
    function frame(time) {
      if (!start) start = time;
      const t = Math.min((time - start) / duration, 1);
      node.textContent = text.slice(0, Math.floor(text.length * t));

      if (t < 1) {
        requestAnimationFrame(frame);
      } else {
        node.dispatchEvent(new CustomEvent("typingend"));
      }
    }

    requestAnimationFrame(frame);
  }
</script>

<div class="terminal">
  <span class="prompt">$</span>
  <span
    class="command"
    use:typewriter
    ontypingend={() => setTimeout(() => (finished = true), 600)}>whoami</span
  >
  <span class="cursor" class:stopped={finished}></span>
</div>

{#if finished}
  <div class="result">
    <h1>{name}</h1>
    <p class="tagline">{tagline}</p>
  </div>
{/if}

<style>
  .terminal {
    display: flex;
    align-items: center;
    gap: 0.4rem;
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 0.6rem;
  }

  .prompt {
    color: var(--accent);
    font-weight: 500;
    user-select: none;
  }

  .command {
    color: var(--text);
  }

  .cursor {
    display: inline-block;
    width: 0.55ch;
    height: 1.1em;
    background: var(--accent);
    opacity: 0.8;
    animation: blink 1s steps(1) infinite;
    vertical-align: text-bottom;
    border-radius: 1px;
  }

  .cursor.stopped {
    display: none;
  }

  @keyframes blink {
    50% {
      opacity: 0;
    }
  }

  .result {
    animation: fadeUp 0.4s ease both;
  }

  @keyframes fadeUp {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  h1 {
    margin: 0 0 0.2rem;
    font-size: clamp(1.6rem, 4vw, 2.2rem);
    line-height: 1.15;
    letter-spacing: -0.02em;
  }

  .tagline {
    margin: 0;
    color: var(--text-muted);
    font-size: 0.95rem;
    font-style: italic;
  }
</style>
