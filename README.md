# TLBeast

**tlbeast.dev** — Making invisible computer systems feel intuitive.

Daily scribbles, visual diagrams, and interactive labs for operating systems, memory, threads, scheduling, caches, and networking.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Adding a daily scribble

Create a markdown file in `content/scribbles/` using the date as the filename:

```markdown
---
title: "What is a process?"
date: "2026-06-21"
excerpt: "A process is more than just a running program."
tags: ["operating-systems"]
audio: "/scribbles/2026-06-21/recording.mp3"
images:
  - src: "/scribbles/2026-06-21/diagram.png"
    alt: "Process memory layout"
---

Your text here. Or leave empty for image/audio-only days.
```

- **Text** — write in the markdown body
- **Images** — add to `public/scribbles/YYYY-MM-DD/` and reference in frontmatter or inline with `![alt](/scribbles/2026-06-21/sketch.png)`
- **Audio** — add an `.mp3` or `.m4a` to `public/scribbles/YYYY-MM-DD/` and set the `audio` field

Example: `content/scribbles/2026-06-21.md` → `/scribbles/2026-06-21`

Then rebuild and re-upload (see Deploy below).

## Project structure

```
src/app/              Pages and routes
src/components/       Shared UI components
src/lib/              Site config and scribble utilities
content/scribbles/    Daily markdown scribbles
public/scribbles/     Images and audio for scribbles
```

## Contact form

The **Get in Touch** form sends messages to **surya.anand2023@gmail.com** via [FormSubmit](https://formsubmit.co) — no API keys, works on GoDaddy static hosting.

**First time only:** submit a test message through the live site. FormSubmit will email you a confirmation link — click it to activate the form.

## Deploy to GoDaddy

This site is built as a **static export** so it runs on GoDaddy shared hosting (no Node.js server needed).

### 1. Build locally

```bash
npm run build
```

This creates an `out/` folder with all site files.

### 2. Upload to GoDaddy

1. Log in to [GoDaddy](https://www.godaddy.com) → **My Products** → **Web Hosting** → **Manage**
2. Open **cPanel** (or **File Manager**)
3. Go to **`public_html`**
4. Upload **everything inside** the `out/` folder

### 3. Updating the site

After adding a new scribble or media:

```bash
npm run build
```

Re-upload the contents of `out/` to `public_html`.
