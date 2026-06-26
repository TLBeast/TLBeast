/* =========================================================================
   xv6, demystified — interactive logic
   Plain vanilla JS, no dependencies. Each section is self-contained below.
   ========================================================================= */

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => [...root.querySelectorAll(sel)];
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* =========================================================================
   GLOBAL: scroll progress, nav highlight, reveal-on-scroll, mobile nav
   ========================================================================= */
(function globalUI() {
  const progress = $("#scroll-progress");
  const links = $$(".nav-link");
  const sections = links.map((l) => $(l.getAttribute("href"))).filter(Boolean);

  window.addEventListener("scroll", () => {
    const h = document.documentElement;
    const scrolled = h.scrollTop / (h.scrollHeight - h.clientHeight);
    progress.style.width = `${scrolled * 100}%`;
  });

  // Active section in nav
  const navObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          links.forEach((l) => l.classList.remove("active"));
          const active = links.find((l) => l.getAttribute("href") === `#${e.target.id}`);
          if (active) active.classList.add("active");
        }
      });
    },
    { rootMargin: "-45% 0px -50% 0px" }
  );
  sections.forEach((s) => navObserver.observe(s));

  // Reveal on scroll
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          revealObserver.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  $$(".section-head, .cpu-demo, .sched-demo, .race-demo, .persist-demo, .trap-demo, .process-demo, .states-demo, .struct-demo, .layer-stack, .three-pillars, .fe-demo, .cs-demo, .rd, .xv6-about").forEach(
    (el) => revealObserver.observe(el)
  );

  // Mobile nav toggle
  const toggle = $("#nav-toggle");
  const nav = $("#sidenav");
  toggle.addEventListener("click", () => nav.classList.toggle("open"));
  $$(".nav-link").forEach((l) => l.addEventListener("click", () => nav.classList.remove("open")));
})();

/* =========================================================================
   SHARED TOOLTIP (used by layer stack + process memory/registers)
   ========================================================================= */
const tooltip = (() => {
  const el = document.createElement("div");
  el.id = "tooltip";
  document.body.appendChild(el);
  let visible = false;

  function show(name, text, x, y) {
    el.innerHTML = name ? `<span class="tt-name">${name}</span>${text}` : text;
    el.classList.add("show");
    visible = true;
    move(x, y);
  }
  function move(x, y) {
    if (!visible) return;
    const pad = 16;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    let left = x + pad;
    let top = y + pad;
    if (left + w > window.innerWidth - 10) left = x - w - pad;
    if (top + h > window.innerHeight - 10) top = y - h - pad;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
  }
  function hide() {
    el.classList.remove("show");
    visible = false;
  }
  return { show, move, hide };
})();

function attachTooltip(elements, getName) {
  elements.forEach((el) => {
    const text = el.dataset.info;
    if (!text) return;
    const name = getName ? getName(el) : el.dataset.name || "";
    el.addEventListener("mouseenter", (e) => tooltip.show(name, text, e.clientX, e.clientY));
    el.addEventListener("mousemove", (e) => tooltip.move(e.clientX, e.clientY));
    el.addEventListener("mouseleave", () => tooltip.hide());
    // touch: tap to toggle
    el.addEventListener("click", (e) => {
      const r = el.getBoundingClientRect();
      tooltip.show(name, text, r.left + r.width / 2, r.top);
      setTimeout(() => tooltip.hide(), 3500);
    });
  });
}

// Chapter 1 layer stack
attachTooltip($$("#layer-stack .layer"), (el) => el.querySelector(".layer-title")?.textContent.trim().split("\n")[0]);
// Chapter 7 memory regions + register cards
attachTooltip($$("#process .mem-region"), (el) => el.dataset.name);
attachTooltip($$("#process .reg-card"), (el) => el.querySelector(".rc-name")?.textContent);

/* =========================================================================
   CHAPTER 2 — FETCH / DECODE / EXECUTE
   A tiny CPU with 4 instructions running a small program.
   ========================================================================= */
