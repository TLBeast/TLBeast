import Link from "next/link";
import { siteConfig, navItems } from "@/lib/site";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-border-subtle)] bg-[var(--color-bg)]/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="group flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md border border-[var(--color-border)] bg-[var(--color-bg-elevated)] font-mono text-xs font-bold text-[var(--color-accent)] transition-colors group-hover:border-[var(--color-accent-dim)]">
            TL
          </span>
          <span className="font-semibold tracking-tight text-[var(--color-text)]">
            {siteConfig.name}
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-bg-subtle)] hover:text-[var(--color-text)]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      <nav className="flex gap-1 overflow-x-auto border-t border-[var(--color-border-subtle)] px-6 py-2 md:hidden">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="shrink-0 rounded-md px-3 py-1.5 text-xs text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
