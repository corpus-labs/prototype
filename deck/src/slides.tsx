import {
  ArrowRight,
  Blocks,
  Bot,
  Check,
  CreditCard,
  Layers,
  Minus,
  Users,
} from "lucide-react";
import { Badge } from "./components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
} from "./components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { CorpusMark, Kicker, LinkSlot, ShotFrame, Slide, SlideHeading, Stat } from "./ui";
import overview from "./assets/shots/overview.png";
import buttonShot from "./assets/shots/component-button.png";
import agentsShot from "./assets/shots/agents.png";

/* 01 — Title */
function Title() {
  return (
    <Slide n={1} dark>
      <div className="flex h-full flex-col justify-between px-20 py-16">
        <div className="flex items-center gap-3">
          <CorpusMark duo className="size-7 text-neutral-50" />
          <span className="text-lg font-medium tracking-[-0.01em]">Corpus</span>
        </div>
        <div>
          <Kicker dark>IYA Ignite Grant · GenAI Category · Fall 2026</Kicker>
          <h1 className="mt-6 text-[68px] leading-[1.2] font-semibold tracking-[-0.035em]">
            One source of truth.
          </h1>
          <p className="mt-4 text-[30px] leading-snug font-medium tracking-[-0.015em] text-neutral-400">
            Two readers: <span className="text-neutral-50">your team</span> and{" "}
            <span className="text-emerald-400">your AI agents</span>.
          </p>
          <p className="mt-6 max-w-xl text-[16px] leading-relaxed text-neutral-500">
            An affordable, self-hosted docs platform: write in Markdown, publish for
            your team, and plug the same pages into any AI agent or customer-support
            bot. Owned, not rented.
          </p>
        </div>
        <div className="flex items-end justify-between font-mono text-[11px] tracking-[0.14em] text-neutral-600 uppercase">
          <span>[ Your name ] · USC graduate student · Spring 2027</span>
          <span>November 2026</span>
        </div>
      </div>
    </Slide>
  );
}

