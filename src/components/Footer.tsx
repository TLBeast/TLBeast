import Link from "next/link";
import { siteConfig } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border-subtle)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--color-text)]">
            {siteConfig.name}
          </p>
          <p className="mt-1 text-sm text-[var(--color-text-subtle)]">
            {siteConfig.tagline}
          </p>
        </div>
        <p className="font-mono text-xs text-[var(--color-text-subtle)]">
          <Link
            href={`https://${siteConfig.domain}`}
            className="transition-colors hover:text-[var(--color-accent)]"
          >
            {siteConfig.domain}
          </Link>
        </p>
      </div>
    </footer>
  );
}
