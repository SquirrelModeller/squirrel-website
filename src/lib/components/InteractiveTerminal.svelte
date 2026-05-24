<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";

  let termBody: HTMLDivElement;
  let termInput: HTMLInputElement;
  let inputRow: HTMLDivElement;

  const startTime = Date.now();
  const cmdHistory: string[] = [];
  let histIdx = -1;

  function fmtUptime(ms: number): string {
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    if (h > 0) return `up ${h}h ${m}m ${sec}s`;
    if (m > 0) return `up ${m}m ${sec}s`;
    return `up ${sec}s`;
  }

  const htmlEscapes: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  };
  function escapeHtml(s: string): string {
    return s.replace(/[&<>"']/g, (c) => htmlEscapes[c]);
  }

  function appendLine(html: string, cls = "out"): void {
    const div = document.createElement("div");
    div.className = cls ? "term-line " + cls : "term-line";
    div.innerHTML = html;
    termBody.insertBefore(div, inputRow);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function appendEcho(cmd: string): void {
    appendLine(
      `<span class="dollar">$</span><span class="cmd-echo"> ${escapeHtml(cmd)}</span>`,
      "",
    );
  }

  const COMMANDS: Record<string, () => void> = {
    help: () => {
      const cmds = [
        ["help", "show this list"],
        ["whoami", "who runs this place"],
        ["ls", "list pages"],
        ["about", "go to /about/"],
        ["blog", "go to /blog/"],
        ["contact", "go to /contact/"],
        ["neofetch", "system info"],
        ["date", "current date"],
        ["uptime", "page uptime"],
        ["cat motd", "message of the day"],
        ["echo", "echo text back"],
        ["clear", "clear the terminal"],
        ["exit", "try it and see"],
      ];
      cmds.forEach(([c, d]) => {
        appendLine(
          `  <span class="accent">${c.padEnd(11)}</span><span class="muted">${d}</span>`,
        );
      });
    },
    whoami: () => {
      appendLine("squirrel");
      appendLine(
        '<span class="muted">computer science student · 3D modeller · nix enjoyer</span>',
      );
    },
    ls: () => {
      appendLine(
        '  <a href="/about/">about/</a>   <a href="/blog/">blog/</a>   <a href="/contact/">contact/</a>   <span class="muted">README.md</span>',
      );
    },
    about: () => {
      appendLine('<span class="muted">opening /about/ …</span>');
      setTimeout(() => goto("/about"), 400);
    },
    blog: () => {
      appendLine('<span class="muted">opening /blog/ …</span>');
      setTimeout(() => goto("/blog"), 400);
    },
    contact: () => {
      appendLine('<span class="muted">opening /contact/ …</span>');
      setTimeout(() => goto("/contact"), 400);
    },
    neofetch: () => {
      const lines = [
        '<span class="accent">       __</span>     <span class="accent">squirrel</span>@<span class="accent">talosvault</span>',
        '<span class="accent">      /  \\</span>    -----------------',
        '<span class="accent">     ( o.o)</span>   OS:       NixOS (unstable)',
        '<span class="accent">     /     \\</span>  Shell:    /bin/zsh',
        '<span class="accent">    /  ___  \\</span> Editor:   neovim',
        '<span class="accent">   (__/   \\__)</span>WM:       hyprland',
        "              Uptime:   " +
          fmtUptime(Date.now() - startTime).replace("up ", ""),
        "              Pkgs:     too many",
        "              CPU:      hand-rolled silicon",
        "              RAM:      mostly cached blog drafts",
      ];
      lines.forEach((l) => appendLine(l));
    },
    date: () => appendLine(new Date().toString()),
    uptime: () => appendLine(fmtUptime(Date.now() - startTime)),
    "cat motd": () => {
      const msgs = [
        "Reproducible builds or it didn't happen.",
        "A function should return the same result every time given the same input.",
        "gaslighting windows since 2024.",
        "have you tried turning your flake off and on again?",
        "a wild squirrel appears.",
      ];
      appendLine(
        '<span class="accent">' +
          msgs[Math.floor(Math.random() * msgs.length)] +
          "</span>",
      );
    },
    clear: () => {
      [...termBody.querySelectorAll(".term-line")].forEach((n) => n.remove());
    },
    exit: () => {
      appendLine('<span class="err">there is no exit. only nix.</span>');
    },
  };

  function run(raw: string): void {
    const cmd = raw.trim();
    if (!cmd) return;
    cmdHistory.push(cmd);
    histIdx = cmdHistory.length;
    appendEcho(cmd);

    if (/^echo(\s|$)/i.test(cmd)) {
      appendLine(escapeHtml(cmd.replace(/^echo\s?/i, "")));
      return;
    }
    if (/^sudo\b/i.test(cmd)) {
      appendLine(
        '<span class="err">[sudo] password for squirrel: </span><span class="muted">nice try.</span>',
      );
      return;
    }
    if (/^rm\s+-rf/i.test(cmd)) {
      appendLine(
        '<span class="err">refusing to remove what doesn\'t exist on a read-only nix store.</span>',
      );
      return;
    }
    if (/^(apt|brew|pacman|yum|dnf)\b/i.test(cmd)) {
      appendLine(
        '<span class="muted">we don\'t do that here. try </span><span class="accent">nix-env -iA</span>',
      );
      return;
    }
    if (/^nix\b/i.test(cmd)) {
      appendLine('<span class="accent">❄  nix is the way.</span>');
      return;
    }

    const fn = COMMANDS[cmd.toLowerCase()];
    if (fn) {
      fn();
      return;
    }
    appendLine(
      `<span class="err">command not found:</span> ${escapeHtml(cmd)} <span class="muted"> - try </span><span class="accent">help</span>`,
    );
  }

  onMount(() => {
    termBody.addEventListener("click", () => termInput.focus());

    termInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        const v = termInput.value;
        termInput.value = "";
        run(v);
      } else if (e.key === "ArrowUp") {
        if (cmdHistory.length && histIdx > 0) {
          histIdx--;
          termInput.value = cmdHistory[histIdx];
          setTimeout(
            () =>
              termInput.setSelectionRange(
                termInput.value.length,
                termInput.value.length,
              ),
            0,
          );
        }
        e.preventDefault();
      } else if (e.key === "ArrowDown") {
        if (histIdx < cmdHistory.length - 1) {
          histIdx++;
          termInput.value = cmdHistory[histIdx];
        } else {
          histIdx = cmdHistory.length;
          termInput.value = "";
        }
        e.preventDefault();
      } else if (e.key === "l" && e.ctrlKey) {
        COMMANDS.clear();
        e.preventDefault();
      }
    });
  });
