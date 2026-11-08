import { useState, type ReactNode } from "react";
import { helpPages, type HelpPage } from "./bot";
import { cn } from "./lib/utils";

/*
 * The prototype's split view, drawn from the real help page instead of a screenshot:
 * the page as people read it beside the Markdown agents get, with the section under
 * the pointer highlighted on both sides. Edit fixtures/help/docs/billing/refunds.md
 * and this updates with it.
 */

type Block =
  | { kind: "h2"; text: string; section: string }
  | { kind: "p"; text: string; section: string }
  | { kind: "ul"; items: string[]; section: string };

const INTRO = "intro";

/** The small Markdown the help pages use: headings, paragraphs, and bulleted lists. */
function blocksOf(body: string): Block[] {
  const out: Block[] = [];
  let section = INTRO;
  for (const raw of body.split(/\n\s*\n/)) {
    const block = raw.trim();
    if (!block) continue;
    const h = block.match(/^#{2,3}\s+(.+)$/);
    if (h) {
      section = h[1];
      out.push({ kind: "h2", text: h[1], section });
    } else if (block.split("\n").every((l) => /^[-*]\s/.test(l))) {
      out.push({
        kind: "ul",
        items: block.split("\n").map((l) => l.replace(/^[-*]\s+/, "")),
        section,
      });
    } else {
      out.push({ kind: "p", text: block.replace(/\s*\n\s*/g, " "), section });
    }
  }
  return out;
}

/** `code` and **bold**, the inline marks these pages use. Links show as their text. */
function inline(text: string): ReactNode[] {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .map((part, i) =>
      part.startsWith("`") ? (
        <code key={i} className="rounded bg-subtle px-1 font-mono text-[0.88em]">
          {part.slice(1, -1)}
        </code>
      ) : part.startsWith("**") ? (
        <strong key={i} className="font-semibold">
          {part.slice(2, -2)}
        </strong>
      ) : (
        part
      ),
    );
}

/** The Markdown an agent receives for the page, one entry per line, each tagged with its section. */
function linesOf(page: HelpPage) {
  const lines: { text: string; section: string }[] = [
    { text: `# ${page.title}`, section: INTRO },
    { text: "", section: INTRO },
    { text: page.description, section: INTRO },
  ];
  for (const b of blocksOf(page.body)) {
    lines.push({ text: "", section: b.section });
    if (b.kind === "h2") lines.push({ text: `## ${b.text}`, section: b.section });
    else if (b.kind === "ul")
      b.items.forEach((t) => lines.push({ text: `- ${t}`, section: b.section }));
    else lines.push({ text: b.text, section: b.section });
  }
  return lines;
}

export function SplitView({
  pageId,
  site,
  start,
}: {
  pageId: string;
  site: string;
  start: string;
}) {
  const page = helpPages.find((p) => p.id === pageId);
  const [active, setActive] = useState(start);
  if (!page) return null;
  const blocks = blocksOf(page.body);
  const lines = linesOf(page);
  const markdown = lines.map((l) => l.text).join("\n");
  // A rough count, the same way the prototype estimates it: about four characters a token.
  const tokens = Math.round(markdown.length / 4);
  const url = `${site}/${page.path.replace(/^docs\//, "")}`;
  const hover = (section: string) => ({
    onMouseEnter: () => setActive(section),
    onFocus: () => setActive(section),
  });

  // Group the people side by section, so a whole section highlights as one.
  const sections: { key: string; blocks: Block[] }[] = [];
  for (const b of blocks) {
    const last = sections[sections.length - 1];
    if (last?.key === b.section) last.blocks.push(b);
    else sections.push({ key: b.section, blocks: [b] });
  }

  return (
    <figure className="shot grid grid-cols-[minmax(0,1fr)] overflow-hidden bg-white md:grid-cols-[52.5%_minmax(0,1fr)]">
      <figcaption className="sr-only">
        The {page.title} help page as people read it, beside the Markdown agents and the support bot
        get. Point at a section to see it in both.
      </figcaption>

      <div className="p-5 sm:p-7">
        <p className="text-[24px] leading-tight font-semibold tracking-[-0.025em]">{page.title}</p>
        <p className="mt-1.5 text-[15px] text-muted">{page.description}</p>
        <div className="mt-6 grid gap-2">
          {sections.map((s) => (
            <div
              key={s.key}
              {...hover(s.key)}
              className={cn(
                "-mx-3 grid gap-3 rounded-xl px-3 py-2.5 transition-colors",
                active === s.key ? "bg-subtle ring-1 ring-line" : "ring-0",
              )}
            >
              {s.blocks.map((b, i) =>
                b.kind === "h2" ? (
                  <p key={i} className="text-[17px] font-semibold tracking-[-0.01em]">
                    {b.text}
                  </p>
                ) : b.kind === "ul" ? (
                  <ul key={i} className="grid list-disc gap-1.5 pl-5 text-[15px] leading-[1.6]">
                    {b.items.map((t) => (
                      <li key={t}>{inline(t)}</li>
                    ))}
                  </ul>
                ) : (
                  <p key={i} className="text-[15px] leading-[1.6] text-pretty">
                    {inline(b.text)}
                  </p>
                ),
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="border-t bg-subtle p-3 sm:p-4 md:border-t-0 md:border-l">
        <div className="overflow-hidden rounded-xl border bg-white">
          <div className="flex items-center gap-3 border-b px-3.5 py-2.5 text-[12.5px]">
            <span className="min-w-0 flex-1 truncate font-mono">
              <span className="text-muted">GET</span> {url}
            </span>
            <span className="shrink-0 text-muted tabular-nums">≈ {tokens} tokens</span>
          </div>
          <ol className="py-2 font-mono text-[12.5px] leading-[1.75]">
            {lines.map((l, i) => (
              <li
                key={i}
                {...hover(l.section)}
                className={cn(
                  "grid grid-cols-[2.25rem_1fr] border-l-2 pr-3 transition-colors",
                  active === l.section ? "border-ink bg-subtle" : "border-transparent",
                )}
              >
                <span className="pr-2 text-right text-faint select-none">{i + 1}</span>
                <span
                  className={cn(
                    "min-w-0 break-words whitespace-pre-wrap",
                    l.text.startsWith("#") && "font-semibold",
                  )}
                >
                  {l.text || " "}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}
