import Link from "next/link";
import { ScribbleMedia } from "@/components/ScribbleMedia";
import { formatDate, type Scribble } from "@/lib/scribble-types";

export function StreamCard({ scribble }: { scribble: Scribble }) {
  return (
    <article className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
      <ScribbleMedia
        video={scribble.video}
        videoEmbed={scribble.videoEmbed}
      />

      <div className="border-t border-[var(--color-border-subtle)] p-6">
        <time
          dateTime={scribble.date}
          className="font-mono text-xs text-[var(--color-accent-dim)]"
        >
          {formatDate(scribble.date)}
        </time>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-text)]">
          {scribble.title}
        </h2>
        {scribble.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {scribble.excerpt}
          </p>
        )}
        <Link
          href={`/scribbles#${scribble.slug}`}
          className="mt-4 inline-block text-sm text-[var(--color-accent)] transition-colors hover:text-[var(--color-text)]"
        >
          View full scribble →
        </Link>
      </div>
    </article>
  );
}