</script>

<section class="term">
  <header class="term-head">
    <div class="lights"><span></span><span></span><span></span></div>
    <div class="title">squirrel@talosvault: ~</div>
    <div class="hint">try <kbd>help</kbd></div>
  </header>
  <div class="term-body" bind:this={termBody}>
    <div class="term-line muted">
      Welcome to squirrel.talosvault.net. Type <span class="accent">help</span> to
      list commands.
    </div>
    <div class="term-input" bind:this={inputRow}>
      <span class="dollar">$</span>
      <input
        bind:this={termInput}
        autocomplete="off"
        spellcheck="false"
        autocapitalize="none"
      />
    </div>
  </div>
</section>

<style>
  .term {
    width: 100%;
    max-width: 820px;
    margin: 1.5rem auto 0;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-subtle);
    box-shadow: var(--shadow-md);
    overflow: hidden;
  }

  .term-head {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 14px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elevated);
  }

  .lights {
    display: flex;
    gap: 6px;
  }

  .lights span {
    width: 11px;
    height: 11px;
    border-radius: 50%;
  }

  .lights span:nth-child(1) {
    background: oklch(72% 0.15 25);
  }
  .lights span:nth-child(2) {
    background: oklch(82% 0.13 85);
  }
  .lights span:nth-child(3) {
    background: oklch(76% 0.14 145);
  }

  .title {
    margin-left: 8px;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    color: var(--text-muted);
    letter-spacing: 0.02em;
  }

  .hint {
    margin-left: auto;
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text-muted);
  }

  .hint kbd {
    font-family: var(--font-mono);
    background: var(--bg);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 1px 5px;
    font-size: 0.65rem;
    color: var(--text);
  }

  .term-body {
    padding: 18px 18px 14px;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    line-height: 1.55;
    color: var(--text);
    max-height: 380px;
    overflow-y: auto;
    scrollbar-width: thin;
    scrollbar-color: var(--border) transparent;
    cursor: text;
  }

  .term-body::-webkit-scrollbar {
    width: 6px;
  }
  .term-body::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 3px;
  }

  /* Styles for dynamically injected .term-line elements */
  .term-body :global(.term-line) {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .term-body :global(.term-line.muted),
  .term-body :global(.term-line .muted) {
    color: var(--text-muted);
  }
  .term-body :global(.term-line.accent),
  .term-body :global(.term-line .accent) {
    color: var(--accent);
  }
  .term-body :global(.term-line.err),
  .term-body :global(.term-line .err) {
    color: oklch(58% 0.18 25);
  }
  .term-body :global(.term-line .dollar) {
    color: var(--accent);
    margin-right: 4px;
  }
  .term-body :global(.term-line .cmd-echo) {
    color: var(--text);
  }
  .term-body :global(.term-line a) {
    color: var(--accent);
    text-decoration: underline;
    text-underline-offset: 3px;
  }
  .term-body :global(.term-line a:hover) {
    color: var(--text);
  }

  .term-input {
    display: flex;
    align-items: center;
    gap: 8px;
    padding-top: 4px;
  }

  .dollar {
    color: var(--accent);
    user-select: none;
    font-family: var(--font-mono);
    font-size: 0.875rem;
  }

  .term-input input {
    flex: 1;
    background: transparent;
    border: 0;
    outline: 0;
    font-family: var(--font-mono);
    font-size: 0.875rem;
    color: var(--text);
    caret-color: var(--accent);
    padding: 2px 0;
  }

  /* The welcome line uses these inline spans */
  .term-line {
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  .term-line.muted {
    color: var(--text-muted);
  }
  .muted {
    color: var(--text-muted);
  }
  .accent {
    color: var(--accent);
  }
</style>