(function fdeDemo() {
  // Program: SET acc, ADD n, PRINT (acc as char A+acc%26 or digit), JMP
  // We'll keep it friendly: prints letters as ACC changes.
  const program = [
    { op: "SET", arg: 0, text: 'SET ACC, 0', say: "Put 0 into the accumulator." },
    { op: "ADD", arg: 1, text: "ADD ACC, 1", say: "Add 1 to the accumulator." },
    { op: "PRINT", arg: null, text: "PRINT ACC", say: "Print the accumulator value." },
    { op: "ADD", arg: 4, text: "ADD ACC, 4", say: "Add 4 to the accumulator." },
    { op: "PRINT", arg: null, text: "PRINT ACC", say: "Print the accumulator value." },
    { op: "JMP", arg: 1, text: "JMP line 1", say: "Jump back to line 1 — loop forever!" },
  ];

  const listEl = $("#instr-list");
  const readout = $("#cpu-readout");
  const pcEl = $("#reg-pc");
  const accEl = $("#reg-acc");
  const outputEl = $("#fde-output");
  const stages = { fetch: $('.stage[data-stage="fetch"]'), decode: $('.stage[data-stage="decode"]'), execute: $('.stage[data-stage="execute"]') };

  let pc = 0;
  let acc = 0;
  let phase = "fetch"; // fetch -> decode -> execute
  let running = false;
  let current = null;

  function renderProgram() {
    listEl.innerHTML = program
      .map((ins, i) => `<li data-i="${i}"><span class="ln">${i}</span><span>${ins.text}</span></li>`)
      .join("");
  }

  function setStage(s) {
    Object.values(stages).forEach((el) => el.classList.remove("on"));
    if (s) stages[s].classList.add("on");
  }

  function highlightLine(i) {
    $$("#instr-list li").forEach((li) => li.classList.toggle("active", +li.dataset.i === i));
  }

  function update() {
    pcEl.textContent = pc;
    accEl.textContent = acc;
  }

  function step() {
    if (phase === "fetch") {
      current = program[pc];
      highlightLine(pc);
      setStage("fetch");
      readout.innerHTML = `<strong style="color:var(--fetch)">FETCH</strong> · grabbed instruction at line ${pc}: <code>${current.text}</code>`;
      phase = "decode";
    } else if (phase === "decode") {
      setStage("decode");
      readout.innerHTML = `<strong style="color:var(--decode)">DECODE</strong> · this is a <code>${current.op}</code> instruction. ${current.say}`;
      phase = "execute";
    } else {
      setStage("execute");
      let jumped = false;
      switch (current.op) {
        case "SET":
          acc = current.arg;
          break;
        case "ADD":
          acc += current.arg;
          break;
        case "PRINT":
          printChar(acc);
          break;
        case "JMP":
          pc = current.arg;
          jumped = true;
          break;
      }
      readout.innerHTML = `<strong style="color:var(--execute)">EXECUTE</strong> · ${current.say}`;
      if (!jumped) pc = (pc + 1) % program.length;
      phase = "fetch";
      update();
    }
  }

  function printChar(v) {
    const span = document.createElement("span");
    span.textContent = v + " ";
    outputEl.appendChild(span);
    outputEl.scrollTop = outputEl.scrollHeight;
    // Keep output from growing forever
    if (outputEl.childNodes.length > 60) outputEl.removeChild(outputEl.firstChild);
  }

  function reset() {
    running = false;
    pc = 0;
    acc = 0;
    phase = "fetch";
    current = null;
    setStage(null);
    highlightLine(-1);
    outputEl.textContent = "";
    readout.innerHTML = "Press <kbd>Step</kbd> to run one stage at a time, or <kbd>Run</kbd> to watch the heartbeat.";
    update();
    $("#fde-run").textContent = "Run ▶";
  }

  $("#fde-step").addEventListener("click", () => {
    if (running) return;
    step();
  });

  $("#fde-run").addEventListener("click", async () => {
    running = !running;
    $("#fde-run").textContent = running ? "Pause ⏸" : "Run ▶";
    while (running) {
      step();
      await sleep(520);
    }
  });

  $("#fde-reset").addEventListener("click", reset);

  renderProgram();
  reset();
})();

/* =========================================================================
   CHAPTER 3 — CPU VIRTUALIZATION (scheduler / time-sharing)
   ========================================================================= */
(function schedulerDemo() {
  const colors = ["#7c5cff", "#21d4fd", "#34e89e", "#ffb020", "#ff5c7c", "#c792ea"];
  const letters = ["A", "B", "C", "D", "E", "F"];

  const poolEl = $("#proc-pool");
  const chipEl = $("#cpu-chip");
  const outEl = $("#sched-output");
  const sliceSlider = $("#slice-slider");
  const countSlider = $("#count-slider");

  let procs = [];
  let running = false;
  let rrIndex = 0;

  function build() {
    const n = +countSlider.value;
    procs = letters.slice(0, n).map((L, i) => ({
      letter: L,
      pid: 100 + i,
      color: colors[i],
      progress: 0,
    }));
    renderPool();
  }

  function renderPool() {
    poolEl.innerHTML = procs
      .map(
        (p, i) => `
      <div class="proc-item" data-i="${i}">
        <div class="proc-badge" style="background:${p.color}">${p.letter}</div>
        <div style="flex:1">
          <div class="proc-meta">process ${p.letter} <span class="pid">pid ${p.pid}</span></div>
          <div class="proc-bar"><i style="background:${p.color};width:${p.progress}%"></i></div>
        </div>
      </div>`
      )
      .join("");
  }

  function markActive(i) {
    $$("#proc-pool .proc-item").forEach((el) => el.classList.toggle("active", +el.dataset.i === i));
  }

  function appendOutput(letter, color) {
    const span = document.createElement("span");
    span.textContent = letter;
    span.style.color = color;
    outEl.appendChild(span);
    outEl.scrollTop = outEl.scrollHeight;
    if (outEl.childNodes.length > 240) outEl.removeChild(outEl.firstChild);
  }

  async function run() {
    if (running) return;
    running = true;
    $("#sched-run").textContent = "Stop ■";
    chipEl.classList.add("busy");

    while (running) {
      const slice = +sliceSlider.value;
      const p = procs[rrIndex % procs.length];
      const idx = rrIndex % procs.length;
      markActive(idx);
      chipEl.textContent = p.letter;
      chipEl.style.color = p.color;
      chipEl.style.borderColor = p.color;

      // emit a few characters during this time slice
      const ticks = Math.max(1, Math.round(slice / 80));
      for (let t = 0; t < ticks && running; t++) {
        appendOutput(p.letter, p.color);
        p.progress = Math.min(100, p.progress + 1.5);
        renderPool();
        markActive(idx);
        await sleep(slice / ticks);
      }
      rrIndex++;
    }
  }

  function stop() {
    running = false;
    $("#sched-run").textContent = "Run scheduler ▶";
    chipEl.classList.remove("busy");
    chipEl.textContent = "idle";
    chipEl.style.color = "";
    chipEl.style.borderColor = "";
    markActive(-1);
  }

  function reset() {
    stop();
    rrIndex = 0;
    outEl.textContent = "";
    build();
  }

  sliceSlider.addEventListener("input", () => ($("#slice-label").textContent = sliceSlider.value + "ms"));
  countSlider.addEventListener("input", () => {
    $("#count-label").textContent = countSlider.value;
    if (!running) build();
  });

  $("#sched-run").addEventListener("click", () => (running ? stop() : run()));
  $("#sched-reset").addEventListener("click", reset);

  build();
})();

