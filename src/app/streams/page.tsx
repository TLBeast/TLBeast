import type { Metadata } from "next";
import { StreamsTimeline } from "@/components/StreamsTimeline";
import { getStreams } from "@/lib/scribbles";

export const metadata: Metadata = {
  title: "Streams",
  description: "Stream recordings from TLBeast — chess, learning sessions, and more.",
};

export default function StreamsPage() {
  const streams = getStreams();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Streams
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Slide through each stream — drag the slider, tap a dot, or swipe to
          explore recordings from the journey.
        </p>
      </div>

      {streams.length > 0 ? (
        <StreamsTimeline streams={streams} />
      ) : (
        <div className="mt-12 rounded-xl border border-dashed border-[var(--color-border)] p-12 text-center">
          <p className="text-lg text-[var(--color-text-muted)]">
            First stream coming soon.
          </p>
        </div>
      )}
    </div>
  );
}
