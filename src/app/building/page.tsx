import type { Metadata } from "next";
import Link from "next/link";
import { topics } from "@/lib/site";

export const metadata: Metadata = {
  title: "What I'm Building",
  description:
    "The roadmap for TLBeast — visual notes, diagrams, and interactive labs for computer systems.",
};

const roadmap = [
  {
    phase: "Now",
    title: "Daily Systems Scribbles",
    description:
      "Publishing what I learn each day — text, images, or audio. Operating systems, memory, threads, scheduling, caches, networking, and whatever else I dig into.",
    status: "active",
  },
  {
    phase: "Next",
    title: "Visual Diagrams",
    description:
      "Animated and static diagrams that walk through processes step by step — context switches, page faults, cache hits, packet flow.",
    status: "planned",
  },
  {
    phase: "Later",
    title: "Interactive Labs",
    description:
      "Hands-on simulations where you can tweak parameters and watch the system respond — schedulers you can configure, memory you can allocate, networks you can trace.",
    status: "planned",
  },
];

export default function BuildingPage() {
  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          What I&apos;m Building
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          TLBeast is a learning project turned product — a place to simplify the
          world of computer systems through writing, visuals, and eventually
          interaction.
        </p>
      </div>

      <div className="mt-16 space-y-6">
        {roadmap.map((item) => (
          <div
            key={item.title}
            className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-2.5 py-0.5 font-mono text-xs ${
                  item.status === "active"
                    ? "bg-[var(--color-accent-glow)] text-[var(--color-accent)]"
                    : "border border-[var(--color-border)] text-[var(--color-text-subtle)]"
                }`}
              >
                {item.phase}
              </span>
            </div>
            <h2 className="mt-4 text-xl font-semibold text-[var(--color-text)]">
              {item.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
              {item.description}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
          Core topics
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-lg border border-[var(--color-border-subtle)] px-4 py-2 text-sm text-[var(--color-text-muted)]"
            >
              {topic}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-12">
        <Link
          href="/scribbles"
          className="text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)]"
        >
          Start reading the scribbles →
        </Link>
      </div>
    </div>
  );
}
