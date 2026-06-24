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
    images: data.images,
    hasText: content.trim().length > 0,
    content,
  };
}

export function getAllScribblesWithContent(): Scribble[] {
  ensureScribblesDirectory();

  const fileNames = fs
    .readdirSync(scribblesDirectory)
    .filter((name) => name.endsWith(".md"));

  const scribbles = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(scribblesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    return parseScribble(slug, fileContents);
  });

  return scribbles.sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
}

export function getAllScribbles(): ScribbleMeta[] {
  ensureScribblesDirectory();

  const fileNames = fs
    .readdirSync(scribblesDirectory)
    .filter((name) => name.endsWith(".md"));

  const scribbles = fileNames.map((fileName) => {
    const slug = fileName.replace(/\.md$/, "");
    const fullPath = path.join(scribblesDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { content: _, ...meta } = parseScribble(slug, fileContents);
    return meta;
  });

  return scribbles.sort(
    (a, b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()
  );
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
