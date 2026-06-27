"use client";

import { useState, type FormEvent } from "react";
import { siteConfig } from "@/lib/site";

export function GetInTouch() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">(
    "idle"
  );
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);

    if (formData.get("_gotcha")) {
      setStatus("success");
      return;
    }

    try {
      const response = await fetch(
        `https://formsubmit.co/ajax/${encodeURIComponent(siteConfig.contactEmail)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            name: formData.get("name"),
            email: formData.get("email"),
            message: formData.get("message"),
            _subject: `[TLBeast] Message from ${formData.get("name")}`,
            _template: "table",
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send");
      }

      form.reset();
      setStatus("success");
    } catch {
      setStatus("error");
      setErrorMessage(
        "Something went wrong. Try again or email me directly."
      );
    }
  }

  return (
    <section
      id="contact"
      className="border-t border-[var(--color-border-subtle)] bg-[var(--color-bg-elevated)]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text)]">
              Get in Touch
            </h2>
            <p className="mt-4 max-w-md leading-relaxed text-[var(--color-text-muted)]">
              Questions, feedback, or just want to talk systems? Send a message
              and it&apos;ll land in my inbox.
            </p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-[var(--color-text-subtle)]">
              If I send you a message back, it might end up in your spam folder
              — just please check that.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden="true"
            />

            <div>
              <label
                htmlFor="name"
                className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                disabled={status === "sending"}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent-dim)] disabled:opacity-50"
                placeholder="Your name"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                disabled={status === "sending"}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent-dim)] disabled:opacity-50"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="message"
                className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-[var(--color-text-subtle)]"
              >
                Message
              </label>
              <textarea
                id="message"
                name="message"
                required
                minLength={10}
                rows={5}
                disabled={status === "sending"}
                className="w-full resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] px-4 py-2.5 text-sm text-[var(--color-text)] outline-none transition-colors placeholder:text-[var(--color-text-subtle)] focus:border-[var(--color-accent-dim)] disabled:opacity-50"
                placeholder="What's on your mind?"
              />
            </div>

            {status === "success" && (
              <p role="status" className="text-sm text-[var(--color-accent)]">
                Thanks — your message has been sent. I&apos;ll get back to you
                soon. If you hear from me, check your spam folder just in case.
              </p>
            )}

            {status === "error" && (
              <p role="status" className="text-sm text-red-400">
                {errorMessage}{" "}
                <a
                  href={`mailto:${siteConfig.contactEmail}`}
                  className="underline underline-offset-2"
                >
                  {siteConfig.contactEmail}
                </a>
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="rounded-lg bg-[var(--color-accent)] px-5 py-2.5 text-sm font-medium text-[var(--color-bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {status === "sending" ? "Sending…" : "Send message"}
            </button>
          </form>
        </div>
      </div>
    </section>
  );
}
