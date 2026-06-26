# xv6, Demystified — An Interactive OS Playground

A single-page, zero-dependency interactive demo that explains operating system
fundamentals (using the **xv6** teaching kernel as the anchor) in plain,
beginner-friendly language — then lets you *play* with each concept.

## Run it

No build step, no install. Just open the file:

```bash
open index.html        # macOS
# or double-click index.html in your file browser
```

(Everything runs locally in the browser via plain HTML/CSS/JS.)

## What's inside

Each chapter pairs a toddler-simple explanation with a hands-on interaction:

| # | Concept | Interaction |
|---|---------|-------------|
| 1 | What is an OS? | Clickable layer diagram (apps → OS → hardware) + the 3 big ideas |
| 2 | Fetch → Decode → Execute | A tiny CPU you step through one stage at a time, watching `PC` & `ACC` |
| 3 | Virtualization | A scheduler time-sharing one CPU across many programs (tune the time slice) |
| 4 | Concurrency | A race-condition counter — run two threads with the lock OFF (loses updates) vs ON (correct) |
| 5 | Persistence | RAM vs disk — "pull the plug" and watch unsaved data vanish |
| 6 | User vs Kernel mode | Animated system-call **trap** into the kernel and back |
| 7 | What is a process? | Explore the address space (code/data/heap/stack) and registers (PC/SP/FP) |
| 8 | `fork()` & `exec()` | Step through how a shell clones itself and runs a command (fork → exec → wait) |
| 9 | Process states | Drive a process through new → ready → running → blocked → zombie |
| 10 | Context switch | Watch the CPU save one process's registers and load another's (xv6's `swtch()`) |
| 11 | The xv6 `struct proc` | Click each real struct field to see which concept it implements |
| 12 | The Real Deal (source) | Tabbed explorer of the **authentic xv6 C/assembly source** (fork, exec, scheduler, swtch.S, spinlock, syscall, sleep/wakeup), each linked back to the toy that simulated it |

The Chapter 12 snippets are pulled verbatim from MIT's [`xv6-public`](https://github.com/mit-pdos/xv6-public) kernel and syntax-highlighted in-browser.

### A note on xv6 versions (x86 vs RISC-V)

xv6 was written at MIT in 2006 (course 6.828) as a modern ANSI-C re-implementation of
Unix V6. There are **two** editions:

- **[`xv6-public`](https://github.com/mit-pdos/xv6-public)** — the original **Intel x86**
  version. **This demo uses x86**, because it matches the code shown in the *OSTEP*
  textbook (e.g. the `struct proc` figure).
- **[`xv6-riscv`](https://github.com/mit-pdos/xv6-riscv)** — a **RISC-V** port used by the
  current MIT course, **6.1810**.

The concepts are identical; only the architecture-specific bits differ (register names,
the `swtch.S` assembly, and `pgdir` vs `pagetable`). Chapter 12 includes an "About xv6"
panel explaining this.

## Files

- `index.html` — structure & content
- `styles.css` — styling (dark, responsive)
- `script.js` — all interactive logic (vanilla JS)

## Credits

Built as a companion to *Operating Systems: Three Easy Pieces* (OSTEP) and the
[xv6](https://github.com/mit-pdos/xv6-public) teaching kernel from MIT.
