import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Interactive Labs",
  description:
    "Hands-on simulations for exploring operating systems — starting with xv6, demystified.",
};

const labs = [
  {
    slug: "xv6",
    title: "xv6, Demystified",
    description:
      "An interactive OS playground — fetch-decode-execute, virtualization, concurrency, persistence, processes, fork/exec, context switches, and the real xv6 source code. Nothing to install. Just poke it.",
    href: "/labs/xv6/",
    status: "live" as const,
  },
];

export default function LabsPage() {
  const featured = labs[0];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Interactive Labs
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Reading about a scheduler is one thing. Stepping through a tiny CPU,
          racing two threads, and watching a context switch happen is another.
        </p>
      </div>

      <div className="mt-12 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="rounded-full bg-[var(--color-accent-glow)] px-2.5 py-0.5 font-mono text-xs text-[var(--color-accent)]">
              Live
            </span>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              {featured.title}
            </h2>
            <p className="mt-2 max-w-2xl text-[var(--color-text-muted)]">
              {featured.description}
            </p>
          </div>
          <Link
            href={featured.href}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-accent-dim)] hover:bg-[var(--color-bg-elevated)]"
          >
            Open fullscreen ↗
          </Link>
        </div>

        <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          <iframe
            src={featured.href}
            title={featured.title}
            className="h-[min(85vh,900px)] w-full border-0"
            loading="lazy"
          />
        </div>

        <p className="text-sm text-[var(--color-text-muted)]">
          Prefer video?{" "}
          <Link
            href="/walkthroughs"
            className="text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)]"
          >
            Watch the walkthroughs →
          </Link>
        </p>
      </div>
    </div>
  );
}
