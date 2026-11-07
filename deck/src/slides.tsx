import type { ReactNode } from "react";
import { FACTS } from "./facts";
import { cn } from "./lib/utils";
import { CorpusLogo, CorpusMark, Dot, Fill, Lead, Shot, Slide, Source, Title, Todo } from "./ui";
import titleShot from "./assets/shots/title-button.png";
import solutionShot from "./assets/shots/solution-split.png";
import tractionShot from "./assets/shots/traction-draft.png";

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

/** A rule as the product shows it: the keyword, then the sentence. */
function Rule({ kw, children }: { kw: string; children: ReactNode }) {
  return (
    <li className="grid grid-cols-[44px_1fr] items-baseline gap-3">
      <code className="text-[11.5px] font-medium">{kw}</code>
      <span>{children}</span>
    </li>
  );
}

/* 1. Cover --------------------------------------------------------------- */

function Cover() {
  return (
    <Slide>
      <CorpusLogo className="absolute top-14 left-16 h-[30px]" />
      <div className="absolute top-[178px] left-16 w-[560px]">
        <h1 className="text-[58px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
          Design system docs that AI agents follow.
        </h1>
        <p className="mt-6 text-[21px] leading-[1.45] text-pretty text-muted">
          Document a design system once. People read it as a website, and coding agents like Claude
          Code and Cursor read the same source.
        </p>
      </div>
      <div className="absolute bottom-14 left-16 grid gap-1 text-[15px]">
        <p className="font-medium">Mitch Kostelecky</p>
        <p className="text-muted">USC Iovine Young Academy</p>
        <p className="text-muted">Ignite Grant, GenAI track, Fall 2026</p>
      </div>
      <Shot
        src={titleShot}
        alt="The Corpus prototype showing the Button component page"
        className="absolute top-[150px] bottom-0 left-[676px] w-[940px] rounded-b-none"
        imgClassName="h-full object-cover object-top-left"
      />
    </Slide>
  );
}

/* 2. Team ---------------------------------------------------------------- */

