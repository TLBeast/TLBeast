import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Interactive Labs",
  description:
    "Hands-on simulations for exploring computer systems concepts.",
};

export default function LabsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <span className="rounded-full border border-[var(--color-border)] px-3 py-1 font-mono text-xs text-[var(--color-text-subtle)]">
          Coming Soon
        </span>
        <h1 className="mt-6 text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Interactive Labs
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Reading about a scheduler is one thing. Configuring one and watching
          threads compete for the CPU is another. Interactive labs are the next
          step — simulations you can tweak, break, and learn from.
        </p>
      </div>

      <div className="mt-16 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-8 sm:p-12">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
          Planned labs
        </h2>
        <ul className="mt-6 space-y-4">
          {[
            "Scheduler playground — compare FCFS, SJF, and round-robin",
            "Virtual memory simulator — page faults in real time",
            "Cache visualizer — see hits, misses, and evictions",
            "Network tracer — follow a packet from socket to wire",
          ].map((lab) => (
            <li
              key={lab}
              className="flex items-start gap-3 text-[var(--color-text-muted)]"
            >
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-accent-dim)]" />
              {lab}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
