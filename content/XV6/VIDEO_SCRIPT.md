# 🎬 xv6, Demystified — Code-Walkthrough Video Script

> **The format:** every chapter is a *code walkthrough first*. You put the source on
> screen, read it **line by line**, and only *then* flip to the demo and click the
> button that makes that code come alive.
>
> - **📄 CODE** = the source to display (real xv6 from the **Chapter 12** tabs, or the
> demo's own JS when there's no kernel equivalent — I'll say which).
> - **🗣️ LINE BY LINE** = your narration, walking the code top to bottom.
> - **🎥 THEN CLICK** = switch to the demo and press the button; tie it back to the line.
>
> **Runtime:** ~16–20 min (it's code-dense — that's the point). Read the line-by-line
> parts slowly; let viewers' eyes track the line you're on. Move your cursor to each
> line as you say it.

---

## 0 · Cold open (15 sec)

**🎥** Hero screen.

> "Most OS explainers wave their hands. This one doesn't. I'm going to walk you through
> the **actual source code** of a real operating system — xv6 — line by line, and after
> each piece I'll run a little simulation so you can *see* that exact code in action.
> Real kernel code, then proof. Let's go."

---

## 0.5 · What is xv6? (45 sec — background)

**🎥** Chapter 12's "What is xv6, exactly?" panel (scroll down and show it), or just talk over the hero.

> "Quick background on xv6 itself, because it has a fun history. Back in the 1970s, Ken
> Thompson and Dennis Ritchie wrote **Unix Version 6** — the ancestor of basically every
> OS you use today. It was a brilliant teaching tool, but by the 2000s it was written in
> ancient pre-standard C and ran on hardware nobody had anymore.
>
> So in **2006, MIT** rebuilt it from scratch for their OS course — same ideas and
> structure as old Unix V6, but in clean modern **ANSI C**. They called it **xv6**. The
> magic of it is the size: the *entire* kernel is only about **9,000 lines**, small enough
> to read end to end. That's why it's the world's go-to teaching OS.
>
> One heads-up if you go looking it up: there are **two versions**. The original runs on
> **Intel x86** — that's the `xv6-public` repo, and it's the code I'm showing in this
> video, and it's the version the OSTEP textbook uses. Around 2019 MIT **ported it to
> RISC-V** for their newer course, 6.1810 — that's `xv6-riscv`. Same operating system,
> same concepts; only the chip-specific bits differ — register names, the assembly in the
> context switch, and what the page-table field is called. Everything we cover here
> applies to both. We're using x86 because it lines up with the textbook."

---

## 1 · What is an OS? (40 sec — the one no-code intro)

**🎥** Chapter 1 layer diagram (Programs → OS → Hardware).

> "One idea before the code: an operating system is just **a program** — software, not
> hardware — that sits between your apps and the physical machine. Your code never talks
> to the CPU or disk directly; it asks the OS, and the OS does it safely. Everything that
> follows is the *code that makes that happen*: scheduling the CPU, locking shared data,
> saving files, switching processes. So let's actually read it."

---

## 2 · Fetch → Decode → Execute

> *(No single xv6 file does this — it's what the CPU hardware does every cycle. So here
> we walk the demo's own simulator, which models it exactly.)*

**📄 CODE** — `script.js` → the CPU's `step()` function:

```js
function step() {
  if (phase === "fetch") {
    current = program[pc];        // FETCH: read the instruction at PC
    phase = "decode";
  } else if (phase === "decode") {
    // DECODE: figure out what 'current.op' means
    phase = "execute";
  } else {
    // EXECUTE: actually do it
    switch (current.op) {
      case "SET": acc = current.arg; break;   // acc = value
      case "ADD": acc += current.arg; break;  // acc = acc + value
      case "PRINT": printChar(acc); break;    // output acc
      case "JMP": pc = current.arg; jumped = true; break;
    }
    if (!jumped) pc = (pc + 1) % program.length;  // advance PC
    phase = "fetch";
  }
}
```

**🗣️ LINE BY LINE**

> "A CPU has a register called **PC**, the program counter — it just holds the index of
> the next instruction. Watch the three phases.
>
> - `current = program[pc]` — that's **FETCH**: go to memory at the address in PC and
> grab the instruction sitting there.
> - The decode branch is **DECODE**: the CPU works out *what* this instruction is — is it
> an add? a jump? — so it knows what to do next.
> - The switch is **EXECUTE**: if it's `SET`, drop a value into the accumulator; `ADD`,
> add to it; `PRINT`, output it; `JMP`, change PC to jump somewhere else.
> - `pc = (pc + 1) % program.length` — unless we jumped, **move PC to the next line**.
> - And `phase = "fetch"` loops us right back to the top. Fetch, decode, execute,
> forever. That `while` loop *is* a CPU."

**🎥 THEN CLICK** — Chapter 2. Press **Step ▸** once per phase.

> "Each click runs one branch of that function. Watch PC and ACC change exactly like the
> code says." *(Click through SET → ADD → PRINT.)* "Now **Run ▶** just calls `step()` on
> a timer — that's the heartbeat under every program you've ever run."

---

## 3 · Virtualization → the real `scheduler()`

**📄 CODE** — Chapter 12 tab `**scheduler()`** (`proc.c`):

```c
void
scheduler(void)
{
  struct proc *p;
  struct cpu *c = mycpu();
  c->proc = 0;

  for(;;){
    sti();                                   // enable interrupts (let the timer fire)
    acquire(&ptable.lock);                    // lock the process table
    for(p = ptable.proc; p < &ptable.proc[NPROC]; p++){
      if(p->state != RUNNABLE)                // skip anything not ready to run
        continue;

      c->proc = p;
      switchuvm(p);                           // switch to p's address space
      p->state = RUNNING;
      swtch(&(c->scheduler), p->context);     // <-- jump INTO process p
      switchkvm();                            // p gave the CPU back; restore kernel

      c->proc = 0;
    }
    release(&ptable.lock);
  }
}
```

**🗣️ LINE BY LINE**

> "This is the real heart of CPU virtualization — the loop that shares one CPU across
> every process.
>
> - `for(;;)` — an **infinite loop**. The scheduler literally never returns; this runs
> forever on each CPU.
> - `sti()` — turn interrupts on, so the hardware **timer** can fire and eventually yank
> the CPU back. That's what stops one process from hogging the machine.
> - `acquire(&ptable.lock)` — grab a lock on the process table (we'll see locks in the
> next chapter — they're everywhere).
> - `for(p = ptable.proc; p < &ptable.proc[NPROC]; p++)` — **walk every process slot** in
> the table.
> - `if(p->state != RUNNABLE) continue;` — RUNNABLE means 'ready to run.' Skip anything
> that's sleeping, a zombie, or empty.
> - `switchuvm(p)` — switch the hardware to **this process's memory map** (its page
> table), so it sees its own private address space.
> - `p->state = RUNNING;` — mark it running.
> - `swtch(&(c->scheduler), p->context)` — **this single line jumps into the process.**
> It saves the scheduler's own registers and loads process p's. We do *not* come back to
> the next line until p hands the CPU back.
> - `switchkvm()` — p gave control back, so switch back to the kernel's page table and
> keep looping to the next RUNNABLE process.
>
> That's it. Pick a ready process, jump in, get control back, pick the next one. Round
> and round, thousands of times a second."

**🎥 THEN CLICK** — Chapter 3. Press **Run scheduler ▶**.

> "Every letter in that stream is one process getting its `swtch` turn on the single CPU
> chip. Now drag the **time slice** slider — that's controlling how long before the timer
> interrupt fires and the loop moves to the next process. Small slice, lots of switching;
> big slice, long bursts. That decision — who's RUNNABLE and who runs next — is the
> scheduling policy."

---

## 4 · Concurrency → the real `acquire()` / `release()`

**📄 CODE part 1** — *why* we need a lock. The demo's race loop (`script.js`):

```js
// UNLOCKED: each "counter++" is split into load / add / store
if (th.phase === "load") {
  th.reg = counter;        // LOAD shared counter into a private register
  th.phase = "store";
} else {
  counter = th.reg + 1;    // ADD 1, then STORE back — can clobber the other thread!
  th.phase = "load";
}
```

**🗣️**

> "Here's the bug. Incrementing a counter isn't one step — it's three: **load** the value
> into a register, **add** one, **store** it back. If two threads interleave those steps —
> both load 50, both store 51 — one update is lost. That's a race condition."

**📄 CODE part 2** — Chapter 12 tab `**spinlock`** (`spinlock.c`):

```c
void
acquire(struct spinlock *lk)
{
  pushcli();                          // disable interrupts on this CPU
  if(holding(lk)) panic("acquire");

  while(xchg(&lk->locked, 1) != 0)    // <-- the atomic heart of the lock
    ;

  __sync_synchronize();               // memory barrier
  lk->cpu = mycpu();
}

void
release(struct spinlock *lk)
{
  __sync_synchronize();
  asm volatile("movl $0, %0" : "+m" (lk->locked) : );  // locked = 0, atomically
  popcli();
}
```

**🗣️ LINE BY LINE**

> "Now the fix.
>
> - `pushcli()` — disable interrupts on this CPU first, so a timer interrupt can't pause
> us *while we hold the lock* and cause a deadlock.
> - `while(xchg(&lk->locked, 1) != 0) ;` — **this one line is the entire lock.** `xchg`
> is a special CPU instruction that does two things as **one atomic, uninterruptible
> step**: it sets `locked` to 1 *and* returns whatever was there before. If the old
> value was 0, the lock was free — we just grabbed it, and the loop exits. If it was 1,
> someone else holds it, so we **spin**, looping until they release. The hardware
> guarantees two CPUs can't both see 0 — that's what makes it safe.
> - `__sync_synchronize()` — a memory barrier so the CPU doesn't reorder reads/writes
> across the lock boundary.
> - And `release` is the mirror: a barrier, then atomically set `locked = 0`, then
> re-enable interrupts with `popcli()`.
>
> So whatever happens *between* acquire and release is a **critical section** — only one
> thread is ever in it. The load-add-store can't be interrupted halfway anymore. It's
> **atomic**."

**🎥 THEN CLICK** — Chapter 4. Lock **OFF**, press **Run both threads ▶**.

> "Lock off — and we lose updates, we land under 400. That's the interleaving from the
> first snippet." *(Flip lock ON, run again.)* "Lock on — that `xchg` spinlock wraps the
> increment, and it's exactly 400 every time. One atomic instruction is the difference
> between chaos and correct."

---

## 5 · Persistence

> *(The file-system code is big; the idea is what matters. We walk the demo's model,
> which captures it: RAM is a variable that gets wiped; disk is a variable that survives.)*

**📄 CODE** — `script.js`:

```js
let ram  = [];   // volatile — lives only while "powered"
let disk = [];   // persistent — survives a crash

// write() → save to disk
saveDisk.onclick = () => {
  ram.forEach(d => { d.saved = true; disk.push({ text: d.text }); });
};

// ⚡ pull the plug
pullPlug.onclick = () => {
  ram = [];        // power lost → RAM wiped instantly
  renderRam();
};
```

**🗣️ LINE BY LINE**

> "Two variables. `ram` is volatile memory; `disk` is persistent storage.
>
> - The **save** handler is what a real program does when it calls `write()`: it copies
> data from RAM out to `disk`, where it'll survive.
> - The **pull-the-plug** handler is a power failure: `ram = []` — memory is wiped *the
> instant* the power drops. Notice it never touches `disk`.
>
> In a real OS this is the **file system**, and programs reach it through system calls —
> `open`, `write`, `close`. Real ones also add **journaling** so a crash *mid-write*
> can't corrupt the data."

**🎥 THEN CLICK** — Chapter 5. Note in RAM → **Pull the plug** (gone). Then note → **save to
disk** → **Pull the plug** (survives).

> "Only what reached the `disk` variable survived the crash. That's persistence in one
> line of difference."

---

## 6 · User vs Kernel → the real `syscall()`

**📄 CODE** — Chapter 12 tab `**syscall()`** (`syscall.c`):

```c
void
syscall(void)
{
  int num;
  struct proc *curproc = myproc();

  num = curproc->tf->eax;                 // syscall number, left by the user in %eax
  if(num > 0 && num < NELEM(syscalls) && syscalls[num]) {
    curproc->tf->eax = syscalls[num]();   // call handler; return value goes back in %eax
  } else {
    cprintf("%d %s: unknown sys call %d\n",
            curproc->pid, curproc->name, num);
    curproc->tf->eax = -1;
  }
}
```

**🗣️ LINE BY LINE**

> "This function runs **in kernel mode**, right after a program trapped in. Here's the
> handoff.
>
> - `curproc->tf` is the **trap frame** — a saved snapshot of the user program's
> registers, taken the moment it trapped into the kernel. Hold onto that idea; the trap
> frame is how the kernel sees what the user wanted.
> - `num = curproc->tf->eax;` — the user put the **system call number** in the `eax`
> register before trapping. So the kernel reads it right out of the saved trap frame.
> - `if(num > 0 && num < NELEM(syscalls) && syscalls[num])` — is that a valid syscall
> number with a real handler? (`syscalls` is a table of function pointers.)
> - `curproc->tf->eax = syscalls[num]();` — **call the handler**, and write its return
> value *back into* the saved `eax`. When the kernel returns from the trap, the user
> wakes up with that value sitting in `eax` — that's how syscalls 'return' to you.
> - Otherwise, unknown call: print a warning and put `-1` in `eax`.
>
> The key insight: user code can't *do* privileged things, it can only **ask** by number.
> The kernel reads the number, runs the safe version, hands a result back."

**🎥 THEN CLICK** — Chapter 6. Press **Make a system call: write("hi") ▶**.

> "Watch the program cross from user mode into kernel mode — that's the **trap** that
> leads into this `syscall()` function. The kernel does the privileged work, then
> **return-from-trap** drops it back to user mode with the result in `eax`."

---

## 7 · What is a process? → `struct proc` (the memory half)

**📄 CODE** — Chapter 12 tab `**struct proc`** (`proc.h`), top fields:

```c
struct proc {
  uint sz;                     // Size of process memory (bytes)
  pde_t* pgdir;                // Page table  (virtual -> physical map)
  char *kstack;                // Bottom of kernel stack for this process
  enum procstate state;        // Process state
  int pid;                     // Process ID
  struct context *context;     // saved registers for context switch
  // ...
};
```

**🗣️ LINE BY LINE**

> "A *program* is a dead file on disk. A *process* is that program **running**, and to
> track a running program the OS needs its **machine state** — its memory and its
> registers. Look at the first fields:
>
> - `uint sz` — how big the process's memory is.
> - `pde_t* pgdir` — a pointer to its **page table**: the map from this process's private
> virtual addresses to real physical RAM. This is *why* every process feels like it owns
> the whole machine — each one gets its own map.
> - `char *kstack` — its kernel stack.
> - `struct context *context` — its **saved registers** (we'll switch on these in
> Chapter 10).
>
> So 'a process' is literally this struct: a chunk of memory described by `pgdir`/`sz`,
> plus saved CPU state in `context`."

**🎥 THEN CLICK** — Chapter 7. Hover the address-space regions (Code/Data/Heap/Stack) and the
registers (PC/SP/FP).

> "`pgdir` and `sz` describe this whole address space on screen — code, data, heap that
> `malloc` grows, and the stack for function calls. PC, SP and FP are the live registers
> the OS will need to save. Which is exactly what comes next."

---

## 8 · fork() & exec() → the real source, line by line

**📄 CODE** — Chapter 12 tab `**fork()`** (`proc.c`):

```c
int
fork(void)
{
  struct proc *np;
  struct proc *curproc = myproc();

  np = allocproc();                              // grab a free process slot
  np->pgdir = copyuvm(curproc->pgdir, curproc->sz); // COPY the parent's whole memory
  np->sz = curproc->sz;
  np->parent = curproc;
  *np->tf = *curproc->tf;                        // copy saved user registers

  np->tf->eax = 0;                               // <-- child's fork() returns 0

  // ... duplicate open files, copy name ...
  pid = np->pid;

  acquire(&ptable.lock);
  np->state = RUNNABLE;                          // child is now schedulable
  release(&ptable.lock);

  return pid;                                    // parent's fork() returns child's pid
}
```

**🗣️ LINE BY LINE**

> "This is how every new process is born. It **clones the caller**.
>
> - `np = allocproc()` — find a free slot in the process table for the child.
> - `np->pgdir = copyuvm(curproc->pgdir, curproc->sz)` — **copy the parent's entire
> address space** into the child. Same code, same data, same heap. This is the 'clone.'
> - `*np->tf = *curproc->tf;` — copy the saved user registers, so the child is poised to
> continue at the *exact same spot* the parent will.
> - `np->tf->eax = 0;` — **this is the famous line.** A function's return value comes back
> in `eax`. The kernel sets the child's `eax` to 0, so in the child, `fork()` returns 0.
> - `np->state = RUNNABLE;` — mark the child ready, so the scheduler from Chapter 3 will
> pick it up.
> - `return pid;` — the *parent* returns normally, and its return value is the child's
> pid. So one call to `fork`, two different return values — pid in the parent, 0 in the
> child. That's how each copy knows who it is."

**📄 CODE** — Chapter 12 tab `**exec()`** (`exec.c`), the commit:

```c
  // ... load the new program's segments from disk into a fresh page table 'pgdir' ...

  oldpgdir = curproc->pgdir;
  curproc->pgdir = pgdir;            // swap in the NEW memory image
  curproc->sz = sz;
  curproc->tf->eip = elf.entry;      // set instruction pointer to new program's main()
  curproc->tf->esp = sp;             // new stack pointer
  switchuvm(curproc);
  freevm(oldpgdir);                  // throw away the OLD memory
  return 0;
```

**🗣️ LINE BY LINE**

> "`fork` makes a copy of you; `exec` turns that copy into a *different program*. Above
> this, exec loads the new program (like `ls`) from disk. Then it **commits**:
>
> - `curproc->pgdir = pgdir;` — point the process at the **brand-new memory image**. The
> old code and data are gone.
> - `curproc->tf->eip = elf.entry;` — set the saved instruction pointer to the new
> program's entry point — its `main`. After the trap returns, the CPU starts running the
> *new* program.
> - `freevm(oldpgdir);` — free the old memory.
>
> Notice what *never* changes: the **pid**. Same process, new program. And exec doesn't
> return on success — there's no old code left to return to."

**🎥 THEN CLICK** — Chapter 8. Step through with **Next step ▸**.

> "Step one, fork: the child appears as a copy, and see the return values — 0 to the
> child, the pid to the parent, exactly like `np->tf->eax = 0`. Step two, exec: the
> child's program is *replaced* by `ls`, same pid — that's the `pgdir` swap. Then the
> parent's `wait` reaps the finished child. Fork, exec, wait — that's your shell."

---

## 9 · Process states → the enum + `sleep()` / `wakeup1()`

**📄 CODE** — Chapter 12 tab `**struct proc`**, the enum:

```c
enum procstate { UNUSED, EMBRYO, SLEEPING, RUNNABLE, RUNNING, ZOMBIE };
```

**🗣️**

> "Every process is in exactly one of these. Map them to the demo: `EMBRYO` is **new**,
> `RUNNABLE` is **ready**, `RUNNING` is on the CPU, `SLEEPING` is **blocked**, `ZOMBIE` is
> finished-but-not-cleaned-up. `UNUSED` is just a free slot."

**📄 CODE** — Chapter 12 tab `**sleep/wakeup`** (`proc.c`):

```c
void
sleep(void *chan, struct spinlock *lk)
{
  struct proc *p = myproc();
  // (acquire ptable.lock, release lk) ...
  p->chan = chan;          // remember what we're waiting on
  p->state = SLEEPING;     // <-- become BLOCKED
  sched();                 // give up the CPU
  p->chan = 0;             // ...woken up: tidy up
  // (reacquire lk) ...
}

static void
wakeup1(void *chan)
{
  struct proc *p;
  for(p = ptable.proc; p < &ptable.proc[NPROC]; p++)
    if(p->state == SLEEPING && p->chan == chan)
      p->state = RUNNABLE;   // <-- back to READY (not RUNNING!)
}
```

**🗣️ LINE BY LINE**

> "This is how a process goes BLOCKED and comes back.
>
> - `p->chan = chan;` — record *what* we're waiting for (a disk read, a key press…). It's
> just a number used as a label.
> - `p->state = SLEEPING;` — flip to blocked. The scheduler will now **skip** us, because
> remember `if(p->state != RUNNABLE) continue;`.
> - `sched();` — voluntarily give up the CPU (that calls the context switch).
> - Later, `wakeup1` runs when the event finishes: it scans every process and, for any
> that are `SLEEPING` on this same `chan`, sets them to `RUNNABLE`.
> - **Crucial detail:** it sets them to `RUNNABLE` — **ready**, not running. A woken
> process still has to wait its turn for the scheduler to pick it. That's the one
> transition everybody gets wrong."

**🎥 THEN CLICK** — Chapter 9. Drive the transitions: schedule → I/O request → I/O done →
schedule.

> "I/O request sets state to SLEEPING — blocked. I/O done is `wakeup1` flipping it back to
> RUNNABLE — ready. And only then does 'schedule' put it back on the CPU, just like the
> code."

---

## 10 · Context switch → `swtch.S` (the payoff, instruction by instruction)

**📄 CODE** — Chapter 12 tab `**swtch.S ⚡`**:

```asm
swtch:
  movl 4(%esp), %eax     # eax = old  (where to SAVE current context)
  movl 8(%esp), %edx     # edx = new  (the context to LOAD)

  # Save old callee-saved registers onto the current stack
  pushl %ebp
  pushl %ebx
  pushl %esi
  pushl %edi

  movl %esp, (%eax)      # *old = esp   <-- SAVE: remember current stack top
  movl %edx, %esp        # esp = new    <-- SWITCH STACKS to the new process

  # Load new callee-saved registers off the new stack
  popl %edi
  popl %esi
  popl %ebx
  popl %ebp
  ret                    # pop saved return address -> resume the new process
```

**🗣️ LINE BY LINE**

> "This is the whole magic trick from Chapter 3, and it's **hand-written assembly** —
> about eleven instructions. `swtch(old, new)` takes two arguments.
>
> - `movl 4(%esp), %eax` — in 32-bit x86, arguments arrive on the stack. This loads the
> first argument, `old`, into `eax` — that's *where we'll save the current registers*.
> - `movl 8(%esp), %edx` — load the second argument, `new`, into `edx` — *the registers we
> want to switch to*.
> - The four `pushl` lines — push the CPU's callee-saved registers (`ebp, ebx, esi, edi`)
> onto the **current** stack. Together with the return address already sitting there,
> those five values *are* a saved `struct context`.
> - `movl %esp, (%eax)` — **this is the SAVE.** Store the current stack pointer into
> `*old`. Now `old` points at the context we just built. The outgoing process is frozen,
> perfectly preserved.
> - `movl %edx, %esp` — **this is the actual switch.** Point the stack pointer at the
> *new* process's saved context. From this instruction on, we're on a different
> process's stack.
> - The four `popl` lines — restore the new process's `edi, esi, ebx, ebp` from *its*
> stack.
> - `ret` — pop the saved return address and jump to it. That address is wherever the new
> process *last called swtch*. So it resumes exactly where it left off, as if no time
> passed.
>
> Save registers, swap the stack pointer, load registers. That's how one CPU pretends to
> be many. Eleven instructions."

> **Tie it back:** "Remember in the scheduler — `swtch(&(c->scheduler), p->context)`?
> That `p->context` is the pointer this assembly loads. And the `context` field in
> `struct proc`? This is what writes it."

**🎥 THEN CLICK** — Chapter 10. Press **Context switch ⇄**.

> "Phase one, save — the CPU's live registers get copied into Process A's slot: that's
> `movl %esp, (%eax)`. Phase two, load — Process B's saved registers go into the CPU:
> that's `movl %edx, %esp` then the pops. Now B runs with B's exact registers. Click
> again and A is restored perfectly. The CPU can't even tell."

---

## 11 · struct proc → the whole thing, tied together

**📄 CODE** — Chapter 12 tab `**struct proc`**, full:

```c
struct proc {
  uint sz;                     // Chapter 7  — size of its memory
  pde_t* pgdir;                // Chapter 3  — page table (private address space)
  char *kstack;                // kernel stack
  enum procstate state;        // Chapter 9  — RUNNABLE/RUNNING/SLEEPING/ZOMBIE
  int pid;                     // Chapter 8  — process id (survives exec)
  struct proc *parent;         // Chapter 8  — who to wake on exit (wait/zombie)
  struct trapframe *tf;        // Chapter 6  — saved user regs for syscalls
  struct context *context;     // Chapter 10 — saved regs for swtch()
  void *chan;                  // Chapter 9  — what it's SLEEPING on
  int killed;                  // kill flag
  struct file *ofile[NOFILE];  // Chapter 5  — open files
  struct inode *cwd;           // current directory
  char name[16];               // debug name
};
```

**🗣️ LINE BY LINE (rapid — this is the synthesis)**

> "Now read it as a summary of the whole video. Every field is a chapter:
> `pgdir` is the virtualized memory from Chapter 3. `state` and `chan` are the state
> machine and blocking from Chapter 9. `pid` and `parent` are fork/exec and zombies from
> Chapter 8. `tf` is the trap frame the syscall handler read in Chapter 6. `context` is
> what `swtch.S` saves in Chapter 10. `ofile` is persistence from Chapter 5. The kernel
> keeps an **array** of these — and that array literally *is* the process list."

**🎥 THEN CLICK** — Chapter 11. Click a few fields (`context`, `state`, `ofile`) to show the
mappings.

---

## 12 · The Real Deal — show it's all genuine (45 sec)

**🎥** Chapter 12. Click across the tabs quickly.

> "Everything I just walked through lives right here — pulled straight from MIT's real
> xv6 kernel: `fork`, `exec`, `scheduler`, `swtch.S`, the spinlock, `syscall`,
> sleep/wakeup, and `struct proc`. Each tab links back to the chapter that simulated it.
> The entire kernel is about **9,000 lines of C** — small enough to read in a weekend,
> which is exactly why it's the world's teaching OS."

---

## 13 · Outro (20 sec)

**🎥** "You made it 🎉" finale.

> "So that's a real operating system, in its own source code: a `scheduler` loop sharing
> the CPU, an `xchg` spinlock guarding shared data, a `syscall` handler behind the trap,
> `fork`/`exec` creating processes, `sleep`/`wakeup` moving them between states, and
> eleven lines of assembly in `swtch.S` switching between them — all tracked in one
> `struct proc`. Not magic. Just code. Link's below — go read it."

---

## 📌 Cheat sheet — the ONE line to point your cursor at per chapter


| Ch  | File / source      | The money line                                  |
| --- | ------------------ | ----------------------------------------------- |
| 2   | `script.js` step() | `current = program[pc];` (fetch)                |
| 3   | `scheduler()`      | `swtch(&(c->scheduler), p->context);`           |
| 4   | `spinlock.c`       | `while(xchg(&lk->locked, 1) != 0) ;`            |
| 5   | `script.js`        | `ram = [];` (pull the plug)                     |
| 6   | `syscall.c`        | `num = curproc->tf->eax;`                       |
| 7   | `proc.h`           | `pde_t* pgdir;`                                 |
| 8   | `proc.c` fork      | `np->tf->eax = 0;`                              |
| 8   | `exec.c`           | `curproc->pgdir = pgdir;`                       |
| 9   | `proc.c`           | `p->state = SLEEPING;` → `p->state = RUNNABLE;` |
| 10  | `swtch.S`          | `movl %esp,(%eax)` then `movl %edx,%esp`        |
| 11  | `proc.h`           | `struct context *context;`                      |


## 🎙️ Recording tips

- **Code on screen the whole time you narrate it.** Split-screen or screen-record the
Chapter 12 tab; only cut to the demo at the **🎥 THEN CLICK** beats.
- **Move your cursor / highlight the exact line** you're saying. This is a code video —
viewers need to see *which* line.
- **Three lines to slow way down on:** `np->tf->eax = 0` (Ch 8), `while(xchg(...))` (Ch 4),
and `movl %esp,(%eax)` / `movl %edx,%esp` (Ch 10). Those are the "ohhh" moments.
- If a line confuses you while recording, say what it does in your *own* words first,
then read the comment. Understanding beats reciting.
- Tighter ~12-min cut: keep Ch 3, 4, 8, 10 in full; trim Ch 2 and 5 to 20 seconds each.

```

```

