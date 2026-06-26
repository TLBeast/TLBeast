export type ScribbleImage = {
  src: string;
  alt?: string;
  caption?: string;
};

export type ScribbleMeta = {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  tags: string[];
  readingTime?: string;
  audio?: string;
  video?: string;
  videoEmbed?: string;
  streamTitle?: string;
  streamNote?: string;
  showStreamOnScribble?: boolean;
  images?: ScribbleImage[];
  hasText?: boolean;
};

export type Scribble = ScribbleMeta & {
  content: string;
};

export type ScribbleMonthGroup = {
  key: string;
  label: string;
  scribbles: ScribbleMeta[];
};

/** Parse YYYY-MM-DD as local midnight (avoids UTC off-by-one in US timezones). */
export function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function formatDate(dateString: string): string {
  if (!dateString) return "";
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatDayLabel(dateString: string): string {
  return parseLocalDate(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function groupScribblesByMonth(
  scribbles: ScribbleMeta[]
): ScribbleMonthGroup[] {
  const groups = new Map<string, ScribbleMeta[]>();

  for (const scribble of scribbles) {
    const date = parseLocalDate(scribble.date);
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    const existing = groups.get(key) ?? [];
    existing.push(scribble);
    groups.set(key, existing);
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => b.localeCompare(a))
    .map(([key, items]) => {
      const [year, month] = key.split("-");
      const label = new Date(Number(year), Number(month) - 1).toLocaleDateString(
        "en-US",
        { month: "long", year: "numeric" }
      );
      return { key, label, scribbles: items };
    });
}

export function getScribbleMediaTypes(
  scribble: Pick<ScribbleMeta, "hasText" | "audio" | "images">
): ("text" | "image" | "audio")[] {
  const types: ("text" | "image" | "audio")[] = [];

  if (scribble.hasText) types.push("text");
  if (scribble.audio) types.push("audio");
  if (scribble.images?.length) types.push("image");

  return types;
}
