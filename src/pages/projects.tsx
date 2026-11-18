import { FileTextIcon, FolderIcon, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { ComponentThumb, CuiScope } from "@/components/charged-ui";
import { KIND_ICON } from "@/components/app-shell";
import { Dot, PageHeader, Section, ViewSwitch, useViewMode } from "@/components/common";
import { docsProjects, helpCenter, questions, workspace, type DocPage } from "@/data/workspace";
import { KIND_LABEL, foldersOf, useProjects, type ProjectSummary } from "@/lib/projects";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";

/** A design system previews as its own components. */
function SystemPreview({ dark }: { dark: boolean }) {
  return (
    <CuiScope
      dark={dark}
      className="pointer-events-none flex h-40 flex-col items-center justify-center gap-4 bg-(--cui-subtle) p-6"
    >
      <ComponentThumb id="button" />
      <ComponentThumb id="badge" />
    </CuiScope>
  );
}

/** A docs project previews as its page tree. */
function DocsPreview({ pages }: { pages: DocPage[] }) {
  return (
    <div className="pointer-events-none h-40 overflow-hidden bg-muted/50 px-5 py-4" aria-hidden>
      <div className="grid gap-3">
        {foldersOf(pages)
          .slice(0, 2)
          .map(([folder, pages]) => (
            <div key={folder}>
              <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <FolderIcon className="size-3.5" />
                {folder}
              </p>
              <ul className="mt-1.5 ml-1.5 grid gap-1 border-l pl-3">
                {pages.map((p) => (
                  <li key={p.id} className="flex items-center gap-1.5 text-sm">
                    <FileTextIcon className="size-3.5 text-muted-foreground" />
                    {p.title}
                  </li>
                ))}
              </ul>
            </div>
          ))}
      </div>
    </div>
  );
}

/** A help center previews as the support bot answering from one of its pages. */
function HelpPreview() {
  const q = helpCenter.questions[0];
  return (
    <div
      className="pointer-events-none flex h-40 flex-col justify-center gap-2.5 overflow-hidden bg-muted/50 px-5 py-4"
      aria-hidden
    >
      <p className="self-end rounded-xl rounded-br-sm bg-background px-3 py-1.5 text-sm shadow-xs ring-1 ring-foreground/10">
        {q.text}
      </p>
      <div className="max-w-[90%] text-sm">
        <p className="text-pretty">Refunds take 3 business days once we approve them.</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <FileTextIcon className="size-3.5" />
          From {q.source?.label}
        </p>
      </div>
    </div>
  );
}

/**
 * One project as a row: what it looks like, what it is, and how it did this week.
 * Rows, not cards, so a fourth and a tenth project read the same way, and the
 * week's numbers line up in one column down the right.
 */
function ProjectRow({ p, dark }: { p: ProjectSummary; dark: boolean }) {
  const [label, count] = p.counts[0];
  return (
    <li>
      <a
        href={`#${p.home}`}
        className="group grid gap-x-8 gap-y-4 py-6 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:grid-cols-[260px_minmax(0,1fr)] md:items-center lg:grid-cols-[260px_minmax(0,1fr)_216px]"
      >
        <div className="overflow-hidden rounded-lg border transition-colors group-hover:border-foreground/25">
          {p.kind === "design-system" ? (
            <SystemPreview dark={dark} />
          ) : p.kind === "help-center" ? (
            <HelpPreview />
          ) : (
            <DocsPreview pages={p.pages ?? []} />
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-xl leading-snug font-semibold tracking-[-0.02em] decoration-foreground/30 underline-offset-4 group-hover:underline">
            {p.name}
          </h2>
          <p className="mt-1.5 max-w-[52ch] text-[15px] leading-relaxed text-pretty text-foreground/75">
            {p.description}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            {KIND_LABEL[p.kind]}, {count} {label.toLowerCase()}, updated {p.updated.toLowerCase()}
          </p>
        </div>
        <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 md:col-start-2 lg:col-start-3 lg:block lg:self-stretch lg:border-l lg:pl-8">
          <p className="flex items-baseline gap-2 lg:mt-1">
            <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
              {p.requests.toLocaleString()}
            </span>
            <span className="text-sm text-muted-foreground">
              {p.kind === "help-center" ? "questions" : "requests"}
            </span>
          </p>
          <p className="text-sm lg:mt-2.5">
            {p.open ? (
              <Dot tone="bad" className="text-bad">
                {p.open} unanswered
              </Dot>
            ) : (
              <Dot tone="good">All answered</Dot>
            )}
          </p>
        </div>
      </a>
    </li>
  );
}

/**
 * A project at a glance: what it looks like, what it is, and the one thing to act on.
 * The description and counts live on the project's own overview.
 */
function ProjectCard({ p, dark }: { p: ProjectSummary; dark: boolean }) {
  const Icon = KIND_ICON[p.kind];
  const [label, count] = p.counts[0];
  return (
    <a
      href={`#${p.home}`}
      title={p.description}
      className="group @container flex flex-col overflow-hidden rounded-xl border bg-card transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {p.kind === "design-system" ? (
        <SystemPreview dark={dark} />
      ) : p.kind === "help-center" ? (
        <HelpPreview />
      ) : (
        <DocsPreview pages={p.pages ?? []} />
      )}
      <div className="flex items-center gap-3 border-t px-4 py-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
          <Icon className="size-[18px]" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-[15px] font-semibold tracking-[-0.01em]">
            {p.name}
          </span>
          <span className="block truncate text-[13px] text-muted-foreground">
            {KIND_LABEL[p.kind]}, {count} {label.toLowerCase()}
          </span>
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 border-t px-4 py-3 text-sm whitespace-nowrap">
        <span className="text-muted-foreground">
          <span className="font-medium text-foreground tabular">{p.requests.toLocaleString()}</span>{" "}
          {p.kind === "help-center" ? "questions" : "requests"}
          {/* Narrow cards drop "this week"; the page lead already says it. */}
          <span className="hidden @[21rem]:inline"> this week</span>
        </span>
        {p.open ? (
          <Dot tone="bad" className="text-bad">
            {p.open} unanswered
          </Dot>
        ) : (
          <Dot tone="good">All answered</Dot>
        )}
      </div>
    </a>
  );
}

export function Projects() {
  const { dark, resolved, setPendingDraft } = useStore();
  const projects = useProjects();
  const [view, setView] = useViewMode("projects");
  const requests = projects.reduce((n, p) => n + p.requests, 0).toLocaleString();
  const open = projects.reduce((n, p) => n + p.open, 0);
  // Unanswered questions from every project, most asked first.
  const gaps = [
    ...questions
      .filter((q) => q.status === "gap" && !resolved.includes(q.id))
      .map((q) => ({
        id: q.id,
        text: q.text,
        count: q.count,
        project: workspace.name,
        write: () => {
          setPendingDraft(q.id);
          navigate(`edit-${q.fileId}`);
        },
      })),
    ...docsProjects.flatMap((d) =>
      d.questions
        .filter((q) => q.status === "gap")
        .map((q) => ({
          id: q.id,
          text: q.text,
          count: q.count,
          project: d.name,
          write: undefined,
        })),
    ),
  ].sort((a, b) => b.count - a.count);

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Projects"
        description={
          open
            ? `People and agents asked ${requests} questions across your ${projects.length} projects this week, and ${open} had no answer.`
            : `People and agents asked ${requests} questions across your ${projects.length} projects this week, and every one found an answer.`
        }
        actions={
          <>
            <ViewSwitch value={view} onChange={setView} />
            <Button
              variant="outline"
              onClick={() =>
                toast.add({
                  title: "Adding projects isn’t part of this prototype",
                  description:
                    "A new project points Corpus at another folder of Markdown: a handbook, a help center, or a design system.",
                })
              }
            >
              <PlusIcon />
              New project
            </Button>
          </>
        }
      />

      {view === "grid" ? (
        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((p) => (
            <ProjectCard key={p.id} p={p} dark={dark} />
          ))}
        </div>
      ) : (
        <ul className="mt-8 divide-y border-y">
          {projects.map((p) => (
            <ProjectRow key={p.id} p={p} dark={dark} />
          ))}
        </ul>
      )}

      {gaps.length > 0 && (
        <Section
          title="Needs an answer"
          className="mt-16"
          aside={<span>Across all projects, most asked first</span>}
        >
          <ol className="divide-y border-y">
            {gaps.map((q) => (
              <li
                key={q.id}
                className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-5"
              >
                <p className="leading-none">
                  <span className="block text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                    {q.count}
                  </span>
                  <span className="mt-1.5 block text-xs text-muted-foreground">asks</span>
                </p>
                <div className="min-w-0">
                  <p className="text-[17px] leading-snug font-medium text-pretty">{q.text}</p>
                  <p className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <Dot tone="bad" className="text-bad">
                      No answer yet
                    </Dot>
                    <span>{q.project}</span>
                  </p>
                </div>
                {q.write ? (
                  <Button
                    variant="outline"
                    className="col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end"
                    onClick={q.write}
                  >
                    Write the answer
                  </Button>
                ) : (
                  <span className="col-start-2 text-sm text-muted-foreground sm:col-start-3">
                    Needs the docs editor
                  </span>
                )}
              </li>
            ))}
          </ol>
        </Section>
      )}
    </div>
  );
}
