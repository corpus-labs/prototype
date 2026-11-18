import * as React from "react";
import { CopyIcon, PlayIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import {
  AgentPane,
  CodeBlock,
  CopyButton,
  PageHeader,
  RailBlock,
  Section,
  SideRail,
  copyText,
  linkClass,
} from "@/components/common";
import { agentStats, components, questions, workspace } from "@/data/workspace";
import {
  checkUsage,
  componentLines,
  llmsTxt,
  searchDocs,
  tokenLines,
  type Line,
} from "@/lib/agent-format";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { QuestionList } from "@/pages/overview";

const SERVER = "charged-ui";

const SETUP = [
  {
    id: "claude",
    label: "Claude Code",
    file: "Terminal",
    code: `claude mcp add --transport http ${SERVER} ${workspace.mcp}`,
  },
  {
    id: "codex",
    label: "Codex",
    file: "Terminal",
    code: `codex mcp add ${SERVER} --url ${workspace.mcp}`,
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
    id: "any",
    label: "Any MCP client",
    file: "Connection",
    code: `URL        ${workspace.mcp}\nTransport  Streamable HTTP\n\nThe same for harnesses that run GLM, DeepSeek,\nGemini, or local models.`,
  },
  {
    id: "agents-md",
    label: "AGENTS.md",
    file: "AGENTS.md",
    code: `## UI work\n\nBefore writing markup, ask the ${SERVER} MCP server for the component.\nUse its tokens instead of raw values, and run check_usage on new templates.`,
  },
];

const EXAMPLES: Record<string, { input: string; chips: string[] }> = {
  get_component: { input: "button", chips: ["button", "card", "pager"] },
  search_docs: {
    input: "loading state",
    chips: ["loading state", "form field spacing", "tabs or menu"],
  },
  check_usage: {
    input: `<a class="btn btn-primary" href="/save">Click here</a>\n{{ include('charged_ui:button', { variant: 'primary', label: 'Save' }) }}\n{{ include('charged_ui:button', { variant: 'primary', label: 'Publish' }) }}`,
    chips: [],
  },
  get_tokens: { input: "color", chips: ["color", "space", "radius", "type"] },
};

/**
 * The tools and the playground as one object: pick a tool on the left, and the right side
 * runs it and shows the payload an agent would receive. Picking a tool runs its example,
 * so the payload is never an empty box.
 */
function ToolConsole() {
  const { resolved, saved } = useStore();
  const [current, setTool] = React.useState("get_component");
  const [input, setInput] = React.useState(EXAMPLES.get_component.input);
  const [running, setRunning] = React.useState(false);
  const [result, setResult] = React.useState<{
    request: string;
    lines: Line[];
    gap?: string;
  } | null>(null);

  const pick = (t: string) => {
    setTool(t);
    setInput(EXAMPLES[t].input);
    run(EXAMPLES[t].input, t);
  };

  const run = (value = input, tool = current) => {
    setRunning(true);
    setResult(null);
    window.setTimeout(() => {
      const ctx = { resolved };
      let lines: Line[] = [];
      let gap: string | undefined;
      let args = "";
      if (tool === "get_component") {
        const id = value
          .trim()
          .toLowerCase()
          .replace(/^charged_ui:/, "")
          .replace(/_/g, "-");
        args = `{ "name": "${id}" }`;
        const c = components.find((x) => x.id === id || x.name.toLowerCase() === id);
        lines = c
          ? componentLines(c, ctx)
          : [
              { text: `No component named "${value}".`, kind: "muted" },
              { text: `Available: ${components.map((x) => x.id).join(", ")}`, kind: "muted" },
            ];
      } else if (tool === "search_docs") {
        args = `{ "query": "${value}" }`;
        const q = value.toLowerCase();
        const openGap =
          /load|spinner/.test(q) && !resolved.includes("q-loading")
            ? "q-loading"
            : /nest/.test(q) && !resolved.includes("q-nesting")
              ? "q-nesting"
              : undefined;
        if (openGap) {
          const question = questions.find((x) => x.id === openGap)!;
          gap = openGap;
          lines = [
            { text: "No section answers this.", kind: "h2" },
            { text: "" },
            {
              text: `Logged as an unanswered question (asked ${question.count + 1} times this week).`,
              kind: "muted",
            },
            { text: "The agent falls back to guessing until someone documents it.", kind: "muted" },
          ];
        } else {
          const hits = searchDocs(value, ctx, saved);
          lines = hits.length
            ? hits.flatMap((h, i) => [
                ...(i ? [{ text: "" }] : []),
                { text: `## ${h.heading}`, kind: "h2" as const },
                { text: `source: ${h.source}`, kind: "meta" as const },
                { text: h.text },
              ])
            : [{ text: "No matches.", kind: "muted" }];
        }
      } else if (tool === "check_usage") {
        args = `{ "code": "…${value.split("\n").length} lines" }`;
        const issues = checkUsage(value);
        lines = issues.length
          ? [
              { text: `${issues.length} problem${issues.length > 1 ? "s" : ""} found`, kind: "h2" },
              { text: "" },
              ...issues.flatMap((x) => [
                { text: `line ${x.line}  ${x.rule}`, kind: "dont" as const },
                { text: `  ${x.message}` },
              ]),
            ]
          : [{ text: "No problems found against 14 rules.", kind: "do" }];
      } else {
        const g = value.trim().toLowerCase();
        args = `{ "category": "${g}" }`;
        lines = tokenLines(["color", "type", "space", "radius"].includes(g) ? g : undefined);
      }
      setResult({ request: `${tool} ${args}`, lines, gap });
      setRunning(false);
    }, 420);
  };

  // Show the first tool's payload as soon as the page opens.
  const started = React.useRef(false);
  React.useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
  });

  const tool = current;
  return (
    <div className="grid overflow-hidden rounded-xl border md:grid-cols-[15rem_minmax(0,1fr)]">
      <div
        role="tablist"
        aria-label="Tools"
        aria-orientation="vertical"
        className="grid content-start divide-y border-b bg-muted/30 md:border-r md:border-b-0"
      >
        <p className="flex justify-between gap-3 px-4 py-2 text-xs text-muted-foreground">
          <span>Tool</span>
          <span>Calls this week</span>
        </p>
        {agentStats.tools.map((t) => {
          const on = t.name === tool;
          return (
            <button
              key={t.name}
              type="button"
              role="tab"
              aria-selected={on}
              onClick={() => pick(t.name)}
              className={cn(
                "grid gap-1 px-4 py-3 text-left transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
                on ? "bg-background" : "hover:bg-muted/60",
              )}
            >
              <span className="flex items-baseline justify-between gap-3">
                <code
                  className={cn(
                    "font-mono text-[13px]",
                    on ? "font-semibold" : "text-foreground/80",
                  )}
                >
                  {t.name}
                </code>
                <span className="text-xs text-muted-foreground tabular">
                  {t.count.toLocaleString()}
                </span>
              </span>
              <span className="hidden text-[13px] leading-snug text-pretty text-muted-foreground md:block">
                {t.description}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex min-w-0 flex-col">
        <div className="grid gap-3 border-b p-3 sm:p-4">
          <div className="flex flex-col gap-2 sm:flex-row">
            {tool === "check_usage" ? (
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                spellCheck={false}
                aria-label="Code to check"
                className="min-h-24 flex-1 font-mono text-[12.5px] md:text-[12.5px]"
              />
            ) : (
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && run()}
                className="flex-1 font-mono text-[13px] md:text-[13px]"
                aria-label="Tool input"
              />
            )}
            <Button
              onClick={() => run()}
              disabled={running || !input.trim()}
              className="self-start"
            >
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
                    setInput(c);
                    run(c);
                  }}
                  className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-foreground/80 transition-colors outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {c}
                </button>
              ))}
            </div>
          )}
        </div>
        {/* The payload fills the rest of the object, flush, so there's no box inside a box. */}
        {result ? (
          <AgentPane
            request={
              <>
                <span className="text-muted-foreground">mcp</span> {result.request}
              </>
            }
            lines={result.lines}
            className="flex-1 rounded-none border-0"
            bodyClassName="h-[26rem]"
          />
        ) : (
          <div className="grid h-[calc(26rem+2.5rem)] place-items-center text-sm text-muted-foreground">
            {running ? <Spinner /> : "Run the call to see what the agent receives."}
          </div>
        )}
        {result?.gap && (
          <div className="border-t p-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(`edit-${questions.find((q) => q.id === result.gap)?.fileId}`)}
            >
              Write the answer
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function listOf(names: string[]) {
  return names.length > 1
    ? `${names.slice(0, -1).join(", ")}, and ${names[names.length - 1]}`
    : names[0];
}

export function Agents() {
  const { resolved, publishing } = useStore();
  const total = agentStats.week.reduce((a, b) => a + b, 0);
  const max = Math.max(...agentStats.week);
  const open = questions.filter((q) => q.status === "gap" && !resolved.includes(q.id)).length;
  const endpoints = [
    {
      label: "MCP server",
      value: workspace.mcp,
      note: publishing.mcpToken ? "Token required" : "Public, read only",
      on: publishing.mcp,
    },
    { label: "llms.txt", value: workspace.llms, note: "Index of every page", on: publishing.llms },
    {
      label: "Markdown pages",
      value: `https://${workspace.site}/components/button.md`,
      note: "Add .md to any page URL",
      on: publishing.markdown,
    },
  ];

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Agents"
        description={`${total.toLocaleString()} requests this week from ${listOf(agentStats.clients.map((c) => c.name))}.`}
        actions={
          <Button
            variant="outline"
            onClick={async () => {
              if (await copyText(workspace.mcp))
                toast.add({ title: "MCP endpoint copied", description: workspace.mcp });
            }}
          >
            <CopyIcon />
            Copy MCP endpoint
          </Button>
        }
      />

      {/* What agents can call and what they get on the left. Where to reach it and how much it's used on the right. */}
      <div className="mt-10 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="grid min-w-0 content-start gap-14">
          <Section title="Tools" aside={<span>Pick one to see what an agent receives</span>}>
            <ToolConsole />
          </Section>

          <Section title="Connect a client">
            <Tabs defaultValue="claude" className="min-w-0">
              <TabsList className="max-w-full justify-start overflow-x-auto [scrollbar-width:none]">
                {SETUP.map((s) => (
                  <TabsTrigger key={s.id} value={s.id}>
                    {s.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {SETUP.map((s) => (
                <TabsContent key={s.id} value={s.id} className="min-w-0">
                  <CodeBlock
                    code={s.code}
                    header={<span className="font-mono">{s.file}</span>}
                    wrap={s.id === "agents-md" || s.id === "claude"}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </Section>

          <Section
            title="Questions"
            aside={
              <span className="tabular">{open ? `${open} without an answer` : "All answered"}</span>
            }
          >
            <QuestionList />
          </Section>

          <Section
            title="llms.txt"
            aside={
              <code className="font-mono text-xs">{workspace.llms.replace("https://", "")}</code>
            }
          >
            <CodeBlock
              code={llmsTxt({ resolved })}
              header={<span>Rebuilt on every push</span>}
              wrap
              className="[&_pre]:max-h-80"
            />
          </Section>
        </div>

        <SideRail>
          <RailBlock
            title="Endpoints"
            aside={
              <a href="#workspace" className={linkClass}>
                Settings
              </a>
            }
          >
            <ul className="grid gap-3">
              {endpoints.map((e) => (
                <li key={e.label} className="flex items-start gap-1">
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-baseline gap-x-2 text-sm">
                      {e.label}
                      <span className="text-[13px] text-muted-foreground">
                        {e.on ? e.note : "Off"}
                      </span>
                    </p>
                    <p className="mt-0.5 truncate font-mono text-xs text-muted-foreground">
                      {e.value.replace("https://", "")}
                    </p>
                  </div>
                  <CopyButton text={e.value} label={`Copy ${e.label}`} />
                </li>
              ))}
            </ul>
          </RailBlock>

          <RailBlock title="This week">
            <p className="flex items-baseline gap-2">
              <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                {total.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground">requests</span>
            </p>
            <div
              className="mt-4 flex h-24 items-end gap-1"
              role="img"
              aria-label={`Requests per day: ${agentStats.week.map((v, i) => `${agentStats.days[i]} ${v}`).join(", ")}`}
            >
              {agentStats.week.map((v, i) => (
                <div
                  key={i}
                  title={`${agentStats.days[i]}: ${v} requests`}
                  className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
                >
                  <div
                    className={cn(
                      "w-full rounded-t-[3px]",
                      i === agentStats.week.length - 1 ? "bg-foreground/80" : "bg-foreground/15",
                    )}
                    style={{ height: `${(v / max) * 100}%` }}
                  />
                  <span className="text-[11px] text-muted-foreground">{agentStats.days[i]}</span>
                </div>
              ))}
            </div>
          </RailBlock>

          <RailBlock title="Clients">
            <ul className="grid gap-1.5 text-sm">
              {agentStats.clients.map((c) => (
                <li
                  key={c.name}
                  className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.5rem] items-center gap-3"
                >
                  <span className="truncate">{c.name}</span>
                  <span className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                    <span
                      className="block h-full rounded-full bg-foreground/60"
                      style={{ width: `${c.share}%` }}
                    />
                  </span>
                  <span className="text-right text-muted-foreground tabular">{c.share}%</span>
                </li>
              ))}
            </ul>
          </RailBlock>
        </SideRail>
      </div>
    </div>
  );
}
