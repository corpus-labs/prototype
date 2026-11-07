// Exploration: docs projects' pages are real Markdown files in fixtures/, read here
// the way Phase 1's loader will read them from a content repository.
// See docs/decisions/proposed-docs-editor.md and proposed-knowledge-notebook.md.
import { readPageMeta, splitFrontmatter } from "@core/markdown/frontmatter";
import type { DocPage } from "@/data/workspace";

// import.meta.glob needs a literal pattern, so each project gets its own line.
const handbookFiles = import.meta.glob<string>("/fixtures/handbook/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});
const helpFiles = import.meta.glob<string>("/fixtures/help/docs/**/*.md", {
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
  refunds: "Today",
  licenses: "4 days ago",
  invoices: "2 weeks ago",
  install: "1 week ago",
  updates: "1 month ago",
};

/** "getting-started" reads as "Getting started". */
function folderName(dir: string) {
  const words = dir.replace(/-/g, " ");
  return words[0].toUpperCase() + words.slice(1);
}

function pagesFrom(files: Record<string, string>, root: string): DocPage[] {
  return Object.entries(files).flatMap(([file, source]) => {
    // docs/<folder>/<page>.md. Pages outside a folder aren't part of this sample.
    const path = file.replace(root, "");
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
        folder: folderName(dir),
        title: meta.data.title,
        description: meta.data.description,
        updated: UPDATED[id] ?? "Recently",
        lines,
        body,
      },
    ];
  });
}

export const handbookPages = pagesFrom(handbookFiles, "/fixtures/handbook/");
export const helpPages = pagesFrom(helpFiles, "/fixtures/help/");
