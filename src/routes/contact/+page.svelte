<script>
  const contacts = [
    {
      logo_url: "https://cdn.simpleicons.org/github",
      alt: "GitHub",
      username: "SquirrelModeller",
      href: "https://github.com/SquirrelModeller",
    },
    {
      logo_url: "https://cdn.simpleicons.org/matrix",
      alt: "Matrix",
      username: "@squirrelmodelling:matrix.org",
      href: "https://matrix.to/#/@squirrelmodelling:matrix.org",
    },
    {
      logo_url: "https://cdn.simpleicons.org/discord",
      alt: "Discord",
      username: "SquirrelModeller",
      href: null,
    },
  ];
</script>

<header class="page-header">
  <span class="label">$ contact</span>
  <h1>Get in touch</h1>
</header>

<ul class="contact-list">
  {#each contacts as c}
    <li>
      {#if c.href}
        <a
          class="contact-row"
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src={c.logo_url} alt={c.alt} class="icon" />
          <span class="platform">{c.alt}</span>
          <span class="username">{c.username}</span>
        </a>
      {:else}
        <div class="contact-row">
          <img src={c.logo_url} alt={c.alt} class="icon" />
          <span class="platform">{c.alt}</span>
          <span class="username">{c.username}</span>
        </div>
      {/if}
    </li>
  {/each}
</ul>

<style>
  .page-header {
    margin-bottom: 2rem;
  }

  .contact-list {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    max-width: 42ch;
    margin: 0 auto;
  }

  .contact-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1.25rem;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    box-shadow: var(--shadow-sm);
    text-decoration: none;
    color: var(--text);
    transition:
      border-color 0.15s ease,
      box-shadow 0.15s ease;

    min-width: 0;
  }
  a.contact-row:hover {
    border-color: var(--accent-soft);
    box-shadow: var(--shadow-md);
    text-decoration: none;
  }

  .icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  .platform {
    font-weight: 600;
    font-size: 0.95rem;
    min-width: 5rem;
    flex-shrink: 0;
  }

  .username {
    font-family: var(--font-mono);
    font-size: 0.82rem;
    color: var(--text-muted);
    margin-left: auto;

    min-width: 0;
    overflow-wrap: anywhere;
    text-align: right;
  }
</style>
