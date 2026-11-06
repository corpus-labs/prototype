import { Check, Minus } from "lucide-react";
import { Badge } from "./components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./components/ui/table";
import { CorpusMark, Kicker, LinkSlot, ShotFrame, Slide, SlideHeading, Stat, Stop } from "./ui";
import overview from "./assets/shots/overview.png";
import buttonShot from "./assets/shots/component-button.png";
import agentsShot from "./assets/shots/agents.png";

/* 01 — Title */
function Title() {
  return (
    <Slide n={1} dark>
      <CorpusMark
        aria-hidden="true"
        className="absolute -right-28 -bottom-36 size-[560px] text-neutral-900"
      />
      <div className="relative flex h-full flex-col justify-between px-20 py-16">
        <div className="flex items-center gap-3">
          <CorpusMark duo className="size-7 text-neutral-50" />
          <span className="text-lg font-medium tracking-[-0.01em]">Corpus</span>
        </div>
        <div>
          <Kicker dark>IYA Ignite Grant · GenAI Category · Fall 2026</Kicker>
          <h1 className="mt-7 text-[76px] leading-[1.28] font-semibold tracking-[-0.035em]">
            One source of truth<Stop />
          </h1>
          <p className="mt-5 text-[29px] leading-snug font-medium tracking-[-0.015em] text-neutral-400">
            Two readers: <span className="text-neutral-50">your team</span> and{" "}
            <span className="text-emerald-400">your AI agents</span>.
          </p>
          <p className="mt-7 max-w-xl text-[15.5px] leading-relaxed text-neutral-500">
            An affordable, self-hosted docs platform for small teams and solo
            builders: write in Markdown, publish for your team, and plug the same
            pages into any AI agent or customer-support bot. Owned, not rented.
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
  const ledger = [
    {
      tag: "Agent-leveraged build",
      body: "The prototype — 12,254 lines, 44 passing tests — was built solo with AI coding agents. The product's thesis, applied to itself.",
    },
    {
      tag: "Open-source core",
      body: "Milkdown editor, React, Tailwind — proven parts assembled, not reinvented.",
    },
    {
      tag: "One mentor ask",
      body: "An IYA mentor in dev-tools or go-to-market to pressure-test the launch plan.",
    },
  ];
  return (
    <Slide n={2}>
      <div className="relative flex h-full flex-col px-20 py-16">
        <SlideHeading kicker="01 · Team" title="Solo founder, agent-leveraged." />
        <div className="mt-12 grid flex-1 grid-cols-2 gap-16">
          <div className="flex flex-col justify-center">
            <div className="rounded-2xl bg-neutral-50 p-9">
              <div className="flex items-center gap-3.5">
                <CorpusMark className="size-6 text-neutral-950" />
                <span className="text-[28px] font-semibold tracking-[-0.02em]">
                  [ Your name ]
                </span>
              </div>
              <p className="mt-3 text-[14.5px] text-neutral-500">
                USC graduate student · graduating Spring 2027 · enrolled Fall 26 –
                Spring 27
              </p>
              <div className="mt-5 flex gap-2">
                {["Product", "Design", "Engineering"].map((r) => (
                  <Badge key={r} variant="secondary" className="font-mono text-[10.5px]">
                    {r}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 border-t border-neutral-200 pt-4 text-[13.5px] leading-relaxed text-neutral-500">
                No hires planned — the grant goes entirely to market validation
                (slide 09). One person ships; the budget buys distribution.
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            {ledger.map((l, i) => (
              <div key={l.tag} className={i > 0 ? "border-t border-neutral-100 pt-6" : ""}>
                <p className="font-mono text-[10.5px] tracking-[0.18em] text-neutral-400 uppercase">
                  {l.tag}
                </p>
                <p className="mt-2 max-w-sm text-[14px] leading-relaxed">{l.body}</p>
                {i < ledger.length - 1 && <div className="h-6" />}
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
      head: "Docs are rented, not owned",
      body: "Mintlify starts at $399/mo and hosts your knowledge for you. Stop paying — or leave — and it's gone.",
    },
    {
      head: "Knowledge fragments everywhere",
      body: "Notes stay personal in Obsidian — publishing is a paid, hosted add-on — docs sit in someone else's cloud, answers rot in Slack.",
    },
    {
      head: "AI agents starve for context",
      body: "Coding agents and support bots get hand-copied rules — CLAUDE.md, AGENTS.md, .cursorrules — one per harness, always stale.",
    },
  ];
  const leaves: [string, number, number][] = [
    ["CLAUDE.md", 30, 128],
    ["AGENTS.md", 216, 128],
    [".cursorrules", 66, 222],
    ["notion", 252, 222],
    ["slack", 150, 312],
  ];
  return (
    <Slide n={3}>
      <div className="relative flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="02 · Problem"
          title="Documentation now has two readers. Every existing tool serves one."
        />
        <div className="mt-12 grid flex-1 grid-cols-[1.15fr_1fr] gap-16">
          <div className="flex flex-col justify-center gap-9">
            {pains.map((p, i) => (
              <div key={p.head} className="flex items-start gap-5">
                <span className="mt-0.5 w-8 shrink-0 font-mono text-[26px] leading-[1.15] font-medium text-neutral-200 tabular">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[16.5px] font-medium">{p.head}</p>
                  <p className="mt-1.5 max-w-md text-[13.5px] leading-relaxed text-neutral-500">
                    {p.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-center justify-center">
            <svg viewBox="0 0 380 380" className="w-full max-w-[380px]" aria-hidden="true">
              {leaves.map(([, x, y]) => (
                <path
                  key={`p${x}`}
                  d={`M190 62 Q190 ${(62 + y) / 2} ${x + 55} ${y}`}
                  fill="none"
                  stroke="#e5e5e5"
                  strokeWidth="1.5"
                />
              ))}
              <rect x="112" y="16" width="156" height="36" rx="9" fill="#0a0a0a" />
              <text
                x="190"
                y="39"
                textAnchor="middle"
                className="font-mono"
                fontSize="10.5"
                fill="#fafafa"
                letterSpacing="0.05em"
              >
                one knowledge base
              </text>
              {leaves.map(([label, x, y]) => (
                <g key={label}>
                  <rect
                    x={x}
                    y={y}
                    width="110"
                    height="32"
                    rx="7"
                    fill="#ffffff"
                    stroke="#d4d4d4"
                    strokeWidth="1.2"
                    strokeDasharray="4 3"
                  />
                  <text
                    x={x + 55}
                    y={y + 20}
                    textAnchor="middle"
                    className="font-mono"
                    fontSize="11"
                    fill="#a3a3a3"
                  >
                    {label}
                  </text>
                </g>
              ))}
            </svg>
            <p className="mt-4 text-[12.5px] text-neutral-400 italic">
              N hand-made copies, none authoritative
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 04 — Solution (dark centerpiece) */
function Solution() {
  return (
    <Slide n={4} dark>
      <div className="relative flex h-full flex-col px-20 py-16">
        <SlideHeading
          dark
          kicker="03 · Solution"
          title="Corpus renders one source for every reader."
        />
        <div className="mt-12 flex flex-1 items-center justify-between gap-6">
          {/* Stacked pages */}
          <div className="relative h-64 w-56 shrink-0">
            <div className="absolute top-4 left-5 h-full w-full rounded-xl bg-white/[0.03] ring-1 ring-neutral-800" />
            <div className="absolute top-2 left-2.5 h-full w-full rounded-xl bg-white/[0.05] ring-1 ring-neutral-800" />
            <div className="relative h-full w-full rounded-xl bg-neutral-900 p-5 ring-1 ring-neutral-700">
              <p className="font-mono text-[10px] tracking-[0.16em] text-neutral-500 uppercase">
                your markdown
              </p>
              <div className="mt-4 space-y-2.5 font-mono text-[11px] leading-none text-neutral-400">
                <p className="text-neutral-200"># Handbook</p>
                <p className="text-neutral-500">## Getting started</p>
                <p>install.md</p>
                <p>write.md</p>
                <p>publish.md</p>
                <p className="text-neutral-500">## Reference</p>
                <p>api.md</p>
                <p>faq.md</p>
              </div>
            </div>
          </div>

          <svg width="56" height="12" viewBox="0 0 56 12" className="shrink-0" aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#525252" strokeWidth="1.5" />
            <path d="M48 1.5 L55 6 L48 10.5 Z" fill="#525252" />
          </svg>

          {/* Hub */}
          <div className="flex w-44 shrink-0 flex-col items-center rounded-2xl bg-neutral-900 px-6 py-7 ring-1 ring-neutral-700">
            <CorpusMark duo className="size-10" />
            <p className="mt-3 text-[15px] font-medium">Corpus</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-neutral-500 uppercase">
              one pipeline
            </p>
          </div>

          <svg width="56" height="12" viewBox="0 0 56 12" className="shrink-0" aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#525252" strokeWidth="1.5" />
            <path d="M48 1.5 L55 6 L48 10.5 Z" fill="#525252" />
          </svg>

          {/* Outputs */}
          <div className="flex w-[420px] flex-col gap-5">
            <div className="rounded-2xl bg-neutral-900 p-6 ring-1 ring-neutral-700">
              <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-neutral-400 uppercase">
                <span className="size-1.5 rounded-full bg-neutral-200" />
                People
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-300">
                Docs site — write, publish, search: handbooks, product docs,
                support articles
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-950/50 p-6 ring-1 ring-emerald-900">
              <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-emerald-400 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Agents
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-emerald-100/90">
                llms.txt · per-page Markdown &amp; JSON · MCP tools — any harness
                or support bot
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11.5px] tracking-[0.02em] text-neutral-500">
          Cursor · Claude Code · Z.ai · Copilot · your support bot — no parallel
          copies, nothing to keep in sync. Design-system docs arrive later, on the
          same pipeline.
        </p>
      </div>
    </Slide>
  );
}

/* 05 — The product today */
function Today() {
  return (
    <Slide n={5}>
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="04 · The product today"
          title="A working prototype, not a mockup."
        />
        <div className="mt-9 grid flex-1 grid-cols-[1.55fr_1fr] gap-12">
          <ShotFrame
            src={overview}
            url="corpus.local/#overview"
            label="Sample workspace: a component library documented end to end"
            imgClassName="max-h-[300px]"
          />
          <div className="flex flex-col justify-between py-1">
            <Stat value="12,254" label="lines of TypeScript" />
            <Stat value="44" label="tests passing" size="md" rule />
            <Stat value="10" label="screens" size="md" rule />
            <Stat value="1" label="self-contained build" size="md" rule />
            <div className="flex flex-wrap items-center gap-2 border-t border-neutral-200 pt-4">
              <span className="font-mono text-[10.5px] tracking-[0.16em] text-neutral-400 uppercase">
                demo
              </span>
              <LinkSlot label="[ add url ]" />
              <span className="font-mono text-[10.5px] tracking-[0.16em] text-neutral-400 uppercase">
                repo
              </span>
              <LinkSlot label="[ add url ]" />
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 06 — One source, two readers */
function TwoReaders() {
  return (
    <Slide n={6}>
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="05 · One source, two readers"
          title="The same Button doc, rendered per reader."
        />
        <div className="mt-8 grid flex-1 grid-cols-2 gap-10">
          <ShotFrame
            src={buttonShot}
            url="corpus.local/#component-button"
            label="People — documentation view"
            imgClassName="max-h-[300px]"
          />
          <ShotFrame
            src={agentsShot}
            url="corpus.local/#agents"
            label="Agents — the same content, structured payloads"
            dark
            accent
            imgClassName="max-h-[300px] rounded-b-2xl"
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
    { tool: "Obsidian", people: "add-on", agents: false, selfHosted: "local app", price: "free · publish $8/mo" },
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
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="06 · Where Corpus sits"
          title="Owned docs that people and agents both read — nobody else does both."
        />
        <div className="mt-10 flex-1">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-neutral-300">
                <TableHead className="h-9" />
                <TableHead className="h-9 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">People docs</TableHead>
                <TableHead className="h-9 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">Agent outputs</TableHead>
                <TableHead className="h-9 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">Self-hosted</TableHead>
                <TableHead className="h-9 font-mono text-[10px] tracking-[0.14em] text-neutral-400 uppercase">Price</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.tool}
                  className={
                    r.corpus
                      ? "bg-neutral-950 border-neutral-950 text-neutral-50 hover:bg-neutral-950 [&>td]:border-neutral-800"
                      : "border-neutral-100"
                  }
                >
                  <TableCell className="py-4 text-[14px] font-medium">
                    {r.corpus ? (
                      <span className="inline-flex items-center gap-2.5">
                        <CorpusMark duo className="size-4" /> Corpus
                      </span>
                    ) : (
                      r.tool
                    )}
                  </TableCell>
                  <TableCell className="py-4">{mark(r.people, r.corpus)}</TableCell>
                  <TableCell className="py-4">{mark(r.agents, r.corpus)}</TableCell>
                  <TableCell className="py-4">{mark(r.selfHosted, r.corpus)}</TableCell>
                  <TableCell className={`py-4 font-mono text-[12.5px] ${r.corpus ? "text-emerald-400" : "text-neutral-500"}`}>
                    {r.price}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-[11.5px] leading-relaxed text-neutral-400">
          *Planned launch pricing. Competitor prices from vendor sites, Nov 2026.
          Obsidian: notes are free and local; Publish ($8/mo/site) and Sync
          ($4/mo) are hosted add-ons; commercial use $50/user/yr. &ldquo;Rules
          files&rdquo; = hand-maintained CLAUDE.md / AGENTS.md / .cursorrules.
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
      <div className="relative flex h-full flex-col px-20 py-16">
        <SlideHeading
          kicker="07 · Roadmap"
          title="Phased build — every phase gated by a “done when” check."
        />
        <div className="relative mt-16 flex-1">
          <span className="absolute top-[7px] right-0 left-0 h-[2px] bg-neutral-200" />
          <span className="absolute top-[7px] left-0 h-[2px] w-[25%] bg-emerald-500" />
          <div className="grid grid-cols-4 gap-10">
            {phases.map((p) => (
              <div key={p.title} className="relative pt-9">
                <span
                  className={
                    p.done
                      ? "absolute top-0 left-0 size-[15px] rounded-full bg-emerald-500 ring-4 ring-emerald-100"
                      : "absolute top-0 left-0 size-[15px] rounded-full border-[2.5px] border-neutral-300 bg-white"
                  }
                />
                <p
                  className={
                    p.done
                      ? "font-mono text-[11px] tracking-[0.16em] text-emerald-600 uppercase"
                      : "font-mono text-[11px] tracking-[0.16em] text-neutral-400 uppercase"
                  }
                >
                  {p.when}
                </p>
                <p className="mt-2 flex items-center gap-2 text-[16.5px] font-medium">
                  {p.title}
                  {p.done ? (
                    <Badge className="bg-emerald-500 text-[9.5px] text-white hover:bg-emerald-500">
                      shipped
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-2 max-w-[230px] text-[13px] leading-relaxed text-neutral-500">
                  {p.body}
                </p>
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
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="08 · Use of proceeds"
          title="No hires. $3,000 buys distribution and real market data."
        />
        <div className="mt-8 grid flex-1 grid-cols-[1.35fr_1fr] gap-16">
          <div className="flex flex-col justify-center">
            {items.map(([what, cost, detail]) => (
              <div key={what} className="flex items-baseline justify-between gap-8 border-b border-neutral-100 py-4">
                <div>
                  <p className="text-[15.5px] font-medium">{what}</p>
                  <p className="mt-0.5 max-w-[400px] text-[12.5px] leading-relaxed text-neutral-500">
                    {detail}
                  </p>
                </div>
                <p className="shrink-0 font-mono text-[24px] font-semibold tracking-[-0.02em] tabular">
                  {cost}
                </p>
              </div>
            ))}
            <div className="flex items-baseline justify-between border-t-2 border-neutral-950 pt-4">
              <p className="text-[16px] font-semibold">Total</p>
              <p className="font-mono text-[34px] leading-[1.2] font-semibold tracking-[-0.03em] tabular">
                $3,000
              </p>
            </div>
          </div>
          <div className="flex flex-col justify-center">
            <p className="font-mono text-[10.5px] tracking-[0.18em] text-neutral-400 uppercase">
              Targets by March
            </p>
            <div className="mt-5 space-y-4">
              {byMarch.map((b) => (
                <div key={b} className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-emerald-500" />
                  <p className="text-[14px] leading-relaxed">{b}</p>
                </div>
              ))}
            </div>
            <p className="mt-7 text-[11.5px] leading-relaxed text-neutral-400">
              Targets, not results — the campaign exists to buy real conversion
              data (CPC, email rate, sales) before the IYA Venture Showcase.
            </p>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 10 — Close */
function Close() {
  return (
    <Slide n={10} dark>
      <CorpusMark
        aria-hidden="true"
        className="absolute -top-32 -left-28 size-[520px] text-neutral-900"
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-7 px-20 text-center">
        <CorpusMark duo className="size-14" />
        <h2 className="max-w-3xl text-[54px] leading-[1.2] font-semibold tracking-[-0.03em] text-balance">
          Documentation your agents actually follow<Stop />
        </h2>
        <p className="max-w-lg text-[16px] leading-relaxed text-neutral-400">
          Docs, agent context, and support answers — from markdown you own. $99
          once.
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-neutral-800 pt-6 font-mono text-[11px] tracking-[0.14em] text-neutral-600 uppercase">
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
