import Link from "next/link";
import { formatDate, getScribbleMediaTypes, type ScribbleMeta } from "@/lib/scribble-types";

const mediaLabels = {
  text: "Text",
  image: "Image",
  audio: "Audio",
} as const;

export function ScribbleCard({ scribble }: { scribble: ScribbleMeta }) {
  const mediaTypes = getScribbleMediaTypes(scribble);

  return (
    <article className="group rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 transition-colors hover:border-[var(--color-border)]">
      <Link href={`/scribbles/${scribble.slug}`} className="block">
        <time
          dateTime={scribble.date}
          className="font-mono text-xs text-[var(--color-accent-dim)]"
        >
          {formatDate(scribble.date)}
        </time>
        <h2 className="mt-2 text-lg font-semibold tracking-tight text-[var(--color-text)] transition-colors group-hover:text-[var(--color-accent)]">
          {scribble.title}
        </h2>
        {scribble.excerpt && (
          <p className="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
            {scribble.excerpt}
          </p>
        )}
        <div className="mt-4 flex flex-wrap items-center gap-2">
          {mediaTypes.map((type) => (
            <span
              key={type}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-subtle)]"
            >
              {mediaLabels[type]}
            </span>
          ))}
          {scribble.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg-subtle)] px-2 py-0.5 font-mono text-xs text-[var(--color-text-subtle)]"
            >
              {tag}
            </span>
          ))}
        </div>
      </Link>
    </article>
  );
}
