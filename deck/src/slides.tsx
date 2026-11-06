import { Check, FileText, Minus, Server } from "lucide-react";
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
import editorShot from "./assets/shots/editor.png";
import buttonShot from "./assets/shots/component-button.png";
import agentsShot from "./assets/shots/agents.png";
import openaiLogo from "./assets/logos/openai.svg";
import anthropicLogo from "./assets/logos/anthropic.svg";
import cursorLogo from "./assets/logos/cursor.svg";
import figmaLogo from "./assets/logos/figma.svg";
import notionLogo from "./assets/logos/notion.svg";
import slackLogo from "./assets/logos/slack.svg";
import mintlifyLogo from "./assets/logos/mintlify.svg";
import gitbookLogo from "./assets/logos/gitbook.svg";
import obsidianLogo from "./assets/logos/obsidian.svg";

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
            One source of truth
            <Stop />
          </h1>
          <p className="mt-5 text-[29px] leading-snug font-medium tracking-[-0.015em] text-neutral-400">
            Two readers: <span className="text-neutral-50">your team</span> and{" "}
            <span className="text-emerald-400">your AI agents</span>.
          </p>
          <p className="mt-7 max-w-xl text-[15.5px] leading-relaxed text-neutral-500">
            A context control plane for small teams and solo builders: capture knowledge in a
            familiar editor, publish it as your docs, and connect every agent and support bot —
            live, via MCP and marketplace apps. Owned, not rented.
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
                <span className="text-[28px] font-semibold tracking-[-0.02em]">[ Your name ]</span>
              </div>
              <p className="mt-3 text-[14.5px] text-neutral-500">
                USC graduate student · graduating Spring 2027 · enrolled Fall 26 – Spring 27
              </p>
              <div className="mt-5 flex gap-2">
                {["Product", "Design", "Engineering"].map((r) => (
                  <Badge key={r} variant="secondary" className="font-mono text-[10.5px]">
                    {r}
                  </Badge>
                ))}
              </div>
              <p className="mt-5 border-t border-neutral-200 pt-4 text-[13.5px] leading-relaxed text-neutral-500">
                No hires planned — the grant goes entirely to market validation (slide 09). One
                person ships; the budget buys distribution.
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
      head: "Docs are rented — or raw",
      body: "Mintlify's agent features jump from $0 to $450/mo, and self-hosting is enterprise-only. The free route is markdown files and a git repo. Neither works for everyone.",
    },
    {
      head: "Knowledge fragments everywhere",
      body: "Notes stay personal in Obsidian — publishing is a paid, hosted add-on — docs sit in someone else's cloud, answers rot in Slack.",
    },
    {
      head: "Agents have protocols, not a source",
      body: "MCP servers and marketplace apps are how harnesses consume context now. But a protocol needs a home to point at — and yours is split across tools that each hold a slice.",
    },
  ];
  const leaves: [string, number, number][] = [
    [anthropicLogo, 250, 0],
    [openaiLogo, 262, 58],
    [cursorLogo, 246, 116],
    [figmaLogo, 264, 174],
    [notionLogo, 248, 232],
    [slackLogo, 262, 290],
  ];
  const labels: Record<string, string> = {
    [anthropicLogo]: "session logs",
    [openaiLogo]: "threads",
    [cursorLogo]: "rules file",
    [figmaLogo]: "comments",
    [notionLogo]: "docs copy",
    [slackLogo]: "history",
  };
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
            <div className="relative h-[360px] w-[430px]">
              <svg viewBox="0 0 430 360" className="absolute inset-0" aria-hidden="true">
                {leaves.map(([, left, top]) => {
                  const y = top + 18;
                  return (
                    <path
                      key={`b${left}`}
                      d={`M132 180 C 196 180, ${left - 72} ${y}, ${left} ${y}`}
                      fill="none"
                      stroke="#d4d4d4"
                      strokeWidth="1.5"
                      strokeDasharray="6 5"
                      className="beam"
                    />
                  );
                })}
              </svg>
              <div className="absolute top-[158px] left-0 flex h-11 items-center gap-2 rounded-xl bg-neutral-950 px-4 text-neutral-50">
                <FileText className="size-3.5 text-neutral-400" />
                <span className="font-mono text-[11px] tracking-[0.06em]">your knowledge</span>
              </div>
              {leaves.map(([logo, left, top]) => (
                <div
                  key={logo}
                  className="absolute flex h-9 w-[168px] items-center gap-2.5 rounded-lg bg-white pr-3 pl-2.5 shadow-[0_2px_10px_rgb(0_0_0/0.07)] ring-1 ring-neutral-200"
                  style={{ left, top }}
                >
                  <img src={logo} alt="" className="size-3.5" />
                  <span className="font-mono text-[10px] text-neutral-500">
                    {labels[logo] ?? ""}
                  </span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] text-neutral-400 italic">
              Copies pushed out. Conversations trapped in.
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
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          dark
          kicker="03 · Solution"
          title="A context control plane: capture once, serve every reader."
        />
        <div className="mt-10 flex flex-1 items-center justify-between gap-6">
          {/* The editor */}
          <div className="w-[440px] shrink-0">
            <ShotFrame src={editorShot} url="corpus.local/#editor" imgClassName="max-h-[280px]" />
            <p className="mt-3.5 text-[13px] leading-relaxed text-neutral-400">
              Write in a familiar editor — headings, links, tables, no syntax to learn. Markdown
              lives underneath, invisible unless you want it.
            </p>
          </div>

          <svg width="56" height="12" viewBox="0 0 56 12" className="shrink-0" aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#525252" strokeWidth="1.5" />
            <path d="M48 1.5 L55 6 L48 10.5 Z" fill="#525252" />
          </svg>

          {/* Hub */}
          <div className="flex w-40 shrink-0 flex-col items-center rounded-2xl bg-neutral-900 px-6 py-7 ring-1 ring-neutral-700">
            <CorpusMark duo className="size-10" />
            <p className="mt-3 text-[15px] font-medium">Corpus</p>
            <p className="mt-1 font-mono text-[10px] tracking-[0.16em] text-neutral-500 uppercase">
              control plane
            </p>
          </div>

          <svg width="56" height="12" viewBox="0 0 56 12" className="shrink-0" aria-hidden="true">
            <line x1="0" y1="6" x2="48" y2="6" stroke="#525252" strokeWidth="1.5" />
            <path d="M48 1.5 L55 6 L48 10.5 Z" fill="#525252" />
          </svg>

          {/* Outputs */}
          <div className="flex w-[400px] flex-col gap-5">
            <div className="rounded-2xl bg-neutral-900 p-6 ring-1 ring-neutral-700">
              <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-neutral-400 uppercase">
                <span className="size-1.5 rounded-full bg-neutral-200" />
                People
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-neutral-300">
                Published documentation + help desk — handbooks, product docs, support articles
              </p>
            </div>
            <div className="rounded-2xl bg-emerald-950/50 p-6 ring-1 ring-emerald-900">
              <p className="flex items-center gap-2 font-mono text-[10.5px] tracking-[0.16em] text-emerald-400 uppercase">
                <span className="size-1.5 rounded-full bg-emerald-400" />
                Agents + bots
              </p>
              <p className="mt-2.5 text-[14px] leading-relaxed text-emerald-100/90">
                Live over MCP and marketplace apps — agents read on demand; sessions sync back as
                knowledge
              </p>
            </div>
          </div>
        </div>
        <p className="mt-4 font-mono text-[11.5px] tracking-[0.02em] text-neutral-500">
          One home for ideas and organizational data. Same plane, next stops: shared conversations,
          shared components, design systems.
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
        <SlideHeading kicker="04 · The product today" title="A working prototype, not a mockup." />
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
              <LinkSlot label="github.com/corpus-labs/prototype" />
            </div>
          </div>
        </div>
      </div>
    </Slide>
  );
}

