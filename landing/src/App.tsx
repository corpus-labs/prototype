import { useEffect, useState, type ReactNode } from "react";
import { CONFIG, JOBS, type JobId } from "./config";
import { cn } from "./lib/utils";
import { ToolLogo, type ToolId } from "./tool-logo";
import { AppWindow, CorpusLogo, CorpusMark, Dot, Heading, Lattice, Shot } from "./ui";
import { BotDemo } from "./bot-demo";
import { visit } from "./visit";
import { PreviewNotice, WaitlistForm } from "./waitlist";
import heroShot from "./assets/hero-projects.png";
import splitShot from "./assets/split.png";
import editorShot from "./assets/editor.png";
import siteShot from "./assets/site.png";

const WRAP = "mx-auto w-full max-w-[1180px] px-5 sm:px-8";

/** Header links and the CTA jump to a section; the CTA also focuses the first email field. */
function joinNow() {
  const input = document.getElementById("email-hero") ?? document.getElementById("email-final");
  input?.scrollIntoView({ behavior: "smooth", block: "center" });
  window.setTimeout(() => (input as HTMLInputElement | null)?.focus({ preventScroll: true }), 400);
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 8);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  const link = "hidden rounded-md px-3 py-2 text-muted transition hover:text-ink md:block";
  return (
    <header
      className={cn(
        "sticky top-0 z-30 border-b bg-white/85 backdrop-blur-md transition-colors",
        scrolled ? "border-line" : "border-transparent",
      )}
    >
      <div className={cn(WRAP, "flex h-16 items-center justify-between")}>
        <a href="#top" aria-label="Corpus, back to top" className="rounded-md">
          <CorpusLogo className="h-[22px]" />
        </a>
        <nav aria-label="Sections" className="flex items-center gap-1 text-[14.5px]">
          <a className={link} href="#how">
            How it works
          </a>
          <a className={link} href="#plugins">
            Plugins
          </a>
          <a className={link} href="#pricing">
            Pricing
          </a>
          <a className={link} href="#faq">
            FAQ
          </a>
          <button
            type="button"
            onClick={joinNow}
            className="ml-2 rounded-lg bg-ink px-3.5 py-2 font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-neutral-300 focus-visible:outline-none"
          >
            Join the waitlist
          </button>
        </nav>
      </div>
    </header>
  );
}

/* Hero --------------------------------------------------------------------- */

const DEFAULT_LEAD =
  "Corpus is one notebook for your docs, help center, AI context, and design system. People, support bots, and every AI tool read the same pages. Host it yourself or with us, and pay once.";

function Hero() {
  return (
    <section id="top" className="relative isolate pt-14 sm:pt-24">
      {/* Texture behind the headline: strongest at the top right, gone before the screenshot. */}
      <Lattice
        className="top-20 h-[640px] opacity-55"
        fade="linear-gradient(to bottom, transparent, black 30%), radial-gradient(ellipse 55% 70% at 100% 25%, black 0%, rgb(0 0 0 / 0.45) 40%, transparent 75%)"
      />
      <div className={WRAP}>
        <div className="max-w-[860px]">
          <Dot tone="good" className="text-[14.5px] text-muted">
            Private beta opens {CONFIG.betaOpens}
          </Dot>
          <h1 className="mt-5 text-[44px] leading-[1.02] font-semibold tracking-[-0.045em] text-balance sm:text-[64px] lg:text-[76px]">
            Own what your company knows. Use it with any AI.
          </h1>
          <p className="mt-6 max-w-[640px] text-[18px] leading-[1.55] text-pretty text-muted sm:text-[20px]">
            {visit.job ? JOBS[visit.job].lead : DEFAULT_LEAD}
          </p>
          <WaitlistForm id="hero" className="mt-8 max-w-[540px]" />
        </div>
      </div>
      <div className="mx-auto mt-14 w-full max-w-[1260px] px-5 sm:mt-20 sm:px-8">
        <div className="relative">
          <AppWindow
            src={heroShot}
            width={2560}
            height={1450}
            address="corpus.app"
            alt="Corpus with three projects side by side: the Charged UI design system, a web team handbook, and a customer help center, each showing questions asked this week and the ones with no answer"
          />
          <Callout className="top-[60%] -left-6">
            <p className="text-[13px] text-muted">“How long do refunds take?”</p>
            <Dot tone="good" className="mt-1 text-[14px] font-medium">
              Answered from Refunds
            </Dot>
          </Callout>
          <Callout className="top-[19%] -right-6">
            <p className="text-[13px] text-muted">Connected over MCP</p>
            <p className="mt-1 text-[14px] font-medium">Claude Code, Codex, Cursor</p>
          </Callout>
        </div>
      </div>
    </section>
  );
}

