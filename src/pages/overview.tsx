import { CopyIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/toast"
import { Dot, Facts, Meter, PageHeader, Section, copyText, linkClass } from "@/components/common"
import { agentStats, components, questions, workspace, type Question } from "@/data/workspace"
import { navigate } from "@/lib/router"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

type State = "answered" | "review" | "gap"

function useQuestionState() {
  const { resolved, inReview } = useStore()
  return (q: Question): State => (resolved.includes(q.id) ? "answered" : inReview.includes(q.id) ? "review" : q.status)
}

export function QuestionStatus({ state }: { state: State }) {
  if (state === "answered") return <Dot tone="good">Answered</Dot>
  if (state === "review") return <Dot tone="warn" className="text-warn">In review</Dot>
  return <Dot tone="bad" className="text-bad">No answer yet</Dot>
}

/** Agent questions, unanswered first, since those are the ones to act on. */
export function QuestionList({ limit }: { limit?: number }) {
  const { resolved, setPendingDraft } = useStore()
  const stateOf = useQuestionState()
  const sorted = [...questions].sort((a, b) => Number(stateOf(b) === "gap") - Number(stateOf(a) === "gap"))
  const list = limit ? sorted.slice(0, limit) : sorted
  return (
    <ul className="divide-y border-y">
      {list.map((q) => {
        const state = stateOf(q)
        const source = resolved.includes(q.id) ? q.resolves : q.source
        return (
          <li key={q.id} className="grid gap-x-6 gap-y-3 py-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
            <div className="min-w-0">
              <p className="text-[15px] text-pretty">{q.text}</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <QuestionStatus state={state} />
                <span className="tabular">Asked {q.count} times</span>
                {source && (
                  <a href={`#${source.route}`} className={cn(linkClass, "font-normal")}>
                    {source.label}
                  </a>
                )}
              </p>
            </div>
            {state === "gap" && (
              <Button
                size="sm"
                variant="outline"
                className="justify-self-start sm:justify-self-end"
                onClick={() => {
                  setPendingDraft(q.id)
                  navigate(`edit-${q.fileId}`)
                }}
              >
                Write the answer
              </Button>
            )}
          </li>
        )
      })}
    </ul>
  )
}

export function Overview() {
  const { commits, resolved } = useStore()
  const open = questions.filter((q) => q.status === "gap" && !resolved.includes(q.id)).length
  const total = agentStats.week.reduce((a, b) => a + b, 0).toLocaleString()
  const has = {
    usage: components.filter((c) => c.whenToUse?.length || c.agentRules?.length),
    examples: components.filter((c) => c.examples?.length || (c.id === "button" && resolved.includes("q-loading"))),
    a11y: components.filter((c) => c.a11y?.length),
  }
  const missing = (list: typeof components) =>
    components.filter((c) => !list.includes(c) && c.status !== "deprecated")

  const coverage = [
    { label: "Props and slots", value: components.length, note: "Read from component.yml", missing: [] as typeof components },
    { label: "Usage rules", value: has.usage.length, missing: missing(has.usage) },
    { label: "Do and don’t examples", value: has.examples.length, missing: missing(has.examples) },
    { label: "Accessibility notes", value: has.a11y.length, missing: missing(has.a11y) },
  ]

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={workspace.name}
        description={
          open
            ? `Agents made ${total} requests this week, and ${open} of their questions had no answer in your docs.`
            : `Agents made ${total} requests this week and found an answer to every question.`
        }
        actions={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                if (await copyText(workspace.mcp)) toast.add({ title: "MCP endpoint copied", description: workspace.mcp })
              }}
            >
              <CopyIcon />
              Copy MCP endpoint
            </Button>
            <Button onClick={() => navigate("agents")}>Connect an agent</Button>
          </>
        }
        meta={
          <Facts
            items={[
              ["Site", workspace.site],
              ["Repository", <code className="font-mono text-[13px]">{workspace.repo}</code>],
              [
                "Branch",
                <Dot tone="good">
                  <span>
                    <code className="font-mono text-[13px]">{workspace.branch}</code>, in sync
                  </span>
                </Dot>,
              ],
              ["Built", commits[0].when.toLowerCase()],
            ]}
          />
        }
      />

      <div className="mt-12 grid gap-16">
        <Section
          title="Agent questions"
          aside={
            <a href="#agents" className={linkClass}>
              All agent activity
            </a>
          }
        >
          <QuestionList limit={5} />
        </Section>

        <div className="grid gap-16 lg:grid-cols-2 lg:gap-12">
          <Section title="Coverage" aside={<span className="tabular">Out of {components.length} components</span>}>
            <ul className="grid gap-6">
              {coverage.map((row) => (
                <li key={row.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[15px]">{row.label}</span>
                    <span className="text-sm text-muted-foreground tabular">
                      {row.value} of {components.length}
                    </span>
                  </div>
                  <Meter value={row.value} total={components.length} className="mt-2" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    {row.note ??
                      (row.missing.length ? (
                        <>
                          Missing{" "}
                          {row.missing.map((c, i) => (
                            <span key={c.id}>
                              {i > 0 && ", "}
                              <a href={`#component-${c.id}`} className={cn(linkClass, "font-normal")}>
                                {c.name}
                              </a>
                            </span>
                          ))}
                        </>
                      ) : (
                        "Complete"
                      ))}
                  </p>
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recent changes">
            <ol className="divide-y border-y">
              {commits.slice(0, 5).map((c) => (
                <li key={c.sha} className="flex items-baseline gap-4 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px]">{c.message}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {c.author}, {c.when.toLowerCase()}
                    </p>
                  </div>
                  <code className="shrink-0 font-mono text-xs text-muted-foreground">{c.sha}</code>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  )
}
