import * as React from "react"
import { CopyIcon, PlayIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/toast"
import { AgentPane, CodeBlock, CopyButton, PageHeader, Section, SegmentedControl, copyText, linkClass } from "@/components/common"
import { agentStats, components, questions, workspace } from "@/data/workspace"
import {
  checkUsage,
  componentLines,
  llmsTxt,
  searchDocs,
  tokenLines,
  type Line,
} from "@/lib/agent-format"
import { navigate } from "@/lib/router"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import { QuestionList } from "@/pages/overview"

const SERVER = "charged-ui"

const SETUP = [
  {
    id: "claude",
    label: "Claude Code",
    file: "Terminal",
    code: `claude mcp add --transport http ${SERVER} ${workspace.mcp}`,
  },
  {
    id: "cursor",
    label: "Cursor",
    file: ".cursor/mcp.json",
    code: JSON.stringify({ mcpServers: { [SERVER]: { url: workspace.mcp } } }, null, 2),
  },
  {
    id: "vscode",
    label: "VS Code",
    file: ".vscode/mcp.json",
    code: JSON.stringify({ servers: { [SERVER]: { type: "http", url: workspace.mcp } } }, null, 2),
  },
  {
    id: "agents-md",
    label: "AGENTS.md",
    file: "AGENTS.md",
    code: `## UI work\n\nBefore writing markup, ask the ${SERVER} MCP server for the component.\nUse its tokens instead of raw values, and run check_usage on new templates.`,
  },
]

const EXAMPLES: Record<string, { input: string; chips: string[] }> = {
  get_component: { input: "button", chips: ["button", "card", "pager"] },
  search_docs: { input: "loading state", chips: ["loading state", "form field spacing", "tabs or menu"] },
  check_usage: {
    input: `<a class="btn btn-primary" href="/save">Click here</a>\n{{ include('charged_ui:button', { variant: 'primary', label: 'Save' }) }}\n{{ include('charged_ui:button', { variant: 'primary', label: 'Publish' }) }}`,
    chips: [],
  },
  get_tokens: { input: "color", chips: ["color", "space", "radius", "type"] },
}

function Playground() {
  const { resolved, saved } = useStore()
  const [tool, setTool] = React.useState("get_component")
  const [input, setInput] = React.useState(EXAMPLES.get_component.input)
  const [running, setRunning] = React.useState(false)
  const [result, setResult] = React.useState<{ request: string; lines: Line[]; gap?: string } | null>(null)

  const pick = (t: string) => {
    setTool(t)
    setInput(EXAMPLES[t].input)
    setResult(null)
  }

  const run = (value = input) => {
    setRunning(true)
    setResult(null)
    window.setTimeout(() => {
      const ctx = { resolved }
      let lines: Line[] = []
      let gap: string | undefined
      let args = ""
      if (tool === "get_component") {
        const id = value.trim().toLowerCase().replace(/^charged_ui:/, "").replace(/_/g, "-")
        args = `{ "name": "${id}" }`
        const c = components.find((x) => x.id === id || x.name.toLowerCase() === id)
        lines = c
          ? componentLines(c, ctx)
          : [{ text: `No component named "${value}".`, kind: "muted" }, { text: `Available: ${components.map((x) => x.id).join(", ")}`, kind: "muted" }]
      } else if (tool === "search_docs") {
        args = `{ "query": "${value}" }`
        const q = value.toLowerCase()
        const openGap = /load|spinner/.test(q) && !resolved.includes("q-loading") ? "q-loading" : /nest/.test(q) && !resolved.includes("q-nesting") ? "q-nesting" : undefined
        if (openGap) {
          const question = questions.find((x) => x.id === openGap)!
          gap = openGap
          lines = [
            { text: "No section answers this.", kind: "h2" },
            { text: "" },
            { text: `Logged as an unanswered question (asked ${question.count + 1} times this week).`, kind: "muted" },
            { text: "The agent falls back to guessing until someone documents it.", kind: "muted" },
          ]
        } else {
          const hits = searchDocs(value, ctx, saved)
          lines = hits.length
            ? hits.flatMap((h, i) => [
                ...(i ? [{ text: "" }] : []),
                { text: `## ${h.heading}`, kind: "h2" as const },
                { text: `source: ${h.source}`, kind: "meta" as const },
                { text: h.text },
              ])
            : [{ text: "No matches.", kind: "muted" }]
        }
      } else if (tool === "check_usage") {
        args = `{ "code": "…${value.split("\n").length} lines" }`
        const issues = checkUsage(value)
        lines = issues.length
          ? [
              { text: `${issues.length} problem${issues.length > 1 ? "s" : ""} found`, kind: "h2" },
              { text: "" },
              ...issues.flatMap((x) => [
                { text: `line ${x.line}  ${x.rule}`, kind: "dont" as const },
                { text: `  ${x.message}` },
              ]),
            ]
          : [{ text: "No problems found against 14 rules.", kind: "do" }]
      } else {
        const g = value.trim().toLowerCase()
        args = `{ "category": "${g}" }`
        lines = tokenLines(["color", "type", "space", "radius"].includes(g) ? g : undefined)
      }
      setResult({ request: `${tool} ${args}`, lines, gap })
      setRunning(false)
    }, 420)
  }

  return (
    <div className="grid gap-4">
      <SegmentedControl
        value={tool}
        onChange={pick}
        aria-label="Tool"
        className="max-w-full flex-wrap justify-self-start"
        options={Object.keys(EXAMPLES).map((t) => ({ value: t, label: t, className: "font-mono text-xs" }))}
      />
      <div className="flex flex-col gap-2 sm:flex-row">
        {tool === "check_usage" ? (
          <Textarea value={input} onChange={(e) => setInput(e.target.value)} spellCheck={false} aria-label="Code to check" className="min-h-24 flex-1 font-mono text-[12.5px] md:text-[12.5px]" />
        ) : (
          <Input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && run()} className="flex-1 font-mono text-[13px] md:text-[13px]" aria-label="Tool input" />
        )}
        <Button onClick={() => run()} disabled={running || !input.trim()} className="self-start">
          {running ? <Spinner /> : <PlayIcon />}
          Run
        </Button>
      </div>
      {EXAMPLES[tool].chips.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
          <span className="mr-1">Try</span>
          {EXAMPLES[tool].chips.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                setInput(c)
                run(c)
              }}
              className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground/80 transition-colors outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {c}
            </button>
          ))}
        </div>
      )}
      {result && (
        <AgentPane
          request={
            <>
              <span className="text-muted-foreground">mcp</span> {result.request}
            </>
          }
          lines={result.lines}
          bodyClassName="max-h-96"
        />
      )}
      {result?.gap && (
        <Button variant="outline" size="sm" className="justify-self-start" onClick={() => navigate(`edit-${questions.find((q) => q.id === result.gap)?.fileId}`)}>
          Write the answer
        </Button>
      )}
    </div>
  )
}