/* =========================================================================
   CHAPTER 4 — CONCURRENCY (race condition counter)
   Simulate two threads doing load/add/store, interleaved.
   ========================================================================= */
(function raceDemo() {
  const TARGET = 200;
  $("#race-target").textContent = TARGET;
  $("#race-expected").textContent = TARGET * 2;

  const counterEl = $("#counter-val");
  const statusEl = $("#counter-status");
  const opA = $("#op-a");
  const opB = $("#op-b");
  const colA = $("#thread-a");
  const colB = $("#thread-b");
  const lockToggle = $("#lock-toggle");
  const lockLabel = $("#lock-label");

  let counter = 0;
  let running = false;

  lockToggle.addEventListener("change", () => {
    lockLabel.textContent = lockToggle.checked ? "Lock: ON (safe / atomic)" : "Lock: OFF (race condition!)";
  });

  function render() {
    counterEl.textContent = counter;
  }

  async function runUnlocked() {
    // The REAL race: each thread's "counter++" is split into a private
    // LOAD then a STORE. We interleave those phases between the two
    // threads, so one can clobber the other's update (a lost update).
    const A = { remaining: TARGET, phase: "load", reg: 0 };
    const B = { remaining: TARGET, phase: "load", reg: 0 };

    while ((A.remaining > 0 || B.remaining > 0) && running) {
      const pickA = B.remaining === 0 || (A.remaining > 0 && Math.random() < 0.5);
      const th = pickA ? A : B;
      const col = pickA ? colA : colB;
      const opEl = pickA ? opA : opB;
      const cls = pickA ? "active-a" : "active-b";

      if (th.phase === "load") {
        th.reg = counter; // LOAD shared counter into a private register
        th.phase = "store";
        await microStep(col, opEl, cls, `load: reg ← counter (${th.reg})`);
      } else {
        counter = th.reg + 1; // ADD 1, then STORE back — may clobber!
        th.remaining--;
        th.phase = "load";
        await microStep(col, opEl, cls, `add+store: counter ← ${counter}`);
      }
      render();
    }
  }

  async function runLocked() {
    // With a lock, each increment's load/add/store is one atomic unit —
    // no other thread can sneak in between. So no updates are ever lost.
    const A = { remaining: TARGET };
    const B = { remaining: TARGET };
    while ((A.remaining > 0 || B.remaining > 0) && running) {
      const pickA = B.remaining === 0 || (A.remaining > 0 && Math.random() < 0.5);
      counter = counter + 1; // protected critical section (atomic)
      if (pickA) {
        A.remaining--;
        await microStep(colA, opA, "active-a", `lock · counter++ · unlock → ${counter}`);
      } else {
        B.remaining--;
        await microStep(colB, opB, "active-b", `lock · counter++ · unlock → ${counter}`);
      }
      render();
    }
  }

  // Visual pacing for each micro-step.
  let stepDelay = 5;
  async function microStep(col, opEl, cls, label) {
    opEl.textContent = label;
    col.classList.add(cls);
    await sleep(stepDelay);
    col.classList.remove(cls);
  }

  async function run() {
    if (running) return;
    counter = 0;
    render();
    running = true;
    statusEl.textContent = "running…";
    statusEl.className = "counter-status";
    $("#race-run").disabled = true;

    if (lockToggle.checked) await runLocked();
    else await runUnlocked();

    running = false;
    $("#race-run").disabled = false;
    opA.textContent = "done";
    opB.textContent = "done";
    finish();
  }

  function finish() {
    const expected = TARGET * 2;
    if (counter === expected) {
      statusEl.textContent = `✓ correct! ${counter} = ${expected}`;
      statusEl.className = "counter-status ok";
    } else {
      const lost = expected - counter;
      statusEl.textContent = `✗ lost ${lost} updates! got ${counter}, expected ${expected}`;
      statusEl.className = "counter-status bad";
    }
  }

  function reset() {
    running = false;
    counter = 0;
    render();
    statusEl.textContent = "";
    statusEl.className = "counter-status";
    opA.textContent = "idle";
    opB.textContent = "idle";
    $("#race-run").disabled = false;
  }

  $("#race-run").addEventListener("click", run);
  $("#race-reset").addEventListener("click", reset);
  render();
})();

