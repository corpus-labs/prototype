// Exploration: a component's written page lives in its MDX file. This reads the file back
// into the fields the rest of the prototype uses (usage, rules, examples, accessibility),
// so the page people edit and what agents get come from the same text.
// See docs/decisions/proposed-library-and-inbox.md.
import { components, type ComponentDoc, type Example, type ExamplePair } from "@/data/workspace";
import { splitFrontmatter } from "@core/markdown/frontmatter";
import { parseMdx, slug, type Block } from "@/lib/mdx-lite";
import { useStore } from "@/lib/store";

/** The headings a component page uses. Any other section is kept as written. */
const KNOWN = new Set(["when-to-use", "when-not-to-use", "rules", "do-and-dont", "accessibility"]);

type Side = Extract<Block, { t: "do" | "dont" }>;

function exampleOf(b: Side): Example {
  return {
    title: b.title,
    caption: b.text,
    previews: b.previews,
    code: b.code?.text ?? "",
    lang: b.code?.lang ?? "",
  };
}

/** What a component's MDX says, in the shape the rest of the prototype reads. */
export function writtenFrom(mdx: string) {
  const { body } = splitFrontmatter(mdx);
  const blocks = parseMdx(body);
  // A section the page doesn't have reads as missing, not as an empty list.
  const items = (key: string) => {
    const list = blocks.flatMap((b) => (b.key === key && b.t === "ul" ? b.items : []));
    return list.length ? list : undefined;
  };
  const summary = blocks.find((b) => b.key === "intro" && b.t === "p");

  // Each Do and the Don't right after it, in the Do and don't section.
  const examples: ExamplePair[] = [];
  const sides = blocks.filter(
    (b): b is Side => b.key === "do-and-dont" && (b.t === "do" || b.t === "dont"),
  );
  for (let i = 0; i < sides.length - 1; i++) {
    if (sides[i].t === "do" && sides[i + 1].t === "dont") {
      examples.push({
        key: slug(sides[i].title) || `example-${i}`,
        do: exampleOf(sides[i]),
        dont: exampleOf(sides[i + 1]),
      });
      i++;
    }
  }

  // Sections beyond the usual ones, as their own Markdown.
  const sections = body
    .split(/^(?=## )/m)
    .filter((part) => part.startsWith("## "))
    .map((part) => {
      const title = part
        .slice(3, part.indexOf("\n") === -1 ? undefined : part.indexOf("\n"))
        .trim();
      return { key: slug(title), title, markdown: part.trim() };
    })
    .filter((s) => !KNOWN.has(s.key));

  return {
    summary: summary?.t === "p" ? summary.text : undefined,
    whenToUse: items("when-to-use"),
    whenNotToUse: items("when-not-to-use"),
    rules: items("rules"),
    examples,
    a11y: items("accessibility"),
    sections,
  };
}

/** A component with its written page read from `mdx`. Without a file, only the schema. */
export function withWritten(c: ComponentDoc, mdx: string | undefined): ComponentDoc {
  if (!mdx) return c;
  const w = writtenFrom(mdx);
  return { ...c, ...w, summary: w.summary ?? c.summary };
}

/**
 * Every component with its written page. "saved" is what's committed, which agents and the
 * other screens read; "files" includes edits not committed yet, for the page being edited.
 */
export function useComponentDocs(from: "saved" | "files" = "saved"): ComponentDoc[] {
  const { saved, files } = useStore();
  const source = from === "saved" ? saved : { ...saved, ...files };
  return components.map((c) => withWritten(c, source[c.id]));
}
