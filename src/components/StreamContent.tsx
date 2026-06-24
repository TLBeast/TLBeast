import type { Scribble } from "@/lib/scribble-types";
import { formatDate } from "@/lib/scribble-types";
import { ScribbleMedia } from "@/components/ScribbleMedia";

export function StreamContent({ stream }: { stream: Scribble }) {
  const title = stream.streamTitle ?? stream.title;

  return (
    <>
      <header className="border-b border-[var(--color-border-subtle)] pb-8">
        <time
          dateTime={stream.date}
          className="font-mono text-sm text-[var(--color-accent-dim)]"
        >
          {formatDate(stream.date)}
        </time>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          {title}
        </h2>
        {stream.streamNote && (
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            {stream.streamNote}
          </p>
        )}
      </header>

      <div className="mt-10">
        <ScribbleMedia video={stream.video} videoEmbed={stream.videoEmbed} />
      </div>
    </>
  );
}
