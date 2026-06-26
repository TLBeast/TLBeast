import type { Metadata } from "next";
import { ScribblesTimeline } from "@/components/ScribblesTimeline";
import { getScribblesForTimeline } from "@/lib/scribbles";

export const metadata: Metadata = {
  title: "Systems Scribbles",
  description:
    "Daily scribbles on operating systems, memory, threads, scheduling, caches, and networking.",
};

export default function ScribblesPage() {
  const scribbles = getScribblesForTimeline();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Systems Scribbles
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Slide through each day&apos;s scribble — drag the slider, tap a dot,
          or swipe to explore your learning journey.
        </p>
      </div>

      {scribbles.length > 0 ? (
        <ScribblesTimeline scribbles={scribbles} />
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-lg text-[var(--color-text-muted)]">
            First scribble coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