/** A small card floating over the hero window, pointing at one thing the product does. */
function Callout({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div
      className={cn(
        "absolute hidden rounded-xl bg-white px-4 py-3 shadow-[0_0_0_1px_rgb(0_0_0/0.08),0_12px_32px_-12px_rgb(0_0_0/0.25)] lg:block",
        className,
      )}
    >
      {children}
    </div>
  );
}

/* Problem ------------------------------------------------------------------ */

function Problem() {
  const pains: [string, string][] = [
    [
      "Scattered",
      "Docs in Mintlify or GitBook, notes in Notion or Obsidian, help articles in Zendesk, and a different context file for every AI tool.",
    ],
    ["Rented", "Each one bills by the seat, the site, or the answer, every month."],
    [
      "Stuck",
      "Context saved inside one AI vendor stays there. Switch models, and you set it all up again.",
    ],
  ];
  return (
    <section className="py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="Your answers live in five places. They don’t agree."
          lead="Every copy was right once. Then the policy changed, one page got updated, and your support bot kept quoting the old one."
        />
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_560px] lg:gap-16">
          <ul className="divide-y border-y self-start">
            {pains.map(([head, body]) => (
              <li key={head} className="py-5">
                <p className="text-[18px] font-medium">{head}</p>
                <p className="mt-1 text-[16px] leading-[1.55] text-pretty text-muted">{body}</p>
              </li>
            ))}
          </ul>
          <FiveAnswers />
        </div>
      </div>
    </section>
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
    <figure className="self-start overflow-hidden rounded-2xl border bg-white">
      <figcaption className="border-b bg-subtle px-5 py-3.5 text-[14.5px] text-muted">
        Five places answer “How long do refunds take?”
      </figcaption>
      <ul className="divide-y text-[15.5px]">
        {answers.map(([where, said, note]) => (
          <li
            key={where}
            className="grid grid-cols-[120px_1fr] items-baseline gap-2 px-5 py-3.5 sm:grid-cols-[150px_1fr]"
          >
            <span className="text-muted">{where}</span>
            <Dot tone="bad" className="flex-wrap gap-y-0">
              {said}
              {note && <span className="text-[13.5px] text-muted">{note}</span>}
            </Dot>
          </li>
        ))}
        <li className="grid grid-cols-[120px_1fr] items-baseline gap-2 bg-good-soft px-5 py-3.5 sm:grid-cols-[150px_1fr]">
          <span className="text-muted">Team notes</span>
          <Dot tone="good">
            <span className="font-medium">“3 business days, since March”</span>
          </Dot>
        </li>
      </ul>
    </figure>
  );
}

/* Four jobs ---------------------------------------------------------------- */

const ICONS: Record<JobId, ReactNode> = {
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

function Icon({ job }: { job: JobId }) {
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
      {ICONS[job]}
    </svg>
  );
}

