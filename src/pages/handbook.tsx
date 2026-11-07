// Exploration: docs projects (a handbook, a help center). See
// docs/decisions/proposed-projects-and-docs.md, proposed-docs-editor.md,
// and proposed-knowledge-notebook.md.
import * as React from "react";
import { PlusIcon } from "lucide-react";

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
  SegmentedControl,
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

export function DocsOverview({ project }: { project: DocsProject }) {
  const { drafts, pages } = usePages(project);
  const help = project.kind === "help-center";
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={project.name}
        description={project.description}
        actions={
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
        }
        meta={
          <Facts
            items={[
              ["Repository", <code className="font-mono text-[13px]">{project.repo}</code>],
              ["Site", project.site],
              ["Pages", project.pages.length],
              ["Updated", project.updated.toLowerCase()],
            ]}
          />
        }
      />

      <div className="mt-12 grid gap-16">
        {help && <SupportBot project={project} pages={pages} />}
        <Section
          title={help ? "Customer questions" : "Agent questions"}
          aside={
            <span className="tabular">
              {project.requests} {help ? "questions" : "requests"} this week
            </span>
          }
        >
          <ul className="divide-y border-y">
            {project.questions.map((q) => (
              <li key={q.id} className="py-4">
                <p className="text-[15px] text-pretty">{q.text}</p>
                <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  {q.status === "gap" ? (
                    <Dot tone="bad" className="text-bad">
                      No answer yet
                    </Dot>
                  ) : (
                    <Dot tone="good">Answered</Dot>
                  )}
                  <span className="tabular">Asked {q.count} times</span>
                  {q.source && (
                    <a href={`#${q.source.route}`} className={cn(linkClass, "font-normal")}>
                      {q.source.label}
                    </a>
                  )}
                </p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Pages">
          <div className="grid gap-x-10 gap-y-10 md:grid-cols-2">
            {foldersOf(pages).map(([folder, list]) => (
              <div key={folder}>
                <h3 className="text-sm font-semibold">{folder}</h3>
                <ul className="mt-3 divide-y border-y">
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
                          <span className="mt-0.5 block text-sm text-muted-foreground">
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

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <header className="grid gap-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="min-w-0 flex-1">
            <input
              value={page.title}
              onChange={(e) => update({ title: e.target.value })}
              aria-label="Title"
              aria-invalid={!!problem || undefined}
              placeholder="Untitled"
              className="w-full bg-transparent text-[28px] leading-tight font-semibold tracking-[-0.03em] outline-none placeholder:text-muted-foreground/50 md:text-[32px]"
            />
            <input
              value={page.description}
              onChange={(e) => update({ description: e.target.value })}
              aria-label="Description"
              placeholder="Add a one-line description"
              className="mt-2 w-full max-w-[60ch] bg-transparent text-base leading-relaxed text-foreground/75 outline-none placeholder:text-muted-foreground/60 md:text-[17px]"
            />
            {problem && <p className="mt-2 text-sm text-bad">{problem}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1.5">
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
        <Facts
          items={[
            ["File", <code className="font-mono text-[13px]">{file.path}</code>],
            [
              "Status",
              changed ? (
                <Dot tone="warn" className="text-warn">
                  Unsaved changes
                </Dot>
              ) : (
                <Dot tone="off">No changes</Dot>
              ),
            ],
          ]}
        />
        <p className="-mt-3 text-sm text-muted-foreground">
          Edits stay in this tab. Committing them to the repository arrives with the server in Phase
          5.
        </p>
      </header>

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
            className="min-h-[60svh] max-w-[72ch] resize-y rounded-xl bg-card p-4 font-mono text-[13px] leading-6 md:text-[13px]"
          />
        )}
      </div>
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

  return (
    <Section title="Ask the support bot" aside={<span>Answers only from these pages</span>}>
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
          className="max-w-xl"
        />
        <Button type="submit" disabled={thinking || !question.trim()}>
          {thinking && <Spinner />}
          Ask
        </Button>
      </form>
      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
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
      {asked && (
        <div className="mt-6 max-w-3xl rounded-xl border" aria-live="polite">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 border-b px-4 py-3">
            <p className="text-[15px] font-medium">“{asked.q}”</p>
            <p className="text-sm text-muted-foreground">{via}</p>
          </div>
          {asked.reply.kind === "answer" ? (
            <div className="px-4 py-4">
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
            <div className="px-4 py-4">
              <Dot tone="bad" className="text-[15px] text-bad">
                No page answers this yet
              </Dot>
              <p className="mt-2 text-sm leading-relaxed text-pretty text-muted-foreground">
                The bot tells the customer it doesn’t know and hands them to a person, instead of
                guessing. The question joins the list below, so someone can write the page once and
                every reader gets it.
              </p>
            </div>
          )}
        </div>
      )}
    </Section>
  );
}