/* 02 — Team */
function Team() {
  const points = [
    {
      icon: Bot,
      head: "Agent-leveraged build",
      what: "The prototype — 12,254 lines, 44 tests — was built solo with AI coding agents. The product's thesis, applied to itself.",
    },
    {
      icon: Blocks,
      head: "Open-source core",
      what: "Milkdown editor, React, Tailwind — proven parts assembled, not reinvented.",
    },
    {
      icon: Users,
      head: "One mentor ask",
      what: "An IYA mentor in dev-tools or go-to-market to pressure-test the launch plan.",
    },
  ];
  return (
    <Slide n={2}>
      <div className="flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="01 · Team"
          title="Solo founder, agent-leveraged."
        />
        <div className="mt-12 grid flex-1 grid-cols-2 gap-14">
          <Card className="justify-start shadow-none">
            <CardHeader>
              <div className="flex items-center gap-3">
                <CorpusMark className="size-5 text-neutral-950" />
                <span className="text-[26px] font-semibold tracking-[-0.02em]">
                  [ Your name ]
                </span>
              </div>
              <p className="text-[15px] text-neutral-500">
                USC graduate student · graduating Spring 2027 · enrolled Fall 26 –
                Spring 27
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                {["Product", "Design", "Engineering"].map((r) => (
                  <Badge key={r} variant="secondary" className="font-mono text-[11px]">
                    {r}
                  </Badge>
                ))}
              </div>
              <p className="mt-4 text-[14px] leading-relaxed text-neutral-500">
                No hires planned — the grant goes entirely to market validation
                (slide 09). One person ships; the budget buys distribution.
              </p>
            </CardContent>
          </Card>
          <div className="flex flex-col justify-center gap-8">
            <p className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
              Why solo works
            </p>
            {points.map((h) => (
              <div key={h.head} className="flex items-start gap-4">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <h.icon className="size-4.5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-[15px] font-medium">{h.head}</p>
                  <p className="mt-1 text-[13.5px] leading-relaxed text-neutral-500">{h.what}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 03 — Problem */
function Problem() {
  const pains = [
    {
      icon: CreditCard,
      head: "Docs are rented, not owned",
      body: "Mintlify starts at $399/mo and hosts your knowledge for you. Stop paying — or leave — and it's gone.",
    },
    {
      icon: Layers,
      head: "Knowledge fragments everywhere",
      body: "Notes in Obsidian, docs in someone's cloud, answers buried in Slack. No single place, no single format.",
    },
    {
      icon: Bot,
      head: "AI agents starve for context",
      body: "Coding agents and support bots get hand-copied rules — CLAUDE.md, AGENTS.md, .cursorrules — one per harness, always stale.",
    },
  ];
  const fragments = ["CLAUDE.md", "AGENTS.md", ".cursorrules", "notion", "readme.md", "slack"];
  return (
    <Slide n={3}>
      <div className="flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="02 · Problem"
          title="Documentation now has two readers. Every existing tool serves one."
        />
        <div className="mt-12 grid flex-1 grid-cols-[1.25fr_1fr] gap-16">
          <div className="flex flex-col justify-center gap-9">
            {pains.map((p) => (
              <div key={p.head} className="flex items-start gap-4">
                <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-neutral-100">
                  <p.icon className="size-4.5 text-neutral-700" />
                </div>
                <div>
                  <p className="text-[16px] font-medium">{p.head}</p>
                  <p className="mt-1 max-w-md text-[13.5px] leading-relaxed text-neutral-500">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-start justify-center">
            <span className="rounded-lg bg-neutral-950 px-3.5 py-2 font-mono text-[11px] tracking-[0.08em] text-neutral-50">
              one design system
            </span>
            <span className="ml-[26px] h-7 w-px bg-neutral-300" />
            <div className="flex flex-col gap-2">
              {fragments.map((f, i) => (
                <span
                  key={f}
                  className="rounded-md border border-dashed border-neutral-300 px-3 py-1.5 font-mono text-[11px] text-neutral-400"
                  style={{ marginLeft: `${(i % 3) * 22}px` }}
                >
                  {f}
                </span>
              ))}
            </div>
            <p className="mt-4 ml-1 text-[12.5px] text-neutral-400 italic">
              N hand-made copies, none authoritative
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 04 — Solution */
function Solution() {
  return (
    <Slide n={4}>
      <div className="flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="03 · Solution"
          title="Corpus renders one source for every reader."
        />
        <div className="mt-14 flex flex-1 items-center gap-7">
          <div className="w-80 rounded-xl border border-neutral-200 p-6">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-neutral-400 uppercase">
              Your markdown
            </p>
            <p className="mt-3 text-[14.5px] leading-relaxed font-medium">
              Docs, notes, knowledge base — written in the built-in editor
            </p>
            <p className="mt-3 text-[13px] leading-relaxed text-neutral-500">
              Plain files in your repo. Git-friendly, diffable, no lock-in.
            </p>
          </div>
          <ArrowRight className="size-7 shrink-0 text-neutral-300" />
          <div className="flex w-56 flex-col items-center rounded-xl bg-neutral-950 px-6 py-8 text-neutral-50">
            <CorpusMark duo className="size-10" />
            <p className="mt-3 text-[15px] font-medium">Corpus</p>
            <p className="mt-1 font-mono text-[10.5px] tracking-[0.14em] text-neutral-500 uppercase">
              one pipeline
            </p>
          </div>
          <ArrowRight className="size-7 shrink-0 text-neutral-300" />
          <div className="flex flex-1 flex-col gap-5">
            <div className="rounded-xl border border-neutral-300 p-5">
              <p className="font-mono text-[10.5px] tracking-[0.16em] text-neutral-500 uppercase">
                People
              </p>
              <p className="mt-2 text-[14px] leading-relaxed">
                Docs site — write, publish, search: handbooks, product docs, support
                articles
              </p>
            </div>
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/50 p-5">
              <p className="font-mono text-[10.5px] tracking-[0.16em] text-emerald-700 uppercase">
                Agents
              </p>
              <p className="mt-2 text-[14px] leading-relaxed">
                llms.txt · per-page Markdown &amp; JSON · MCP tools — any harness or
                support bot
              </p>
            </div>
          </div>
        </div>
        <p className="mt-2 text-[13.5px] text-neutral-500">
          Plug into Cursor, Claude Code, Z.ai, Copilot — or a customer-support bot.
          No parallel copies, nothing to keep in sync. Design-system docs arrive
          later, on the same pipeline.
        </p>
      </div>
    </Slide>
  );
}

/* 05 — The product today */
function Today() {
  return (
    <Slide n={5}>
      <div className="flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="04 · The product today"
          title="A working prototype, not a mockup."
        />
        <div className="mt-9 flex justify-between">
          <Stat value="12,254" label="lines of TypeScript" />
          <Stat value="44" label="tests passing" />
          <Stat value="10" label="screens" />
          <Stat value="1" label="self-contained build file" />
        </div>
        <div className="mt-8 flex-1">
          <ShotFrame
            src={overview}
            url="corpus.local/#overview"
            label="Live prototype — sample workspace: a component library documented end to end"
            imgClassName="max-h-[240px]"
          />
        </div>
        <div className="mt-4 flex items-center gap-3">
          <span className="font-mono text-[11px] tracking-[0.16em] text-neutral-400 uppercase">
            demo
          </span>
          <LinkSlot label="[ add deployed url ]" />
          <span className="font-mono text-[11px] tracking-[0.16em] text-neutral-400 uppercase">
            repo
          </span>
          <LinkSlot label="[ add github url ]" />
        </div>
      </div>
    </Slide>
  );
}

/* 06 — One source, two readers */
function TwoReaders() {
  return (
    <Slide n={6}>
      <div className="flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="05 · One source, two readers"
          title="The same Button doc, rendered per reader."
        />
        <div className="mt-8 grid flex-1 grid-cols-2 gap-8">
          <ShotFrame
            src={buttonShot}
            url="corpus.local/#component-button"
            label="People — documentation view"
            imgClassName="max-h-[300px]"
          />
          <ShotFrame
            src={agentsShot}
            url="corpus.local/#agents"
            label="Agents — the same content as structured payloads"
            accent
            imgClassName="max-h-[300px]"
          />
        </div>
        <p className="mt-5 text-[13.5px] text-neutral-500">
          Identical source content. Agents get llms.txt, Markdown, JSON and token
          exports today — MCP tools in Phase 3.
        </p>
      </div>
    </Slide>
  );
}

/* 07 — Positioning */
function Positioning() {
  const rows = [
    { tool: "Mintlify", people: true, agents: false, selfHosted: false, price: "from $399/mo" },
    { tool: "Notion", people: true, agents: false, selfHosted: false, price: "per-seat / mo" },
    { tool: "Obsidian", people: "personal", agents: false, selfHosted: true, price: "free — local only" },
    { tool: "Rules files", people: false, agents: "manual", selfHosted: true, price: "free — chaotic" },
    { tool: "Corpus", people: true, agents: "generated", selfHosted: true, price: "$99 once*", corpus: true },
  ];
  const mark = (v: boolean | string, corpus = false) => {
    if (v === true) return <Check className="size-4 text-emerald-500" />;
    if (v === false) return <Minus className={corpus ? "size-4 text-neutral-600" : "size-4 text-neutral-300"} />;
    return <span className="font-mono text-[11.5px] text-neutral-500">{v}</span>;
  };
  return (
    <Slide n={7}>
      <div className="flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="06 · Where Corpus sits"
          title="Owned docs that people and agents both read — nobody else does both."
        />
        <div className="mt-9 flex-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10" />
                <TableHead className="h-10 font-mono text-[10.5px] tracking-[0.14em] uppercase">People docs</TableHead>
                <TableHead className="h-10 font-mono text-[10.5px] tracking-[0.14em] uppercase">Agent outputs</TableHead>
                <TableHead className="h-10 font-mono text-[10.5px] tracking-[0.14em] uppercase">Self-hosted</TableHead>
                <TableHead className="h-10 font-mono text-[10.5px] tracking-[0.14em] uppercase">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.tool}
                  className={
                    r.corpus
                      ? "bg-neutral-950 border-neutral-950 text-neutral-50 hover:bg-neutral-950 [&>td]:border-neutral-800"
                      : ""
                  }
                >
                  <TableCell className="py-3.5 text-[14px] font-medium">
                    {r.corpus ? (
                      <span className="inline-flex items-center gap-2">
                        <CorpusMark duo className="size-4" /> Corpus
                      </span>
                    ) : (
                      r.tool
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">{mark(r.people, r.corpus)}</TableCell>
                  <TableCell className="py-3.5">{mark(r.agents, r.corpus)}</TableCell>
                  <TableCell className="py-3.5">{mark(r.selfHosted, r.corpus)}</TableCell>
                  <TableCell className={`py-3.5 font-mono text-[12.5px] ${r.corpus ? "text-emerald-400" : "text-neutral-500"}`}>
                    {r.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-[12px] text-neutral-400">
          *Planned launch pricing. Competitor prices from vendor sites, Nov 2026.
          &ldquo;Rules files&rdquo; = hand-maintained CLAUDE.md / AGENTS.md /
          .cursorrules.
        </p>
      </div>
    </Slide>
  );
}

/* 08 — Roadmap */
function Roadmap() {
  const phases = [
    {
      when: "Nov 2026",
      title: "Prototype + tests",
      body: "Working editor, agent views, 44 tests. You are looking at it.",
      done: true,
    },
    {
      when: "Dec 2026",
      title: "Content on disk",
      body: "Markdown files + server: edit anywhere, live reload, git-friendly.",
    },
    {
      when: "Jan 2027",
      title: "Agents, first class",
      body: "MCP server, llms.txt, per-page payloads, usage log.",
    },
    {
      when: "Spring 2027",
      title: "Launch + Showcase",
      body: "Landing page, X ad campaign, private beta, IYA Venture Showcase.",
    },
  ];
  return (
    <Slide n={8}>
      <div className="flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="07 · Roadmap"
          title="Phased build — every phase gated by a “done when” check."
        />
        <div className="relative mt-16 flex-1">
          <span className="absolute top-[5px] right-0 left-0 h-px bg-neutral-200" />
          <div className="grid grid-cols-4 gap-10">
            {phases.map((p) => (
              <div key={p.title} className="relative pt-7">
                <span
                  className={`absolute top-0 left-0 size-[11px] rounded-full border-2 border-white ${
                    p.done ? "bg-emerald-500" : "bg-neutral-300 outline outline-neutral-200"
                  }`}
                />
                <p className="font-mono text-[11px] tracking-[0.16em] text-neutral-400 uppercase">
                  {p.when}
                </p>
                <p className="mt-2 flex items-center gap-2 text-[16px] font-medium">
                  {p.title}
                  {p.done ? (
                    <Badge className="bg-emerald-500 text-[9.5px] text-white hover:bg-emerald-500">
                      shipped
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-2 text-[13px] leading-relaxed text-neutral-500">{p.body}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[12.5px] text-neutral-400">
          The full phase plan, with acceptance checks per phase, lives in the repo
          (PLAN.md).
        </p>
      </div>
    </Slide>
  );
}

/* 09 — Use of proceeds */
function Proceeds() {
  const items = [
    ["X ad campaign", "$2,250", "Sponsored posts aimed at developers, indie hackers and AI-tooling buyers, driving to the landing page"],
    ["Landing page + email", "$300", "Domain, hosting, and email-capture / automation tooling"],
    ["Creative testing", "$450", "Ad variants and retargeting, reallocated by measured CPC and CTR"],
  ];
  const byMarch = [
    "2,000+ landing-page visits from paid",
    "500+ waitlist emails collected",
    "50-user private beta from the waitlist",
    "First $99 sales — real CPC and conversion data",
  ];
  return (
    <Slide n={9}>
      <div className="flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="08 · Use of proceeds"
          title="No hires. $3,000 buys distribution and real market data."
        />
        <div className="mt-10 grid flex-1 grid-cols-[1.3fr_1fr] gap-14">
          <Table>
            <TableBody>
              {items.map(([what, cost, detail]) => (
                <TableRow key={what} className="border-neutral-100">
                  <TableCell className="py-4 pl-0">
                    <p className="text-[14.5px] font-medium">{what}</p>
                    <p className="mt-0.5 text-[12.5px] text-neutral-500">{detail}</p>
                  </TableCell>
                  <TableCell className="py-4 pr-0 text-right font-mono text-[13px] whitespace-nowrap tabular">
                    {cost}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="border-neutral-950">
                <TableCell className="py-4 pl-0 text-[14.5px] font-semibold">
                  Total
                </TableCell>
                <TableCell className="py-4 pr-0 text-right font-mono text-[14px] font-semibold tabular">
                  $3,000
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
          <div className="flex flex-col justify-center gap-5">
            <p className="font-mono text-[11px] tracking-[0.18em] text-neutral-400 uppercase">
              Targets by March
            </p>
            {byMarch.map((b) => (
              <div key={b} className="flex items-start gap-3">
                <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                <p className="text-[14px] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="mt-2 text-[12px] text-neutral-400">
          Targets, not results — the campaign exists to buy real conversion data
          (CPC, email rate, sales) before the IYA Venture Showcase.
        </p>
      </div>
    </Slide>
  );
}

/* 10 — Close */
function Close() {
  return (
    <Slide n={10} dark>
      <div className="flex h-full flex-col items-center justify-center gap-7 px-20 text-center">
        <CorpusMark duo className="size-16" />
        <h2 className="max-w-3xl text-[52px] leading-[1.22] font-semibold tracking-[-0.03em] text-balance">
          Documentation your agents actually follow.
        </h2>
        <p className="max-w-xl text-[16px] leading-relaxed text-neutral-400">
          One source of truth for people and agents. Self-hosted. Markdown-native.
          $99.
        </p>
        <div className="mt-2 flex items-center gap-3 font-mono text-[11px] tracking-[0.14em] text-neutral-600 uppercase">
          <span>[ demo url ]</span>
          <span>·</span>
          <span>[ github url ]</span>
          <span>·</span>
          <span>[ your name ] · IYA Ignite Grant · November 2026</span>
        </div>
      </div>
    </Slide>
  );
}

export const SLIDES = [Title, Team, Problem, Solution, Today, TwoReaders, Positioning, Roadmap, Proceeds, Close];
