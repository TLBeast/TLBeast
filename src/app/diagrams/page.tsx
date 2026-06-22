import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Visual Diagrams",
  description:
    "Step-by-step visual diagrams for operating systems, memory, threads, and more.",
};

export default function DiagramsPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Visual Diagrams
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Abstract diagrams are hard to follow. These visuals are built to show
          what happens inside the machine — frame by frame, step by step.
        </p>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-2">
        {[
          "Process lifecycle",
          "Virtual memory & page tables",
          "Context switching",
          "CPU scheduling",
          "Cache hierarchy",
          "TCP handshake",
        ].map((topic) => (
          <div
            key={topic}
            className="rounded-xl border border-dashed border-[var(--color-border)] p-8 text-center"
          >
            <p className="text-sm text-[var(--color-text-muted)]">{topic}</p>
            <p className="mt-2 font-mono text-xs text-[var(--color-text-subtle)]">
              Coming soon
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