function Jobs() {
  const jobs: { id: JobId; body: string; instead: string }[] = [
    {
      id: "ai",
      body: "Plugins for Claude, Codex, and more recall your plans and decisions, and save new ones back.",
      instead: "a prompt file copied into every AI tool",
    },
    {
      id: "support",
      body: "A support bot answers customers from the pages your team already keeps, and links the one it used.",
      instead: "paying per answer for a bot that guesses",
    },
    {
      id: "docs",
      body: "Publish public docs, a help center, or an internal handbook, straight from the notebook.",
      instead: "a monthly bill for every docs site",
    },
    {
      id: "design",
      body: "Components, tokens, and usage rules, with live previews for people and exact rules for agents.",
      instead: "a design system site agents can’t read",
    },
  ];
  return (
    <section className="border-t bg-subtle py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="One notebook. Four jobs."
          lead="Write it once in Corpus, and every reader that needs it gets it: your team, your customers, and every AI tool you use. The files stay yours."
        />
        <ul className="mt-14 grid gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {jobs.map((j) => (
            <li
              key={j.id}
              className={cn(
                "border-t-2 pt-5",
                visit.job === j.id ? "border-ink" : "border-neutral-200",
              )}
            >
              <span className="grid size-10 place-items-center rounded-xl border bg-white text-ink">
                <Icon job={j.id} />
              </span>
              <p className="mt-4 text-[18px] font-medium">{JOBS[j.id].label}</p>
              <p className="mt-1.5 text-[15.5px] leading-[1.55] text-pretty text-muted">{j.body}</p>
              <p className="mt-3 text-[14px] leading-snug text-pretty">
                <span className="text-muted">Instead of </span>
                {j.instead}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Writing ------------------------------------------------------------------ */

function Writing() {
  const ways: [string, string][] = [
    ["/", "Insert any block: headings, lists, to-dos, quotes, code, tables"],
    ["[[", "Link another page by name, as a plain Markdown link"],
    ["Markdown", "Switch to the file itself whenever you want it"],
  ];
  return (
    <section id="write" className="py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="Write like it’s a notebook, because it is."
          lead="A toolbar, a slash menu, to-dos, and links between pages, the way Notion and Obsidian work. Every page is still a Markdown file you own."
        />
        <AppWindow
          src={editorShot}
          width={2560}
          height={1600}
          address="corpus.app"
          alt="Editing a handbook page in Corpus: a formatting toolbar above the page, a selection menu over bold text, and a to-do list with one item checked"
          className="mt-12"
        />
        <ul className="mt-8 grid gap-x-10 gap-y-4 border-t pt-6 sm:grid-cols-3">
          {ways.map(([key, text]) => (
            <li key={key} className="grid grid-cols-[auto_1fr] items-baseline gap-3 text-[15.5px]">
              <kbd className="rounded-md border bg-subtle px-1.5 py-0.5 font-mono text-[13px]">
                {key}
              </kbd>
              <span className="text-pretty text-muted">{text}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* Publishing --------------------------------------------------------------- */

function Publishing() {
  return (
    <section id="publish" className="border-t bg-subtle py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="Turn your notebook into a help center."
          lead="Docs, a help center, or a handbook, on your own domain: search, articles by topic, and a support bot that answers from those pages. Every page is also served as Markdown for AI tools."
        />
        <AppWindow
          src={siteShot}
          width={2560}
          height={1600}
          address="charged-help.corpus.app"
          alt="A published help center for Charged Labs: a search box, articles grouped by topic, and a support bot that answers from the same pages"
          className="mt-12"
        />
      </div>
    </section>
  );
}

/* How it works ------------------------------------------------------------- */

function HowItWorks() {
  const steps: [string, string][] = [
    [
      "Write",
      "Plain Markdown files you own, in folders, like a notebook. Edit them as rich text or as Markdown.",
    ],
    [
      "Publish and connect",
      "Publish a docs site or help center. One line connects Claude, Codex, or any MCP client.",
    ],
    [
      "Fill the gaps",
      "Questions nobody could answer show up in a list. AI drafts the page, and you review it.",
    ],
  ];
  return (
    <section id="how" className="border-t py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="Every reader gets the same words."
          lead="Write a page once. People read it on your site. Coding agents and your support bot get the same Markdown, word for word, so nobody works from an old copy."
        />
        <ol className="mt-12 grid gap-8 sm:grid-cols-3 sm:gap-10">
          {steps.map(([head, body], i) => (
            <li key={head} className="grid grid-cols-[24px_1fr] border-t pt-4">
              <span className="text-[15px] font-medium text-faint tabular-nums">{i + 1}</span>
              <div>
                <p className="text-[17px] font-medium">{head}</p>
                <p className="mt-1 text-[15.5px] leading-[1.55] text-pretty text-muted">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="mt-14">
          <div className="mb-3 hidden grid-cols-[52.5%_1fr] px-1 text-[15px] md:grid">
            <Dot tone="off">
              <span className="font-medium">People</span>
              <span className="text-muted">read the help page</span>
            </Dot>
            <Dot tone="good">
              <span className="font-medium">Agents and the support bot</span>
              <span className="text-muted">get the same words</span>
            </Dot>
          </div>
          <Shot
            src={splitShot}
            width={2448}
            height={800}
            alt="A help page about refunds in Corpus’s split view: the page as people read it, beside the Markdown agents get, with the same section highlighted on both sides"
          />
          <p className="mt-3 text-[14px] text-muted md:hidden">
            Left, the page people read. Right, the Markdown agents and the support bot get.
          </p>
        </div>
      </div>
    </section>
  );
}

/* Support bot -------------------------------------------------------------- */

function SupportBot() {
  return (
    <section id="support" className="border-t py-24 sm:py-32">
      <div className={cn(WRAP, "grid gap-12 lg:grid-cols-[400px_1fr] lg:gap-16")}>
        <div>
          <Heading
            title="A support bot that cites its source, or says it doesn’t know."
            lead="It answers customers only from your help center’s pages and links the page it used. When no page covers a question, it hands off to a person instead of guessing."
          />
          <p className="mt-6 text-[15.5px] leading-[1.55] text-pretty">
            <span className="font-medium">Try it.</span>{" "}
            <span className="text-muted">
              Ask about refunds, licenses, invoices, installing a theme, or updates. Then ask
              something those pages don’t cover.
            </span>
          </p>
        </div>
        <div className="self-center">
          <BotDemo />
          <p className="mt-3 text-[13.5px] text-muted">
            A live demo, running on the five sample help pages from the prototype.
          </p>
        </div>
      </div>
    </section>
  );
}

/* Any AI ------------------------------------------------------------------- */

function Tile({ tile, className }: { tile: ToolId; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg border bg-white text-ink",
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
      <p className="max-w-[85%] justify-self-end rounded-2xl rounded-br-md bg-ink px-3.5 py-2 text-[15px] text-white">
        {ask}
      </p>
      <div className="text-[15px] leading-[1.5]">{reply}</div>
    </div>
  );
  return (
    <figure className="shot divide-y overflow-hidden bg-white">
      {turn(
        "claude",
        "Claude Code",
        "Monday",
        "Remember that refunds now take 3 business days.",
        <>
          <Dot tone="good">Saved to Customer help, Refunds</Dot>
          <p className="mt-1 pl-4 text-[13.5px] text-muted">
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
          <p className="mt-1 text-[13.5px] text-muted">From Customer help, Refunds</p>
        </>,
      )}
    </figure>
  );
}

function PluginsSection() {
  const tools: [ToolId, string][] = [
    ["claude", "Claude"],
    ["codex", "Codex"],
    ["cursor", "Cursor"],
    ["zai", "Z.ai"],
    ["deepseek", "DeepSeek"],
    ["grok", "Grok"],
  ];
  const rows: [string, string][] = [
    ["Recall", "Agents answer from your notebook and cite the page they used."],
    ["Save", "They save decisions and fixes back as drafts your team approves."],
    ["One click", "No terminal or config file, so it works for everyone, not just engineers."],
  ];
  return (
    <section id="plugins" className="border-t bg-subtle py-24 sm:py-32">
      <div className={cn(WRAP, "grid gap-12 lg:grid-cols-[1fr_520px] lg:gap-16")}>
        <div>
          <Heading
            title="Plugins give every AI tool the same memory."
            lead="Install Corpus in Claude, Codex, Cursor, Z.ai, DeepSeek, or Grok. What one tool saves, every other tool can recall, so switching models never means starting over."
          />
          <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
            {tools.map(([tile, name]) => (
              <li key={name} className="flex items-center gap-2.5 text-[15px] font-medium">
                <Tile tile={tile} />
                {name}
              </li>
            ))}
          </ul>
          <dl className="mt-8 divide-y border-y">
            {rows.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[120px_1fr] sm:gap-6">
                <dt className="text-[15.5px] font-medium">{k}</dt>
                <dd className="text-[15.5px] leading-[1.55] text-pretty text-muted">{v}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-5 text-[14px] leading-[1.6] text-muted">
            Prefer the terminal? Any MCP client connects in one line:{" "}
            <code className="font-mono text-[13px] break-all text-ink">
              claude mcp add --transport http charged-help https://charged-help.corpus.app/mcp
            </code>
          </p>
        </div>
        <div className="self-center">
          <SharedMemory />
          <p className="mt-3 text-[13.5px] text-muted">
            Saved in one tool on Monday, recalled in another today.
          </p>
        </div>
      </div>
    </section>
  );
}

/* Pricing ------------------------------------------------------------------ */

function Pricing() {
  const today: [name: string, plan: string, price: string][] = [
    ["Mintlify", "Pro", "$450 a month"],
    ["Zendesk", "Suite Team", "$55 an agent a month, plus $1.50 an AI answer"],
    ["GitBook", "Essential", "$65 a site, plus $12 a user, a month"],
    ["zeroheight", "Starter", "$49 an editor a month"],
    ["Obsidian", "Sync and Publish", "$12 a person a month"],
  ];
  const included = [
    "Docs, help center, AI context, and design systems",
    "Self-host on your server, or let us host it",
    "Any AI on your own key, with no usage fees",
    "Your content stays a folder of Markdown",
  ];
  return (
    <section id="pricing" className="border-t py-24 sm:py-32">
      <div className={WRAP}>
        <Heading
          title="Pay once. Own it for life."
          lead="Corpus is a one-time license, not a subscription. Bring your own server and AI key, or let us host it. Hosted plans are priced at launch."
        />
        <div className="mt-12 grid gap-12 lg:grid-cols-[440px_1fr] lg:gap-16">
          <div className="self-start rounded-2xl border p-6 sm:p-8">
            <p className="text-[15px] text-muted">Launch price</p>
            <p className="mt-2 flex items-baseline gap-2">
              <span className="text-[56px] leading-none font-semibold tracking-[-0.04em] tabular-nums">
                ${visit.price}
              </span>
              <span className="text-[18px] text-muted">once</span>
            </p>
            <ul className="mt-6 grid gap-2.5 border-t pt-5 text-[15.5px] leading-[1.45]">
              {included.map((it) => (
                <li key={it} className="flex gap-2.5">
                  <span className="mt-[8px] size-2 shrink-0 rounded-full bg-good" />
                  {it}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={joinNow}
              className="mt-7 inline-flex h-11 w-full items-center justify-center rounded-xl bg-ink px-5 text-[15.5px] font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-neutral-300 focus-visible:outline-none"
            >
              Join the waitlist
            </button>
            <p className="mt-3 text-center text-[13.5px] text-muted">
              The waitlist gets the private beta first.
            </p>
          </div>
          <div>
            <p className="text-[16px] font-medium">What teams pay today</p>
            <ul className="mt-3 divide-y border-y">
              {today.map(([name, plan, price]) => (
                <li
                  key={name}
                  className="grid gap-1 py-3.5 sm:grid-cols-[200px_1fr] sm:items-baseline sm:gap-6"
                >
                  <span className="text-[15.5px]">
                    <span className="font-medium">{name}</span>{" "}
                    <span className="text-muted">{plan}</span>
                  </span>
                  <span className="text-[15.5px] text-muted">{price}</span>
                </li>
              ))}
              <li className="grid gap-1 bg-good-soft px-3 py-3.5 sm:grid-cols-[200px_1fr] sm:items-baseline sm:gap-6 sm:px-0 sm:pl-3">
                <span className="flex items-center gap-2 text-[15.5px] font-semibold">
                  <CorpusMark className="size-4" />
                  Corpus
                </span>
                <span className="text-[15.5px] font-semibold sm:-ml-3">${visit.price} once</span>
              </li>
            </ul>
            <p className="mt-3 text-[13px] leading-[1.5] text-pretty text-faint">
              Entry paid plans from each vendor’s pricing page, November 2026, billed yearly.
              Obsidian’s app is free; Sync is $4 a person and Publish $8 a site, each month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* FAQ ---------------------------------------------------------------------- */

function Faq() {
  const items: [string, string][] = [
    [
      "When can I use it?",
      `The private beta opens in ${CONFIG.betaOpens} for teams on the waitlist, and Corpus launches in ${CONFIG.launches}. The waitlist hears first, by email.`,
    ],
    [
      "Where does my content live?",
      "In Markdown files you own: in your own git repository on your server, or in Corpus cloud. Moving between the two means copying a folder.",
    ],
    [
      "Which AI tools does it work with?",
      "Plugins for Claude, Codex, Cursor, Z.ai, DeepSeek, and Grok install in one click. Any other tool that speaks MCP or reads llms.txt works too. Drafting and the support bot run on your own key with Anthropic, OpenAI, Z.ai, DeepSeek, OpenRouter, or a local model.",
    ],
    [
      "Why a one-time price?",
      "When you self-host, you bring the server and the AI key, so there’s nothing for Corpus to bill you for each month. Pay once, and the version you bought keeps working. Hosted plans are priced at launch.",
    ],
    [
      "Do I need Drupal, WordPress, or Notion?",
      "No. Corpus stands on its own. Plugins for WordPress and Drupal, and imports from Notion, are planned after launch.",
    ],
  ];
  return (
    <section id="faq" className="border-t py-24 sm:py-32">
      <div className={cn(WRAP, "grid gap-10 lg:grid-cols-[400px_1fr] lg:gap-16")}>
        <Heading title="Questions" />
        <div className="divide-y border-y">
          {items.map(([q, a]) => (
            <details key={q} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-md py-4 text-[17px] font-medium outline-none focus-visible:ring-4 focus-visible:ring-neutral-200 [&::-webkit-details-marker]:hidden">
                {q}
                <svg
                  viewBox="0 0 16 16"
                  className="size-4 shrink-0 text-muted transition-transform group-open:rotate-45"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <path d="M8 3v10M3 8h10" />
                </svg>
              </summary>
              <p className="max-w-[640px] pb-5 text-[16px] leading-[1.6] text-pretty text-muted">
                {a}
              </p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Final CTA and footer ----------------------------------------------------- */

function Join() {
  return (
    <section
      id="join"
      className="relative isolate overflow-hidden border-t bg-subtle py-24 sm:py-32"
    >
      <Lattice fade="radial-gradient(ellipse 70% 120% at 100% 100%, black 0%, rgb(0 0 0 / 0.5) 40%, transparent 75%)" />
      <div className={WRAP}>
        <div className="max-w-[920px]">
          <h2 className="text-[38px] leading-[1.05] font-semibold tracking-[-0.04em] text-balance sm:text-[56px]">
            Write it once. Own it for life. <br className="hidden sm:block" />
            Use it with any AI.
          </h2>
          <p className="mt-5 max-w-[560px] text-[18px] leading-[1.55] text-pretty text-muted">
            Join the waitlist for the private beta. Early teams shape what Corpus does first.
          </p>
          <WaitlistForm id="final" className="mt-8 max-w-[540px]" />
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t py-10 pb-16">
      <div
        className={cn(
          WRAP,
          "flex flex-col gap-4 text-[14px] text-muted sm:flex-row sm:items-center sm:justify-between",
        )}
      >
        <div className="flex items-center gap-2.5">
          <CorpusMark className="size-4 text-ink" />
          <span>Corpus, built at the USC Iovine Young Academy</span>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            className="underline-offset-4 hover:text-ink hover:underline"
            href={`https://${CONFIG.repo}`}
          >
            Prototype on GitHub
          </a>
          {CONFIG.contactEmail && (
            <a
              className="underline-offset-4 hover:text-ink hover:underline"
              href={`mailto:${CONFIG.contactEmail}`}
            >
              {CONFIG.contactEmail}
            </a>
          )}
          <span>© 2026</span>
        </div>
      </div>
    </footer>
  );
}

export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <Problem />
        <Jobs />
        <Writing />
        <Publishing />
        <HowItWorks />
        <SupportBot />
        <PluginsSection />
        <Pricing />
        <Faq />
        <Join />
      </main>
      <Footer />
      <PreviewNotice />
    </>
  );
}