/* =========================================================================
   CHAPTER 5 — PERSISTENCE (RAM vs disk, pull the plug)
   ========================================================================= */
(function persistDemo() {
  const ramBody = $("#ram-body");
  const diskBody = $("#disk-body");
  const input = $("#data-input");
  const hint = $("#persist-hint");
  const ramBox = $("#ram-box");

  let ram = []; // {id, text, saved}
  let disk = [];
  let nextId = 1;

  function renderRam() {
    ramBody.innerHTML = ram
      .map((d) => `<span class="data-chip ${d.saved ? "saved" : ""}">${escapeHtml(d.text)}</span>`)
      .join("");
  }
  function renderDisk() {
    diskBody.innerHTML = disk.map((d) => `<span class="data-chip saved">${escapeHtml(d.text)}</span>`).join("");
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  }

  $("#add-ram").addEventListener("click", () => {
    const text = (input.value || "note-" + nextId).trim();
    ram.push({ id: nextId++, text, saved: false });
    input.value = "";
    renderRam();
    hint.textContent = "It's in RAM only (volatile). Try pulling the plug now — it vanishes.";
  });

  $("#save-disk").addEventListener("click", () => {
    if (ram.length === 0) {
      hint.textContent = "Nothing in RAM to save. Create a note first.";
      return;
    }
    ram.forEach((d) => {
      d.saved = true;
      if (!disk.find((x) => x.text === d.text)) disk.push({ text: d.text });
    });
    renderRam();
    renderDisk();
    hint.textContent = "Written to disk via write(). This data will now survive a crash.";
  });

  $("#pull-plug").addEventListener("click", () => {
    ramBox.classList.remove("flash-off");
    void ramBox.offsetWidth; // restart animation
    ramBox.classList.add("flash-off");
    ram = []; // volatile memory wiped
    renderRam();
    hint.textContent = "⚡ Power lost! RAM wiped instantly. Whatever reached the disk is still there.";
  });

  $("#reboot").addEventListener("click", () => {
    ram = [];
    renderRam();
    hint.textContent = "Rebooted. RAM starts empty; the OS could now read your saved notes back from disk.";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") $("#add-ram").click();
  });

  renderRam();
  renderDisk();
})();

/* =========================================================================
   CHAPTER 6 — USER vs KERNEL MODE (the trap)
   ========================================================================= */
(function trapDemo() {
  const dot = $("#prog-dot");
  const log = $("#trap-log");
  const btn = $("#syscall-btn");
  let busy = false;

  function line(text, cls) {
    const d = document.createElement("div");
    d.className = "tl " + (cls || "");
    d.textContent = text;
    log.appendChild(d);
    log.scrollTop = log.scrollHeight;
  }

  btn.addEventListener("click", async () => {
    if (busy) return;
    busy = true;
    btn.disabled = true;
    log.innerHTML = "";

    line("● user mode: running your code…", "u");
    await sleep(600);
    line('● user mode: you call write("hi") — but writing needs hardware!', "u");
    await sleep(700);
    line("⚡ TRAP! switch to kernel mode, jump to OS handler", "k");
    dot.classList.add("in-kernel");
    dot.textContent = "your program (trapped)";
    await sleep(900);
    line("● kernel mode: OS verifies the request is allowed", "k");
    await sleep(700);
    line('● kernel mode: OS talks to the device, writes "hi" safely', "k");
    await sleep(800);
    line("↩ return-from-trap: switch back to user mode", "u");
    dot.classList.remove("in-kernel");
    dot.textContent = "your program";
    await sleep(700);
    line("● user mode: your code continues, none the wiser ✓", "u");

    busy = false;
    btn.disabled = false;
  });
})();

/* =========================================================================
   CHAPTER 8 — PROCESS STATES (state machine)
   ========================================================================= */
(function statesDemo() {
  // transitions: from -> [{to, label}]
  const transitions = {
    new: [{ to: "ready", label: "admit (load into memory)" }],
    ready: [{ to: "running", label: "schedule (ready → running)" }],
    running: [
      { to: "ready", label: "deschedule (time slice up)" },
      { to: "blocked", label: "I/O request (running → blocked)" },
      { to: "zombie", label: "exit() (process finishes)" },
    ],
    blocked: [{ to: "ready", label: "I/O done (blocked → ready)" }],
    zombie: [{ to: "new", label: "wait() by parent → cleaned up, start over" }],
  };

  const labels = { new: "new", ready: "ready", running: "running", blocked: "blocked", zombie: "zombie" };
  const curEl = $("#cur-state");
  const btnWrap = $("#transition-buttons");
  const logEl = $("#state-log");
  let state = "new";

  function setActive() {
    $$(".state-node").forEach((n) => n.classList.toggle("active", n.dataset.state === state));
    curEl.textContent = labels[state];
  }

  function renderButtons() {
    btnWrap.innerHTML = "";
    transitions[state].forEach((t) => {
      const b = document.createElement("button");
      b.className = "btn";
      if (t.to === "running") b.classList.add("btn-primary");
      b.textContent = t.label;
      b.addEventListener("click", () => go(t));
      btnWrap.appendChild(b);
    });
  }

  function go(t) {
    addLog(`${labels[state]} → ${labels[t.to]}`);
    state = t.to;
    setActive();
    renderButtons();
  }

  function addLog(text) {
    const d = document.createElement("div");
    d.textContent = "▸ " + text;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }

  setActive();
  renderButtons();
})();

