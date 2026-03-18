<script lang="ts">
  import { page } from "$app/stores";
</script>

<nav>
  <ul>
    <li><a class:active={$page.url.pathname === "/"} href="/">Home</a></li>
    <li>
      <a class:active={$page.url.pathname === "/about"} href="/about">About</a>
    </li>
    <li>
      <a class:active={$page.url.pathname === "/contact"} href="/contact"
        >Contact</a
      >
    </li>
  </ul>
</nav>

<style>
  nav {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 0;
    height: 4rem;
  }

  nav {
    position: sticky;
    top: 0;
    z-index: 100;
    padding: 0.875rem 1.5rem;

    background: color-mix(in srgb, var(--bg) 80%, transparent);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);

    border-bottom: 1px solid var(--border);
  }

  ul {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  li {
    position: relative;
  }

  li + li::before {
    content: "/";
    padding: 0 0.6rem;
    color: var(--text-muted);
    opacity: 0.5;
    font-size: 0.85rem;
    pointer-events: none;
    user-select: none;
  }

  a {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 500;
    color: var(--text-muted);
    text-decoration: none;
    letter-spacing: 0.02em;
    padding: 0.25rem 0.1rem;
    transition: color 0.2s ease;

    position: relative;
  }

  a::after {
    content: "";
    position: absolute;
    bottom: -1px;
    left: 0;
    width: 0;
    height: 1.5px;
    background: var(--accent);
    transition: width 0.2s ease;
  }

  nav a {
    line-height: 1;
    transition:
      font-size 0.2s ease,
      color 0.2s ease;
  }

  nav a:hover {
    color: var(--link-text-hover);
    font-size: 1.5rem;
  }

  nav a:hover::after,
  nav a.active::after {
    width: 100%;
  }

  nav a.active {
    color: var(--accent);
    transform: scale(120%);
  }
</style>
