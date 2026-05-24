<svelte:head>
  <title>About page</title>
  <meta name="description" content="Squirrel Modeller's introduction." />
</svelte:head>

<article class="about">
  <header class="page-header">
    <span class="label">$ whoami</span>
    <h1>Who am I?</h1>
  </header>

  <section class="prose">
    <p>
      I am Squirrel Modeller, a computer science student currently studying
      towards becoming a civil engineer.
    </p>
    <p>
      Why "Modeller"? Well, I started my Blender journey roughly over a decade
      ago. Ever since then, I've enjoyed sculpting architecture, replicating
      real-life locations, and generally experimenting with 3D modelling. From
      this, you could infer that I am comfortable handling the pipeline from 3D
      assets to game engine integration. This also includes experience
      optimizing asset usage, batching, LODs, and texture atlasing.
    </p>
    <p>
      What excites me most are technologies like Nanite in UE5, which render
      many of these optimisation methods a thing of the past. I love the thought
      of unleashing creativity to the fullest without being held back by
      technical limitations.
    </p>
  </section>

  <div class="section-divider">
    <span class="divider-line"></span>
    <img class="divider-icon" src="/assets/nix-snowflake-colours.svg" alt="" aria-hidden="true" />
    <span class="divider-line"></span>
  </div>

  <section class="prose">
    <h2>My Nix journey</h2>
    <p>
      I write a lot of code, and over time I've developed a strong preference
      for systems that behave predictably. A function should return the same
      result every time given the same input. That level of determinism is what
      makes software reliable.
    </p>
    <p>
      Naturally, this raises the question: why don't we expect the same from the
      systems we run our software on? The operating system is not just a tool in
      the background - it is something we interact with constantly. It shapes
      how we work, what we can build, and how efficiently we can move between
      tasks.
    </p>
    <p>
      In practice, traditional setups fall short of this ideal. I rely on a
      specific development environment: an IDE (the program used to write and
      manage code), with a consistent set of plugins, language versions, and
      tools. Recreating that environment across multiple machines is tedious and
      often inconsistent. Different operating systems ship different versions of
      software, updates introduce breaking changes, and subtle mismatches
      accumulate over time.
    </p>
    <p>
      These are tools, and tools should not behave unpredictably. A workflow
      should not degrade simply because a package updated or a machine differs
      slightly from another.
    </p>
    <p>This is where Nix entered the picture.</p>
    <p>
      With Nix, I can declare my entire environment, from system configuration
      to individual development dependencies as code. Instead of manually
      setting up each machine, I describe exactly how it should be configured,
      and that definition is reproduced identically everywhere.
    </p>
    <p>
      This extends beyond just installing programs. Configuration, plugins, and
      even cryptographic keys are managed declaratively. When something changes,
      I update it once, and that change propagates across all systems in a
      controlled and reproducible way.
    </p>
    <p>
      It also fundamentally changes how I approach projects. Previously, I would
      default to working on a single machine simply because reproducing the
      setup elsewhere was too time-consuming. Now, with Nix flakes and direnv,
      each project defines its own environment. If it works on one machine, it
      works on all of them, whether it's macOS or Linux.
    </p>
    <p>
      The result is a workflow where the environment is no longer a source of
      friction. It becomes stable, portable, and predictable. That is exactly
      what I expect from any well-engineered system.
    </p>
  </section>
</article>

<style>
  .page-header {
    margin-bottom: 2rem;
  }
  .prose p {
    line-height: 1.8;
    color: var(--text);
  }

  .prose h2 {
    font-size: 1.4rem;
    margin-top: 0;
    margin-bottom: 0.75rem;
  }

  .section-divider {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin: 2.5rem 0;
  }

  .divider-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  .divider-icon {
    width: 1.25rem;
    height: 1.25rem;
    opacity: 0.7;
    animation: spin 20s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
