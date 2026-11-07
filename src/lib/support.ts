// Exploration: the support bot, simulated in the browser. It answers only from a
// help center's pages and says so when they don't cover a question, using the same
// match-coverage idea as gaps (fewer than half the question's words found).
// A real version calls the owner's AI provider with the matched section as context.
import type { DocPage } from "@/data/workspace";

const STOP = new Set(
  (
    "a an the and or but to of in on for with at by from is are was be do does did can could " +
    "i you we my your our it its how what when where which who why will would should there this " +
    "that these those me us any about into if so as have has get"
  ).split(" "),
);

/** Lowercase, drop filler words, and fold simple plurals so "refunds" finds "refund". */
function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => {
      if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
      if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
      return w;
    });
}

/** Markdown to the plain sentences a customer reads in a chat reply. */
function plain(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

type Section = { heading: string | null; text: string };

/** A page's paragraphs, each with the heading it sits under. */
function sectionsOf(page: DocPage): Section[] {
  const out: Section[] = [];
  let heading: string | null = null;
  for (const block of page.body.split(/\n\s*\n/)) {
    const b = block.trim();
    if (!b) continue;
    const h = b.match(/^#{2,3}\s+(.*)$/);
    if (h) {
      heading = h[1];
      continue;
    }
    out.push({ heading, text: plain(b) });
  }
  return out;
}

export type BotReply =
  | { kind: "answer"; text: string; page: DocPage; section: string | null; coverage: number }
  | { kind: "gap"; coverage: number };

export function answerFrom(question: string, pages: DocPage[]): BotReply {
  const asked = [...new Set(words(question))];
  if (!asked.length) return { kind: "gap", coverage: 0 };
  let best: { page: DocPage; section: Section; coverage: number } | null = null;
  for (const page of pages) {
    for (const section of sectionsOf(page)) {
      const found = new Set(words(`${page.title} ${section.heading ?? ""} ${section.text}`));
      const coverage = asked.filter((w) => found.has(w)).length / asked.length;
      if (!best || coverage > best.coverage) best = { page, section, coverage };
    }
  }
  if (!best || best.coverage < 0.5) return { kind: "gap", coverage: best?.coverage ?? 0 };
  return {
    kind: "answer",
    text: best.section.text,
    page: best.page,
    section: best.section.heading,
    coverage: best.coverage,
  };
}
