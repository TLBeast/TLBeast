import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: "About TLBeast and the mission behind tlbeast.dev.",
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
        About {siteConfig.name}
      </h1>

      <div className="mt-8 space-y-6 text-[var(--color-text-muted)] leading-relaxed">
        <p>
          Computer systems are everywhere — in every app, every server, every
          device. But the ideas behind them (processes, memory, threads,
          scheduling, caches, networking) are often taught in ways that feel
          abstract and disconnected from what actually happens.
        </p>
        <p>
          <strong className="text-[var(--color-text)]">TLBeast</strong> is my
          attempt to change that. I&apos;m learning these topics deeply and
          documenting the journey — daily scribbles, visual diagrams, and eventually
          interactive labs that let you see systems work instead of just reading
          about them.
        </p>
        <p>
          Connect on{" "}
          <Link
            href={siteConfig.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-[var(--color-accent)] underline underline-offset-2"
          >
            LinkedIn
          </Link>
          . It&apos;s a work in progress, built in public, one concept at a
          time.
        </p>
      </div>

      <div className="mt-12 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6">
        <h2 className="font-semibold text-[var(--color-text)]">
          What you&apos;ll find here
        </h2>
        <ul className="mt-4 space-y-3 text-sm text-[var(--color-text-muted)]">
          <li>
            <Link href="/scribbles" className="text-[var(--color-accent)] hover:underline">
              Systems Scribbles
            </Link>{" "}
            — daily uploads (text, images, or audio)
          </li>
          <li>
            <Link href="/diagrams" className="text-[var(--color-accent)] hover:underline">
              Visual Diagrams
            </Link>{" "}
            — step-by-step visuals for complex ideas
          </li>
          <li>
            <Link href="/labs" className="text-[var(--color-accent)] hover:underline">
              Interactive Labs
            </Link>{" "}
            — hands-on simulations (coming soon)
          </li>
        </ul>
      </div>
    </div>
  );
}
