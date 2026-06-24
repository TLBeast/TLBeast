import type { Metadata } from "next";
import { StreamCard } from "@/components/StreamCard";
import { getStreams } from "@/lib/scribbles";

export const metadata: Metadata = {
  title: "Streams",
  description: "Stream recordings from TLBeast — chess, learning sessions, and more.",
};

export default function StreamsPage() {
  const streams = getStreams();

  return (
    <div className="mx-auto max-w-5xl px-6 py-16">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-text)]">
          Streams
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)]">
          Recordings from the journey — chess, walkthroughs, and whatever else
          ends up on stream that day.
        </p>
      </div>

      {streams.length > 0 ? (
        <div className="mt-12 space-y-8">
          {streams.map((stream) => (
            <StreamCard key={stream.slug} scribble={stream} />
          ))}
        </div>
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
