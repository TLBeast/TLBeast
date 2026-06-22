import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ScribbleContent } from "@/components/ScribbleContent";
import { getAllScribbles, getScribbleBySlug } from "@/lib/scribbles";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllScribbles().map((scribble) => ({ slug: scribble.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const scribble = getScribbleBySlug(slug);
  if (!scribble) return { title: "Not Found" };

  return {
    title: scribble.title,
    description: scribble.excerpt,
  };
}

export default async function ScribblePage({ params }: Props) {
  const { slug } = await params;
  const scribble = getScribbleBySlug(slug);

  if (!scribble) {
    notFound();
  }

  return (
    <article className="mx-auto max-w-3xl px-6 py-16">
      <Link
        href={`/scribbles#${scribble.slug}`}
        className="font-mono text-xs text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-accent)]"
      >
        ← Back to timeline
      </Link>

      <div className="mt-8">
        <ScribbleContent scribble={scribble} />
      </div>
    </article>
  );
}
