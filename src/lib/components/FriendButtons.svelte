<!-- NOTE: Claude helped me write some of the physics code for this, and also all the CSS. I am really bad at CSS. -->

<script lang="ts">
  import { onMount } from "svelte";

  const BUTTON_W = 88;
  const BUTTON_H = 31;
  const CONTAINER_H = 220;
  const GAP = 12;
  const LIVES = 3;
  // stuff is calculated in frame
  // 60 = 1 second
  const BASH_COOLDOWN_BASE = 120;
  const NOVA_COOLDOWN_BASE = 420;
  const NOVA_RADIUS = 160;
  const NOVA_PUSH = 17;
  const STUN_FRAMES = 75;
  const CONCUSS_FRAMES = 100;
  const INVINCIBLE_FRAMES = 60;
  const WIN_FRAMES = 300;
  const HOLD_DIST = 32;
  const BASH_SPEED = 18;

  interface Friend {
    name: string;
    url: string;
    image?: string;
    color?: string;
  }

  const friends: Friend[] = [
    {
      name: "CRISPY",
      url: "https://crispy-caesus.eu",
      color: "#3a9c2e",
      image: "https://crispy-caesus.eu/static/crispybutton.png",
    },
    { name: "raf", url: "https://notashelf.dev/" },
    {
      name: "orange",
      url: "https://orangc.net",
      color: "#c47d00",
      image: "https://zip.orangc.net/raw/Q5AK8G.png",
    },
    {
      name: "twig",
      url: "https://imnottwig.github.io",
      color: "#981aed",
    },
  ];

  interface BtnState {
    x: number;
    y: number;
    vx: number;
    vy: number;
    homeX: number;
    homeY: number;
    lives: number;
    cooldown: number;
    novaCooldown: number;
    stunned: number;
    concussed: number;
    invincible: number;
    bashing: boolean;
    deadSettled: boolean;
  }

  let slotOrder: number[] = [];

  let containerEl: HTMLElement;
  let btnEls: HTMLElement[] = [];
  let timerEl: HTMLElement;
  let containerW = 600;
  let states: BtnState[] = [];
  let mouseX = -9999,
    mouseY = -9999;
  let isHovering = false;
  let cursorHolder = -1;
  let holdTimer = 0;
  let winnerIdx = -1;
  let animFrame: number;

  function calcHomes(w: number): BtnState[] {
    const n = friends.length;
    const totalW = n * BUTTON_W + (n - 1) * GAP;
    const startX = Math.max(0, (w - totalW) / 2);
    const homeY = Math.floor((CONTAINER_H - BUTTON_H) / 2) - 8;
    slotOrder = friends.map((_, i) => i);
    for (let i = slotOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [slotOrder[i], slotOrder[j]] = [slotOrder[j], slotOrder[i]];
    }
    return friends.map((_, i) => {
      const slotX = startX + slotOrder[i] * (BUTTON_W + GAP);
      return {
        x: slotX,
        y: homeY,
        vx: 0,
        vy: 0,
        homeX: slotX,
        homeY,
        lives: LIVES,
        cooldown: 30 + Math.floor(Math.random() * 60),
        novaCooldown: 60 + Math.floor(Math.random() * 120),
        stunned: 0,
        concussed: 0,
        invincible: 0,
        bashing: false,
        deadSettled: false,
      };
    });
  }

  function resetGame() {
    winnerIdx = -1;
    cursorHolder = -1;
    holdTimer = 0;
    states = calcHomes(containerW);
    for (let i = 0; i < states.length; i++) {
      const el = btnEls[i];
      if (!el) continue;
      el.classList.remove("dead", "bashing", "stunned", "holding", "won");
      el.style.transform = `translate(${states[i].x}px, ${states[i].y}px)`;
      updateLives(i);
    }
    if (timerEl) timerEl.style.opacity = "0";
  }

  function updateLives(i: number) {
    const el = btnEls[i]?.querySelector<HTMLElement>(".lives");
    if (el)
      el.textContent =
        "♥".repeat(states[i].lives) +
        "♡".repeat(Math.max(0, LIVES - states[i].lives));
  }

  // AI: pick a target to BASH, or null if there's no one left to fight
  function aiDecide(i: number): { tx: number; ty: number } | null {
    const hasOpponents = states.some((b, j) => j !== i && b.lives > 0);
    if (!hasOpponents) return null;

    // Envy: on 1 life, ignore everything else, take out whoever has the most
    if (states[i].lives === 1) {
      let envyIdx = -1,
        maxLives = 0;
      for (let j = 0; j < states.length; j++) {
        if (j === i || states[j].lives <= 0) continue;
        if (states[j].lives > maxLives) {
          maxLives = states[j].lives;
          envyIdx = j;
        }
      }
      if (envyIdx >= 0) {
        const o = states[envyIdx];
        return { tx: o.x + BUTTON_W / 2, ty: o.y + BUTTON_H / 2 };
      }
    }

    // Urgent: someone is about to win, stop them
    if (
      cursorHolder >= 0 &&
      cursorHolder !== i &&
      holdTimer > WIN_FRAMES * 0.25
    ) {
      const h = states[cursorHolder];
      return { tx: h.x + BUTTON_W / 2, ty: h.y + BUTTON_H / 2 };
    }

    // Opportunistic: finish off the weakest target
    let weakIdx = -1,
      minLives = LIVES;
    for (let j = 0; j < states.length; j++) {
      if (j === i || states[j].lives <= 0) continue;
      if (states[j].lives < minLives) {
        minLives = states[j].lives;
        weakIdx = j;
      }
    }
    if (weakIdx >= 0) {
      const o = states[weakIdx];
      return { tx: o.x + BUTTON_W / 2, ty: o.y + BUTTON_H / 2 };
    }

    // Default: rush the cursor
    return { tx: mouseX, ty: mouseY };
  }

  function launchBash(i: number, tx: number, ty: number) {
    const b = states[i];
    const dx = tx - (b.x + BUTTON_W / 2);
    const dy = ty - (b.y + BUTTON_H / 2);
    const dist = Math.sqrt(dx * dx + dy * dy) || 1;
    b.vx = (dx / dist) * BASH_SPEED;
    b.vy = (dy / dist) * BASH_SPEED;
    b.bashing = true;
    b.cooldown = BASH_COOLDOWN_BASE + Math.floor(Math.random() * 80);
  }

  function shouldNova(i: number): boolean {
    const cx = states[i].x + BUTTON_W / 2;
    const cy = states[i].y + BUTTON_H / 2;
    // At cursor: fire if any basher is incoming
    if (i === cursorHolder) {
      return states.some(
        (b, j) =>
          j !== i &&
          b.bashing &&
          b.lives > 0 &&
          Math.sqrt(
            (b.x + BUTTON_W / 2 - cx) ** 2 + (b.y + BUTTON_H / 2 - cy) ** 2,
          ) < NOVA_RADIUS,
      );
    }
    // Offensive: close to the cursor holder, nova to blast them off
    if (cursorHolder >= 0 && cursorHolder !== i) {
      const h = states[cursorHolder];
      const d = Math.sqrt(
        (cx - (h.x + BUTTON_W / 2)) ** 2 + (cy - (h.y + BUTTON_H / 2)) ** 2,
      );
      if (d < NOVA_RADIUS * 0.65) return true;
    }

    // Otherwise: fire if surrounded by 2+ buttons close by
    let nearby = 0;
    for (let j = 0; j < states.length; j++) {
      if (j === i || states[j].lives <= 0) continue;
      const d = Math.sqrt(
        (states[j].x + BUTTON_W / 2 - cx) ** 2 +
          (states[j].y + BUTTON_H / 2 - cy) ** 2,
      );
      if (d < NOVA_RADIUS * 0.55) nearby++;
    }
    return nearby >= 2;
  }

  function triggerNova(i: number) {
    const b = states[i];
    b.novaCooldown = NOVA_COOLDOWN_BASE + Math.floor(Math.random() * 100);
    const cx = b.x + BUTTON_W / 2;
    const cy = b.y + BUTTON_H / 2;

    // Spawn expanding ring visual
    const ring = document.createElement("div");
    ring.className = "nova-ring";
    ring.style.left = cx + "px";
    ring.style.top = cy + "px";
    containerEl.appendChild(ring);
    ring.addEventListener("animationend", () => ring.remove(), { once: true });

    // Push all other alive buttons radially
    const n = states.length;
    for (let j = 0; j < n; j++) {
      if (j === i || states[j].lives <= 0) continue;
      const o = states[j];
      const dx = o.x + BUTTON_W / 2 - cx;
      const dy = o.y + BUTTON_H / 2 - cy;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < NOVA_RADIUS) {
        const falloff = 1 - dist / NOVA_RADIUS;
        o.vx += (dx / dist) * NOVA_PUSH * falloff;
        o.vy += (dy / dist) * NOVA_PUSH * falloff;
        // Close enough and not invincible: concussed after the throw
        if (falloff > 0.4 && o.invincible === 0 && Math.random() < 0.65) {
          o.concussed = CONCUSS_FRAMES + Math.floor(Math.random() * 60);
        }
      }
    }
  }

  function tick() {
    if (winnerIdx >= 0) {
      if (timerEl) {
        const w = states[winnerIdx];
        timerEl.style.transform = `translate(calc(${w.x + BUTTON_W / 2}px - 50%), ${w.y - 20}px)`;
        timerEl.textContent = "🏆";
        timerEl.style.opacity = "1";
      }
      animFrame = requestAnimationFrame(tick);
      return;
    }

    const n = states.length;

    // AI, tick cooldowns, decide bashes and novas
    if (isHovering) {
      for (let i = 0; i < n; i++) {
        const b = states[i];
        if (b.lives <= 0 || b.bashing || b.stunned > 0 || b.concussed > 0)
          continue;
        if (b.novaCooldown > 0) b.novaCooldown--;
        if (b.cooldown > 0) b.cooldown--;
        // Nova takes priority over bash
        if (b.novaCooldown === 0 && shouldNova(i)) {
          triggerNova(i);
          continue;
        }
        if (b.cooldown === 0) {
          const target = aiDecide(i);
          if (target) launchBash(i, target.tx, target.ty);
        }
      }
    }

    // Apply physics per state
    for (let i = 0; i < n; i++) {
      const b = states[i];
      if (b.lives <= 0) continue;

      if (b.invincible > 0) b.invincible--;
      if (b.stunned > 0) {
        b.stunned--;
        b.vx *= 0.88;
        b.vy *= 0.88;
      } else if (b.concussed > 0) {
        b.concussed--;
        b.vx *= 0.92;
        b.vy *= 0.92;
      } else if (b.bashing) {
        // Bash slows naturally; end if nearly stopped
        b.vx *= 0.93;
        b.vy *= 0.93;
        if (Math.abs(b.vx) + Math.abs(b.vy) < 0.6) b.bashing = false;
      } else if (isHovering) {
        // Idle, gentle drift toward cursor
        const cx = b.x + BUTTON_W / 2;
        const cy = b.y + BUTTON_H / 2;
        b.vx += (mouseX - cx) * 0.015;
        b.vy += (mouseY - cy) * 0.015;
        b.vx *= 0.88;
        b.vy *= 0.88;
      } else {
        // Return home
        b.vx += (b.homeX - b.x) * 0.06;
        b.vy += (b.homeY - b.y) * 0.06;
        b.vx *= 0.82;
        b.vy *= 0.82;
      }
    }

    // Integrate positions
    for (let i = 0; i < n; i++) {
      if (states[i].lives <= 0) continue;
      states[i].x += states[i].vx;
      states[i].y += states[i].vy;
    }

    // Passive separation, non-bashing buttons can never overlap
    for (let i = 0; i < n; i++) {
      if (states[i].lives <= 0 || states[i].bashing) continue;
      for (let j = i + 1; j < n; j++) {
        if (states[j].lives <= 0 || states[j].bashing) continue;
        const a = states[i],
          b = states[j];
        const dx = b.x + BUTTON_W / 2 - (a.x + BUTTON_W / 2);
        const dy = b.y + BUTTON_H / 2 - (a.y + BUTTON_H / 2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minSep = BUTTON_W + 4;
        if (dist < minSep) {
          const nx = dx / dist,
            ny = dy / dist;
          const overlap = (minSep - dist) * 0.5;
          a.x -= nx * overlap;
          a.y -= ny * overlap;
          b.x += nx * overlap;
          b.y += ny * overlap;
          // Dampen relative velocity along the normal so they don't jitter
          const dot = (a.vx - b.vx) * nx + (a.vy - b.vy) * ny;
          if (dot > 0) {
            a.vx -= dot * nx * 0.4;
            a.vy -= dot * ny * 0.4;
            b.vx += dot * nx * 0.4;
            b.vy += dot * ny * 0.4;
          }
        }
      }
    }

    // Bash collision detection
    for (let i = 0; i < n; i++) {
      const a = states[i];
      if (!a.bashing || a.lives <= 0) continue;

      for (let j = 0; j < n; j++) {
        if (j === i || states[j].lives <= 0) continue;
        const b = states[j];
        const dx = b.x + BUTTON_W / 2 - (a.x + BUTTON_W / 2);
        const dy = b.y + BUTTON_H / 2 - (a.y + BUTTON_H / 2);

        if (Math.sqrt(dx * dx + dy * dy) < BUTTON_W + 4) {
          // Knock victim away, skip damage if invincible
          if (b.invincible > 0) {
            a.bashing = false;
            a.vx *= 0.15;
            a.vy *= 0.15;
            break;
          }
          b.lives--;
          if (b.lives <= 0) a.lives++; // kill steals a life
          b.invincible = INVINCIBLE_FRAMES;
          const ang = Math.atan2(dy, dx);
          const spd = 15 + Math.random() * 8;
          b.vx = Math.cos(ang) * spd;
          b.vy = Math.sin(ang) * spd;
          b.stunned = STUN_FRAMES + Math.floor(Math.random() * 20);
          b.bashing = false;
          // Basher stops on first hit, one damage per bash
          a.bashing = false;
          a.vx *= 0.15;
          a.vy *= 0.15;
          // If victim was holding cursor, everyone rushes
          if (j === cursorHolder) {
            cursorHolder = -1;
            holdTimer = 0;
            for (let k = 0; k < n; k++) {
              if (
                states[k].lives > 0 &&
                !states[k].bashing &&
                states[k].stunned === 0 &&
                states[k].concussed === 0
              ) {
                states[k].cooldown = 0;
              }
            }
          }
          updateLives(i);
          updateLives(j);
          break; // bash only damages one target
        }
      }

      // If bash reaches cursor, settle there
      if (isHovering) {
        const dx = mouseX - (a.x + BUTTON_W / 2);
        const dy = mouseY - (a.y + BUTTON_H / 2);
        if (Math.sqrt(dx * dx + dy * dy) < HOLD_DIST) a.bashing = false;
      }
    }

    // Dead button physics, gravity, bounce, floor settle
    for (let i = 0; i < n; i++) {
      const b = states[i];
      if (b.lives > 0 || b.deadSettled) continue;
      b.vy += 0.5;
      b.vx *= 0.97;
      b.x += b.vx;
      b.y += b.vy;
      if (b.x < 0) {
        b.x = 0;
        b.vx = Math.abs(b.vx) * 0.5;
      }
      if (b.x > containerW - BUTTON_W) {
        b.x = containerW - BUTTON_W;
        b.vx = -Math.abs(b.vx) * 0.5;
      }
      if (b.y < 0) {
        b.y = 0;
        b.vy = Math.abs(b.vy) * 0.3;
      }
      const floorY = CONTAINER_H - BUTTON_H;
      if (b.y >= floorY) {
        b.y = floorY;
        b.vy = -Math.abs(b.vy) * 0.3;
        b.vx *= 0.8;
        if (Math.abs(b.vy) < 0.8 && Math.abs(b.vx) < 0.8) {
          b.vx = 0;
          b.vy = 0;
          b.deadSettled = true;
        }
      }
    }

    // Dead-dead separation, pile up effect (allow partial overlap)
    for (let i = 0; i < n; i++) {
      if (states[i].lives > 0) continue;
      for (let j = i + 1; j < n; j++) {
        if (states[j].lives > 0) continue;
        const a = states[i],
          b = states[j];
        const dx = b.x + BUTTON_W / 2 - (a.x + BUTTON_W / 2);
        const dy = b.y + BUTTON_H / 2 - (a.y + BUTTON_H / 2);
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const minSep = BUTTON_W * 0.6;
        if (dist < minSep) {
          const nx = dx / dist,
            ny = dy / dist;
          const push = (minSep - dist) * 0.5;
          a.x -= nx * push;
          a.y -= ny * push;
          b.x += nx * push;
          b.y += ny * push;
          if (push > 0.5) {
            a.deadSettled = false;
            b.deadSettled = false;
          }
        }
      }
    }

    // Last survivor wins automatically
    let aliveCount = 0,
      lastAlive = -1;
    for (let i = 0; i < n; i++) {
      if (states[i].lives > 0) {
        aliveCount++;
        lastAlive = i;
      }
    }
    if (aliveCount === 1 && winnerIdx < 0) {
      winnerIdx = lastAlive;
      cursorHolder = lastAlive;
      holdTimer = 1;
      for (let i = 0; i < n; i++) {
        states[i].invincible = 0;
        if (btnEls[i]) btnEls[i].classList.remove("invincible");
      }
    }

    // Cursor hold tracking
    if (isHovering) {
      const prevHolder = cursorHolder;
      let newHolder = -1,
        minD = Infinity;
      for (let i = 0; i < n; i++) {
        const b = states[i];
        if (b.lives <= 0 || b.stunned > 0 || b.concussed > 0 || b.bashing)
          continue;
        const d = Math.sqrt(
          (mouseX - b.x - BUTTON_W / 2) ** 2 +
            (mouseY - b.y - BUTTON_H / 2) ** 2,
        );
        if (d < HOLD_DIST && d < minD) {
          minD = d;
          newHolder = i;
        }
      }
      cursorHolder = newHolder;
      // Cursor just became empty, everyone rushes
      if (prevHolder >= 0 && cursorHolder < 0) {
        for (let i = 0; i < n; i++) {
          if (
            states[i].lives > 0 &&
            !states[i].bashing &&
            states[i].stunned === 0
          ) {
            states[i].cooldown = 0;
          }
        }
      }
      if (cursorHolder >= 0) {
        holdTimer++;
        if (holdTimer >= WIN_FRAMES) {
          winnerIdx = cursorHolder;
          for (let i = 0; i < n; i++) {
            states[i].invincible = 0;
            if (btnEls[i]) btnEls[i].classList.remove("invincible");
          }
        }
      } else {
        holdTimer = Math.max(0, holdTimer - 2);
      }
    } else {
      cursorHolder = -1;
      holdTimer = 0;
    }

    // Boundary clamp
    for (let i = 0; i < n; i++) {
      const b = states[i];
      if (b.lives <= 0) continue;
      if (b.x < 0) {
        b.x = 0;
        b.vx = Math.abs(b.vx) * 0.5;
      }
      if (b.x > containerW - BUTTON_W) {
        b.x = containerW - BUTTON_W;
        b.vx = -Math.abs(b.vx) * 0.5;
      }
      // Keep top clear so lives indicator shows
      if (b.y < 18) {
        b.y = 18;
        b.vy = Math.abs(b.vy) * 0.5;
      }
      if (b.y > CONTAINER_H - BUTTON_H) {
        b.y = CONTAINER_H - BUTTON_H;
        b.vy = -Math.abs(b.vy) * 0.5;
      }
    }

    // DOM updates
    for (let i = 0; i < n; i++) {
      const b = states[i];
      const el = btnEls[i];
      if (!el) continue;

      if (b.lives <= 0) {
        el.classList.add("dead");
        el.classList.remove(
          "invincible",
          "bashing",
          "stunned",
          "concussed",
          "holding",
        );
        el.style.transform = `translate(${b.x}px, ${b.y}px)`;
        continue;
      }

      el.style.transform = `translate(${b.x}px, ${b.y}px)`;
      el.classList.remove(
        "bashing",
        "stunned",
        "concussed",
        "invincible",
        "holding",
        "won",
      );
      if (b.bashing) el.classList.add("bashing");
      else if (b.stunned > 0) el.classList.add("stunned");
      else if (b.concussed > 0) el.classList.add("concussed");
      else if (i === cursorHolder) el.classList.add("holding");
      if (b.invincible > 0) el.classList.add("invincible");
      if (i === winnerIdx) el.classList.add("won");
    }

    // Countdown above the holder / trophy above winner
    if (timerEl) {
      const displayIdx = winnerIdx >= 0 ? winnerIdx : cursorHolder;
      if (displayIdx >= 0 && (winnerIdx >= 0 || holdTimer > 0)) {
        const h = states[displayIdx];
        timerEl.style.transform = `translate(calc(${h.x + BUTTON_W / 2}px - 50%), ${h.y - 20}px)`;
        timerEl.textContent =
          winnerIdx >= 0
            ? "🏆"
            : String(Math.ceil((WIN_FRAMES - holdTimer) / 60));
        timerEl.style.opacity = "1";
      } else {
        timerEl.style.opacity = "0";
      }
    }

    animFrame = requestAnimationFrame(tick);
  }

  onMount(() => {
    containerW = containerEl.clientWidth;
    states = calcHomes(containerW);
    for (let i = 0; i < states.length; i++) {
      if (btnEls[i]) {
        btnEls[i].style.transform =
          `translate(${states[i].x}px, ${states[i].y}px)`;
        updateLives(i);
      }
    }
    animFrame = requestAnimationFrame(tick);

    const ro = new ResizeObserver(([entry]) => {
      containerW = entry.contentRect.width;
      const n = friends.length;
      const totalW = n * BUTTON_W + (n - 1) * GAP;
      const startX = Math.max(0, (containerW - totalW) / 2);
      const homeY = Math.floor((CONTAINER_H - BUTTON_H) / 2) - 8;
      for (let i = 0; i < states.length; i++) {
        states[i].homeX = startX + slotOrder[i] * (BUTTON_W + GAP);
        states[i].homeY = homeY;
      }
    });
    ro.observe(containerEl);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(animFrame);
    };
  });
