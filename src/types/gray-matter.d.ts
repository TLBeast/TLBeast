declare module "gray-matter" {
  interface GrayMatterFile<T extends Record<string, unknown> = Record<string, unknown>> {
    data: T;
    content: string;
    excerpt?: string;
    orig: Buffer | string;
    language: string;
    matter: string;
    stringify(lang?: string): string;
  }

  function matter<T extends Record<string, unknown> = Record<string, unknown>>(
    input: string | Buffer,
    options?: Record<string, unknown>
  ): GrayMatterFile<T>;

  export = matter;
}
