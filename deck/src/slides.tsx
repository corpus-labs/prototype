import { Fragment, type ReactNode } from "react";
import { FACTS } from "./facts";
import { SplitView } from "./split-view";
import { cn } from "./lib/utils";
import { ToolLogo, type ToolId } from "./tool-logo";
import {
  CorpusLogo,
  CorpusMark,
  Dot,
  Fill,
  Lead,
  Mailto,
  Shot,
  Slide,
  Source,
  Title,
  Url,
} from "./ui";
import coverShot from "./assets/shots/cover-notebook.png";
import siteShot from "./assets/shots/traction-site.png";
import portrait from "./assets/portrait.jpg";

/* Shared pieces --------------------------------------------------------- */

/** Content area below the running header. */
function Body({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={cn("absolute inset-x-16 top-[108px] bottom-14", className)}>{children}</div>
  );
}

/** A label and value pair, like the product's Facts line, stacked. */
function Fact({ k, children, wide = false }: { k: string; children: ReactNode; wide?: boolean }) {
  return (
    <div
      className={cn(
        "grid items-baseline gap-4",
        wide ? "grid-cols-[132px_1fr]" : "grid-cols-[96px_1fr]",
      )}
    >
      <dt className="text-muted">{k}</dt>
      <dd>{children}</dd>
    </div>
  );
}

/* 1. Cover -------------------------------------------------------------- */

function Cover() {
  return (
    <Slide>
      <CorpusLogo className="absolute top-14 left-16 h-[30px]" />
      <div className="absolute top-[170px] left-16 w-[572px]">
        <h1 className="text-[56px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
          Own what your company knows. Use it with any AI.
        </h1>
        <p className="mt-6 text-[20px] leading-[1.45] text-pretty text-muted">
          One shared memory for every AI tool and teammate, including open-weight models. Your docs,
          help center, and support bot come from the same pages.
        </p>
      </div>
      <div className="absolute bottom-14 left-16 grid gap-1 text-[15px]">
        <p className="font-medium">Mitch Kostelecky</p>
        <p className="text-muted">USC Iovine Young Academy</p>
        <p className="text-muted">Ignite Grant, GenAI track, Fall 2026</p>
      </div>
      <Shot
        src={coverShot}
        alt="Editing the decision log in Corpus: a formatting toolbar, and the block menu opened under a heading"
        className="absolute top-[150px] bottom-0 left-[676px] w-[940px] rounded-b-none"
        imgClassName="h-full object-cover object-top-left"
      />
    </Slide>
  );
}

/* 2. Problem ------------------------------------------------------------ */