function listOf(names: string[]) {
  return names.length > 1 ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}` : names[0]
}

export function Agents() {
  const { resolved, publishing } = useStore()
  const total = agentStats.week.reduce((a, b) => a + b, 0)
  const max = Math.max(...agentStats.week)
  const open = questions.filter((q) => q.status === "gap" && !resolved.includes(q.id)).length
  const endpoints = [
    { label: "MCP server", value: workspace.mcp, note: publishing.mcpToken ? "Token required" : "Public, read only", on: publishing.mcp },
    { label: "llms.txt", value: workspace.llms, note: "Index of every page", on: publishing.llms },
    { label: "Markdown pages", value: `https://${workspace.site}/components/button.md`, note: "Add .md to any page URL", on: publishing.markdown },
  ]

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Agents"
        description={`${total.toLocaleString()} requests this week from ${listOf(agentStats.clients.map((c) => c.name))}.`}
        actions={
          <Button
            variant="outline"
            onClick={async () => {
              if (await copyText(workspace.mcp)) toast.add({ title: "MCP endpoint copied", description: workspace.mcp })
            }}
          >
            <CopyIcon />
            Copy MCP endpoint
          </Button>
        }
      />

      <div className="mt-12 grid gap-16">
        <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] lg:gap-12">
          <Section
            title="Endpoints"
            aside={
              <a href="#workspace" className={linkClass}>
                Change in Settings
              </a>
            }
          >
            <ul className="divide-y border-y">
              {endpoints.map((e) => (
                <li key={e.label} className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-[15px]">
                      {e.label}
                      <span className="text-sm text-muted-foreground">{e.on ? e.note : "Off"}</span>
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">{e.value}</p>
                  </div>
                  <CopyButton text={e.value} label={`Copy ${e.label}`} />
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Connect a client">
            <Tabs defaultValue="claude" className="min-w-0">
              <TabsList className="max-w-full overflow-x-auto">
                {SETUP.map((s) => (
                  <TabsTrigger key={s.id} value={s.id}>
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {SETUP.map((s) => (
                <TabsContent key={s.id} value={s.id} className="min-w-0">
                  <CodeBlock code={s.code} header={<span className="font-mono">{s.file}</span>} wrap={s.id === "agents-md" || s.id === "claude"} />
                </TabsContent>
              ))}
            </Tabs>
          </Section>
        </div>

        <Section title="Tools" aside={<span className="tabular">Calls this week</span>}>
          <ul className="divide-y border-y">
            {agentStats.tools.map((t) => (
              <li key={t.name} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-6 gap-y-1 py-3.5 sm:grid-cols-[11rem_minmax(0,1fr)_auto]">
                <code className="font-mono text-[13px] font-medium">{t.name}</code>
                <span className="text-sm text-muted-foreground tabular sm:order-last">{t.count.toLocaleString()}</span>
                <p className="col-span-2 text-sm text-muted-foreground sm:col-span-1">{t.description}</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section title="Try a tool call">
          <Playground />
        </Section>

        <div className="grid gap-16 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-12">
          <Section title="Requests" aside={<span className="tabular">{total.toLocaleString()} this week</span>}>
            <div className="flex h-40 items-end gap-2" role="img" aria-label={`Requests per day: ${agentStats.week.join(", ")}`}>
              {agentStats.week.map((v, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                  <span className="text-[11px] text-muted-foreground tabular">{v}</span>
                  <div className={cn("w-full rounded-sm", i === agentStats.week.length - 1 ? "bg-foreground/80" : "bg-foreground/15")} style={{ height: `${(v / max) * 100}%` }} />
                  <span className="text-xs text-muted-foreground">{agentStats.days[i]}</span>
                </div>
              ))}
            </div>
          </Section>
          <Section title="Clients">
            <ul className="grid gap-5">
              {agentStats.clients.map((c) => (
                <li key={c.name}>
                  <div className="flex justify-between gap-3">
                    <span className="text-[15px]">{c.name}</span>
                    <span className="text-sm text-muted-foreground tabular">{c.share}%</span>
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full bg-foreground/70" style={{ width: `${c.share}%` }} />
                  </div>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Questions" aside={<span className="tabular">{open ? `${open} without an answer` : "All answered"}</span>}>
          <QuestionList />
        </Section>

        <Section title="llms.txt" aside={<code className="font-mono text-xs">{workspace.llms.replace("https://", "")}</code>}>
          <CodeBlock code={llmsTxt({ resolved })} header={<span>Rebuilt on every push</span>} wrap className="[&_pre]:max-h-80" />
        </Section>
      </div>
    </div>
  )
}
