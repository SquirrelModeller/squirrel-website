<script>
  import Terminal from "$lib/components/Terminal.svelte";
</script>

<section class="hero">
  <div class="logo-wrap">
    <img
      src="assets/SquirrelModeller.svg"
      alt="Squirrel Modeller logo"
      class="logo"
    />
  </div>

  <div class="intro">
    <Terminal />
  </div>
</section>

<div class="divider"></div>

<p class="welcome">
  You've somehow arrived to my website. Please, enjoy your stay.
</p>

<style>
  .hero {
    display: flex;
    align-items: center;
    gap: 2rem;
    margin: 3rem auto 2rem;
    width: fit-content;
  }

  .logo {
    width: 5rem;
    height: 5rem;
    flex-shrink: 0;
    animation: float 6s ease-in-out infinite;
  }

  .logo-wrap {
    flex-shrink: 0;
  }

  @keyframes float {
    0%,
    100% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-6px);
    }
  }

  .intro {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .divider {
    width: 3rem;
    height: 2px;
    background: var(--accent);
    border-radius: 2px;
    margin: 2rem 0;
    opacity: 0.6;
  }

  .welcome {
    font-size: 1.1rem;
    font-style: italic;
    color: var(--text-muted);
    max-width: 60ch;
    width: fit-content;
  }

  @media (max-width: 480px) {
    .hero {
      gap: 1.25rem;
    }

    .logo {
      width: 3.5rem;
      height: 3.5rem;
    }
  }
</style>
