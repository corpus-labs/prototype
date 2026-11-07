import type { ReactNode } from "react";
import { FACTS } from "./facts";
import { cn } from "./lib/utils";
import { CorpusLogo, CorpusMark, Dot, Fill, Lead, Shot, Slide, Source, Title, Todo } from "./ui";
import coverShot from "./assets/shots/cover-notebook.png";
import writeShot from "./assets/shots/how-write.png";
import projectsShot from "./assets/shots/traction-projects.png";

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

/* 1. Cover --------------------------------------------------------------- */

function Cover() {
  return (
    <Slide>
      <CorpusLogo className="absolute top-14 left-16 h-[30px]" />
      <div className="absolute top-[170px] left-16 w-[572px]">
        <h1 className="text-[56px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
          Own what your company knows. Use it with any AI.
        </h1>
        <p className="mt-6 text-[20px] leading-[1.45] text-pretty text-muted">
          Corpus is one notebook for your docs, help center, AI context, and design system. Host it
          with us or on your own server, and pay once.
        </p>
      </div>
      <div className="absolute bottom-14 left-16 grid gap-1 text-[15px]">
        <p className="font-medium">Mitch Kostelecky</p>
        <p className="text-muted">USC Iovine Young Academy</p>
        <p className="text-muted">Ignite Grant, GenAI track, Fall 2026</p>
      </div>
      <Shot
        src={coverShot}
        alt="The Corpus prototype showing a team handbook: pages in folders, open to the decision log"
        className="absolute top-[150px] bottom-0 left-[676px] w-[940px] rounded-b-none"
        imgClassName="h-full object-cover object-top-left"
      />
    </Slide>
  );
}

/* 2. Problem ------------------------------------------------------------- */