</script>

<div
  class="arena"
  bind:this={containerEl}
  style="height: {CONTAINER_H}px"
  onmousemove={(e) => {
    const r = containerEl.getBoundingClientRect();
    mouseX = e.clientX - r.left;
    mouseY = e.clientY - r.top;
  }}
  onmouseenter={() => {
    if (winnerIdx >= 0) resetGame();
    isHovering = true;
  }}
  onmouseleave={() => {
    isHovering = false;
    cursorHolder = -1;
    holdTimer = 0;
  }}
  role="region"
  aria-label="Cool people"
>
  <span class="hint" class:hidden={isHovering}>move your cursor in here</span>
  <span class="timer" bind:this={timerEl}></span>

  {#each friends as friend, i (friend.name)}
    <a
      bind:this={btnEls[i]}
      class="btn"
      href={friend.url}
      style="--c: {friend.color ?? 'var(--text-muted)'};"
      target="_blank"
      rel="noopener noreferrer"
      aria-label={friend.name}
    >
      {#if friend.image}
        <img src={friend.image} alt={friend.name} width="88" height="31" />
      {:else}
        <span class="name">{friend.name}</span>
      {/if}
      <span class="lives" aria-hidden="true"></span>
    </a>
  {/each}
</div>

<style>
  .arena {
    position: relative;
    width: 100%;
    overflow: hidden;
    border: 1px solid var(--border);
    border-radius: var(--radius);
    background: var(--bg-elevated);
    cursor: crosshair;
  }

  .hint {
    position: absolute;
    bottom: 0.6rem;
    left: 50%;
    transform: translateX(-50%);
    font-family: var(--font-mono);
    font-size: 0.7rem;
    color: var(--text);
    background: color-mix(in srgb, var(--bg) 88%, transparent);
    border: 1px solid var(--border);
    border-radius: 3px;
    padding: 0.25rem 0.6rem;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity 0.3s ease;
    z-index: 30;
    opacity: 1;
  }

  .hint.hidden {
    opacity: 0;
  }

  .timer {
    position: absolute;
    top: 0;
    left: 0;
    font-family: var(--font-mono);
    font-size: 0.8rem;
    font-weight: 700;
    color: var(--accent);
    pointer-events: none;
    opacity: 0;
    z-index: 20;
    white-space: nowrap;
    transition: opacity 0.15s ease;
  }

  .btn {
    position: absolute;
    top: 0;
    left: 0;
    width: 88px;
    height: 31px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid var(--border);
    border-radius: 2px;
    text-decoration: none;
    font-family: var(--font-mono);
    color: var(--c);
    background: var(--bg);
    user-select: none;
    will-change: transform;
    overflow: visible;
  }

  .name {
    font-size: 0.62rem;
    font-weight: 700;
  }

  .lives {
    position: absolute;
    top: -14px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 7px;
    line-height: 1;
    color: #e05060;
    letter-spacing: 1px;
    white-space: nowrap;
    pointer-events: none;
  }

  .btn img {
    display: block;
    width: 88px;
    height: 31px;
    image-rendering: pixelated;
  }

  .btn:hover {
    text-decoration: none;
  }

  :global(.btn.bashing) {
    box-shadow: 0 0 10px orange;
    z-index: 5;
  }
  :global(.btn.stunned) {
    opacity: 0.4;
  }
  :global(.btn.holding) {
    box-shadow: 0 0 14px var(--accent);
    z-index: 10;
  }
  :global(.btn.won) {
    z-index: 20;
    animation: pulse-win 0.6s ease infinite alternate;
  }
  :global(.btn.won) .lives {
    display: none;
  }
  :global(.btn.dead) {
    pointer-events: none;
    opacity: 0.8;
    filter: grayscale(0.7);
    z-index: 1;
  }
  :global(.btn.dead::after) {
    content: "x\00A0\00A0\00A0x";
    position: absolute;
    inset: 0;
    overflow: hidden;
    background: rgba(15, 5, 5, 0.65);
    color: #ff3333;
    font-family: monospace;
    font-size: 11px;
    font-weight: 900;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  :global(.btn.dead .lives) {
    display: none;
  }

  :global(.nova-ring) {
    position: absolute;
    width: 0;
    height: 0;
    border-radius: 50%;
    border: 3px solid var(--accent);
    transform: translate(-50%, -50%);
    pointer-events: none;
    animation: nova-expand 0.5s ease-out forwards;
    z-index: 15;
  }

  @keyframes nova-expand {
    0% {
      width: 0;
      height: 0;
      opacity: 1;
      border-width: 3px;
    }
    100% {
      width: 320px;
      height: 320px;
      opacity: 0;
      border-width: 1px;
    }
  }

  :global(.btn.invincible) {
    animation: invincible-flicker 0.1s step-end infinite;
  }

  @keyframes invincible-flicker {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.15;
    }
  }

  :global(.btn.concussed) {
    opacity: 0.5;
    animation: concuss-pulse 0.35s ease infinite alternate;
  }

  @keyframes concuss-pulse {
    from {
      box-shadow: 0 0 4px #aaa;
      opacity: 0.35;
    }
    to {
      box-shadow: 0 0 10px #ddd;
      opacity: 0.6;
    }
  }

  @keyframes pulse-win {
    from {
      box-shadow: 0 0 12px gold;
    }
    to {
      box-shadow:
        0 0 40px gold,
        0 0 80px gold;
    }
  }
</style>
