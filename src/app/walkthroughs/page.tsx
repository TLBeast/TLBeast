import type { Metadata } from "next";
import Link from "next/link";
import { ScribbleMedia } from "@/components/ScribbleMedia";
import { formatDate } from "@/lib/scribble-types";
import { getWalkthroughs } from "@/lib/scribbles";

export const metadata: Metadata = {
  title: "Walkthroughs",
  description:
    "Video walkthroughs for the xv6 interactive lab and other hands-on OS explorations.",
};

export default function WalkthroughsPage() {
  const walkthroughs = getWalkthroughs();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Walkthroughs
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Step-by-step video guides for the interactive labs — watch before you
          poke around, or follow along while you explore.
        </p>
        <Link
          href="/labs"
          className="mt-4 inline-block text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)]"
        >
          Open Interactive Labs →
        </Link>
      </div>

      <div className="mt-16 space-y-12">
        {walkthroughs.length > 0 ? (
          walkthroughs.map((walkthrough) => {
            const title = walkthrough.streamTitle ?? walkthrough.title;

            return (
              <article
                key={walkthrough.slug}
                className="space-y-4 border-t border-[var(--color-border-subtle)] pt-12 first:border-t-0 first:pt-0"
              >
                <header>
                  <time
                    dateTime={walkthrough.date}
                    className="font-mono text-sm text-[var(--color-accent-dim)]"
                  >
                    {formatDate(walkthrough.date)}
                  </time>
                  <h2 className="mt-2 text-xl font-semibold tracking-tight text-[var(--color-text)]">
                    {title}
                  </h2>
                  {walkthrough.streamNote && (
                    <p className="mt-2 text-[var(--color-text-muted)]">
                      {walkthrough.streamNote}
                    </p>
                  )}
                </header>
                <ScribbleMedia
                  video={walkthrough.video}
                  videoEmbed={walkthrough.videoEmbed}
                  videoLabel=""
                />
              </article>
            );
          })
        ) : (
          <div className="rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
            <p className="text-[var(--color-text-muted)]">
              First walkthrough coming soon.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
