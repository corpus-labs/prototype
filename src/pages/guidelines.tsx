import * as React from "react";
import { CheckIcon, FileCodeIcon, InfoIcon, XIcon } from "lucide-react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Previews } from "@/components/charged-ui";
import {
  AgentPane,
  CodeBlock,
  DocSection,
  Dot,
  Facts,
  PageHeader,
  ReaderSwitch,
  linkClass,
  proseClass,
  useEffectiveReader,
  type Hover,
} from "@/components/common";
import { guidelineFiles, questions, workspace } from "@/data/workspace";
import { guideLines } from "@/lib/agent-format";
import {
  joinFrontmatter,
  readField,
  splitFrontmatter,
  writeField,
} from "@core/markdown/frontmatter";
import { Inline, parseMdx, sectionize, type Block } from "@/lib/mdx-lite";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * A Do or Don't. With previews it's a figure: the rendering on the system's canvas, a green
 * or red bar, the caption, and the code behind a toggle. Without, it's a ruled note.
 */
function Example({ b, dark }: { b: Extract<Block, { t: "do" | "dont" }>; dark: boolean }) {
  const good = b.t === "do";
  const label = (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 font-medium",
        good ? "text-good" : "text-bad",
      )}
    >
      {good ? (
        <CheckIcon className="size-4 self-center" />
      ) : (
        <XIcon className="size-4 self-center" />
      )}
      {good ? "Do" : "Don’t"}
    </span>
  );
  const code = b.code && (
    <details className="group/code mt-2">
      <summary className="cursor-pointer list-none text-[13px] text-muted-foreground hover:text-foreground [&::-webkit-details-marker]:hidden">
        <span className="group-open/code:hidden">Show code</span>
        <span className="hidden group-open/code:inline">Hide code</span>
      </summary>
      <CodeBlock
        code={b.code.text}
        header={<span>{b.code.lang || "code"}</span>}
        className="mt-2"
      />
    </details>
  );
  if (!b.previews.length)
    return (
      <div
        className={cn("max-w-[68ch] border-l-2 py-0.5 pl-4", good ? "border-good" : "border-bad")}
      >
        <p className="flex items-center gap-1 text-sm">
          {label}
          {b.title && <span className="ml-0.5 font-medium text-foreground">{b.title}</span>}
        </p>
        <p className="mt-1 text-[15px] leading-relaxed text-muted-foreground">
          <Inline text={b.text} />
        </p>
        {code}
      </div>
    );
  return (
    <figure className="grid min-w-0 content-start gap-3">
      <div className="overflow-hidden rounded-lg">
        <Previews list={b.previews} dark={dark} />
        <div className={cn("h-0.5", good ? "bg-good" : "bg-bad")} />
      </div>
      <figcaption className="text-sm leading-relaxed">
        {label}
        {b.title && <span className="ml-1.5 font-medium">{b.title}</span>}
        <span className="mt-0.5 block text-muted-foreground">
          <Inline text={b.text} />
        </span>
        {code}
      </figcaption>
    </figure>
  );
}

function BlockView({ b, dark }: { b: Block; dark: boolean }) {
  switch (b.t) {
    case "h1":
    case "h2":
      return <h2 className="text-xl leading-snug font-semibold tracking-[-0.02em]">{b.text}</h2>;
    case "h3":
      return <h3 className="text-base font-semibold">{b.text}</h3>;
    case "p":
      return (
        <p className={cn(proseClass, "text-pretty")}>
          <Inline text={b.text} />
        </p>
      );
    case "ul":
      return (
        <ul className={cn(proseClass, "grid list-disc gap-2 pl-5 marker:text-muted-foreground/60")}>
          {b.items.map((x, i) => (
            <li key={i}>
              <Inline text={x} />
            </li>
          ))}
        </ul>
      );
    case "code":
      return <CodeBlock code={b.text} header={<span>{b.lang || "code"}</span>} />;
    case "do":
    case "dont":
      return <Example b={b} dark={dark} />;
    case "preview":
      return <Previews list={[b.attrs]} dark={dark} className="min-h-40 rounded-xl p-8" />;
    case "callout":
      return (
        <Alert className="max-w-[68ch]">
          <InfoIcon />
          <AlertDescription className="text-foreground/90">
            <Inline text={b.text} />
          </AlertDescription>
        </Alert>
      );
    default:
      return null;
  }
}

/** Pairs a Do with the Don't after it when either shows a preview, so the two compare side by side. */
function pairUp(blocks: Block[]) {
  const out: Block[][] = [];
  for (let i = 0; i < blocks.length; i++) {
    const a = blocks[i];
    const b = blocks[i + 1];
    if (a.t === "do" && b?.t === "dont" && (a.previews.length || b.previews.length)) {
      out.push([a, b]);
      i++;
    } else out.push([a]);
  }
  return out;
}