/* =========================================================================
   CHAPTER 9 — xv6 struct proc explorer
   ========================================================================= */
(function structDemo() {
  // Each field maps to a concept covered earlier on the page.
  const fields = {
    state: {
      maps: "Chapter 8 · Process States",
      text: "The current state of this process: UNUSED, EMBRYO (new), SLEEPING (blocked), RUNNABLE (ready), RUNNING, or ZOMBIE. This is exactly the state machine you just played with.",
      link: "#states",
    },
    pid: {
      maps: "identity",
      text: "The process ID — a unique number the OS uses to refer to this process. You saw pids (100, 101…) on the scheduler badges.",
      link: "#virtualization",
    },
    sz: {
      maps: "Chapter 7 · Address Space",
      text: "The size of this process's memory (its address space) in bytes. Grows when the program asks for more heap via malloc/sbrk.",
      link: "#process",
    },
    pgdir: {
      maps: "Chapter 3 · Memory Virtualization",
      text: "Pointer to the page table — the map from this process's virtual addresses to real physical memory. This is the magic that gives every process its own private memory.",
      link: "#virtualization",
    },
    kstack: {
      maps: "Chapter 7 · Stack",
      text: "The bottom of the kernel stack for this process — scratch space the kernel uses while running on behalf of this process (e.g. during a trap).",
      link: "#process",
    },
    parent: {
      maps: "Chapter 8 · Zombie / wait()",
      text: "Pointer to the parent process. When this process exits and becomes a ZOMBIE, the parent calls wait() to read its exit code and clean it up.",
      link: "#states",
    },
    context: {
      maps: "Chapter 10 · Context Switch",
      text: "Saved registers (like the stack pointer and instruction pointer). To pause this process and run another, the OS saves registers HERE, then restores them later. That's a context switch — you literally watched this field get written.",
      link: "#ctxswitch",
    },
    chan: {
      maps: "Chapter 8 · Blocked / I/O",
      text: "If non-zero, this process is SLEEPING (blocked), waiting on this 'channel'. When the event it's waiting for happens, the OS wakes everyone sleeping on that channel.",
      link: "#states",
    },
    killed: {
      maps: "Chapter 6 · Kernel control",
      text: "A flag: if set, this process has been asked to die. The kernel checks it and tears the process down at a safe moment.",
      link: "#protection",
    },
    ofile: {
      maps: "Chapter 5 · Persistence / Files",
      text: "The process's open file table — file descriptors like stdin(0), stdout(1), stderr(2), plus any files it opened. This is how it reads/writes persistent data.",
      link: "#persistence",
    },
    tf: {
      maps: "Chapter 6 · The Trap",
      text: "Pointer to the trap frame: the user-mode registers saved when this process trapped into the kernel via a system call or interrupt. Used to return-from-trap back to user mode.",
      link: "#protection",
    },
  };

  // Build the code with clickable fields
  const code = [
    ['<span class="cm">// xv6: one of these per process. The array of them IS the process list.</span>', null],
    ['<span class="kw">struct</span> proc {', null],
    ['  <span class="ty">uint</span>             <f>sz</f>;          <span class="cm">// size of process memory (bytes)</span>', "sz"],
    ['  <span class="ty">pde_t</span>*           <f>pgdir</f>;       <span class="cm">// page table (virtual → physical)</span>', "pgdir"],
    ['  <span class="ty">char</span>*            <f>kstack</f>;      <span class="cm">// bottom of kernel stack</span>', "kstack"],
    ['  <span class="ty">enum</span> procstate   <f>state</f>;       <span class="cm">// RUNNABLE, RUNNING, SLEEPING…</span>', "state"],
    ['  <span class="ty">int</span>              <f>pid</f>;         <span class="cm">// process id</span>', "pid"],
    ['  <span class="ty">struct</span> proc*     <f>parent</f>;      <span class="cm">// parent process</span>', "parent"],
    ['  <span class="ty">struct</span> trapframe* <f>tf</f>;         <span class="cm">// trap frame (saved user regs)</span>', "tf"],
    ['  <span class="ty">struct</span> context*  <f>context</f>;     <span class="cm">// saved regs for context switch</span>', "context"],
    ['  <span class="ty">void</span>*            <f>chan</f>;        <span class="cm">// if non-zero, sleeping on chan</span>', "chan"],
    ['  <span class="ty">int</span>              <f>killed</f>;      <span class="cm">// if non-zero, has been killed</span>', "killed"],
    ['  <span class="ty">struct</span> file*     <f>ofile</f>[NOFILE];<span class="cm">// open files</span>', "ofile"],
    ['  <span class="ty">char</span>             name[16];     <span class="cm">// process name (debugging)</span>', null],
    ["};", null],
  ];

  const codeEl = $("#struct-code");
  codeEl.innerHTML = code
    .map(([html, key]) => (key ? html.replace("<f>", `<span class="field" data-key="${key}">`).replace("</f>", "</span>") : html.replace("<f>", "").replace("</f>", "")))
    .join("\n");

  const infoEl = $("#struct-info");
  $$(".field", codeEl).forEach((f) => {
    f.addEventListener("click", () => {
      $$(".field", codeEl).forEach((x) => x.classList.remove("selected"));
      f.classList.add("selected");
      const key = f.dataset.key;
      const info = fields[key];
      infoEl.innerHTML = `
        <div class="si-field">${key}</div>
        <div class="si-maps">↳ ${info.maps}</div>
        <div class="si-text">${info.text}</div>
        <a class="si-link" href="${info.link}">Revisit that concept →</a>`;
    });
  });
})();

