// Exploration: docs projects (a handbook, a help center). See
// docs/decisions/proposed-projects-and-docs.md, proposed-docs-editor.md,
// and 0001-knowledge-notebook.md.
import * as React from "react";
import { FileCodeIcon, GlobeIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  AgentPane,
  Dot,
  Facts,
  PageHeader,
  ReaderSwitch,
  Section,
  linkClass,
  useEffectiveReader,
} from "@/components/common";
import type { DocPage, DocsProject } from "@/data/workspace";
import { guideLines, type Line } from "@/lib/agent-format";
import { pageMetaSchema } from "@core/markdown/frontmatter";
import { linksIn, resolveLink } from "@core/markdown/links";
import {
  clearDraft,
  getDraft,
  isChanged,
  setDraft,
  useDocDrafts,
  withDraft,
  type DocDraft,
} from "@/lib/docs-drafts";
import { LinkResolver } from "@/lib/mdx-lite";
import { foldersOf } from "@/lib/projects";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { answerFrom, type BotReply } from "@/lib/support";
import { cn } from "@/lib/utils";
import { PROVIDER_LABEL, modelLabel } from "@/pages/editor";
import { InboxNotice } from "@/pages/inbox";

// ProseMirror and Milkdown are the heaviest part of the app, so the editor loads only when a docs page opens.
const DocsEditor = React.lazy(() =>
  import("@/components/docs-editor/docs-editor").then((m) => ({ default: m.DocsEditor })),
);

/** Every page in a docs project as it reads right now, with this tab's drafts applied. */
function usePages(project: DocsProject) {
  const drafts = useDocDrafts();
  return { drafts, pages: project.pages.map((p) => withDraft(p, drafts)) };
}

/** What an agent gets for a docs page: the same Markdown, keyed by section like the page. */
function pageLines(page: DocPage): Line[] {
  const intro: Line[] = [{ text: `# ${page.title}`, key: "intro", kind: "h1" }];
  if (page.description)
    intro.push({ text: "", key: "intro" }, { text: page.description, key: "intro" });
  return [...intro, ...guideLines(page.body)];
}

/**
 * A docs project's home is a page: what it is, what's waiting in the inbox, the support bot
 * for a help center, and the index of its pages. The weekly numbers live in Settings and the
 * questions in the inbox. See docs/decisions/proposed-library-and-inbox.md.
 */
