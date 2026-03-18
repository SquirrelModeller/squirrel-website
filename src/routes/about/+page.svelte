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
    <p>
      My creative endeavours also include logo creation. I even created my own.
    </p>
  </section>

  <div class="section-divider">
    <span class="divider-line"></span>
    <span class="divider-icon">❄</span>
    <span class="divider-line"></span>
  </div>

  <section class="prose">
    <h2>My Nix journey</h2>
    <p>
      Nix has grabbed my attention. I'll add more glazing, once I am done with
      this website.
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
    color: var(--accent);
    font-size: 0.9rem;
    opacity: 0.7;

    display: inline-block;
    animation: spin 20s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
</style>