/* =========================================================================
   CHAPTER 8 — fork() & exec() guided walkthrough
   ========================================================================= */
(function forkExecDemo() {
  const parent = {
    box: $("#fe-parent"), pid: $("#fe-parent-pid"), state: $("#fe-parent-state"),
    prog: $("#fe-parent-prog"), ret: $("#fe-parent-ret"),
  };
  const child = {
    box: $("#fe-child"), pid: $("#fe-child-pid"), state: $("#fe-child-state"),
    prog: $("#fe-child-prog"), ret: $("#fe-child-ret"),
  };
  const explainEl = $("#fe-explain");
  const termEl = $("#fe-term");
  const progressEl = $("#fe-progress");

  function setState(p, label, cls) {
    p.state.textContent = label;
    p.box.classList.remove("is-running", "is-blocked", "is-zombie");
    if (cls) p.box.classList.add(cls);
  }

  // Each step is a function that mutates the scene.
  const steps = [
    {
      explain: 'The shell calls <code>fork()</code>. The OS makes a near-identical <strong>copy</strong> of the shell — same code, same memory, same open files. Now there are two processes.',
      run() {
        child.box.classList.remove("empty");
        child.box.classList.add("spawn");
        setTimeout(() => child.box.classList.remove("spawn"), 400);
        child.pid.textContent = "pid 5";
        setState(child, "RUNNING (copy of sh)", "is-running");
        child.prog.innerHTML = "program: <b>sh</b> (a clone!)";
        parent.ret.textContent = "fork() returned 5  ← child's pid";
        child.ret.textContent = "fork() returned 0  ← I'm the child";
      },
    },
    {
      explain: 'Both copies check the return value of <code>fork()</code>. The parent got <code>5</code> (the child\'s pid), the child got <code>0</code>. So the code <code>if (pid == 0)</code> runs only in the child — that\'s how a process knows which one it is.',
      run() {
        parent.box.classList.add("is-running");
        explainExtra();
      },
    },
    {
      explain: 'The child calls <code>exec("ls")</code>. This <strong>replaces</strong> the child\'s entire program — its code and memory become the <code>ls</code> program. Crucially, the <strong>pid stays 5</strong>. exec() does not return on success: there\'s no old code left to come back to.',
      run() {
        child.box.classList.add("exec-flash");
        setTimeout(() => child.box.classList.remove("exec-flash"), 600);
        child.prog.innerHTML = "program: <b>ls</b> (replaced!)";
        setState(child, "RUNNING (now ls)", "is-running");
        child.ret.textContent = "exec() never returns ✗";
        child.pid.textContent = "pid 5 (unchanged)";
      },
    },
    {
      explain: 'Meanwhile the parent calls <code>wait()</code>. It has nothing to do until the child finishes, so it goes to sleep — it <strong>blocks</strong>.',
      run() {
        setState(parent, "BLOCKED (in wait())", "is-blocked");
        parent.ret.textContent = "wait() … sleeping";
      },
    },
    {
      explain: 'The <code>ls</code> program runs to completion, prints its output, and calls <code>exit(0)</code>. The child is now a <strong>zombie</strong>: finished, but still around so the parent can read its exit code.',
      run() {
        term('file1.txt  file2.txt  notes.md');
        setState(child, "ZOMBIE (exited 0)", "is-zombie");
        child.ret.textContent = "exit(0)";
      },
    },
    {
      explain: 'The child\'s exit wakes the parent. <code>wait()</code> returns the child\'s pid and exit code, and the OS <strong>cleans up</strong> the zombie. The shell is back, ready for your next command. That loop — fork, exec, wait — runs every single command you type.',
      run() {
        child.box.classList.add("empty");
        child.pid.textContent = "—";
        setState(child, "(reaped & gone)", null);
        child.prog.innerHTML = "";
        child.ret.textContent = "";
        setState(parent, "RUNNING", "is-running");
        parent.ret.textContent = "wait() returned: pid 5, status 0 ✓";
        term('$ ');
      },
    },
  ];

  function explainExtra() {}
  let stepIdx = 0;

  function term(text) {
    termEl.textContent += "\n" + text;
    termEl.scrollTop = termEl.scrollHeight;
  }

  function renderProgress() {
    progressEl.innerHTML = steps
      .map((_, i) => `<span class="dot-step ${i < stepIdx ? "done" : ""}"></span>`)
      .join("");
  }

  function reset() {
    stepIdx = 0;
    parent.pid.textContent = "pid 4";
    setState(parent, "RUNNING", "is-running");
    parent.prog.innerHTML = "program: <b>sh</b>";
    parent.ret.textContent = "";
    child.box.classList.add("empty");
    child.box.classList.remove("is-running", "is-blocked", "is-zombie");
    child.pid.textContent = "—";
    child.state.textContent = "(none yet)";
    child.prog.innerHTML = "";
    child.ret.textContent = "";
    termEl.textContent = "$ ";
    explainEl.innerHTML = 'A single shell process is running, waiting for you to type a command. Press <kbd>Next step</kbd> to type <code>ls</code> and watch how the shell runs it.';
    $("#fe-next").disabled = false;
    $("#fe-next").textContent = "Next step ▸";
    renderProgress();
  }

  $("#fe-next").addEventListener("click", () => {
    if (stepIdx === 0) term("$ ls");
    if (stepIdx >= steps.length) return;
    const s = steps[stepIdx];
    s.run();
    explainEl.innerHTML = s.explain;
    stepIdx++;
    renderProgress();
    if (stepIdx >= steps.length) {
      $("#fe-next").disabled = true;
      $("#fe-next").textContent = "Done ✓";
    }
  });

  $("#fe-reset").addEventListener("click", reset);
  reset();
})();