export function DocsOverview({ project }: { project: DocsProject }) {
  const { drafts, pages } = usePages(project);
  const help = project.kind === "help-center";
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={project.name}
        description={project.description}
        actions={
          <>
            <Button variant="outline" onClick={() => navigate(`site-${project.id}`)}>
              <GlobeIcon />
              View site
            </Button>
            <Button
              variant="outline"
              onClick={() =>
                toast.add({
                  title: "New pages need the server",
                  description:
                    "Creating a file in the repository arrives with Phase 5. Until then, edit the pages that are here.",
                })
              }
            >
              <PlusIcon />
              New page
            </Button>
          </>
        }
        meta={
          <Facts
            items={[
              ["Repository", <code className="font-mono text-[13px]">{project.repo}</code>],
              ["Site", project.site],
              ["Updated", project.updated.toLowerCase()],
            ]}
          />
        }
      />

      <InboxNotice project={project.name} className="mt-8" />

      <div className="mt-12 grid gap-14">
        {/* An index: each folder named once on the left, its pages beside it. */}
        <Section
          title="Pages"
          aside={
            <span className="tabular">
              {pages.length} in {foldersOf(pages).length} folders
            </span>
          }
        >
          <div className="divide-y border-y">
            {foldersOf(pages).map(([folder, list]) => (
              <div key={folder} className="grid gap-x-6 py-2 sm:grid-cols-[9rem_minmax(0,1fr)]">
                <h3 className="pt-3 text-sm font-medium sm:pt-[0.9rem]">{folder}</h3>
                <ul className="divide-y">
                  {list.map((p) => (
                    <li key={p.id}>
                      <a
                        href={`#${project.id}-${p.id}`}
                        className="group -mx-1 flex items-baseline justify-between gap-4 rounded-md px-1 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline">
                            {p.title}
                          </span>
                          <span className="mt-0.5 block text-sm text-pretty text-muted-foreground">
                            {p.description}
                          </span>
                        </span>
                        <span className="shrink-0 text-sm text-muted-foreground">
                          {drafts[p.id] ? <Dot tone="warn">Edited</Dot> : p.updated}
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {help && <SupportBot project={project} pages={pages} />}
      </div>
    </div>
  );
}

/**
 * A docs page, always editable, the way a Notion page is. There's no Edit button: the
 * title, description, and body are fields, and changes stay in this tab until Phase 5
 * can write the file. People, Split, and Agents switch what's beside the text, and
 * Markdown switches the text itself to its source.
 */
export function DocsPage({ project, id }: { project: DocsProject; id: string }) {
  const { drafts, pages } = usePages(project);
  const { reader, setReader } = useStore();
  const mode = useEffectiveReader(reader);
  const [source, setSource] = React.useState(false);
  // The rich editor loads its text once. Discard and Undo replace the text from outside, so they bump this to remount it.
  const [revision, setRevision] = React.useState(0);
  const file = project.pages.find((p) => p.id === id);
  if (!file) return <p className="p-8 text-sm text-muted-foreground">That page doesn’t exist.</p>;

  const page = withDraft(file, drafts);
  const changed = isChanged(file, drafts[file.id]);
  const update = (patch: Partial<DocDraft>) =>
    setDraft(file.id, {
      title: page.title,
      description: page.description,
      body: page.body,
      ...patch,
    });
  const meta = pageMetaSchema.safeParse({ title: page.title, description: page.description });
  const problem = meta.success
    ? null
    : meta.error.issues[0].message.replace("Add `title:` to its frontmatter.", "Add one above.");

  const discard = () => {
    const kept = getDraft(file.id);
    clearDraft(file.id);
    setRevision((r) => r + 1);
    const toastId = toast.add({
      title: "Changes discarded",
      description: `${file.path} matches the file again.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          if (kept) setDraft(file.id, kept);
          setRevision((r) => r + 1);
          toast.close(toastId);
        },
      },
    });
  };

  // Relative links in the page open the page they point to.
  const resolve = (href: string) => {
    const target = resolveLink(file.path, href);
    const hit = pages.find((p) => p.path === target);
    return hit ? `#${project.id}-${hit.id}` : undefined;
  };
  const linkedFrom = pages.filter(
    (p) =>
      p.id !== file.id && linksIn(p.body).some((href) => resolveLink(p.path, href) === file.path),
  );
  const nearby = pages.filter((p) => p.folder === file.folder && p.id !== file.id);

  const lines = pageLines(page);
  const request = (
    <>
      <span className="text-muted-foreground">GET</span> {project.site}/
      {file.path.replace(/^docs\//, "")}
    </>
  );

  // The same quiet hover as a sidebar row, so the title and description read as fields you can
  // type in. Negative margins keep their text where it sits.
  const field =
    "-mx-2 w-[calc(100%+1rem)] rounded-md bg-transparent px-2 outline-none transition-colors hover:bg-muted/60 focus:bg-transparent";

  const text = source ? (
    <Textarea
      value={page.body}
      onChange={(e) => update({ body: e.target.value })}
      spellCheck={false}
      aria-label={`${file.path} source`}
      className="min-h-[50svh] w-full max-w-[72ch] resize-y rounded-none border-0 bg-transparent p-0 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
    />
  ) : (
    <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading the page…</p>}>
      <DocsEditor
        key={`${file.id}-${revision}`}
        value={page.body}
        onChange={(body) => update({ body })}
        pagePath={file.path}
        pages={pages.map((p) => ({ title: p.title, path: p.path, folder: p.folder }))}
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
          <div className="min-w-0 max-w-[72ch] flex-1">
            <input
              value={page.title}
              onChange={(e) => update({ title: e.target.value })}
              aria-label="Title"
              aria-invalid={!!problem || undefined}
              placeholder="Untitled"
              className={cn(
                field,
                "text-[28px] leading-tight font-semibold tracking-[-0.03em] placeholder:text-muted-foreground/50 md:text-[32px]",
              )}
            />
            <input
              value={page.description}
              onChange={(e) => update({ description: e.target.value })}
              aria-label="Description"
              placeholder="Add a one-line description"
              className={cn(
                field,
                "mt-1 py-0.5 text-base leading-relaxed text-foreground/75 placeholder:text-muted-foreground/60 md:text-[17px]",
              )}
            />
            {problem && <p className="mt-2 text-sm text-bad">{problem}</p>}
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
            ["File", <code className="font-mono text-[13px]">{file.path}</code>],
            changed
              ? [
                  "Status",
                  <span
                    className="flex items-baseline gap-3"
                    title="Edits stay in this tab. Committing them to the repository arrives with the server in Phase 5."
                  >
                    <Dot tone="warn" className="text-warn">
                      Edited in this tab
                    </Dot>
                    <button
                      type="button"
                      onClick={discard}
                      className={cn(linkClass, "font-normal")}
                    >
                      Discard
                    </button>
                  </span>,
                ]
              : ["Updated", file.updated.toLowerCase()],
          ]}
        />
      </header>

      <div className="mt-10">
        <LinkResolver.Provider value={resolve}>
          {mode === "people" && text}
          {mode === "agents" && (
            <div className="grid gap-3">
              <p className="max-w-[68ch] text-sm text-muted-foreground">
                The same words, served as Markdown at this page’s URL plus{" "}
                <code className="font-mono text-xs">.md</code>, over MCP, and in llms.txt.
              </p>
              <AgentPane request={request} lines={lines} />
            </div>
          )}
          {mode === "split" && (
            // Type on the left and the agent's copy updates on the right, word for word.
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8">
              <div className="min-w-0">{text}</div>
              <div className="min-w-0">
                <AgentPane
                  className="sticky top-16 max-h-[calc(100svh-5.5rem)]"
                  request={request}
                  lines={lines}
                />
              </div>
            </div>
          )}
        </LinkResolver.Provider>
      </div>

      {(linkedFrom.length > 0 || nearby.length > 0) && (
        // Below the rule is about the page, not part of it, so none of it is editable.
        <div className="mt-6 grid gap-12 border-t pt-10">
          {linkedFrom.length > 0 && (
            <Section title="Linked from">
              <ul className="grid gap-2">
                {linkedFrom.map((p) => (
                  <li key={p.id}>
                    <a href={`#${project.id}-${p.id}`} className={linkClass}>
                      {p.title}
                    </a>
                    <span className="ml-2 text-sm text-muted-foreground">{p.folder}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
          {nearby.length > 0 && (
            <Section title={`More in ${file.folder}`}>
              <ul className="grid gap-2">
                {nearby.map((p) => (
                  <li key={p.id}>
                    <a href={`#${project.id}-${p.id}`} className={linkClass}>
                      {p.title}
                    </a>
                    <span className="ml-2 text-sm text-muted-foreground">{p.description}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>
      )}
    </div>
  );
}

const BOT_EXAMPLES = [
  "How long do refunds take?",
  "Can I move my license to a new site?",
  "Do you offer discounts for nonprofits?",
];

/**
 * The support bot, as a customer meets it on the help site. It answers only from
 * these pages, links the page it used, and says so when no page covers the question.
 */
function SupportBot({ project, pages }: { project: DocsProject; pages: DocPage[] }) {
  const { ai } = useStore();
  const [question, setQuestion] = React.useState("");
  const [asked, setAsked] = React.useState<{ q: string; reply: BotReply } | null>(null);
  const [thinking, setThinking] = React.useState(false);
  const model = modelLabel(ai.provider, ai.model);
  const via =
    ai.provider === "ollama"
      ? `${model} on your server`
      : `${model} on your ${PROVIDER_LABEL[ai.provider]} key`;

  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setQuestion(text);
    setThinking(true);
    window.setTimeout(() => {
      setAsked({ q: text, reply: answerFrom(text, pages) });
      setThinking(false);
    }, 600);
  };

  // Show an answer as soon as the page opens, so the object is never an empty box.
  const started = React.useRef(false);
  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    ask(BOT_EXAMPLES[0]);
  });

  return (
    <Section title="Ask the support bot" aside={<span>Answers only from these pages</span>}>
      <div className="overflow-hidden rounded-xl border">
        <div className="grid gap-3 border-b bg-muted/30 p-3 sm:p-4">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              ask(question);
            }}
          >
            <Input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask what a customer would ask"
              aria-label="Question for the support bot"
              className="flex-1 bg-background"
            />
            <Button type="submit" disabled={thinking || !question.trim()}>
              {thinking && <Spinner />}
              Ask
            </Button>
          </form>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {BOT_EXAMPLES.map((q) => (
              <button
                key={q}
                type="button"
                className={cn(linkClass, "font-normal text-muted-foreground")}
                onClick={() => ask(q)}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
        <div className="min-h-36" aria-live="polite">
          {!asked ? (
            <div className="grid h-36 place-items-center text-sm text-muted-foreground">
              {thinking ? <Spinner /> : "Ask a question to see what a customer gets."}
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 px-4 pt-4">
                <p className="text-[15px] font-medium">“{asked.q}”</p>
                <p className="text-sm text-muted-foreground">{via}</p>
              </div>
              {asked.reply.kind === "answer" ? (
                <div className="px-4 pt-2 pb-4">
                  <p className="text-[15px] leading-relaxed text-pretty">{asked.reply.text}</p>
                  <p className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <Dot tone="good">From</Dot>
                    <a
                      href={`#${project.id}-${asked.reply.page.id}`}
                      className={cn(linkClass, "font-normal text-foreground")}
                    >
                      {asked.reply.page.title}
                      {asked.reply.section ? `, ${asked.reply.section}` : ""}
                    </a>
                    <code className="font-mono text-xs">{asked.reply.page.path}</code>
                  </p>
                </div>
              ) : (
                <div className="px-4 pt-2 pb-4">
                  <Dot tone="bad" className="text-[15px] text-bad">
                    No page answers this yet
                  </Dot>
                  <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                    The bot tells the customer it doesn’t know and hands them to a person, instead
                    of guessing. The question joins the list below, so someone can write the page
                    once and every reader gets it.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </Section>
  );
}
