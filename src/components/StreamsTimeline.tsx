"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Scribble } from "@/lib/scribble-types";
import { formatDate, formatDayLabel, parseLocalDate } from "@/lib/scribble-types";
import { StreamContent } from "@/components/StreamContent";

function getStreamLabel(stream: Scribble): string {
  return stream.streamTitle ?? stream.title;
}

export function StreamsTimeline({ streams }: { streams: Scribble[] }) {
  const chronological = useMemo(
    () =>
      [...streams].sort((a, b) => {
        const dateDiff =
          parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
        if (dateDiff !== 0) return dateDiff;
        return a.slug.localeCompare(b.slug);
      }),
    [streams]
  );

  const slugToIndex = useMemo(() => {
    const map = new Map<string, number>();
    chronological.forEach((s, i) => map.set(s.slug, i));
    return map;
  }, [chronological]);

  const [index, setIndex] = useState(chronological.length - 1);
  const touchStartX = useRef(0);

  const selected = chronological[index];
  const hasOlder = index > 0;
  const hasNewer = index < chronological.length - 1;

  const selectIndex = useCallback(
    (nextIndex: number) => {
      const clamped = Math.max(0, Math.min(chronological.length - 1, nextIndex));
      setIndex(clamped);
      const slug = chronological[clamped]?.slug;
      if (slug) window.history.replaceState(null, "", `#${slug}`);
    },
    [chronological]
  );

  const goOlder = useCallback(() => {
    if (hasOlder) selectIndex(index - 1);
  }, [hasOlder, index, selectIndex]);

  const goNewer = useCallback(() => {
    if (hasNewer) selectIndex(index + 1);
  }, [hasNewer, index, selectIndex]);

  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (hash && slugToIndex.has(hash)) {
      setIndex(slugToIndex.get(hash)!);
    }
  }, [slugToIndex]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        goOlder();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        goNewer();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goOlder, goNewer]);

  const handleTouchStart = (event: React.TouchEvent) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    const delta = event.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) < 50) return;
    if (delta > 0) goOlder();
    else goNewer();
  };

  if (!selected) return null;

  const progress =
    chronological.length > 1 ? (index / (chronological.length - 1)) * 100 : 100;

  return (
    <div className="mt-12">
      <div className="rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 sm:p-8">
        <div className="text-center">
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]">
            Slide through your streams
          </p>
          <p className="mt-3 font-mono text-sm text-[var(--color-accent)]">
            {formatDate(selected.date)}
          </p>
          <h2 className="mt-1 text-xl font-semibold tracking-tight text-[var(--color-text)] sm:text-2xl">
            {getStreamLabel(selected)}
          </h2>
        </div>

        <div className="mt-8 flex items-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={goOlder}
            disabled={!hasOlder}
            aria-label="Previous stream"
            className="shrink-0 rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent)] disabled:opacity-25"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M10 3L5 8L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div className="relative min-w-0 flex-1 pt-6 pb-2">
            <div
              className="pointer-events-none absolute top-0 flex -translate-x-1/2 flex-col items-center"
              style={{ left: `${progress}%` }}
            >
              <span className="whitespace-nowrap font-mono text-[10px] text-[var(--color-accent)] sm:text-xs">
                {formatDayLabel(selected.date)}
              </span>
            </div>

            <div className="relative mb-3 h-3">
              <div className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[var(--color-border)]" />
              <div
                className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full bg-[var(--color-accent-dim)] transition-all duration-150"
                style={{ width: `${progress}%` }}
              />
              <div className="absolute inset-x-0 top-1/2 flex -translate-y-1/2 justify-between px-0.5">
                {chronological.map((stream, i) => (
                  <button
                    key={stream.slug}
                    type="button"
                    onClick={() => selectIndex(i)}
                    aria-label={`${formatDayLabel(stream.date)} — ${getStreamLabel(stream)}`}
                    className={`h-2.5 w-2.5 shrink-0 rounded-full transition-all ${
                      i === index
                        ? "scale-125 bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]/30"
                        : i < index
                          ? "bg-[var(--color-accent-dim)]"
                          : "bg-[var(--color-border)] hover:bg-[var(--color-text-subtle)]"
                    }`}
                  />
                ))}
              </div>
            </div>

            <input
              type="range"
              min={0}
              max={Math.max(0, chronological.length - 1)}
              value={index}
              onChange={(event) => selectIndex(Number(event.target.value))}
              aria-label="Select stream by date"
              aria-valuetext={`${formatDate(selected.date)} — ${getStreamLabel(selected)}`}
              className="scribble-slider relative z-10 w-full"
            />

            <div className="mt-2 flex justify-between font-mono text-[10px] text-[var(--color-text-subtle)] sm:text-xs">
              <span>{formatDayLabel(chronological[0].date)}</span>
              <span>
                {index + 1} / {chronological.length}
              </span>
              <span>
                {formatDayLabel(chronological[chronological.length - 1].date)}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={goNewer}
            disabled={!hasNewer}
            aria-label="Next stream"
            className="shrink-0 rounded-full border border-[var(--color-border)] p-2.5 text-[var(--color-text-muted)] transition-colors hover:border-[var(--color-accent-dim)] hover:text-[var(--color-accent)] disabled:opacity-25"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6 3L11 8L6 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <article
        key={selected.slug}
        className="scribble-fade-in mt-8 rounded-xl border border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)] p-6 sm:p-8"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <StreamContent stream={selected} />
      </article>

      <p className="mt-4 text-center font-mono text-xs text-[var(--color-text-subtle)]">
        Drag the slider, tap a dot, swipe the card, or use ← → keys
      </p>
    </div>
  );
}