function Problem() {
  const pains: [string, string][] = [
    [
      "Scattered",
      "Docs in Mintlify or GitBook, notes in Notion or Obsidian, help articles in Zendesk, and AI context in each vendor’s own project files.",
    ],
    ["Rented", "Every tool bills by the seat, the site, or the answer, every month."],
    [
      "Stuck",
      "Context saved inside one AI vendor stays there. Switch models, and you set it all up again.",
    ],
  ];
  return (
    <Slide section="Problem">
      <Body>
        <Title className="max-w-[900px]">
          Company knowledge is scattered, rented, and stuck with one AI vendor.
        </Title>
        <div className="mt-11 grid grid-cols-[1fr_560px] gap-14">
          <ul className="divide-y border-y">
            {pains.map(([head, body]) => (
              <li key={head} className="py-4">
                <p className="text-[18.5px] font-medium">{head}</p>
                <p className="mt-1 text-[16px] leading-[1.5] text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
          <FiveAnswers />
        </div>
      </Body>
    </Slide>
  );
}

function FiveAnswers() {
  const answers: [where: string, said: string, note?: string][] = [
    ["Help center", "“5 business days”"],
    ["Docs site", "“Up to 7 days”"],
    ["Support bot", "“Within 24 hours”", "a guess"],
    ["ChatGPT project", "“5 to 7 days”", "last year’s PDF"],
  ];
  return (
    <figure className="self-start overflow-hidden rounded-xl border bg-white">
      <figcaption className="border-b bg-subtle px-5 py-3 text-[14px] text-muted">
        Five places answer “How long do refunds take?”
      </figcaption>
      <ul className="divide-y text-[15.5px]">
        {answers.map(([where, said, note]) => (
          <li key={where} className="grid grid-cols-[150px_1fr] items-baseline px-5 py-3">
            <span className="text-muted">{where}</span>
            <Dot tone="bad">
              {said}
              {note && <span className="text-[13.5px] text-muted">{note}</span>}
            </Dot>
          </li>
        ))}
        <li className="grid grid-cols-[150px_1fr] items-baseline bg-good-soft px-5 py-3">
          <span className="text-muted">Team notes</span>
          <Dot tone="good">
            <span className="font-medium">“3 business days, since March”</span>
          </Dot>
        </li>
      </ul>
      <p className="border-t px-5 py-3 text-[13px] text-muted">
        An illustration. Every copy was right once.
      </p>
    </figure>
  );
}

/* 3. Why now ------------------------------------------------------------- */

function WhyNow() {
  const shifts: [string, ReactNode, string][] = [
    [
      "Teams use several models at once",
      "37% of enterprises use five or more models, up from 29% a year earlier.",
      "Andreessen Horowitz, CIO survey, 2025",
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
          Teams now use several AI models, and the leader keeps changing.
        </Title>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-[452px_1fr] items-end gap-16">
          <figure>
            <figcaption className="text-[15px] font-medium">
              Share of enterprise AI model use
            </figcaption>
            <ShareShift />
            <Source className="mt-2">Menlo Ventures, LLM market update, July 2025</Source>
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

/** A two-point slope chart. Direct labels carry identity, so there's no legend. */
function ShareShift() {
  const x0 = 140;
  const x1 = 312;
  const y = (v: number) => 236 - (v / 60) * 216;
  const series = [
    { name: "OpenAI", from: 50, to: 25, stroke: "stroke-neutral-400", fill: "fill-neutral-400" },
    { name: "Anthropic", from: 12, to: 32, stroke: "stroke-ink", fill: "fill-ink" },
  ];
  return (
    <svg viewBox="0 0 452 272" className="mt-3 w-full" role="img" aria-labelledby="share-desc">
      <desc id="share-desc">
        OpenAI fell from 50% of enterprise model use in 2023 to 25% in 2025. Anthropic rose from 12%
        to 32%.
      </desc>
      <line x1={x0} x2={x0} y1={12} y2={244} className="stroke-line" />
      <line x1={x1} x2={x1} y1={12} y2={244} className="stroke-line" />
      {series.map((s) => (
        <g key={s.name}>
          <line
            x1={x0}
            y1={y(s.from)}
            x2={x1}
            y2={y(s.to)}
            className={s.stroke}
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx={x0} cy={y(s.from)} r="5" className={s.fill} stroke="#fff" strokeWidth="2" />
          <circle cx={x1} cy={y(s.to)} r="5" className={s.fill} stroke="#fff" strokeWidth="2" />
          <text
            x={x0 - 14}
            y={y(s.from)}
            textAnchor="end"
            dominantBaseline="middle"
            className="fill-ink text-[15px]"
          >
            {s.name} <tspan className="font-semibold">{s.from}%</tspan>
          </text>
          <text x={x1 + 14} y={y(s.to)} dominantBaseline="middle" className="fill-ink text-[15px]">
            <tspan className="font-semibold">{s.to}%</tspan> {s.name}
          </text>
        </g>
      ))}
      <text x={x0} y={266} textAnchor="middle" className="fill-muted text-[13px]">
        2023
      </text>
      <text x={x1} y={266} textAnchor="middle" className="fill-muted text-[13px]">
        2025
      </text>
    </svg>
  );
}

/* 4. Solution ------------------------------------------------------------ */

function Solution() {
  const jobs: [head: string, body: string, instead: string][] = [
    [
      "AI context",
      "Claude, Codex, Cursor, or any tool that speaks MCP reads your plans, decisions, and rules.",
      "prompt files in every AI tool",
    ],
    [
      "Support answers",
      "A support bot answers customers from the same pages your team already keeps.",
      "Zendesk AI, at $1.50 an answer",
    ],
    [
      "Docs and help center",
      "Publish public docs, a help center, or an internal handbook from the notebook.",
      "Mintlify or GitBook",
    ],
    [
      "Design systems",
      "Components, tokens, and usage rules, with live previews of the real thing.",
      "zeroheight",
    ],
  ];
  return (
    <Slide section="Solution">
      <Body>
        <Title className="max-w-[980px]">
          Corpus: one notebook that every person, support bot, and AI tool reads.
        </Title>
        <Lead className="max-w-[900px]">
          A context control plane for your company. Write it once, choose what’s public, and every
          reader gets the same answer.
        </Lead>
        <div className="absolute inset-x-0 bottom-0">
          <div className="flex h-[60px] items-center gap-3 rounded-xl bg-ink px-5 text-white">
            <CorpusMark className="size-5" />
            <span className="text-[17px] font-semibold">Corpus notebook</span>
            <span className="text-[14.5px] text-neutral-400">
              Markdown files you own, hosted or on your server
            </span>
          </div>
          <ol className="grid grid-cols-4 gap-8">
            {jobs.map(([head, body, instead]) => (
              <li key={head}>
                <span className="ml-5 block h-7 w-px bg-neutral-300" />
                <div className="border-t pt-4">
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

/* 5. How it works -------------------------------------------------------- */

function HowItWorks() {
  return (
    <Slide section="How it works">
      <Body>
        <Title className="max-w-[1000px]">
          Write once in the notebook. Publish it, and connect any AI in one line.
        </Title>
      </Body>
      <Shot
        src={writeShot}
        alt="A handbook page open for editing in Corpus, with a Rich and Markdown switch and the page tree beside it"
        className="absolute top-[236px] left-16 h-[428px] w-[672px]"
        imgClassName="h-full object-cover object-top-left"
      />
      <ol className="absolute top-[236px] right-16 bottom-14 w-[432px] divide-y border-y">
        <Step n={1} head="Write">
          Pages are plain Markdown files you own, kept in folders. Edit them as rich text or as
          Markdown.
        </Step>
        <Step n={2} head="Publish and connect">
          Publish a docs site or help center. Any MCP client connects with one line:
          <code className="mt-2.5 block rounded-lg border bg-subtle px-3 py-2 text-[12.5px] leading-[1.6] text-ink">
            claude mcp add --transport http acme
            <br />
            https://docs.acme.com/mcp
          </code>
        </Step>
        <Step n={3} head="Fill the gaps">
          When people or agents ask something the notebook can’t answer, AI drafts the page for you
          to review, using the model you pick.
        </Step>
      </ol>
    </Slide>
  );
}

function Step({ n, head, children }: { n: number; head: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[26px_1fr] py-4">
      <span className="text-[15px] font-medium text-faint tabular-nums">{n}</span>
      <div>
        <p className="text-[17px] font-medium">{head}</p>
        <div className="mt-1 text-[15px] leading-[1.5] text-pretty text-muted">{children}</div>
      </div>
    </li>
  );
}

/* 6. Competition --------------------------------------------------------- */

type Has = "yes" | "part" | "planned" | "no";

const HAS_LABEL: Record<Has, string> = {
  yes: "Yes",
  part: "Partly",
  planned: "Planned",
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
      {has === "planned" && (
        <span className="size-[11px] rounded-full border-[1.5px] border-neutral-400" />
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
      has: ["yes", "yes", "planned", "yes", "yes", "yes"],
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
              <tr key={r.name} className={cn("border-b", r.us && "border-b-0 bg-subtle")}>
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
            {(["yes", "part", "planned", "no"] as Has[]).map((h) => (
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
            month. Corpus pricing is planned, and support answers aren’t built yet.
          </Source>
        </div>
      </Body>
    </Slide>
  );
}

/* 7. Business model ------------------------------------------------------ */

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
        Small teams priced out of Mintlify and Zendesk: startups, agencies, schools, and nonprofits.{" "}
        <Fill value={FACTS.market} todo="how many" />
      </>,
    ],
    [
      "Reach",
      "X first, then Notion imports and WordPress and Drupal plugins, where millions of sites already live.",
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
          <dl className="divide-y border-y text-[15px] leading-[1.45]">
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

/* 8. Traction ------------------------------------------------------------ */

function Traction() {
  const groups: { tone: "good" | "warn" | "off"; label: string; items: ReactNode[] }[] = [
    {
      tone: "good",
      label: "Built",
      items: [
        "Notebook pages in folders, edited as rich text or Markdown",
        "Docs and design system projects in one workspace",
        "Every page served to AI as MCP, llms.txt, and Markdown",
        "Unanswered questions become AI drafts to review",
      ],
    },
    { tone: "warn", label: "Next", items: ["Read a real folder of Markdown from disk"] },
    {
      tone: "off",
      label: "Not yet",
      items: ["Support answers, hosting, and user research. This grant pays for the research."],
    },
  ];
  return (
    <Slide section="Traction">
      <Body>
        <Title>What’s built: a clickable prototype of the whole notebook.</Title>
        <div className="mt-9 grid grid-cols-[664px_1fr] gap-12">
          <figure>
            <Shot
              src={projectsShot}
              alt="The Corpus projects screen: a team handbook and a design system side by side, with agent requests and unanswered questions"
            />
            <figcaption className="mt-3 text-[13.5px] leading-snug text-pretty text-muted">
              A team handbook and a design system in one workspace, with the questions agents
              couldn’t answer. Sample data; AI, git, and MCP calls are simulated until their build
              phases land.
            </figcaption>
          </figure>
          <div className="flex flex-col">
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
              <Fact k="Demo video">
                <Fill value={FACTS.demoVideo} todo="link" />
              </Fact>
              <Fact k="Prototype">
                <Fill value={FACTS.prototypeUrl} todo="link" />
              </Fact>
              <Fact k="Waitlist">
                {FACTS.waitlist.url}{" "}
                {FACTS.waitlist.liveSince && FACTS.waitlist.signups ? (
                  <span className="text-muted">
                    live since {FACTS.waitlist.liveSince}, {FACTS.waitlist.signups} signups
                  </span>
                ) : (
                  <Todo>live date, signups</Todo>
                )}
              </Fact>
              <Fact k="Code">
                <code className="text-[13px]">{FACTS.repo}</code>
              </Fact>
            </dl>
          </div>
        </div>
      </Body>
    </Slide>
  );
}

/* 9. Team ---------------------------------------------------------------- */

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
      "More than $75,000 in lifetime sales of one-time-priced products, Envato’s bar for Elite. Corpus uses the same model.",
    ],
    [
      "15 years in the Drupal community",
      "People I already know how to reach when the Drupal and WordPress plugins ship.",
    ],
  ];
  return (
    <Slide section="Team">
      <Body>
        <Title>Solo founder. I’ve built docs, design systems, and products people pay for.</Title>
        <div className="mt-12 grid grid-cols-[372px_1fr] gap-16">
          <div>
            <div className="grid size-[72px] place-items-center rounded-full bg-neutral-100 text-[24px] font-medium text-neutral-600">
              MK
            </div>
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
                <Fill value={FACTS.email} todo="email" />
              </Fact>
            </dl>
          </div>
          <ul className="divide-y border-y">
            {record.map(([head, body]) => (
              <li key={head} className="py-[15px]">
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

/* 10. Use of proceeds ---------------------------------------------------- */

function Proceeds() {
  const spend: [string, string, string][] = [
    [
      "$2,500",
      "X ads as a demand test",
      "Four ad sets, one per job: AI context, support answers, docs, and design systems. Each sends people to the corpus.app waitlist, where half see $79 and half see $99.",
    ],
    [
      "$500",
      "Ten paid user interviews",
      "30 minutes each, $50 per person, with signups from the job that draws the most interest.",
    ],
  ];
  const report = [
    "Cost per signup, by job",
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
            <div className="flex h-3 gap-[3px] overflow-hidden rounded-full">
              <span className="w-5/6 rounded-l-full bg-ink" />
              <span className="w-1/6 rounded-r-full bg-good" />
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
              No hires. I build Corpus with AI coding agents, so the money goes to learning from
              users instead of buying engineering hours.
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

/* 11. Milestones --------------------------------------------------------- */

function Milestones() {
  const steps: { when: string; head: string; body: string; done?: boolean }[] = [
    {
      when: "Nov 2026",
      head: "Clickable prototype",
      body: "Notebook, docs, and design system projects on sample data, plus an 8-phase build plan.",
      done: true,
    },
    {
      when: "Dec 2026",
      head: "Demand test",
      body: "Ads, waitlist, and interviews. Corpus reads a real folder of Markdown.",
    },
    {
      when: "Jan 2027",
      head: "Any AI connects",
      body: "Claude, Codex, Cursor, and other MCP clients read real notebooks.",
    },
    {
      when: "Feb 2027",
      head: "Private beta",
      body: "Waitlist teams, hosted or on their own servers. AI drafts with the model each team picks.",
    },
    {
      when: "Spring 2027",
      head: "Launch",
      body: "Lifetime licenses on sale, support answers, and the IYA Venture Showcase.",
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
            After the Showcase: imports from Notion, and plugins for WordPress and Drupal.
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

/* 12. Close -------------------------------------------------------------- */

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
          One notebook for your docs, help center, AI context, and design system. Hosted or
          self-hosted, for a one-time price.
        </p>
      </div>
      <div className="absolute inset-x-16 bottom-14 grid grid-cols-[1fr_440px] gap-16">
        <div>
          <p className="text-[15px] font-medium">The ask</p>
          <ul className="mt-3 divide-y border-y text-[17px] leading-[1.45]">
            <li className="py-3">
              <span className="font-medium">$3,000 Ignite Grant, GenAI track</span>
              <span className="text-muted"> for the demand test and ten user interviews</span>
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
              <Fill value={FACTS.email} todo="email" />
            </Fact>
            <Fact k="Waitlist">{FACTS.waitlist.url}</Fact>
            <Fact k="Demo">
              <Fill value={FACTS.demoVideo} todo="link" />
            </Fact>
            <Fact k="Code">
              <code className="text-[14px]">{FACTS.repo}</code>
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
  HowItWorks,
  Competition,
  BusinessModel,
  Traction,
  Team,
  Proceeds,
  Milestones,
  Close,
];
