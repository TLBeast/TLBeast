import Link from "next/link";
import { ScribbleCard } from "@/components/ScribbleCard";
import { getAllScribbles } from "@/lib/scribbles";
import { siteConfig, topics } from "@/lib/site";

export default function HomePage() {
  const recentScribbles = getAllScribbles().slice(0, 3);

  return (
    <>
      <section className="grid-bg relative overflow-hidden border-b border-[var(--color-border-subtle)]">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[var(--color-accent-glow)] to-transparent" />
        <div className="relative mx-auto max-w-5xl px-6 py-24 sm:py-32">
          <Link
            href={siteConfig.linkedIn}
            target="_blank"
            rel="noopener noreferrer"
            className="font-mono text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)]"
          >
            LinkedIn · Me
          </Link>
          <h1 className="mt-4 max-w-2xl text-4xl font-semibold tracking-tight text-[var(--color-text)] sm:text-5xl">
            Making invisible systems feel intuitive
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
            Computer systems topics like operating systems, memory, threads,
            scheduling, caches, and networking are often taught through dense
            lectures and abstract diagrams. These ideas are easier to understand
            when you can see what is happening step by step.
          </p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--color-text-muted)]">
            Just know that my long-term vision is that I'm building a tool in this space (I'm shooting for the stars with the focus/scope/customers/context, will reveal details when I'm ready), but for now, the current focus is my personal learning journey. 
            This is where I document what I&apos;m learning, create visual
            notes, and gradually build interactive explanations that make
            invisible systems feel more intuitive.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href="/scribbles"
              className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90"
            >
              Read Systems Scribbles
            </Link>
            <Link
              href="/building"
              className="rounded-lg border border-[var(--color-border)] px-5 py-2.5 text-sm font-medium text-[var(--color-text)] transition-colors hover:border-[var(--color-text-subtle)] hover:bg-[var(--color-bg-elevated)]"
            >
              What I&apos;m Building
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <h2 className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
          Topics I&apos;m exploring
        </h2>
        <div className="mt-6 flex flex-wrap gap-2">
          {topics.map((topic) => (
            <span
              key={topic}
              className="rounded-lg border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] px-4 py-2 text-sm text-[var(--color-text-muted)]"
            >
              {topic}
            </span>
          ))}
        </div>
      </section>

      <section className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
        <div className="mx-auto max-w-5xl px-6 py-16">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
                Latest Scribbles
              </h2>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                Daily uploads — text, images, or audio
              </p>
            </div>
            <Link
              href="/scribbles"
              className="hidden text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)] sm:block"
            >
              View all →
            </Link>
          </div>

          {recentScribbles.length > 0 ? (
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentScribbles.map((scribble) => (
                <ScribbleCard key={scribble.slug} scribble={scribble} />
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border border-dashed border-[var(--color-border)] p-10 text-center">
              <p className="text-[var(--color-text-muted)]">
                First scribble coming soon.
              </p>
            </div>
          )}

          <Link
            href="/scribbles"
            className="mt-6 block text-sm text-[var(--color-accent)] sm:hidden"
          >
            View all scribbles →
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/diagrams",
              title: "Visual Diagrams",
              desc: "Step-by-step visuals that show how systems work under the hood.",
            },
            {
              href: "/labs",
              title: "Interactive Labs",
              desc: "Hands-on simulations to explore concepts yourself. Coming soon.",
            },
            {
              href: "/about",
              title: "About",
              desc: "Why TLBeast exists and what I'm trying to build.",
            },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-xl border border-[var(--color-border-subtle)] p-6 transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
            >
              <h3 className="font-semibold text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {item.desc}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
