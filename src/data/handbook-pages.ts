// Exploration: the handbook's pages are real Markdown files in fixtures/handbook,
// read here the way Phase 1's loader will read them from a content repository.
// See docs/decisions/proposed-docs-editor.md.
import { readPageMeta, splitFrontmatter } from "@core/markdown/frontmatter";
import type { DocPage } from "@/data/workspace";

const files = import.meta.glob<string>("/fixtures/handbook/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

// Last-changed dates come from git history in Phase 2. Until then, sample values.
const UPDATED: Record<string, string> = {
  deploying: "Yesterday",
  "on-call": "3 days ago",
  "content-style": "1 week ago",
  "accessibility-review": "2 weeks ago",
  onboarding: "1 month ago",
  decisions: "2 days ago",
};

export const handbookPages: DocPage[] = Object.entries(files).flatMap(([file, source]) => {
  // docs/<folder>/<page>.md. Pages outside a folder aren't part of this sample.
  const path = file.replace("/fixtures/handbook/", "");
  const m = path.match(/^docs\/([^/]+)\/([^/]+)\.md$/);
  if (!m) return [];
  const [, dir, id] = m;
  const { lines, body } = splitFrontmatter(source);
  const meta = readPageMeta(lines);
  if (!meta.success) throw new Error(`${path}: ${meta.error.issues[0].message}`);
  return [
    {
      id,
      path,
      folder: dir[0].toUpperCase() + dir.slice(1),
      title: meta.data.title,
      description: meta.data.description,
      updated: UPDATED[id] ?? "Recently",
      lines,
      body,
    },
  ];
});
