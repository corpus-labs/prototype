// Exploration: docs projects (a handbook, a help center). See
// docs/decisions/proposed-projects-and-docs.md, proposed-docs-editor.md,
// and 0001-knowledge-notebook.md.
import * as React from "react";
import { GlobeIcon, PlusIcon } from "lucide-react";

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
  RailBlock,
  ReaderSwitch,
  Section,
  SegmentedControl,
  SideRail,
  linkClass,
  useEffectiveReader,
  type Hover,
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
import { MdxPeople } from "@/pages/guidelines";

// ProseMirror and Milkdown are the heaviest part of the app, so the editor loads only when someone edits.
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

const QUEUE_ROW =
  "grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-1 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-5";

export function DocsOverview({ project }: { project: DocsProject }) {
  const { drafts, pages } = usePages(project);
  const help = project.kind === "help-center";
  const unit = help ? "questions" : "requests";
  const byCount = [...project.questions].sort((x, y) => y.count - x.count);
  const gaps = byCount.filter((q) => q.status === "gap");
  const answered = byCount.filter((q) => q.status === "answered");
  const asked = gaps.reduce((n, q) => n + q.count, 0);
  const who = help ? "Customers and agents" : "Agents";
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title={project.name}
        description={
          gaps.length
            ? `${who} asked ${project.requests} times this week. ${gaps.length} ${gaps.length === 1 ? "question" : "questions"} had no answer, asked ${asked} times in all.`
            : `${who} asked ${project.requests} times this week, and every question found an answer.`
        }
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
      />

      {/* The work and the pages on the left, the facts on the right. */}
      <div className="mt-10 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="grid min-w-0 content-start gap-14">
          <Section title="Needs an answer" aside={gaps.length > 1 && <span>Most asked first</span>}>
            {gaps.length ? (
              <ol className="divide-y border-y">
                {gaps.map((q) => (
                  <li key={q.id} className={cn(QUEUE_ROW, "gap-y-3 py-5 sm:items-center")}>
                    <p className="leading-none">
                      <span className="block text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                        {q.count}
                      </span>
                      <span className="mt-1.5 block text-xs text-muted-foreground">asks</span>
                    </p>
                    <div className="min-w-0">
                      <p className="text-[17px] leading-snug font-medium text-pretty">{q.text}</p>
                      <p className="mt-1.5 text-sm">
                        <Dot tone="bad" className="text-bad">
                          No answer yet
                        </Dot>
                      </p>
                    </div>
                    <span className="col-start-2 text-sm text-muted-foreground sm:col-start-3">
                      No page covers this
                    </span>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="border-y py-8">
                <Dot tone="good" className="text-[17px] font-medium">
                  Every question answered
                </Dot>
                <p className="mt-1.5 pl-3 text-sm text-muted-foreground">
                  {help ? "Customers" : "Agents"} found an answer in these pages all week.
                </p>
              </div>
            )}
          </Section>

          {help && <SupportBot project={project} pages={pages} />}

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

          {answered.length > 0 && (
            <Section title="Answered">
              <ul className="divide-y border-y">
                {answered.map((q) => (
                  <li key={q.id} className={cn(QUEUE_ROW, "items-baseline py-3")}>
                    <span className="text-[15px] text-muted-foreground tabular">{q.count}</span>
                    <span className="text-[15px] text-pretty">{q.text}</span>
                    {q.source && (
                      <a
                        href={`#${q.source.route}`}
                        className={cn(linkClass, "col-start-2 text-sm font-normal sm:col-start-3")}
                      >
                        {q.source.label}
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </div>

        <SideRail>
          <RailBlock title="This week">
            <p className="flex items-baseline gap-2">
              <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                {project.requests.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">{unit}</span>
            </p>
            <p className="mt-3 text-sm">
              {gaps.length ? (
                <Dot tone="bad" className="text-bad">
                  {gaps.length} without an answer
                </Dot>
              ) : (
                <Dot tone="good">All answered</Dot>
              )}
            </p>
          </RailBlock>

          <RailBlock title="Project">
            <p className="text-sm leading-relaxed text-pretty text-foreground/75">
              {project.description}
            </p>
            <dl className="mt-4 grid gap-2 text-sm">
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Repository</dt>
                <dd className="truncate">
                  <code className="font-mono text-[13px]">{project.repo}</code>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Site</dt>
                <dd className="truncate">
                  <a href={`#site-${project.id}`} className={cn(linkClass, "font-normal")}>
                    {project.site}
                  </a>
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-4">
                <dt className="text-muted-foreground">Updated</dt>
                <dd>{project.updated.toLowerCase()}</dd>
              </div>
            </dl>
          </RailBlock>
        </SideRail>
      </div>
    </div>
  );
}

export function DocsPage({ project, id }: { project: DocsProject; id: string }) {
  const { drafts, pages } = usePages(project);
  const { reader, setReader } = useStore();
  const mode = useEffectiveReader(reader);
  const [hover, setHover] = React.useState<Hover>({ key: null, from: null });
  const [editing, setEditing] = React.useState(false);
  const [view, setView] = React.useState<"rich" | "markdown">("rich");
  const file = project.pages.find((p) => p.id === id);
  if (!file) return <p className="p-8 text-sm text-muted-foreground">That page doesn’t exist.</p>;

  const page = withDraft(file, drafts);
  const changed = isChanged(file, drafts[file.id]);

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

  if (editing) {
    return (
      <PageEditor
        file={file}
        page={page}
        pages={pages}
        changed={changed}
        view={view}
        onView={setView}
        onDone={() => setEditing(false)}
      />
    );
  }

  const lines = pageLines(page);
  const request = (
    <>
      <span className="text-muted-foreground">GET</span> {project.site}/
      {file.path.replace(/^docs\//, "")}
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8 md:py-12",
        mode === "split" ? "max-w-[1480px]" : "max-w-[1120px]",
      )}
    >
      <PageHeader
        title={page.title}
        description={page.description}
        actions={
          <>
            <ReaderSwitch value={reader} onChange={setReader} />
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
              Edit
            </Button>
          </>
        }
        meta={
          <Facts
            items={[
              ["File", <code className="font-mono text-[13px]">{file.path}</code>],
              changed
                ? [
                    "Status",
                    <Dot tone="warn" className="text-warn">
                      Edited in this tab
                    </Dot>,
                  ]
                : ["Updated", file.updated.toLowerCase()],
            ]}
          />
        }
      />
      <div className="mt-10">
        <LinkResolver.Provider value={resolve}>
          {mode === "people" && <MdxPeople body={page.body} />}
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
            <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.95fr)] gap-8">
              <MdxPeople body={page.body} hover={hover} onHover={setHover} />
              <div className="min-w-0">
                <AgentPane
                  className="sticky top-16 max-h-[calc(100svh-5.5rem)]"
                  request={request}
                  lines={lines}
                  hover={hover}
                  onHover={setHover}
                />
              </div>
            </div>
          )}
        </LinkResolver.Provider>
      </div>
      {linkedFrom.length > 0 && (
        <Section title="Linked from" className="mt-16">
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
        <Section title={`More in ${file.folder}`} className="mt-16">
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
  );
}

/**
 * Editing in place. The title and description are the page's frontmatter, and the
 * body is Markdown, either rich or as source. Edits stay in this tab until Phase 5.
 */
function PageEditor({
  file,
  page,
  pages,
  changed,
  view,
  onView,
  onDone,
}: {
  file: DocPage;
  page: DocPage;
  pages: DocPage[];
  changed: boolean;
  view: "rich" | "markdown";
  onView: (v: "rich" | "markdown") => void;
  onDone: () => void;
}) {
  const update = (patch: Partial<DocDraft>) =>
    setDraft(file.id, {
      title: page.title,
      description: page.description,
      body: page.body,
      ...patch,
    });
  // The rich editor loads its text once. Discard and Undo replace the text from outside, so they bump this to remount it.
  const [revision, setRevision] = React.useState(0);
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

  // The same quiet hover as a sidebar row, so the title and description read as fields you can
  // type in. Negative margins keep their text where it sits when reading.
  const field =
    "-mx-2 w-[calc(100%+1rem)] rounded-md bg-transparent px-2 outline-none transition-colors hover:bg-muted/60 focus:bg-transparent";

  return (
    <>
      {/*
        Editing chrome, pinned under the top bar: what's being edited, whether it's saved,
        and how to finish. Everything below it is the page, and all of it is editable.
      */}
      <div className="sticky top-[calc(env(safe-area-inset-top,0px)+3.25rem)] z-10 border-b bg-background/90 backdrop-blur-md md:top-12">
        <div className="mx-auto flex w-full max-w-[1120px] flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-2 md:px-8">
          <div className="flex min-w-0 items-center gap-3 text-sm">
            <span className="shrink-0 font-medium">Editing</span>
            <code className="hidden truncate font-mono text-xs text-muted-foreground sm:inline">
              {file.path}
            </code>
            <span
              className="shrink-0"
              title="Edits stay in this tab. Committing them to the repository arrives with the server in Phase 5."
            >
              {changed ? (
                <Dot tone="warn" className="text-warn">
                  Unsaved changes
                </Dot>
              ) : (
                <span className="text-muted-foreground">No changes</span>
              )}
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <SegmentedControl
              value={view}
              onChange={(v) => onView(v as "rich" | "markdown")}
              aria-label="Editor view"
              options={[
                { value: "rich", label: "Rich" },
                { value: "markdown", label: "Markdown" },
              ]}
            />
            {changed && (
              <Button variant="ghost" size="sm" onClick={discard}>
                Discard
              </Button>
            )}
            <Button size="sm" disabled={!!problem} onClick={onDone}>
              Done
            </Button>
          </div>
        </div>
      </div>

      {/* The page itself, in the same place and type as when reading it. */}
      <article className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
        <div className="max-w-[72ch]">
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

        <div className="mt-10">
          {view === "rich" ? (
            <React.Suspense
              fallback={<p className="text-sm text-muted-foreground">Loading the editor…</p>}
            >
              <DocsEditor
                // Switching back from Markdown remounts it too, so it always loads the latest text.
                key={`${file.id}-rich-${revision}`}
                value={page.body}
                onChange={(body) => update({ body })}
                pagePath={file.path}
                pages={pages.map((p) => ({ title: p.title, path: p.path, folder: p.folder }))}
                autoFocus
              />
            </React.Suspense>
          ) : (
            <Textarea
              value={page.body}
              onChange={(e) => update({ body: e.target.value })}
              spellCheck={false}
              aria-label={`${file.path} source`}
              className="min-h-[60svh] w-full max-w-[72ch] resize-y rounded-none border-0 bg-transparent p-0 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
            />
          )}
        </div>
      </article>
    </>
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
