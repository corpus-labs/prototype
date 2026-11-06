// Exploration: a docs project. See docs/decisions/proposed-projects-and-docs.md
// and docs/decisions/proposed-docs-editor.md.
import * as React from "react"
import { PlusIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { Dot, Facts, PageHeader, Section, SegmentedControl, linkClass } from "@/components/common"
import { handbook, type DocPage } from "@/data/workspace"
import { pageMetaSchema } from "@core/markdown/frontmatter"
import { linksIn, resolveLink } from "@core/markdown/links"
import { clearDraft, getDraft, isChanged, setDraft, useDocDrafts, withDraft, type DocDraft } from "@/lib/docs-drafts"
import { LinkResolver } from "@/lib/mdx-lite"
import { foldersOf } from "@/lib/projects"
import { cn } from "@/lib/utils"
import { MdxPeople } from "@/pages/guidelines"

// ProseMirror and Milkdown are the heaviest part of the app, so the editor loads only when someone edits.
const DocsEditor = React.lazy(() => import("@/components/docs-editor/docs-editor").then((m) => ({ default: m.DocsEditor })))

/** Every handbook page as it reads right now, with this tab's drafts applied. */
function usePages() {
  const drafts = useDocDrafts()
  return { drafts, pages: handbook.pages.map((p) => withDraft(p, drafts)) }
}

export function HandbookOverview() {
  const { drafts, pages } = usePages()
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={handbook.name}
        description={handbook.description}
        actions={
          <Button
            variant="outline"
            onClick={() =>
              toast.add({
                title: "New pages need the server",
                description: "Creating a file in the repository arrives with Phase 5. Until then, edit the pages that are here.",
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
              ["Repository", <code className="font-mono text-[13px]">{handbook.repo}</code>],
              ["Site", handbook.site],
              ["Pages", handbook.pages.length],
              ["Updated", handbook.updated.toLowerCase()],
            ]}
          />
        }
      />

      <div className="mt-12 grid gap-16">
        <Section title="Agent questions" aside={<span className="tabular">{handbook.requests} requests this week</span>}>
          <ul className="divide-y border-y">
            {handbook.questions.map((q) => (
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
                        href={`#handbook-${p.id}`}
                        className="group -mx-1 flex items-baseline justify-between gap-4 rounded-md px-1 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        <span className="min-w-0">
                          <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline">{p.title}</span>
                          <span className="mt-0.5 block text-sm text-muted-foreground">{p.description}</span>
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
  )
}

export function HandbookPage({ id }: { id: string }) {
  const { drafts, pages } = usePages()
  const [editing, setEditing] = React.useState(false)
  const [view, setView] = React.useState<"rich" | "markdown">("rich")
  const file = handbook.pages.find((p) => p.id === id)
  if (!file) return <p className="p-8 text-sm text-muted-foreground">That page doesn’t exist.</p>

  const page = withDraft(file, drafts)
  const changed = isChanged(file, drafts[file.id])

  // Relative links in the page open the page they point to.
  const resolve = (href: string) => {
    const target = resolveLink(file.path, href)
    const hit = pages.find((p) => p.path === target)
    return hit ? `#handbook-${hit.id}` : undefined
  }
  const linkedFrom = pages.filter((p) => p.id !== file.id && linksIn(p.body).some((href) => resolveLink(p.path, href) === file.path))
  const nearby = pages.filter((p) => p.folder === file.folder && p.id !== file.id)

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
    )
  }

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={page.title}
        description={page.description}
        actions={
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            Edit
          </Button>
        }
        meta={
          <Facts
            items={[
              ["File", <code className="font-mono text-[13px]">{file.path}</code>],
              changed ? ["Status", <Dot tone="warn" className="text-warn">Edited in this tab</Dot>] : ["Updated", file.updated.toLowerCase()],
            ]}
          />
        }
      />
      <div className="mt-10">
        <LinkResolver.Provider value={resolve}>
          <MdxPeople body={page.body} />
        </LinkResolver.Provider>
      </div>
      {linkedFrom.length > 0 && (
        <Section title="Linked from" className="mt-16">
          <ul className="grid gap-2">
            {linkedFrom.map((p) => (
              <li key={p.id}>
                <a href={`#handbook-${p.id}`} className={linkClass}>
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
                <a href={`#handbook-${p.id}`} className={linkClass}>
                  {p.title}
                </a>
                <span className="ml-2 text-sm text-muted-foreground">{p.description}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  )
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
  file: DocPage
  page: DocPage
  pages: DocPage[]
  changed: boolean
  view: "rich" | "markdown"
  onView: (v: "rich" | "markdown") => void
  onDone: () => void
}) {
  const update = (patch: Partial<DocDraft>) => setDraft(file.id, { title: page.title, description: page.description, body: page.body, ...patch })
  // The rich editor loads its text once. Discard and Undo replace the text from outside, so they bump this to remount it.
  const [revision, setRevision] = React.useState(0)
  const meta = pageMetaSchema.safeParse({ title: page.title, description: page.description })
  const problem = meta.success ? null : meta.error.issues[0].message.replace("Add `title:` to its frontmatter.", "Add one above.")

  const discard = () => {
    const kept = getDraft(file.id)
    clearDraft(file.id)
    setRevision((r) => r + 1)
    const toastId = toast.add({
      title: "Changes discarded",
      description: `${file.path} matches the file again.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          if (kept) setDraft(file.id, kept)
          setRevision((r) => r + 1)
          toast.close(toastId)
        },
      },
    })
  }

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
            ["Status", changed ? <Dot tone="warn" className="text-warn">Unsaved changes</Dot> : <Dot tone="off">No changes</Dot>],
          ]}
        />
        <p className="-mt-3 text-sm text-muted-foreground">
          Edits stay in this tab. Committing them to the repository arrives with the server in Phase 5.
        </p>
      </header>

      <div className="mt-10">
        {view === "rich" ? (
          <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading the editor…</p>}>
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
  )
}
