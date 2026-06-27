import fs from "fs";
import path from "path";
import matter from "gray-matter";
import type { Scribble, ScribbleMeta } from "@/lib/scribble-types";
import { parseLocalDate } from "@/lib/scribble-types";

export type {
  Scribble,
  ScribbleImage,
  ScribbleMeta,
} from "@/lib/scribble-types";

export {
  formatDate,
  formatDayLabel,
  getScribbleMediaTypes,
  groupScribblesByMonth,
} from "@/lib/scribble-types";

const scribblesDirectory = path.join(process.cwd(), "content/scribbles");

type ScribbleFrontmatter = {
  title?: string;
  date?: string;
  excerpt?: string;
  tags?: string[];
  readingTime?: string;
  audio?: string;
  video?: string;
  videoEmbed?: string;
  streamTitle?: string;
  streamNote?: string;
  showStreamOnScribble?: boolean;
  streamsOnly?: boolean;
  images?: ScribbleMeta["images"];
};

function ensureScribblesDirectory() {
  if (!fs.existsSync(scribblesDirectory)) {
    fs.mkdirSync(scribblesDirectory, { recursive: true });
  }
}

function parseScribble(
  slug: string,
  fileContents: string
): ScribbleMeta & { content: string } {
  const { data, content } = matter<ScribbleFrontmatter>(fileContents);

  return {
    slug,
    title: data.title ?? slug,
    date: data.date ?? "",
    excerpt: data.excerpt ?? "",
    tags: data.tags ?? [],
    readingTime: data.readingTime,
    audio: data.audio,
    video: data.video,
    videoEmbed: data.videoEmbed,
    streamTitle: data.streamTitle,
    streamNote: data.streamNote,
    showStreamOnScribble: data.showStreamOnScribble,
    streamsOnly: data.streamsOnly,
    images: data.images,
    hasText: content.trim().length > 0,
    content,
  };
}

function loadAllScribbles(): Scribble[] {
  ensureScribblesDirectory();

  const fileNames = fs
    .readdirSync(scribblesDirectory)
    .filter((name) => name.endsWith(".md"));

  return fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(scribblesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return parseScribble(slug, fileContents);
  });
}

function sortScribblesNewestFirst(scribbles: Scribble[]): Scribble[] {
  return scribbles.sort((a, b) => {
    const dateDiff =
      parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime();
    if (dateDiff !== 0) return dateDiff;
    return b.slug.localeCompare(a.slug);
  });
}

export function getAllScribblesWithContent(): Scribble[] {
  return sortScribblesNewestFirst(loadAllScribbles());
}

export function getScribblesForTimeline(): Scribble[] {
  return sortScribblesNewestFirst(
    loadAllScribbles().filter((scribble) => !scribble.streamsOnly)
  );
}

export function getAllScribbles(): ScribbleMeta[] {
  return getScribblesForTimeline().map(({ content: _, ...meta }) => meta);
}

export function getScribbleBySlug(slug: string): Scribble | null {
  ensureScribblesDirectory();

  const fullPath = path.join(scribblesDirectory, `${slug}.md`);

  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  return parseScribble(slug, fileContents);
}

export function getStreams(): Scribble[] {
  return getAllScribblesWithContent().filter(
    (scribble) => scribble.video || scribble.videoEmbed
  );
}

export function getWalkthroughs(): Scribble[] {
  return getStreams()
    .filter((scribble) => scribble.tags.includes("interactive-lab"))
    .sort((a, b) => {
      const dateDiff =
        parseLocalDate(a.date).getTime() - parseLocalDate(b.date).getTime();
      if (dateDiff !== 0) return dateDiff;
      return a.slug.localeCompare(b.slug);
    });
}
