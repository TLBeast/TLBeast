import type { Scribble } from "@/lib/scribble-types";
import { formatDate } from "@/lib/scribble-types";
import { MarkdownContent } from "@/components/MarkdownContent";
import { ScribbleMedia } from "@/components/ScribbleMedia";

export function ScribbleContent({ scribble }: { scribble: Scribble }) {
  return (
    <>
      <header className="border-b border-[var(--color-border-subtle)] pb-8">
        <time
          dateTime={scribble.date}
          className="font-mono text-sm text-[var(--color-accent-dim)]"
        >
          {formatDate(scribble.date)}
        </time>
        <h2 className="mt-3 text-2xl font-semibold tracking-tight text-[var(--color-text)] sm:text-3xl">
          {scribble.title}
        </h2>
        {scribble.excerpt && (
          <p className="mt-4 text-lg text-[var(--color-text-muted)]">
            {scribble.excerpt}
          </p>
        )}
        {scribble.tags.length > 0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {scribble.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-2.5 py-1 font-mono text-xs text-[var(--color-text-subtle)]"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </header>

      <div className="mt-10 space-y-10">
        <ScribbleMedia audio={scribble.audio} images={scribble.images} />
        {scribble.content.trim() && (
          <MarkdownContent content={scribble.content} />
        )}
        {scribble.showStreamOnScribble && (
          <ScribbleMedia
            video={scribble.video}
            videoEmbed={scribble.videoEmbed}
            videoAtBottom
          />
        )}
      </div>
    </>
  );
}