function Problem() {
  const pains: [string, string][] = [
    [
      "Personal",
      "Claude and ChatGPT remember one person. Your teammate’s AI doesn’t know what yours learned.",
    ],
    [
      "Locked in",
      "Switch to another AI, or to next year’s leader, and the memory stays with the old vendor.",
    ],
    [
      "Missing",
      "Open-weight models like DeepSeek and Qwen, and tools that store no user data, start every session blank.",
    ],
  ];
  return (
    <Slide section="Problem">
      <Body>
        <Title className="max-w-[960px]">
          The best AI tools remember you. That memory is locked inside one vendor.
        </Title>
        <div className="mt-11 grid grid-cols-[1fr_600px] gap-14">
          <ul className="self-start divide-y border-y">
            {pains.map(([head, body]) => (
              <li key={head} className="py-4">
                <p className="text-[18.5px] font-medium">{head}</p>
                <p className="mt-1 text-[16px] leading-[1.5] text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
          <MemoryTable />
        </div>
      </Body>
    </Slide>
  );
}

function MemoryTable() {
  const cols = ["Remembers", "Shared with your team", "Any AI can use it"];
  const rows: { name: string; has: Has[]; us?: boolean }[] = [
    { name: "Claude", has: ["yes", "part", "no"] },
    { name: "ChatGPT", has: ["yes", "part", "no"] },
    { name: "Open-weight models", has: ["no", "no", "no"] },
    { name: "Corpus", has: ["yes", "yes", "yes"], us: true },
  ];
  return (
    <figure className="self-start">
      <table className="w-full border-collapse text-[15px]">
        <thead>
          <tr className="border-b text-left text-[13.5px] text-muted">
            <th className="py-2.5 pr-3 pl-3 font-normal">Where memory lives</th>
            {cols.map((c) => (
              <th key={c} className="w-[124px] px-2 py-2.5 text-center font-normal leading-tight">
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className={cn("border-b", r.us && "border-b-0 bg-good-soft")}>
              <td className={cn("py-3 pr-3 pl-3", r.us ? "font-semibold" : "font-medium")}>
                {r.name}
              </td>
              {r.has.map((h, k) => (
                <td key={k} className="px-2 py-3 text-center">
                  <span className="inline-flex items-baseline gap-2">
                    <span className="self-center">
                      <Mark has={h} />
                    </span>
                    {HAS_LABEL[h]}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <Source className="mt-3 text-pretty">
        Partly: shared projects on team plans, with memory kept to that project. Claude can import a
        one-time copy of ChatGPT memory; the two don’t stay in sync. Open-weight models means the
        model itself, through an API or on your own server. Vendor help pages, November 2026. Corpus
        runs as a prototype.
      </Source>
    </figure>
  );
}

/* 3. Why now ------------------------------------------------------------ */

function WhyNow() {
  const shifts: [string, ReactNode, ReactNode][] = [
    [
      "Even big customers switch",
      "Revolut moved its developers from Claude to self-hosted Z.ai models and cut inference costs by up to 90%, it reported in November 2026.",
      <a
        href="https://www.techradar.com/pro/we-were-highly-skeptical-about-the-cost-of-ai-revolut-reveals-it-cut-ai-coding-costs-by-cutting-out-claude-entirely"
        target="_blank"
        rel="noreferrer"
        className="underline decoration-neutral-400 underline-offset-2 hover:text-ink"
      >
        Revolut, via TechRadar, November 4, 2026
      </a>,
    ],
    [
      "One plug fits all of them",
      "The Model Context Protocol (MCP) lets Claude, ChatGPT, Codex, Cursor, and VS Code read from the same outside source.",
      "Each vendor’s docs, November 2026",
    ],
    [
      "So knowledge has to outlive the model",
      "Write it once, somewhere you own, and point this year’s AI at it.",
      "",
    ],
  ];
  return (
    <Slide section="Why now">
      <Body>
        <Title className="max-w-[960px]">
          The AI leader changed in two years, and companies keep switching.
        </Title>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-[452px_1fr] items-end gap-16">
          <figure>
            <figcaption className="text-[15px] font-medium">
              Share of enterprise AI spend
            </figcaption>
            <ShareShift />
            <p className="mt-2 text-[14px] text-muted">
              Open-weight models: 19% of enterprise AI use, 4% of spend
            </p>
            <Source className="mt-1">
              Menlo Ventures, State of Enterprise AI, December 2025 and November 2026
            </Source>
          </figure>
          <ul className="divide-y border-y">
            {shifts.map(([head, body, source]) => (
              <li key={head} className="py-4">
                <p className="text-[18px] font-medium">{head}</p>
                <p className="mt-1 text-[15.5px] leading-[1.5] text-pretty text-muted">{body}</p>
                {source && <Source className="mt-1">{source}</Source>}
              </li>
            ))}
          </ul>
        </div>
      </Body>
    </Slide>
  );
}

/**
 * A three-point slope chart, with years spaced to scale. Direct labels carry
 * identity, so there's no legend.
 */
function ShareShift() {
  const years = [2023, 2025, 2026];
  const xs = [130, 263, 330];
  const y = (v: number) => 236 - (v / 60) * 216;
  const series = [
    {
      name: "OpenAI",
      values: [50, 27, 31],
      stroke: "stroke-neutral-400",
      fill: "fill-neutral-400",
    },
    { name: "Anthropic", values: [12, 40, 55], stroke: "stroke-ink", fill: "fill-ink" },
  ];
  const [openai, anthropic] = series;
  return (
    <svg viewBox="0 0 452 272" className="mt-3 w-full" role="img" aria-labelledby="share-desc">
      <desc id="share-desc">
        OpenAI went from 50% of enterprise AI spend in 2023 to 27% in 2025 and 31% in 2026.
        Anthropic went from 12% to 40% to 55%.
      </desc>
      {xs.map((x) => (
        <line key={x} x1={x} x2={x} y1={12} y2={244} className="stroke-line" />
      ))}
      {series.map((s) => (
        <g key={s.name}>
          <polyline
            points={s.values.map((v, i) => `${xs[i]},${y(v)}`).join(" ")}
            className={s.stroke}
            fill="none"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {s.values.map((v, i) => (
            <circle
              key={i}
              cx={xs[i]}
              cy={y(v)}
              r="5"
              className={s.fill}
              stroke="#fff"
              strokeWidth="2"
            />
          ))}
          <text
            x={xs[0] - 14}
            y={y(s.values[0])}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-ink text-[15px]"
          >
            {s.name} <tspan className="font-semibold">{s.values[0]}%</tspan>
          </text>
          <text
            x={xs[2] + 14}
            y={y(s.values[2])}
            dominantBaseline="middle"
            className="fill-ink text-[15px]"
          >
            <tspan className="font-semibold">{s.values[2]}%</tspan> {s.name}
          </text>
        </g>
      ))}
      {/* 2025 values sit where the lines leave room: Anthropic's above left, OpenAI's below. */}
      <text
        x={xs[1] - 10}
        y={y(anthropic.values[1]) - 12}
        textAnchor="end"
        className="fill-ink text-[13.5px] font-semibold"
      >
        {anthropic.values[1]}%
      </text>
      <text
        x={xs[1]}
        y={y(openai.values[1]) + 24}
        textAnchor="middle"
        className="fill-ink text-[13.5px] font-semibold"
      >
        {openai.values[1]}%
      </text>
      {years.map((yr, i) => (
        <text key={yr} x={xs[i]} y={266} textAnchor="middle" className="fill-muted text-[13px]">
          {yr}
        </text>
      ))}
    </svg>
  );
}

/* 4. Solution ----------------------------------------------------------- */

type JobId = "ai" | "support" | "docs" | "design";

/** The same job icons as the landing page (landing/src/App.tsx). */
const JOB_ICONS: Record<JobId, ReactNode> = {
  ai: (
    <>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2M20 14h2M15 13v2M9 13v2" />
    </>
  ),
  support: (
    <>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="4" />
      <path d="m4.93 4.93 4.24 4.24M14.83 9.17l4.24-4.24M14.83 14.83l4.24 4.24M9.17 14.83l-4.24 4.24" />
    </>
  ),
  docs: (
    <>
      <path d="M12 7v14" />
      <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
    </>
  ),
  design: (
    <>
      <path d="M15.54 11.29a1 1 0 0 0 0 1.42l2.37 2.37a1 1 0 0 0 1.42 0l2.37-2.37a1 1 0 0 0 0-1.42l-2.37-2.37a1 1 0 0 0-1.42 0z" />
      <path d="M2.3 11.29a1 1 0 0 0 0 1.42l2.37 2.37a1 1 0 0 0 1.42 0l2.37-2.37a1 1 0 0 0 0-1.42L6.09 8.92a1 1 0 0 0-1.42 0z" />
      <path d="M8.92 17.91a1 1 0 0 0 0 1.42l2.37 2.37a1 1 0 0 0 1.42 0l2.37-2.37a1 1 0 0 0 0-1.42l-2.37-2.37a1 1 0 0 0-1.42 0z" />
      <path d="M8.92 4.67a1 1 0 0 0 0 1.42l2.37 2.37a1 1 0 0 0 1.42 0l2.37-2.37a1 1 0 0 0 0-1.42l-2.37-2.37a1 1 0 0 0-1.42 0z" />
    </>
  ),
};

function JobIcon({ job }: { job: JobId }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {JOB_ICONS[job]}
    </svg>
  );
}

function Solution() {
  const jobs: [job: JobId, head: string, body: string, instead: string][] = [
    [
      "ai",
      "Memory for any AI",
      "Claude, ChatGPT, Codex, Cursor, and open-weight models recall what your team knows and save what they learn.",
      "memory locked in one vendor",
    ],
    [
      "support",
      "Support answers",
      "A support bot answers customers from the same pages your team already keeps.",
      "Zendesk AI, at $1.50 an answer",
    ],
    [
      "docs",
      "Docs and help center",
      "Publish public docs, a help center, or an internal handbook from the same pages.",
      "Mintlify or GitBook",
    ],
    [
      "design",
      "Design systems",
      "Components, tokens, and usage rules, with live previews for people and exact rules for agents.",
      "zeroheight",
    ],
  ];
  return (
    <Slide section="Solution">
      <Body>
        <Title className="max-w-[980px]">
          Corpus: shared memory that every AI tool and every teammate can use.
        </Title>
        <Lead className="max-w-[900px]">
          One library your company owns. Any AI recalls from it and saves to it, and the same pages
          publish as docs, a help center, and a support bot.
        </Lead>
        <div className="absolute inset-x-0 bottom-0">
          <div className="flex h-[60px] items-center gap-3 rounded-xl bg-ink px-5 text-white">
            <CorpusMark className="size-5" />
            <span className="text-[17px] font-semibold">Corpus library</span>
            <span className="text-[14.5px] text-neutral-400">
              Shared memory as Markdown files you own, hosted or on your server
            </span>
          </div>
          <ol className="grid grid-cols-4 gap-8">
            {jobs.map(([job, head, body, instead]) => (
              <li key={head}>
                {/* The line from the notebook runs into each job's icon. */}
                <span
                  className={cn("ml-5 block h-6 w-px", job === "ai" ? "bg-ink" : "bg-neutral-300")}
                />
                <span
                  className={cn(
                    "grid size-10 place-items-center rounded-xl border",
                    job === "ai" ? "border-ink bg-ink text-white" : "bg-white text-ink",
                  )}
                >
                  <JobIcon job={job} />
                </span>
                <div className="mt-4">
                  <p className="text-[18px] font-medium">{head}</p>
                  <p className="mt-1.5 text-[15px] leading-[1.5] text-pretty text-muted">{body}</p>
                  <p className="mt-3 text-[13.5px] leading-snug text-pretty">
                    <span className="text-muted">Instead of </span>
                    {instead}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Body>
    </Slide>
  );
}

/* 5. Plugins ------------------------------------------------------------ */

function Tile({ tile, className }: { tile: ToolId; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg border bg-subtle text-ink",
        className,
      )}
    >
      <ToolLogo id={tile} className="size-1/2" />
    </span>
  );
}

/** One fact, saved from one tool on Monday and recalled from another today. */
function SharedMemory() {
  const turn = (tile: ToolId, tool: string, when: string, ask: string, reply: ReactNode) => (
    <div className="grid gap-3 px-5 py-4">
      <p className="flex items-center gap-2 text-[13px] text-muted">
        <Tile tile={tile} className="size-6 rounded-md" />
        <span className="font-medium text-ink">{tool}</span>
        {when}
      </p>
      <p className="justify-self-end rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-[14.5px] text-white">
        {ask}
      </p>
      <div className="text-[14.5px] leading-[1.5]">{reply}</div>
    </div>
  );
  return (
    <figure className="divide-y overflow-hidden rounded-xl border bg-white">
      {turn(
        "claude",
        "Claude Code",
        "Monday",
        "Remember that refunds now take 3 business days.",
        <>
          <Dot tone="good">Saved to Customer help, Refunds</Dot>
          <p className="mt-1 pl-4 text-[13px] text-muted">
            As a draft. Mitch approved it the same day.
          </p>
        </>,
      )}
      {turn(
        "codex",
        "Codex",
        "Today",
        "How long do refunds take?",
        <>
          <p>3 business days once the refund is approved.</p>
          <p className="mt-1 text-[13px] text-muted">From Customer help, Refunds</p>
        </>,
      )}
    </figure>
  );
}

function Plugins() {
  const tools: [ToolId, string][] = [
    ["claude", "Claude"],
    ["codex", "Codex"],
    ["cursor", "Cursor"],
    ["zai", "Z.ai"],
    ["deepseek", "DeepSeek"],
    ["grok", "Grok"],
  ];
  const rows: [string, string][] = [
    ["Recall", "Agents answer from the notebook and cite the page they used."],
    ["Save", "They save decisions and fixes back as drafts a person approves."],
    ["One click", "No terminal or config file, so the whole team can use it."],
  ];
  return (
    <Slide section="Plugins">
      <Body>
        <Title className="max-w-[980px]">Plugins give every AI tool the same memory.</Title>
        <Lead className="max-w-[880px]">
          What one tool saves to Corpus, every other tool can recall. Switch models, and the memory
          comes with you.
        </Lead>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-[520px_1fr] items-end gap-14">
          <SharedMemory />
          <div>
            <ul className="grid grid-cols-3 gap-x-5 gap-y-3">
              {tools.map(([tile, name]) => (
                <li key={name} className="flex items-center gap-2.5 text-[15px] font-medium">
                  <Tile tile={tile} />
                  {name}
                </li>
              ))}
            </ul>
            <dl className="mt-6 divide-y border-y text-[15px] leading-[1.45]">
              {rows.map(([k, v]) => (
                <div key={k} className="grid grid-cols-[96px_1fr] gap-4 py-2.5">
                  <dt className="font-medium">{k}</dt>
                  <dd className="text-pretty text-muted">{v}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 text-[13.5px] leading-[1.6] text-muted">
              Prefer the terminal? Any MCP client connects in one line:
              <code className="mt-1 block font-mono text-[12.5px] text-ink">
                {/* Wraps between words, never at the hyphens inside them. */}
                {"claude mcp add --transport http acme-help https://acme-help.corpus.app/mcp"
                  .split(" ")
                  .map((word, i) => (
                    <Fragment key={i}>
                      {i > 0 && " "}
                      <span className="whitespace-nowrap">{word}</span>
                    </Fragment>
                  ))}
              </code>
            </p>
          </div>
        </div>
      </Body>
    </Slide>
  );
}

/* 6. How it works ------------------------------------------------------- */

function HowItWorks() {
  return (
    <Slide section="How it works">
      <Body>
        <Title className="max-w-[960px]">
          People and agents write to the same notebook, and read the same words.
        </Title>
      </Body>
      <ol className="absolute top-[232px] inset-x-16 grid grid-cols-3 gap-10">
        <Step n={1} head="Write and save">
          People write in the editor. Agents save notes from Claude Code, OpenCode, or any harness,
          as Markdown drafts a person approves.
        </Step>
        <Step n={2} head="Publish and connect">
          A docs site or help center for people. Plugins connect Claude, Codex, and more in one
          click.
        </Step>
        <Step n={3} head="Fill the gaps">
          Questions nobody could answer come back as AI drafts, written with the model you pick.
        </Step>
      </ol>
      <div className="absolute inset-x-16 top-[378px] bottom-0 flex flex-col">
        <div className="mb-3 grid grid-cols-[52.5%_1fr] px-1 text-[15px]">
          <Dot tone="off">
            <span className="font-medium">People</span>
            <span className="text-muted">read the help page</span>
          </Dot>
          <Dot tone="good">
            <span className="font-medium">Agents and the support bot</span>
            <span className="text-muted">get the same words</span>
          </Dot>
        </div>
        <SplitView
          pageId="refunds"
          site="acme-help.corpus.app"
          start="How long refunds take"
          className="min-h-0 flex-1 rounded-b-none"
        />
      </div>
    </Slide>
  );
}

function Step({ n, head, children }: { n: number; head: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[24px_1fr] border-t pt-3.5">
      <span className="text-[15px] font-medium text-faint tabular-nums">{n}</span>
      <div>
        <p className="text-[17px] font-medium">{head}</p>
        <div className="mt-1 text-[14.5px] leading-[1.5] text-pretty text-muted">{children}</div>
      </div>
    </li>
  );
}

/* 7. Competition -------------------------------------------------------- */

type Has = "yes" | "part" | "no";

const HAS_LABEL: Record<Has, string> = {
  yes: "Yes",
  part: "Partly",
  no: "No",
};

function Mark({ has }: { has: Has }) {
  return (
    <span
      className="inline-grid size-[12px] place-items-center align-middle"
      title={HAS_LABEL[has]}
    >
      {has === "yes" && <span className="size-[11px] rounded-full bg-ink" />}
      {has === "part" && (
        <span
          className="size-[11px] rounded-full border-[1.5px] border-ink"
          style={{ background: "linear-gradient(90deg, var(--color-ink) 50%, transparent 50%)" }}
        />
      )}
      {has === "no" && <span className="h-px w-2.5 bg-neutral-300" />}
      <span className="sr-only">{HAS_LABEL[has]}</span>
    </span>
  );
}

function Competition() {
  const cols = [
    "Docs site",
    "Notes and plans",
    "Support answers",
    "Design system",
    "Any AI can read it",
    "Self-host",
  ];
  const rows: { name: string; has: Has[]; price: string; us?: boolean }[] = [
    {
      name: "Mintlify",
      has: ["yes", "no", "part", "no", "yes", "part"],
      price: "$450 a month",
    },
    {
      name: "GitBook",
      has: ["yes", "yes", "part", "no", "yes", "no"],
      price: "$65 a site, plus $12 a user, monthly",
    },
    {
      name: "Zendesk",
      has: ["yes", "no", "yes", "no", "part", "no"],
      price: "$55 an agent a month, plus $1.50 an AI answer",
    },
    {
      name: "Obsidian",
      has: ["part", "yes", "no", "no", "part", "yes"],
      price: "Free app. Sync $4 a user, Publish $8 a site, monthly",
    },
    {
      name: "zeroheight",
      has: ["yes", "no", "no", "yes", "part", "no"],
      price: "$49 an editor a month",
    },
    {
      name: "Corpus",
      has: ["yes", "yes", "yes", "yes", "yes", "yes"],
      price: "$79 to $99, once",
      us: true,
    },
  ];
  return (
    <Slide section="Competition">
      <Body>
        <Title className="max-w-[980px]">
          Teams pay for five tools, every month, to do what one notebook can.
        </Title>
        <table className="mt-9 w-full table-fixed border-collapse text-left text-[15px]">
          <colgroup>
            <col className="w-[148px]" />
            {cols.map((c) => (
              <col key={c} className="w-[92px]" />
            ))}
            <col />
          </colgroup>
          <thead>
            <tr className="border-b align-bottom text-[13px] leading-snug text-muted">
              <th className="pb-2.5 font-normal" />
              {cols.map((c) => (
                <th key={c} className="px-1 pb-2.5 text-center font-normal">
                  {c}
                </th>
              ))}
              <th className="pb-2.5 pl-6 font-normal">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={cn("border-b", r.us && "border-b-0 bg-good-soft")}>
                <td className={cn("py-[12px]", r.us ? "pl-3 font-semibold" : "font-medium")}>
                  {r.us ? (
                    <span className="inline-flex items-center gap-2">
                      <CorpusMark className="size-4" />
                      {r.name}
                    </span>
                  ) : (
                    r.name
                  )}
                </td>
                {r.has.map((h, i) => (
                  <td key={cols[i]} className="text-center">
                    <Mark has={h} />
                  </td>
                ))}
                <td
                  className={cn(
                    "pl-6 text-[14px] leading-snug",
                    r.us ? "font-semibold" : "text-muted",
                  )}
                >
                  {r.price}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="absolute inset-x-0 bottom-0">
          <div className="flex gap-6 text-[13px] text-muted">
            {(["yes", "part", "no"] as Has[]).map((h) => (
              <span key={h} className="inline-flex items-center gap-2">
                <Mark has={h} />
                {HAS_LABEL[h]}
              </span>
            ))}
          </div>
          <Source className="mt-3 max-w-[1100px] text-pretty">
            Vendor pricing pages and docs, November 2026, billed yearly where both are listed.
            Mintlify self-hosting is Enterprise only. Zendesk AI answers are $1.50 each committed or
            $2 pay as you go, and its MCP server is in early access. Obsidian is free for work; its
            AI access comes from community plugins. zeroheight caps agent access at 500 calls a
            month. Corpus pricing is planned, and its features run in a prototype on sample data.
          </Source>
        </div>
      </Body>
    </Slide>
  );
}

/* 8. Business model ----------------------------------------------------- */

function BusinessModel() {
  const plans: [name: string, plan: string, total: number][] = [
    ["Mintlify", "Pro", 16200],
    ["GitBook", "Essential, one site", 2340],
    ["Zendesk", "Suite Team, one agent", 1980],
    ["zeroheight", "Starter, one editor", 1764],
    ["Obsidian", "Sync and Publish, one person", 432],
    ["Corpus", "Lifetime license", 99],
  ];
  const max = plans[0][2];
  const terms: [string, ReactNode][] = [
    ["Price", "$79 to $99 once, for a lifetime license. The demand test picks the price."],
    [
      "Hosting",
      <>
        Run it on your own server, or we host it for <Fill value={FACTS.hostedPrice} todo="price" />
        .
      </>,
    ],
    ["AI costs", "Each team brings its own AI key and model, so model bills never land on Corpus."],
    [
      "Who buys",
      <>
        Small teams priced out of Mintlify and Zendesk: startups, agencies, schools, and nonprofits.
      </>,
    ],
    [
      "Reach",
      "X and Reddit first, then Notion imports and WordPress and Drupal plugins, where millions of sites already live.",
    ],
    ["Goal", "Bootstrapped and profitable. Not raising venture capital."],
  ];
  return (
    <Slide section="Business model">
      <Body>
        <Title className="max-w-[960px]">
          Pay once, own it for life. Each sale is nearly all margin.
        </Title>
        <div className="mt-10 grid grid-cols-[536px_1fr] gap-14">
          <figure>
            <figcaption className="text-[15px] font-medium">
              Three years of the smallest paid plan, at list price
            </figcaption>
            <ul className="mt-3 border-t">
              {plans.map(([name, plan, total]) => {
                const us = name === "Corpus";
                return (
                  <li key={name} className="grid grid-cols-[176px_1fr] items-center gap-3 py-[7px]">
                    <div className="leading-tight">
                      <p className={cn("text-[15px]", us ? "font-semibold" : "font-medium")}>
                        {name}
                      </p>
                      <p className="text-[12.5px] text-muted">{plan}</p>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <span
                        className={cn("h-3 rounded-r-[4px]", us ? "bg-good" : "bg-neutral-300")}
                        style={{
                          width: `max(3px, calc((100% - 92px) * ${total / max}))`,
                        }}
                      />
                      <span
                        className={cn(
                          "text-[14px] whitespace-nowrap tabular-nums",
                          us ? "font-semibold" : "text-muted",
                        )}
                      >
                        ${total.toLocaleString("en-US")}
                        {us && " once"}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
            <Source className="mt-3 text-pretty">
              Yearly list prices from each pricing page, November 2026, before extra users, agents,
              sites, or AI answers.
            </Source>
          </figure>
          <dl className="self-start divide-y border-y text-[15px] leading-[1.45]">
            {terms.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[96px_1fr] gap-4 py-[9px]">
                <dt className="font-medium">{k}</dt>
                <dd className="text-pretty text-muted">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </Body>
    </Slide>
  );
}

/* 9. Traction ----------------------------------------------------------- */

function Traction() {
  const groups: { tone: "good" | "warn" | "off"; label: string; items: ReactNode[] }[] = [
    {
      tone: "good",
      label: "Built",
      items: [
        "A notebook editor: toolbar, slash menu, to-dos, page links",
        "Handbook, help center, and design system projects",
        "A published help center with search and a support bot",
        "Plugins that recall and save notes, with a review queue",
        "Unanswered questions become drafts from any AI provider",
      ],
    },
    { tone: "warn", label: "Next", items: ["Read a real folder of Markdown from disk"] },
    {
      tone: "off",
      label: "Not yet",
      items: ["Hosting, live AI calls, and user research"],
    },
  ];
  return (
    <Slide section="Traction">
      <Body>
        <Title>What’s built: a clickable prototype of the whole notebook.</Title>
        <div className="mt-8 grid grid-cols-[600px_1fr] gap-14">
          <figure>
            <Shot
              src={siteShot}
              alt="The help center Corpus publishes for Acme, Inc: a search box, articles by topic, and a support bot that answers from the same pages"
              className="h-[340px]"
              imgClassName="h-full object-cover object-top"
            />
            <figcaption className="mt-3 text-[13.5px] leading-snug text-pretty text-muted">
              The help center Corpus publishes from Acme’s pages, with search and a support bot.
              Sample data; AI, git, and MCP calls are simulated until they’re built.
            </figcaption>
          </figure>
          <div className="flex flex-col gap-6">
            <div className="grid gap-4">
              {groups.map((g) => (
                <div key={g.label}>
                  <Dot tone={g.tone} className="text-[15px] font-medium">
                    {g.label}
                  </Dot>
                  <ul className="mt-1.5 grid gap-1.5 pl-4 text-[14.5px] leading-[1.4]">
                    {g.items.map((it, i) => (
                      <li key={i}>{it}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <dl className="mt-auto grid gap-2 border-t pt-4 text-[14px]">
              <Fact k="Prototype">
                <Url value={FACTS.prototypeUrl} />
              </Fact>
              <Fact k="Help center">
                <Url value={FACTS.helpCenterUrl} />
              </Fact>
              <Fact k="Waitlist">
                <Url value={FACTS.waitlist.url} />{" "}
                <span className="text-muted">
                  (live since {FACTS.waitlist.liveSince}
                  {FACTS.waitlist.signups && `, ${FACTS.waitlist.signups} signups`})
                </span>
              </Fact>
            </dl>
          </div>
        </div>
      </Body>
    </Slide>
  );
}

/* 10. Team -------------------------------------------------------------- */

function Team() {
  const record: [string, ReactNode][] = [
    [
      "Founder, Charged Labs",
      "Developer tools for Drupal and WordPress, including Charged UI, the design system in the prototype.",
    ],
    [
      "Staff-level frontend engineer",
      "Flipgrid (acquired by Microsoft), OurFamilyWizard, and Parsley Health.",
    ],
    [
      "Elite author on ThemeForest",
      "More than $100,000 in lifetime sales of one-time-priced products, past Envato’s $75,000 bar for Elite. Corpus uses the same model.",
    ],
    [
      "15 years in the Drupal community",
      "People I already know how to reach when the Drupal and WordPress plugins ship.",
    ],
    [
      "Uses four AI tools every week",
      "I switch between Claude Code, Z.ai, DeepSeek, and OpenCode. Corpus is the shared memory I need.",
    ],
  ];
  return (
    <Slide section="Team">
      <Body>
        <Title>Solo founder. I’ve built docs, design systems, and products people pay for.</Title>
        <div className="mt-8 grid grid-cols-[372px_1fr] gap-16">
          <div>
            <img
              src={portrait}
              alt="Mitch Kostelecky"
              className="size-[88px] rounded-full object-cover ring-1 ring-black/10"
            />
            <p className="mt-5 text-[28px] font-semibold tracking-[-0.02em]">Mitch Kostelecky</p>
            <p className="mt-1 text-[17px] text-muted">
              Founder. Product, design, and engineering.
            </p>
            <dl className="mt-7 grid gap-2.5 text-[15px] leading-snug">
              <Fact k="USC">
                IYA graduate student, MS in Integrated Design, Business and Technology
              </Fact>
              <Fact k="Enrolled">Fall 2026 and Spring 2027</Fact>
              <Fact k="Email">
                <Mailto value={FACTS.email} />
              </Fact>
            </dl>
          </div>
          <ul className="divide-y border-y">
            {record.map(([head, body]) => (
              <li key={head} className="py-3">
                <p className="text-[18px] font-medium">{head}</p>
                <p className="mt-1 text-[15.5px] leading-[1.5] text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Body>
    </Slide>
  );
}

/* 11. Use of proceeds --------------------------------------------------- */

function Proceeds() {
  const spend: [string, string, string][] = [
    [
      "$1,500",
      "Reddit ads",
      "Four ad sets, one per job: AI memory, support answers, docs, and design systems. Shown in communities like r/selfhosted and r/webdev.",
    ],
    [
      "$1,500",
      "X ads",
      "The same four ad sets, shown to people building with AI tools. Both send people to the corpus.app waitlist, where half see $79 and half see $99.",
    ],
  ];
  const report = [
    "Cost per signup, by job and platform",
    "Waitlist size",
    "Landing page conversion rate",
    "Share willing to pay $79, and $99",
    "What teams use now, and what it costs them",
  ];
  return (
    <Slide section="Use of proceeds">
      <Body>
        <Title className="max-w-[960px]">
          $3,000 to learn who will pay, and for which job, before I build the rest.
        </Title>
        <div className="mt-11 grid grid-cols-[1fr_360px] gap-16">
          <div>
            {/* The budget split, in the same order and colors as the rows below. */}
            <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
              <span className="w-1/2 rounded-l-full bg-ink" />
              <span className="w-1/2 rounded-r-full bg-good" />
            </div>
            <ul className="mt-6 divide-y border-y">
              {spend.map(([amount, head, body], i) => (
                <li key={head} className="grid grid-cols-[120px_1fr] gap-5 py-5">
                  <p className="text-[28px] leading-[1.05] font-semibold tracking-[-0.025em] tabular-nums">
                    {amount}
                  </p>
                  <div>
                    <p className="flex items-center gap-2.5 text-[18px] font-medium">
                      <span
                        className={cn("size-2.5 rounded-[3px]", i === 0 ? "bg-ink" : "bg-good")}
                      />
                      {head}
                    </p>
                    <p className="mt-1.5 text-[15.5px] leading-[1.5] text-pretty text-muted">
                      {body}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-5 text-[15.5px] leading-[1.5] text-pretty text-muted">
              After two weeks, more of the budget goes to whichever platform brings signups more
              cheaply. I’ll also interview ten signups, thanked with a free lifetime license.
            </p>
          </div>
          <div>
            <p className="text-[16px] font-medium">What I’ll report back</p>
            <ul className="mt-3 divide-y border-y text-[16px]">
              {report.map((r) => (
                <li key={r} className="py-3">
                  {r}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-[14px] leading-[1.5] text-pretty text-muted">
              If teams won’t sign up at these prices, I find out for $3,000 instead of a year of
              building.
            </p>
          </div>
        </div>
      </Body>
    </Slide>
  );
}

/* 12. Milestones -------------------------------------------------------- */

function Milestones() {
  const steps: { when: string; head: string; body: string; done?: boolean }[] = [
    {
      when: "Nov 2026",
      head: "Clickable prototype",
      body: "Handbook, help center, and design system projects on sample data, plus a build plan.",
      done: true,
    },
    {
      when: "Dec 2026",
      head: "Demand test",
      body: "Ads, waitlist, and interviews. Corpus reads a real folder of Markdown.",
    },
    {
      when: "Jan 2027",
      head: "Plugins ship",
      body: "Claude and Codex plugins recall and save notes. Any MCP client reads real notebooks.",
    },
    {
      when: "Feb 2027",
      head: "Private beta",
      body: "Waitlist teams, hosted or on their own servers. AI drafts with the model each team picks.",
    },
    {
      when: "Spring 2027",
      head: "Launch",
      body: "Lifetime licenses on sale, a hosted plan, and the IYA Venture Showcase.",
    },
  ];
  return (
    <Slide section="Milestones">
      <Body>
        <Title>By the Venture Showcase: a working notebook in real teams’ hands.</Title>
        <div className="relative mt-16">
          <span className="absolute top-[5px] right-0 left-0 h-px bg-line" />
          <ol className="relative grid grid-cols-5 gap-7">
            {steps.map((s) => (
              <li key={s.when}>
                <span
                  className={cn(
                    "block size-[11px] rounded-full",
                    s.done ? "bg-good" : "border-[1.5px] border-neutral-300 bg-white",
                  )}
                />
                <p className={cn("mt-5 text-[14px]", s.done ? "text-good" : "text-muted")}>
                  {s.when}
                </p>
                <p className="mt-1 text-[18px] font-medium">{s.head}</p>
                <p className="mt-1.5 text-[14.5px] leading-[1.5] text-pretty text-muted">
                  {s.body}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-6 text-[14.5px] text-muted">
            After the Showcase: plugins for Z.ai, DeepSeek, and more, imports from Notion, and
            plugins for WordPress and Drupal.
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 border-t pt-5">
          <p className="text-[15px] font-medium">Targets for the Showcase</p>
          <dl className="mt-2.5 grid grid-cols-3 gap-8 text-[15px]">
            <Fact k="Waitlist" wide>
              <Fill value={FACTS.targets.waitlist} todo="signups" />
            </Fact>
            <Fact k="Beta teams" wide>
              <Fill value={FACTS.targets.betaTeams} todo="teams" />
            </Fact>
            <Fact k="Paid licenses" wide>
              <Fill value={FACTS.targets.paidLicenses} todo="licenses" />
            </Fact>
          </dl>
        </div>
      </Body>
    </Slide>
  );
}

/* 13. Close ------------------------------------------------------------- */

function Close() {
  return (
    <Slide>
      <CorpusLogo className="absolute top-14 left-16 h-[30px]" />
      <div className="absolute top-[176px] left-16 w-[1040px]">
        <h2 className="text-[56px] leading-[1.05] font-semibold tracking-[-0.035em]">
          Write it once. Own it for life.
          <br />
          Use it with any AI.
        </h2>
        <p className="mt-6 max-w-[660px] text-[20px] leading-[1.45] text-pretty text-muted">
          One shared memory for every AI tool and teammate, with docs, a help center, and a support
          bot from the same pages.
        </p>
      </div>
      <div className="absolute inset-x-16 bottom-14 grid grid-cols-[1fr_440px] gap-16">
        <div>
          <p className="text-[15px] font-medium">The ask</p>
          <ul className="mt-3 divide-y border-y text-[17px] leading-[1.45]">
            <li className="py-3">
              <span className="font-medium">$3,000 Ignite Grant, GenAI track</span>
              <span className="text-muted">
                {" "}
                for a demand test: ads, a waitlist, and a price test
              </span>
            </li>
            <li className="py-3">
              <span className="font-medium">A mentor</span>
              <span className="text-muted"> who has sold software to small teams</span>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-[15px] font-medium">Mitch Kostelecky</p>
          <dl className="mt-3 grid gap-2 border-t pt-3 text-[15px]">
            <Fact k="Email">
              <Mailto value={FACTS.email} />
            </Fact>
            <Fact k="Waitlist">
              <Url value={FACTS.waitlist.url} />
            </Fact>
            <Fact k="Prototype">
              <Url value={FACTS.prototypeUrl} />
            </Fact>
          </dl>
        </div>
      </div>
    </Slide>
  );
}

export const SLIDES = [
  Cover,
  Problem,
  WhyNow,
  Solution,
  Plugins,
  HowItWorks,
  Competition,
  BusinessModel,
  Traction,
  Team,
  Proceeds,
  Milestones,
  Close,
];