function Team() {
  const record: [string, ReactNode][] = [
    [
      "Founder, Charged Labs",
      "Developer tools for Drupal and WordPress, including Charged UI, the first design system documented in Corpus.",
    ],
    [
      "Staff-level frontend engineer",
      "Flipgrid (acquired by Microsoft), OurFamilyWizard, and Parsley Health.",
    ],
    [
      "Elite author on ThemeForest",
      "More than $75,000 in lifetime sales, Envato’s bar for Elite. I’ve sold one-time-priced products to developers before.",
    ],
    [
      "15 years in the Drupal community",
      "Corpus launches there first, with people I already know how to reach.",
    ],
  ];
  return (
    <Slide section="Team">
      <Body>
        <Title>Solo founder, already inside the market Corpus serves first.</Title>
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

/* 3. Problem ------------------------------------------------------------- */

function Problem() {
  return (
    <Slide section="Problem">
      <Body>
        <Title className="max-w-[880px]">
          AI agents write UI code now. They don’t follow your design system.
        </Title>
        <div className="mt-11 grid grid-cols-[1fr_588px] gap-14">
          <div className="flex flex-col">
            <ul className="divide-y border-y text-[18.5px] leading-[1.45]">
              <li className="py-4">
                Design system rules live in docs written for people. Agents can’t use them, so they
                guess.
              </li>
              <li className="py-4">
                The guess is almost right: the wrong component, a hardcoded color, a vague label.
              </li>
              <li className="py-4">
                Someone fixes it in review, again and again. Nobody sees which answers were missing.
              </li>
            </ul>
            <div className="mt-auto">
              <p className="text-[15px] leading-snug text-pretty text-muted">
                <span className="font-semibold text-ink">66%</span> of developers say their top
                frustration with AI tools is answers that are “almost right, but not quite.”
              </p>
              <Source className="mt-1.5">Stack Overflow Developer Survey 2025</Source>
            </div>
          </div>
          <CodeCompare />
        </div>
      </Body>
    </Slide>
  );
}

function CodeCompare() {
  return (
    <figure className="overflow-hidden rounded-xl border bg-white">
      <figcaption className="border-b bg-subtle px-5 py-3 text-[14px] text-muted">
        Asked to “add a checkout button to the cart page”
      </figcaption>
      <div className="px-5 pt-4 pb-4">
        <Dot tone="bad" className="text-[14px] font-medium text-bad">
          What the agent wrote
        </Dot>
        <pre className="mt-2 text-[13.5px] leading-[1.6]">{`<a class="btn btn-primary" href="/checkout">
  Checkout
</a>`}</pre>
      </div>
      <div className="border-t px-5 pt-4 pb-5">
        <Dot tone="good" className="text-[14px] font-medium text-good">
          What Charged UI’s docs say
        </Dot>
        <pre className="mt-2 text-[13.5px] leading-[1.6]">{`{{ include('charged_ui:button', {
  variant: 'primary',
  label: 'Go to checkout',
  href: '/checkout',
}) }}`}</pre>
        <ul className="mt-3 grid gap-1.5 border-t border-dashed pt-3 text-[13px] leading-snug text-muted">
          <Rule kw="MUST">pass href to Button for links styled as buttons.</Rule>
          <Rule kw="MUST">write labels as a verb phrase, three words or fewer.</Rule>
        </ul>
      </div>
    </figure>
  );
}

/* 4. Why now ------------------------------------------------------------- */

function WhyNow() {
  const shifts: [string, ReactNode][] = [
    [
      "Agents got a standard plug",
      "The Model Context Protocol (MCP) lets an agent ask an outside source for context. Claude Code, Cursor, VS Code, and Codex all support it.",
    ],
    [
      "Design system tools are adding it",
      "zeroheight, Supernova, and Storybook now ship MCP servers. Teams are asking for this, and vendors are answering.",
    ],
    [
      "Without a source, agents fill the gaps",
      "An agent that can’t find your rules falls back on what it saw in training: other teams’ components, not yours.",
    ],
  ];
  return (
    <Slide section="Why now">
      <Body>
        <Title className="max-w-[960px]">
          Agents became an everyday tool, and they now have a standard way to read context.
        </Title>
        <div className="absolute inset-x-0 bottom-0 grid grid-cols-[420px_1fr] items-end gap-16">
          <div className="pb-5">
            <p className="text-[136px] leading-[0.85] font-semibold tracking-[-0.05em] tabular-nums">
              84%
            </p>
            <p className="mt-7 text-[20px] leading-[1.45] text-pretty">
              of developers use or plan to use AI tools. Half of professional developers use them
              every day.
            </p>
            <Source className="mt-3">
              Stack Overflow Developer Survey 2025 (51% use them daily)
            </Source>
          </div>
          <ul className="divide-y border-y">
            {shifts.map(([head, body]) => (
              <li key={head} className="py-[18px]">
                <p className="text-[18.5px] font-medium">{head}</p>
                <p className="mt-1 text-[16px] leading-[1.5] text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
        </div>
      </Body>
    </Slide>
  );
}

/* 5. Solution ------------------------------------------------------------ */

function Solution() {
  return (
    <Slide section="Solution">
      <Body>
        <Title className="max-w-[900px]">
          Corpus: write the docs once. People and agents read the same source.
        </Title>
      </Body>
      <div className="absolute inset-x-16 top-[240px] bottom-0 flex flex-col">
        <div className="mb-3.5 grid grid-cols-[53.9%_1fr] px-1 text-[15.5px]">
          <Dot tone="off">
            <span className="font-medium">People</span>
            <span className="text-muted">read the published page</span>
          </Dot>
          <Dot tone="good">
            <span className="font-medium">Agents</span>
            <span className="text-muted">get the same rules, word for word</span>
          </Dot>
        </div>
        <Shot
          src={solutionShot}
          alt="Corpus split view: the Button page for people beside the Markdown an agent receives, with the Rules section highlighted on both sides"
          className="min-h-0 flex-1 rounded-b-none"
          imgClassName="h-full object-cover object-top"
        />
      </div>
    </Slide>
  );
}

/* 6. How it works -------------------------------------------------------- */

function HowItWorks() {
  const steps: [string, string][] = [
    [
      "Point it at your repo",
      "Component schemas, docs, and tokens stay as files in your git repo, on your server.",
    ],
    [
      "Every reader, one source",
      "People browse a site. Agents connect over MCP and ask for exactly the component they need.",
    ],
    [
      "Gaps become drafts",
      "When agents ask something the docs can’t answer, AI drafts the answer for you to review.",
    ],
  ];
  return (
    <Slide section="How it works">
      <Body>
        <Title className="max-w-[920px]">
          Docs stay in your repo. Corpus serves every reader and flags what’s missing.
        </Title>
      </Body>
      <Diagram />
      <ol className="absolute inset-x-16 bottom-14 grid grid-cols-3 gap-10">
        {steps.map(([head, body], i) => (
          <li key={head} className="grid grid-cols-[28px_1fr] gap-1">
            <span className="text-[15px] font-medium text-faint tabular-nums">{i + 1}</span>
            <div>
              <p className="text-[16px] font-medium">{head}</p>
              <p className="mt-1 text-[14.5px] leading-[1.5] text-pretty text-muted">{body}</p>
            </div>
          </li>
        ))}
      </ol>
    </Slide>
  );
}

function Diagram() {
  // A 1152 x 300 canvas under the title. Boxes are HTML, connectors are one SVG.
  const line = "stroke-neutral-300";
  return (
    <div className="absolute top-[250px] left-16 h-[300px] w-[1152px]">
      <svg viewBox="0 0 1152 300" className="absolute inset-0 overflow-visible" aria-hidden>
        <defs>
          <marker
            id="arrow"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M0 0 8 4 0 8z" className="fill-neutral-400" />
          </marker>
          <marker
            id="arrow-good"
            viewBox="0 0 8 8"
            refX="7"
            refY="4"
            markerWidth="8"
            markerHeight="8"
            orient="auto"
          >
            <path d="M0 0 8 4 0 8z" className="fill-good" />
          </marker>
        </defs>
        {/* repo to Corpus */}
        <path
          d="M338 104 H 418"
          className={line}
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#arrow)"
        />
        {/* Corpus to people and agents */}
        <path
          d="M606 104 C 650 104, 650 50, 700 50"
          className={line}
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#arrow)"
        />
        <path
          d="M606 104 C 650 104, 650 166, 700 166"
          className={line}
          strokeWidth="1.5"
          fill="none"
          markerEnd="url(#arrow)"
        />
        {/* the loop: agent questions come back to the repo as drafts */}
        <path
          d="M926 222 V 268 Q 926 282 912 282 H 183 Q 169 282 169 268 V 166"
          className="stroke-good"
          strokeWidth="1.5"
          strokeDasharray="5 5"
          fill="none"
          markerEnd="url(#arrow-good)"
        />
      </svg>

      {/* Your repo */}
      <div className="absolute top-0 left-0 w-[338px] rounded-xl border bg-white">
        <div className="flex items-baseline justify-between border-b px-4 py-2.5">
          <span className="text-[14.5px] font-medium">Your git repo</span>
          <span className="text-[12.5px] text-muted">files you own</span>
        </div>
        <ul className="grid gap-1 px-4 py-3 font-mono text-[12.5px] leading-[1.55]">
          <li>components/button/button.component.yml</li>
          <li>components/button/button.twig</li>
          <li>docs/components/button.mdx</li>
          <li>tokens/charged-ui.tokens.json</li>
        </ul>
      </div>

      {/* Corpus */}
      <div className="absolute top-[52px] left-[418px] flex h-[104px] w-[188px] flex-col items-center justify-center rounded-xl bg-ink text-white">
        <CorpusMark className="size-6" />
        <p className="mt-2 text-[16px] font-semibold">Corpus</p>
        <p className="text-[12.5px] text-neutral-400">on your server</p>
      </div>

      {/* People */}
      <div className="absolute top-0 left-[700px] w-[452px] rounded-xl border bg-white px-4 py-3">
        <Dot tone="off" className="text-[14.5px] font-medium">
          People
        </Dot>
        <p className="mt-1 text-[14px] text-muted">
          A docs site with live previews:{" "}
          <code className="text-[12.5px] text-ink">docs.charged.dev</code>
        </p>
      </div>

      {/* Agents */}
      <div className="absolute top-[116px] left-[700px] w-[452px] rounded-xl border border-emerald-200 bg-white px-4 py-3">
        <Dot tone="good" className="text-[14.5px] font-medium">
          Agents
        </Dot>
        <p className="mt-1 text-[14px] text-muted">Claude Code, Cursor, and Codex over MCP</p>
        <code className="mt-1.5 block text-[12.5px]">get_component {'{ name: "button" }'}</code>
      </div>

      {/* The loop label, sitting on the dashed line */}
      <div className="absolute top-[266px] left-[338px] flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-1.5 text-[13.5px] whitespace-nowrap">
        <span className="font-medium">Questions the docs couldn’t answer</span>
        <span className="text-muted">come back as AI drafts to review</span>
      </div>
    </div>
  );
}

/* 7. Traction ------------------------------------------------------------ */

function Traction() {
  const groups: { tone: "good" | "warn" | "off"; label: string; items: ReactNode[] }[] = [
    {
      tone: "good",
      label: "Built",
      items: [
        "Ten screens: components, tokens, agents, editor, and more",
        "Agent output from the same source: Markdown, JSON, llms.txt",
        "An 8-phase build plan, each phase with a pass or fail check",
      ],
    },
    { tone: "warn", label: "Next", items: ["Phase 1: read a real design system repo from disk"] },
    { tone: "off", label: "Not yet", items: ["User research. This grant pays for it."] },
  ];
  return (
    <Slide section="Traction">
      <Body>
        <Title>What’s built: the whole product, as a clickable prototype.</Title>
        <div className="mt-9 grid grid-cols-[664px_1fr] gap-12">
          <figure>
            <Shot
              src={tractionShot}
              alt="The Corpus editor with the writing assistant, which has drafted an answer to a question agents asked 14 times"
            />
            <figcaption className="mt-3 text-[13.5px] leading-snug text-pretty text-muted">
              The editor drafting an answer agents asked for 14 times. Sample data from Charged UI;
              AI, git, and MCP calls are simulated until their build phases land.
            </figcaption>
          </figure>
          <div className="flex flex-col">
            <div className="grid gap-5">
              {groups.map((g) => (
                <div key={g.label}>
                  <Dot tone={g.tone} className="text-[15px] font-medium">
                    {g.label}
                  </Dot>
                  <ul className="mt-1.5 grid gap-1.5 pl-4 text-[15px] leading-[1.4]">
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

/* 8. Differentiation ----------------------------------------------------- */

type Cell = [tone: "good" | "warn" | "off", text: string];

function Differentiation() {
  const rows: { name: string; ds: Cell; home: Cell; agents: Cell; price: string; us?: boolean }[] =
    [
      {
        name: "Mintlify",
        ds: ["off", "No, general product docs"],
        home: ["off", "Their cloud"],
        agents: ["good", "Yes"],
        price: "Free, or $450/mo for Pro",
      },
      {
        name: "zeroheight",
        ds: ["good", "Yes"],
        home: ["off", "Their cloud"],
        agents: ["good", "Yes, 500 calls a month"],
        price: "Free for 1 editor, then $49/editor/mo",
      },
      {
        name: "Supernova",
        ds: ["good", "Yes"],
        home: ["off", "Their cloud"],
        agents: ["good", "Yes"],
        price: "Free tier, or $399/mo for Pro",
      },
      {
        name: "Storybook",
        ds: ["good", "Yes, for developers"],
        home: ["good", "Your repo"],
        agents: ["warn", "Preview, React only"],
        price: "Free, open source",
      },
      {
        name: "Corpus",
        ds: ["good", "Yes, Drupal first"],
        home: ["good", "Your repo, your server"],
        agents: ["good", "Yes, built in"],
        price: "$79 to $99, once",
        us: true,
      },
    ];
  const cell = ([tone, text]: Cell, us?: boolean) => (
    <Dot tone={tone} className={us ? "font-medium" : undefined}>
      {text}
    </Dot>
  );
  return (
    <Slide section="Differentiation">
      <Body>
        <Title className="max-w-[960px]">
          The design system docs you own: your repo, your server, one price.
        </Title>
        <Lead className="max-w-[900px]">
          Every other option with agent access keeps your docs in its cloud, or only reads React.
        </Lead>
        <table className="mt-9 w-full table-fixed border-collapse text-left text-[15px]">
          <colgroup>
            <col className="w-[150px]" />
            <col className="w-[270px]" />
            <col className="w-[210px]" />
            <col className="w-[220px]" />
            <col />
          </colgroup>
          <thead>
            <tr className="border-b text-[13.5px] text-muted">
              <th className="pb-2.5 font-normal" />
              <th className="pb-2.5 font-normal">Built for design systems</th>
              <th className="pb-2.5 font-normal">Where your docs live</th>
              <th className="pb-2.5 font-normal">Agents can read it</th>
              <th className="pb-2.5 font-normal">Price</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className={cn("border-b", r.us && "border-b-0 bg-subtle")}>
                <td className={cn("py-[13px]", r.us ? "pl-3 font-semibold" : "font-medium")}>
                  {r.us ? (
                    <span className="inline-flex items-center gap-2">
                      <CorpusMark className="size-4" />
                      {r.name}
                    </span>
                  ) : (
                    r.name
                  )}
                </td>
                <td>{cell(r.ds, r.us)}</td>
                <td>{cell(r.home, r.us)}</td>
                <td>{cell(r.agents, r.us)}</td>
                <td className={r.us ? "font-medium" : "text-muted"}>{r.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Source className="absolute bottom-0 max-w-[1080px] text-pretty">
          From each vendor’s pricing page and docs, November 2026. Prices billed yearly where both
          are listed. Mintlify Pro is $540 a month billed monthly, and self-hosting is Enterprise
          only. zeroheight Starter is $59 billed monthly, and its Free and Starter plans cap agent
          access at 500 calls a month. Storybook’s agent docs are in preview and React only. Corpus
          pricing is planned and gets tested on the landing page.
        </Source>
      </Body>
    </Slide>
  );
}

/* 9. Business model ------------------------------------------------------ */

function BusinessModel() {
  const terms: [string, ReactNode][] = [
    ["Price", "$79 to $99 for a one-time license per site. The landing page tests both prices."],
    [
      "Cost to serve",
      "Close to zero. Customers run Corpus on their own server with their own AI key, so there’s no hosting or AI bill per customer.",
    ],
    [
      "Who buys",
      <>
        Teams that keep a design system for Drupal, WordPress, or web components: agencies,
        universities, and product companies. <Fill value={FACTS.market} todo="how many teams" />
      </>,
    ],
    ["Reach", "The Drupal and WordPress communities I’ve sold into for years, then X."],
    ["Room to grow", "Web components (Lit) next, then React Native and WordPress blocks."],
    ["Goal", "Bootstrapped and profitable. Not raising venture capital."],
  ];
  return (
    <Slide section="Business model">
      <Body>
        <Title>Pay once, run it yourself. Each sale is nearly all margin.</Title>
        <div className="mt-10 grid grid-cols-[1fr_300px] gap-14">
          <dl className="divide-y border-y text-[16px] leading-[1.45]">
            {terms.map(([k, v]) => (
              <div key={k} className="grid grid-cols-[150px_1fr] gap-6 py-3">
                <dt className="font-medium">{k}</dt>
                <dd className="text-pretty text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="self-start rounded-xl border p-6">
            <p className="text-[14px] text-muted">I’ve run this model before</p>
            <p className="mt-3 text-[44px] leading-none font-semibold tracking-[-0.03em] tabular-nums">
              $75,000+
            </p>
            <p className="mt-3 text-[15px] leading-[1.45] text-pretty">
              in lifetime sales of one-time-priced products on ThemeForest, the bar for Envato’s
              Elite authors.
            </p>
          </div>
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
      "Posts aimed at design system, frontend, and developer tools audiences, sending people to the corpus.app waitlist. Half the visitors see $79, half see $99.",
    ],
    [
      "$500",
      "Ten paid user interviews",
      "30 minutes each, $50 per person, with design system maintainers from the waitlist.",
    ],
  ];
  const report = [
    "Cost per signup",
    "Waitlist size",
    "Landing page conversion rate",
    "Share willing to pay $79, and $99",
    "What teams use now, and what it costs them",
  ];
  return (
    <Slide section="Use of proceeds">
      <Body>
        <Title className="max-w-[920px]">
          $3,000 to learn whether teams will pay, before I build the rest.
        </Title>
        <div className="mt-12 grid grid-cols-[1fr_360px] gap-16">
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
      body: "Every screen, sample data, and the 8-phase build plan.",
      done: true,
    },
    {
      when: "Dec 2026",
      head: "Demand test",
      body: "Ads, waitlist, and interviews. Corpus reads a real repo from disk.",
    },
    {
      when: "Jan 2027",
      head: "Agents connect",
      body: "Claude Code and Cursor get Charged UI answers over MCP.",
    },
    {
      when: "Feb 2027",
      head: "Private beta",
      body: "Waitlist teams on their own repos. AI drafts answers, the editor commits to git.",
    },
    {
      when: "Spring 2027",
      head: "Launch",
      body: "One-container release, first paid licenses, and the IYA Venture Showcase.",
    },
  ];
  return (
    <Slide section="Milestones">
      <Body>
        <Title>By the Venture Showcase: a working MVP in real teams’ hands.</Title>
        <div className="relative mt-20">
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
        <h2 className="text-[58px] leading-[1.05] font-semibold tracking-[-0.035em] text-balance">
          Documentation your agents actually follow.
        </h2>
        <p className="mt-6 max-w-[620px] text-[21px] leading-[1.45] text-pretty text-muted">
          Self-hosted design system docs for people and coding agents. Pay once, and the docs stay
          yours.
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
              <span className="text-muted"> who has taken a developer tool to market</span>
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
  Team,
  Problem,
  WhyNow,
  Solution,
  HowItWorks,
  Traction,
  Differentiation,
  BusinessModel,
  Proceeds,
  Milestones,
  Close,
];