/** Renders a page’s MDX as people see it. Sections share keys with the agent view. */
export function MdxPeople({
  body,
  hover,
  onHover,
  className,
}: {
  body: string;
  hover?: Hover;
  onHover?: (h: Hover) => void;
  className?: string;
}) {
  const { dark } = useStore();
  const blocks = parseMdx(body).filter((b) => b.t !== "front");
  const sections = sectionize(blocks);
  return (
    <article className={cn("grid max-w-[72ch] gap-10", className)}>
      {sections.map((s, i) => (
        <DocSection key={s.key + i} k={s.key} hover={hover} onHover={onHover}>
          <div className="grid gap-5">
            {pairUp(s.blocks).map((group, j) =>
              group.length === 2 ? (
                <div key={j} className="grid gap-6 sm:grid-cols-2">
                  <BlockView b={group[0]} dark={dark} />
                  <BlockView b={group[1]} dark={dark} />
                </div>
              ) : (
                <BlockView key={j} b={group[0]} dark={dark} />
              ),
            )}
          </div>
        </DocSection>
      ))}
    </article>
  );
}

/** What a guideline covers, read from its own headings, and how often agents were sent to it. */
function useGuideSummaries() {
  const { saved } = useStore();
  return guidelineFiles.map((g) => {
    const blocks = parseMdx(saved[g.id] ?? g.body);
    const headings = blocks.filter((b) => b.t === "h2").map((b) => (b as { text: string }).text);
    const examples = blocks.filter((b) => b.t === "do" || b.t === "dont").length;
    const answered = questions.filter((q) => q.source?.route === `guide-${g.id}`);
    return {
      g,
      headings,
      examples,
      asks: answered.reduce((n, q) => n + q.count, 0),
    };
  });
}

/**
 * Guidelines as one ruled index: what each one covers, read from its headings, then how
 * many agent questions it answered this week. Columns line up like the other indexes.
 */
