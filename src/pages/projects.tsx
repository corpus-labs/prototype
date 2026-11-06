import { FileTextIcon, FolderIcon, PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { ComponentThumb, CuiScope } from "@/components/charged-ui"
import { Dot, Facts, PageHeader, Section } from "@/components/common"
import { handbook, questions, workspace } from "@/data/workspace"
import { KIND_LABEL, foldersOf, useProjects, type ProjectSummary } from "@/lib/projects"
import { navigate } from "@/lib/router"
import { useStore } from "@/lib/store"

/** A design system previews as its own components. */
function SystemPreview({ dark }: { dark: boolean }) {
  return (
    <CuiScope dark={dark} className="pointer-events-none flex h-44 flex-col items-center justify-center gap-4 bg-(--cui-subtle) p-6">
      <ComponentThumb id="button" />
      <ComponentThumb id="badge" />
    </CuiScope>
  )
}

/** A docs project previews as its page tree. */
function DocsPreview() {
  return (
    <div className="pointer-events-none h-44 overflow-hidden bg-muted/50 px-6 py-5" aria-hidden>
      <div className="grid gap-3">
        {foldersOf(handbook.pages)
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
  )
}

function ProjectCard({ p, dark }: { p: ProjectSummary; dark: boolean }) {
  return (
    <a
      href={`#${p.home}`}
      className="group flex flex-col overflow-hidden rounded-xl border transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {p.kind === "design-system" ? <SystemPreview dark={dark} /> : <DocsPreview />}
      <div className="grid gap-4 border-t p-5">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="truncate text-lg font-semibold tracking-[-0.02em]">{p.name}</p>
            <span className="shrink-0 text-sm text-muted-foreground">{KIND_LABEL[p.kind]}</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
        </div>
        <Facts items={[...p.counts, ["Agent requests", `${p.requests.toLocaleString()} this week`]]} />
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {p.open ? (
            <Dot tone="bad" className="text-bad">
              {p.open} unanswered {p.open === 1 ? "question" : "questions"}
            </Dot>
          ) : (
            <Dot tone="good">Every question answered</Dot>
          )}
          <span className="text-muted-foreground">Updated {p.updated.toLowerCase()}</span>
        </div>
      </div>
    </a>
  )
}

export function Projects() {
  const { dark, resolved, setPendingDraft } = useStore()
  const projects = useProjects()
  const requests = projects.reduce((n, p) => n + p.requests, 0).toLocaleString()
  const open = projects.reduce((n, p) => n + p.open, 0)
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
          setPendingDraft(q.id)
          navigate(`edit-${q.fileId}`)
        },
      })),
    ...handbook.questions.filter((q) => q.status === "gap").map((q) => ({ id: q.id, text: q.text, count: q.count, project: handbook.name, write: undefined })),
  ].sort((a, b) => b.count - a.count)

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Projects"
        description={
          open
            ? `Agents made ${requests} requests across your ${projects.length} projects this week, and ${open} of their questions had no answer.`
            : `Agents made ${requests} requests across your ${projects.length} projects this week and found an answer every time.`
        }
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                title: "Adding projects isn’t part of this prototype",
                description: "A new project points Corpus at another content repository, for a design system or a docs space.",
              })
            }
          >
            <PlusIcon />
            New project
          </Button>
        }
      />

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {projects.map((p) => (
          <ProjectCard key={p.id} p={p} dark={dark} />
        ))}
      </div>

      {gaps.length > 0 && (
        <Section title="Unanswered questions" className="mt-16" aside={<span className="tabular">Across all projects</span>}>
          <ul className="divide-y border-y">
            {gaps.map((q) => (
              <li key={q.id} className="grid gap-x-6 gap-y-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
                <div className="min-w-0">
                  <p className="text-[15px] text-pretty">{q.text}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span>{q.project}</span>
                    <span className="tabular">Asked {q.count} times</span>
                  </p>
                </div>
                {q.write ? (
                  <Button size="sm" variant="outline" className="justify-self-start sm:justify-self-end" onClick={q.write}>
                    Write the answer
                  </Button>
                ) : (
                  <span className="text-sm text-muted-foreground">Needs the docs editor</span>
                )}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
}
