<script>
  const usrname = "SquirrelModeller";
</script>

<div class="ring-wrapper">
  <nav>
    <a
      class="arrow"
      href="https://nixwebr.ing/prev/{usrname}"
      aria-label="Previous site">❮</a
    >

    <a class="badge" href="https://nixwebr.ing" aria-label="Nix Webring">
      <img src="/assets/nix-snowflake-colours.svg" alt="Nix Logo" />
      <span class="label">nixwebr.ing</span>
    </a>

    <a
      class="arrow"
      href="https://nixwebr.ing/next/{usrname}"
      aria-label="Next site">❯</a
    >
  </nav>
</div>

<style>
  .ring-wrapper {
    display: flex;
    justify-content: center;
  }

  nav {
    display: inline-flex;
    align-items: center;
    gap: 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    color: var(--text-muted);
    text-decoration: none;
    font-size: 0.75rem;
    transition:
      background 0.15s ease,
      color 0.15s ease;
  }

  .arrow:hover {
    background: var(--bg-subtle);
    color: var(--accent);
    text-decoration: none;
  }

  .badge {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0 1rem;
    height: 2.5rem;
    border-left: 1px solid var(--border);
    border-right: 1px solid var(--border);
    text-decoration: none;
    transition: background 0.15s ease;
  }

  .badge:hover {
    background: var(--bg-subtle);
    text-decoration: none;
  }

  .badge img {
    width: 1.1rem;
    height: 1.1rem;
  }

  .label {
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    transition: color 0.15s ease;
  }

  .badge:hover .label {
    color: var(--text);
  }
</style>