/* 06 — Write once, read everywhere */
function TwoReaders() {
  return (
    <Slide n={6}>
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="05 · Write once, read everywhere"
          title="Write it once — the editor handles the markdown."
        />
        <div className="mt-8 grid flex-1 grid-cols-3 gap-7">
          <ShotFrame
            src={editorShot}
            url="corpus.local/#editor"
            label="Write — no markdown required"
            imgClassName="max-h-[250px]"
          />
          <ShotFrame
            src={buttonShot}
            url="corpus.local/#component-button"
            label="People — published view"
            imgClassName="max-h-[250px]"
          />
          <ShotFrame
            src={agentsShot}
            url="corpus.local/#agents"
            label="Agents — structured payloads"
            dark
            accent
            imgClassName="max-h-[250px]"
          />
        </div>
        <p className="mt-5 text-[13.5px] text-neutral-500">
          One page, three surfaces: captured in the editor, published for people, emitted for agents
          — llms.txt, Markdown, JSON today; MCP tools in Phase 3.
        </p>
      </div>
    </Slide>
  );
}

/* 07 — Positioning */
function Positioning() {
  const rows = [
    {
      logo: mintlifyLogo,
      tool: "Mintlify",
      people: true,
      agents: "at $450/mo",
      selfHosted: false,
      price: "free · pro $450/mo",
    },
    {
      logo: gitbookLogo,
      tool: "GitBook",
      people: true,
      agents: false,
      selfHosted: false,
      price: "free (1) · $65/site/mo",
    },
    {
      logo: notionLogo,
      tool: "Notion",
      people: true,
      agents: false,
      selfHosted: false,
      price: "per-seat / mo",
    },
    {
      logo: obsidianLogo,
      tool: "Obsidian",
      people: "add-on",
      agents: "community",
      selfHosted: "local app",
      price: "free · publish $8/mo",
    },
    {
      logo: null,
      tool: "Memory MCPs",
      people: false,
      agents: "convos only",
      selfHosted: "varies",
      price: "$0–20/mo",
    },
    {
      logo: "corpus",
      tool: "Corpus",
      people: true,
      agents: "generated",
      selfHosted: true,
      price: "$99 once*",
      corpus: true,
    },
  ];
  const mark = (v: boolean | string, corpus = false) => {
    const inner =
      v === true ? (
        <Check className={corpus ? "size-4 text-emerald-400" : "size-4 text-emerald-500"} />
      ) : v === false ? (
        <Minus className={corpus ? "size-4 text-neutral-700" : "size-4 text-neutral-300"} />
      ) : (
        <span
          className={
            corpus
              ? "font-mono text-[11px] text-neutral-300"
              : "font-mono text-[11px] text-neutral-500"
          }
        >
          {v}
        </span>
      );
    return <span className="flex items-center justify-center">{inner}</span>;
  };
  const toolCell = (r: (typeof rows)[number]) => (
    <span className="flex items-center gap-3">
      <span
        className={
          r.corpus
            ? "flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-neutral-900 ring-1 ring-neutral-700"
            : "flex size-8 shrink-0 items-center justify-center rounded-[9px] bg-white shadow-[0_1px_4px_rgb(0_0_0/0.08)] ring-1 ring-neutral-200"
        }
      >
        {r.logo === "corpus" ? (
          <CorpusMark duo className="size-4" />
        ) : r.logo ? (
          <img src={r.logo} alt="" className="size-4" />
        ) : (
          <Server className="size-4 text-neutral-400" />
        )}
      </span>
      <span className={r.corpus ? "text-[15px] font-semibold" : "text-[14px] font-medium"}>
        {r.tool}
      </span>
    </span>
  );
  return (
    <Slide n={7}>
      <div className="relative flex h-full flex-col px-20 py-14">
        <SlideHeading
          kicker="06 · Where Corpus sits"
          title="Owned docs that people and agents both read — nobody else does both."
        />
        <div className="mt-9 flex-1">
          <Table className="[&_tr]:border-0">
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-10 px-3" />
                <TableHead className="h-10 px-3 text-center font-mono text-[9.5px] tracking-[0.14em] text-neutral-400 uppercase">
                  People docs
                </TableHead>
                <TableHead className="h-10 px-3 text-center font-mono text-[9.5px] tracking-[0.14em] text-neutral-400 uppercase">
                  Agent outputs
                </TableHead>
                <TableHead className="h-10 px-3 text-center font-mono text-[9.5px] tracking-[0.14em] text-neutral-400 uppercase">
                  Self-hosted
                </TableHead>
                <TableHead className="h-10 px-3 font-mono text-[9.5px] tracking-[0.14em] text-neutral-400 uppercase">
                  Price
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r) => (
                <TableRow
                  key={r.tool}
                  className={
                    r.corpus
                      ? "bg-neutral-950 text-neutral-50 hover:bg-neutral-950 [&>td:first-child]:rounded-l-xl [&>td]:px-3 [&>td:last-child]:rounded-r-xl"
                      : "hover:bg-transparent"
                  }
                >
                  <TableCell className="py-[15px] px-3">{toolCell(r)}</TableCell>
                  <TableCell className="py-[15px] px-3 text-center">
                    {mark(r.people, r.corpus)}
                  </TableCell>
                  <TableCell className="py-[15px] px-3 text-center">
                    {mark(r.agents, r.corpus)}
                  </TableCell>
                  <TableCell className="py-[15px] px-3 text-center">
                    {mark(r.selfHosted, r.corpus)}
                  </TableCell>
                  <TableCell className="py-[15px] px-3">
                    {r.corpus ? (
                      <span className="inline-block rounded-md bg-emerald-500/15 px-2.5 py-1 font-mono text-[11.5px] text-emerald-300">
                        {r.price}
                      </span>
                    ) : (
                      <span className="font-mono text-[12px] text-neutral-500">{r.price}</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="mt-4 text-[11px] leading-relaxed text-neutral-400">
          *Planned launch pricing. Prices from vendor sites, Nov 2026. Mintlify: Starter free (5
          editors); agent features from Pro, $450/mo annual; self-hosting is an Enterprise add-on.
          GitBook: free for one user, then $65/site + $12/user/mo. Obsidian: local and free; Publish
          ($8/mo) is hosted; agent access via community MCP plugins — local, single-user,
          unsupported. Memory MCPs store conversations — not published docs.
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
      body: "MCP server, first marketplace app, session sync-back, usage log.",
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
          The full phase plan, with acceptance checks per phase, lives in the repo (PLAN.md).
        </p>
      </div>
    </Slide>
  );
}

/* 09 — Use of proceeds */
function Proceeds() {
  const items = [
    [
      "X ad campaign",
      "$2,250",
      "Sponsored posts aimed at developers, indie hackers and AI-tooling buyers, driving to the landing page",
    ],
    ["Landing page + email", "$300", "Domain, hosting, and email-capture / automation tooling"],
    [
      "Creative testing",
      "$450",
      "Ad variants and retargeting, reallocated by measured CPC and CTR",
    ],
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
              <div
                key={what}
                className="flex items-baseline justify-between gap-8 border-b border-neutral-100 py-4"
              >
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
              Targets, not results — the campaign exists to buy real conversion data (CPC, email
              rate, sales) before the IYA Venture Showcase.
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
          Documentation your agents actually follow
          <Stop />
        </h2>
        <p className="max-w-lg text-[16px] leading-relaxed text-neutral-400">
          Docs, agent context, and support answers — from markdown you own. $99 once.
        </p>
        <div className="mt-3 flex items-center gap-3 border-t border-neutral-800 pt-6 font-mono text-[11px] tracking-[0.14em] text-neutral-600 uppercase">
          <span>[ demo url ]</span>
          <span>·</span>
          <span>github.com/corpus-labs/prototype</span>
          <span>·</span>
          <span>[ your name ] · IYA Ignite Grant · November 2026</span>
        </div>
      </div>
    </Slide>
  );
}

export const SLIDES = [
  Title,
  Team,
  Problem,
  Solution,
  Today,
  TwoReaders,
  Positioning,
  Roadmap,
  Proceeds,
  Close,
];
