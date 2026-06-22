import type { ScribbleImage } from "@/lib/scribble-types";

export function ScribbleMedia({
  audio,
  images,
}: {
  audio?: string;
  images?: ScribbleImage[];
}) {
  if (!audio && !images?.length) return null;

  return (
    <div className="space-y-6">
      {audio && (
        <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-4">
          <p className="mb-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
            Audio scribble
          </p>
          <audio controls preload="metadata" className="w-full">
            <source src={audio} />
            Your browser does not support audio playback.
          </audio>
        </div>
      )}

      {images && images.length > 0 && (
        <div className="space-y-4">
          {images.map((image) => (
            <figure
              key={image.src}
              className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.src}
                alt={image.alt ?? ""}
                className="w-full object-cover"
              />
              {image.caption && (
                <figcaption className="border-t border-[var(--color-border-subtle)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
                  {image.caption}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      )}
    </div>
  );
}