/* =========================================================================
   CHAPTER 10 — Context switch animation
   ========================================================================= */
(function contextSwitchDemo() {
  const regNames = ["PC", "SP", "eax"];
  // distinct register values per process
  const procA = { PC: "0x100", SP: "0xF00", eax: "7" };
  const procB = { PC: "0x800", SP: "0xA00", eax: "42" };

  let running = "A"; // who is on the CPU
  let cpu = { ...procA };
  let savedA = { ...procA };
  let savedB = { ...procB };
  let busy = false;

  const aRegs = $("#cs-a-regs");
  const bRegs = $("#cs-b-regs");
  const cpuRegs = $("#cs-cpu-regs");
  const logEl = $("#cs-log");

  function regRow(name, val) {
    return `<div class="cs-reg" data-reg="${name}"><span class="rn">${name}</span><span class="rv">${val}</span></div>`;
  }
  function renderRegs(el, obj) {
    el.innerHTML = regNames.map((n) => regRow(n, obj[n])).join("");
  }

  function renderAll() {
    renderRegs(aRegs, savedA);
    renderRegs(bRegs, savedB);
    renderRegs(cpuRegs, cpu);
    $("#cs-running").textContent = running;
    $("#cs-a-badge").textContent = running === "A" ? "RUNNING" : "READY";
    $("#cs-a-badge").className = "cs-badge" + (running === "A" ? "" : " dim");
    $("#cs-b-badge").textContent = running === "B" ? "RUNNING" : "READY";
    $("#cs-b-badge").className = "cs-badge" + (running === "B" ? "" : " dim");
    $("#cs-a").classList.toggle("dim-proc", running !== "A");
    $("#cs-b").classList.toggle("dim-proc", running !== "B");
  }

  function log(text, cls) {
    const d = document.createElement("div");
    if (cls) d.className = cls;
    d.textContent = text;
    logEl.appendChild(d);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function flash(el, name, cls) {
    const row = el.querySelector(`[data-reg="${name}"]`);
    if (!row) return;
    row.classList.add(cls);
    setTimeout(() => row.classList.remove(cls), 450);
  }

  async function doSwitch() {
    if (busy) return;
    busy = true;
    $("#cs-switch").disabled = true;
    logEl.innerHTML = "";

    const from = running;
    const to = running === "A" ? "B" : "A";
    const fromSaved = from === "A" ? savedA : savedB;
    const fromRegsEl = from === "A" ? aRegs : bRegs;
    const toSaved = to === "A" ? savedA : savedB;
    const toRegsEl = to === "A" ? aRegs : bRegs;

    log(`⚡ timer interrupt — trap into kernel, swtch() runs`);
    await sleep(700);

    // Phase 1: save CPU regs -> from's saved context
    log(`① SAVE ${from}: copy CPU registers → ${from}.context`, "csl-s");
    for (const n of regNames) {
      fromSaved[n] = cpu[n];
      renderRegs(fromRegsEl, fromSaved);
      flash(cpuRegs, n, "flash-save");
      flash(fromRegsEl, n, "flash-save");
      await sleep(260);
    }
    await sleep(300);

    // Phase 2: load to's saved context -> CPU regs
    log(`② LOAD ${to}: copy ${to}.context → CPU registers`, "csl-l");
    for (const n of regNames) {
      cpu[n] = toSaved[n];
      renderRegs(cpuRegs, cpu);
      flash(cpuRegs, n, "flash-load");
      flash(toRegsEl, n, "flash-load");
      await sleep(260);
    }
    await sleep(200);

    running = to;
    log(`③ return-from-trap → process ${to} is now RUNNING`);
    renderAll();
    busy = false;
    $("#cs-switch").disabled = false;
  }

  function reset() {
    running = "A";
    cpu = { ...procA };
    savedA = { ...procA };
    savedB = { ...procB };
    logEl.innerHTML = "";
    busy = false;
    $("#cs-switch").disabled = false;
    renderAll();
  }

  $("#cs-switch").addEventListener("click", doSwitch);
  $("#cs-reset").addEventListener("click", reset);
  reset();
})();

/* =========================================================================
   CHAPTER 12 — THE REAL DEAL (authentic xv6 source explorer)
   Reads code from hidden <script type="text/plain"> blocks and renders it
   with a tiny, safe C / assembly syntax highlighter.
   ========================================================================= */
(function realDeal() {
  const tabs = [
    { id: "src-proc", file: "proc.h", lang: "c", label: "struct proc",
      ch: "#proc-struct", chLabel: "Chapter 11",
      note: "The one struct that holds <b>everything</b> you learned — state, pid, page table, saved registers, open files. The OS keeps an array of these; that array IS the process list." },
    { id: "src-fork", file: "proc.c · fork()", lang: "c", label: "fork()",
      ch: "#forkexec", chLabel: "Chapter 8",
      note: "Copies the parent into a new process. Notice <b>np->tf->eax = 0</b> — that single line is literally why fork() returns 0 in the child and the child's pid in the parent." },
    { id: "src-exec", file: "exec.c · exec()", lang: "c", label: "exec()",
      ch: "#forkexec", chLabel: "Chapter 8",
      note: "Loads a new ELF program and <b>commits</b> by swapping curproc->pgdir to the new memory image — same pid, brand-new program. On success it never returns to the old code." },
    { id: "src-sched", file: "proc.c · scheduler()", lang: "c", label: "scheduler()",
      ch: "#virtualization", chLabel: "Chapter 3",
      note: "The real round-robin loop behind the time-sharing demo. It scans for a RUNNABLE process and <b>swtch()</b>es into it. This loop never returns." },
    { id: "src-swtch", file: "swtch.S", lang: "asm", label: "swtch.S ⚡",
      ch: "#ctxswitch", chLabel: "Chapter 10",
      note: "The payoff: the context switch is <b>hand-written x86 assembly</b>. Push old registers, swap the stack pointer, pop the new registers. That's the entire magic trick — 11 instructions." },
    { id: "src-lock", file: "spinlock.c · acquire()/release()", lang: "c", label: "spinlock",
      ch: "#concurrency", chLabel: "Chapter 4",
      note: "The lock that fixed your race condition. The heart of it is <b>xchg(&lk->locked, 1)</b> — one atomic instruction the hardware guarantees can't be interrupted halfway." },
    { id: "src-syscall", file: "syscall.c · syscall()", lang: "c", label: "syscall()",
      ch: "#protection", chLabel: "Chapter 6",
      note: "After a trap into the kernel, this reads the syscall number from <b>%eax</b> and dispatches it. This runs in kernel mode — the privileged side of the trap you animated." },
    { id: "src-sleep", file: "proc.c · sleep()/wakeup()", lang: "c", label: "sleep/wakeup",
      ch: "#states", chLabel: "Chapter 9",
      note: "How a process becomes BLOCKED and gets woken back to READY. <b>sleep()</b> sets state = SLEEPING then calls sched(); <b>wakeup1()</b> flips matching sleepers back to RUNNABLE." },
  ];

  const C_KEYWORDS = /\b(?:int|void|char|short|long|unsigned|signed|struct|enum|union|static|const|volatile|for|if|else|while|do|return|sizeof|switch|case|break|continue|goto|typedef|extern|asm)\b/g;
  const C_TYPES = /\b(?:uint|uchar|ushort|pde_t|pte_t|procstate|spinlock|trapframe|context|proc|cpu|inode|file|elfhdr|proghdr)\b/g;

  function esc(s) {
    return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  // Safe highlighter: stash comments & strings first (so keywords inside them
  // aren't touched), highlight keywords/types, then restore. Placeholders use
  // digits between \x00 markers; the keyword/type word-lists never match digits.
  function highlight(code, lang) {
    let s = esc(code);
    const store = [];
    const stash = (cls, t) => {
      store.push(`<span class="${cls}">${t}</span>`);
      return `\x00${store.length - 1}\x00`;
    };
    s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => stash("cm", m)); // block comments
    s = s.replace(lang === "asm" ? /#.*$/gm : /\/\/.*$/gm, (m) => stash("cm", m)); // line comments
    s = s.replace(/"(?:[^"\\]|\\.)*"/g, (m) => stash("str", m)); // strings
    s = s.replace(/'(?:[^'\\]|\\.)*'/g, (m) => stash("str", m)); // char literals
    if (lang !== "asm") {
      s = s.replace(C_KEYWORDS, (m) => `<span class="kw">${m}</span>`);
      s = s.replace(C_TYPES, (m) => `<span class="ty">${m}</span>`);
    }
    s = s.replace(/\x00(\d+)\x00/g, (_, i) => store[i]);
    return s;
  }

  const tabsEl = $("#rd-tabs");
  const codeEl = $("#rd-code");
  const metaEl = $("#rd-meta");

  function getCode(id) {
    const el = document.getElementById(id);
    return el ? el.textContent.replace(/^\n+/, "").replace(/\s+$/, "") : "// (source not found)";
  }

  function select(i) {
    const t = tabs[i];
    $$(".rd-tab", tabsEl).forEach((b, j) => b.classList.toggle("active", j === i));
    metaEl.innerHTML = `
      <span class="rd-file">${t.file}</span>
      <a class="rd-link" href="${t.ch}">↳ you simulated this in ${t.chLabel}</a>
      <span class="rd-note">${t.note}</span>`;
    codeEl.innerHTML = highlight(getCode(t.id), t.lang);
  }

  tabs.forEach((t, i) => {
    const b = document.createElement("button");
    b.className = "rd-tab";
    b.innerHTML = t.label;
    b.addEventListener("click", () => select(i));
    tabsEl.appendChild(b);
  });

  select(0);
})();
