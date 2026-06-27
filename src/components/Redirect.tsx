"use client";

import { useEffect } from "react";
import Link from "next/link";

export function Redirect({ to, label }: { to: string; label: string }) {
  useEffect(() => {
    window.location.replace(to);
  }, [to]);

  return (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <p className="text-[var(--color-text-muted)]">
        Redirecting to{" "}
        <Link href={to} className="text-[var(--color-accent)] hover:underline">
          {label}
        </Link>
        …
      </p>
    </div>
  );
}
