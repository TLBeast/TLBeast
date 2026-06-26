import type { ScribbleImage } from "@/lib/scribble-types";

function toEmbedUrl(url: string): string {
  const driveMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveMatch) {
    return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
  }
  return url;
}

function StreamPlayer({
  video,
  videoEmbed,
}: {
  video?: string;
  videoEmbed?: string;
}) {
  if (videoEmbed) {
    return (
      <iframe
        src={toEmbedUrl(videoEmbed)}
        title="Stream"
        allow="autoplay; encrypted-media"
        allowFullScreen
        className="aspect-video w-full border-0"
      />
    );
  }

  if (video) {
    return (
      <video controls preload="metadata" playsInline className="w-full">
        <source src={video} />
        Your browser does not support video playback.
      </video>
    );
  }

  return null;
}

export function ScribbleMedia({
  audio,
  images,
  video,
  videoEmbed,
  videoAtBottom = false,
  videoLabel = "Stream",
}: {
  audio?: string;
  images?: ScribbleImage[];
  video?: string;
  videoEmbed?: string;
  videoAtBottom?: boolean;
  videoLabel?: string;
}) {
  const hasVideo = Boolean(video || videoEmbed);
  const showVideo = hasVideo && videoAtBottom;
  const showTop = audio || images?.length || (hasVideo && !videoAtBottom);

  if (!showTop && !showVideo) return null;

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

      {hasVideo && !videoAtBottom && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          {videoLabel && (
            <p className="border-b border-[var(--color-border-subtle)] px-4 py-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
              {videoLabel}
            </p>
          )}
          <StreamPlayer video={video} videoEmbed={videoEmbed} />
        </div>
      )}

      {showVideo && (
        <div className="overflow-hidden rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]">
          {videoLabel && (
            <p className="border-b border-[var(--color-border-subtle)] px-4 py-3 font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
              {videoLabel}
            </p>
          )}
          <StreamPlayer video={video} videoEmbed={videoEmbed} />
        </div>
      )}
    </div>
  );
}