export function GuidelinesIndex() {
  const rows = useGuideSummaries();
  const used = rows.filter((r) => r.asks > 0);
  const asks = used.reduce((n, r) => n + r.asks, 0);
  const cols = "md:grid-cols-[minmax(0,1fr)_8rem_7rem]";
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Guidelines"
        description={
          asks
            ? `${guidelineFiles.length} guidelines on how the components work together. ${used.length} of them answered ${asks} agent questions this week.`
            : `${guidelineFiles.length} guidelines on how the components work together.`
        }
      />
      <div className="mt-8">
        <div className={cn("hidden gap-x-6 pb-2 text-[13px] text-muted-foreground md:grid", cols)}>
          <span>Guideline</span>
          <span>Answered</span>
          <span>Updated</span>
        </div>
        <ul className="divide-y border-y">
          {rows.map(({ g, headings, examples, asks }) => (
            <li
              key={g.id}
              className={cn(
                "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-6 gap-y-3 py-5",
                cols,
              )}
            >
              <a
                href={`#guide-${g.id}`}
                className="group col-span-2 -m-1 min-w-0 rounded-md p-1 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:col-span-1"
              >
                <p className="text-[17px] font-semibold tracking-[-0.01em] decoration-foreground/30 underline-offset-4 group-hover:underline">
                  {g.title}
                </p>
                <p className="mt-1 max-w-[60ch] text-[15px] text-pretty text-foreground/75">
                  {g.description}
                </p>
                {headings.length > 0 && (
                  <p className="mt-2 max-w-[60ch] text-sm text-pretty text-muted-foreground">
                    {headings.join(", ")}
                    {examples > 0 &&
                      `. ${examples} do and don’t ${examples === 1 ? "example" : "examples"}`}
                    .
                  </p>
                )}
              </a>
              <p className="flex items-baseline gap-1.5 md:block md:pt-1">
                {asks ? (
                  <>
                    <span className="text-xl leading-none font-semibold tracking-[-0.02em] tabular">
                      {asks}
                    </span>{" "}
                    <span className="text-sm text-muted-foreground">
                      {asks === 1 ? "question" : "questions"}
                    </span>
                  </>
                ) : (
                  <span className="text-sm text-muted-foreground">None this week</span>
                )}
              </p>
              <p className="text-sm text-muted-foreground max-md:hidden md:pt-1">{g.updated}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

const DocsEditor = React.lazy(() =>
  import("@/components/docs-editor/docs-editor").then((m) => ({ default: m.DocsEditor })),
);

/**
 * A guideline, always editable, in the same editor as docs pages. Its Do, Don't, and
 * Callout blocks show as cards with their own forms. The file is in the repository, so
 * changes wait as "not committed" until Commit, through the prototype's simulated commit.
 */
export function GuideReader({ id }: { id: string }) {
  const { reader, setReader, files, saved, setFile, commit } = useStore();
  const mode = useEffectiveReader(reader);
  const [source, setSource] = React.useState(false);
  // The rich editor loads its text once. Discard and Undo replace it from outside, so they remount it.
  const [revision, setRevision] = React.useState(0);
  const g = guidelineFiles.find((x) => x.id === id);
  if (!g) return <p className="p-8 text-sm text-muted-foreground">That guideline doesn’t exist.</p>;

  const original = saved[id] ?? g.body;
  const text = files[id] ?? original;
  const { lines: front, body } = splitFrontmatter(text);
  const title = readField(front, "title") ?? g.title;
  const description = readField(front, "description") ?? g.description;
  const changed = text !== original;
  const setBody = (next: string) => setFile(id, joinFrontmatter({ lines: front, body: next }));
  const setMeta = (key: "title" | "description", value: string) =>
    setFile(id, joinFrontmatter({ lines: writeField(front, key, value), body }));
  const lines = guideLines(text);
  const request = (
    <>
      <span className="text-muted-foreground">GET</span> {workspace.site}/guidelines/{g.id}.md
    </>
  );

  const discard = () => {
    const kept = text;
    setFile(id, original);
    setRevision((r) => r + 1);
    const toastId = toast.add({
      title: "Changes discarded",
      description: `${g.path} matches the last commit again.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          setFile(id, kept);
          setRevision((r) => r + 1);
          toast.close(toastId);
        },
      },
    });
  };
  const commitNow = () => {
    const c = commit({ fileId: id, message: `Update ${title}`, mode: "main" });
    toast.add({
      title: "Committed to main",
      description: `${c.sha}: Update ${title}. Agents get it on their next request.`,
    });
  };

  // The same quiet hover as a sidebar row, so the title and description read as fields.
  const field =
    "-mx-2 w-[calc(100%+1rem)] rounded-md bg-transparent px-2 outline-none transition-colors hover:bg-muted/60 focus:bg-transparent";

  const editor = source ? (
    <Textarea
      value={body}
      onChange={(e) => setBody(e.target.value)}
      spellCheck={false}
      aria-label={`${g.path} source`}
      className="min-h-[50svh] w-full max-w-[72ch] resize-y rounded-none border-0 bg-transparent p-0 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
    />
  ) : (
    <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading the page…</p>}>
      <DocsEditor
        key={`${id}-${revision}`}
        value={body}
        onChange={setBody}
        pagePath={g.path}
        pages={guidelineFiles.map((x) => ({ title: x.title, path: x.path, folder: "Guidelines" }))}
        mdx
      />
    </React.Suspense>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8 md:py-12",
        mode === "split" ? "max-w-[1480px]" : "max-w-[1120px]",
      )}
    >
      <header className="grid gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="max-w-[72ch] min-w-0 flex-1">
            <input
              value={title}
              onChange={(e) => setMeta("title", e.target.value)}
              aria-label="Title"
              placeholder="Untitled"
              className={cn(
                field,
                "text-[28px] leading-tight font-semibold tracking-[-0.03em] placeholder:text-muted-foreground/50 md:text-[32px]",
              )}
            />
            <input
              value={description}
              onChange={(e) => setMeta("description", e.target.value)}
              aria-label="Description"
              placeholder="Add a one-line description"
              className={cn(
                field,
                "mt-1 py-0.5 text-base leading-relaxed text-foreground/75 placeholder:text-muted-foreground/60 md:text-[17px]",
              )}
            />
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1.5">
            <ReaderSwitch value={reader} onChange={setReader} />
            {mode !== "agents" && (
              <Button
                variant="outline"
                size="sm"
                aria-pressed={source}
                className="aria-pressed:bg-muted"
                onClick={() => setSource((s) => !s)}
              >
                <FileCodeIcon />
                Markdown
              </Button>
            )}
          </div>
        </div>
        <Facts
          items={[
            ["File", <code className="font-mono text-[13px]">{g.path}</code>],
            changed
              ? [
                  "Status",
                  <span className="flex items-baseline gap-3">
                    <Dot tone="warn" className="text-warn">
                      Not committed
                    </Dot>
                    <button
                      type="button"
                      onClick={commitNow}
                      className={cn(linkClass, "font-normal")}
                    >
                      Commit
                    </button>
                    <button
                      type="button"
                      onClick={discard}
                      className={cn(linkClass, "font-normal")}
                    >
                      Discard
                    </button>
                  </span>,
                ]
              : ["Updated", g.updated],
          ]}
        />
      </header>

      <div className="mt-10">
        {mode === "people" && editor}
        {mode === "agents" && (
          <div className="grid gap-3">
            <p className="max-w-[68ch] text-sm text-muted-foreground">
              Served as plain Markdown at this page’s URL plus{" "}
              <code className="font-mono text-xs">.md</code>, and listed in llms.txt.
            </p>
            <AgentPane request={request} lines={lines} />
          </div>
        )}
        {mode === "split" && (
          // Type on the left and the agent's copy updates on the right, word for word.
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8">
            <div className="min-w-0">{editor}</div>
            <div className="min-w-0">
              <AgentPane
                className="sticky top-16 max-h-[calc(100svh-5.5rem)]"
                request={request}
                lines={lines}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
