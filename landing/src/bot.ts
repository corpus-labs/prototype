// The support bot demo on the landing page. It answers from the prototype's own
// sample help center (fixtures/help), using the same rule as src/lib/support.ts:
// answer from the best-matching section, or say it doesn't know when fewer than
// half of the question's meaningful words appear there. Keep the two in step.

export type HelpPage = {
  id: string;
  title: string;
  description: string;
  path: string;
  body: string;
};

const files = import.meta.glob<string>("../../fixtures/help/docs/**/*.md", {
  query: "?raw",
  import: "default",
  eager: true,
});

export const helpPages: HelpPage[] = Object.entries(files).map(([file, source]) => {
  const path = file.replace(/^.*fixtures\/help\//, "");
  const front = source.match(/^---\n([\s\S]*?)\n---\n?/);
  const title = front?.[1].match(/^title:\s*(.+)$/m)?.[1].trim() ?? path;
  const description = front?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? "";
  return {
    id: path.replace(/^.*\//, "").replace(/\.md$/, ""),
    title,
    description,
    path,
    body: front ? source.slice(front[0].length) : source,
  };
});

const STOP = new Set(
  (
    "a an the and or but to of in on for with at by from is are was be do does did can could " +
    "i you we my your our it its how what when where which who why will would should there this " +
    "that these those me us any about into if so as have has get"
  ).split(" "),
);

function words(text: string): string[] {
  return (text.toLowerCase().match(/[a-z0-9]+/g) ?? [])
    .filter((w) => w.length > 1 && !STOP.has(w))
    .map((w) => {
      if (w.length > 4 && w.endsWith("ies")) return `${w.slice(0, -3)}y`;
      if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
      return w;
    });
}

function plain(md: string) {
  return md
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/[`*_]/g, "")
    .replace(/^[-*]\s+/gm, "")
    .replace(/\s*\n\s*/g, " ")
    .trim();
}

type Section = { heading: string | null; text: string };

function sectionsOf(page: HelpPage): Section[] {
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
  | { kind: "answer"; text: string; page: HelpPage; section: string | null }
  | { kind: "gap" };

export function answerFrom(question: string, pages: HelpPage[] = helpPages): BotReply {
  const asked = [...new Set(words(question))];
  if (!asked.length) return { kind: "gap" };
  let best: { page: HelpPage; section: Section; coverage: number } | null = null;
  for (const page of pages) {
    for (const section of sectionsOf(page)) {
      const found = new Set(words(`${page.title} ${section.heading ?? ""} ${section.text}`));
      const coverage = asked.filter((w) => found.has(w)).length / asked.length;
      if (!best || coverage > best.coverage) best = { page, section, coverage };
    }
  }
  if (!best || best.coverage < 0.5) return { kind: "gap" };
  return {
    kind: "answer",
    text: best.section.text,
    page: best.page,
    section: best.section.heading,
  };
}
