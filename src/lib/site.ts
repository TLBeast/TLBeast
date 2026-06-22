export const siteConfig = {
  name: "TLBeast",
  domain: "tlbeast.dev",
  url: "https://tlbeast.dev",
  description:
    "Making invisible computer systems feel intuitive — through visual notes, diagrams, and interactive explanations.",
  tagline: "See what happens inside the machine.",
  author: "TLBeast",
  contactEmail: "surya.anand2023@gmail.com",
};

export const navItems = [
  { href: "/", label: "Home" },
  { href: "/building", label: "What I'm Building" },
  { href: "/scribbles", label: "Systems Scribbles" },
  { href: "/diagrams", label: "Visual Diagrams" },
  { href: "/labs", label: "Interactive Labs" },
  { href: "/about", label: "About" },
] as const;

export const topics = [
  "Operating Systems",
  "Memory",
  "Threads",
  "Scheduling",
  "Caches",
  "Networking",
] as const;
