// Exploration: the published site a docs project builds, as its readers see it.
// Rendered without Corpus's own chrome, in the documented company's tokens (--cui-*).
// See docs/decisions/0001-knowledge-notebook.md.
import * as React from "react";
import {
  BookOpenIcon,
  CheckIcon,
  CopyIcon,
  CreditCardIcon,
  FileTextIcon,
  MoonIcon,
  RocketIcon,
  SearchIcon,
  SunIcon,
  ThumbsDownIcon,
  ThumbsUpIcon,
} from "lucide-react";

import { toast } from "@/components/ui/toast";
import { CorpusMark } from "@/components/corpus-logo";
import { copyText } from "@/components/common";
import type { DocPage, DocsProject } from "@/data/workspace";
import { resolveLink } from "@core/markdown/links";
import { LinkResolver } from "@/lib/mdx-lite";
import { foldersOf } from "@/lib/projects";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { answerFrom, type BotReply } from "@/lib/support";
import { cn } from "@/lib/utils";
import { MdxPeople } from "@/pages/guidelines";

const FOLDER_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  "Getting started": RocketIcon,
  Billing: CreditCardIcon,
};

/** Getting started first, the way readers expect a help center to open. */
function topics(pages: DocPage[]) {
  return foldersOf(pages).sort(
    ([a], [b]) => Number(b === "Getting started") - Number(a === "Getting started"),
  );
}

const href = (project: DocsProject, page?: DocPage) =>
  page ? `#site-${project.id}-${page.id}` : `#site-${project.id}`;

/** Headings in a page's body, for the "On this page" list. */
function headingsOf(body: string) {
  return [...body.matchAll(/^#{2,3}\s+(.+)$/gm)].map((m) => m[1].trim());
}

/** Plain search across titles, descriptions, and text: every word has to appear. */
function searchPages(pages: DocPage[], query: string) {
  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 1);
  if (!words.length) return [];
  return pages
    .filter((p) => {
      const text = `${p.title} ${p.description} ${p.body}`.toLowerCase();
      return words.every((w) => text.includes(w));
    })
    .slice(0, 5);
}

/* Header and footer ------------------------------------------------------- */

function Brand({ project }: { project: DocsProject }) {
  return (
    <a href={href(project)} className="flex items-center gap-2.5 rounded-md outline-none">
      <span className="grid size-7 place-items-center rounded-lg bg-(--cui-charge) text-white">
        <span className="text-[14px] font-bold">A</span>
      </span>
      <span className="text-[15px] font-semibold tracking-[-0.01em]">Acme, Inc</span>
      <span className="text-[15px] text-(--cui-muted)">Help</span>
    </a>
  );
}

function SiteHeader({ project, onSearch }: { project: DocsProject; onSearch: () => void }) {
  const { dark, setTheme } = useStore();
  return (
    <header className="sticky top-0 z-30 border-b border-(--cui-line) bg-(--cui-surface)/90 backdrop-blur-md">
      <div className="mx-auto flex h-15 max-w-[1280px] items-center gap-4 px-5 md:px-8">
        <Brand project={project} />
        <button
          type="button"
          onClick={onSearch}
          className="ml-auto flex h-9 w-9 items-center gap-2 rounded-lg border border-(--cui-line) px-2.5 text-sm text-(--cui-muted) transition-colors hover:bg-(--cui-subtle) sm:w-60"
        >
          <SearchIcon className="size-4 shrink-0" />
          <span className="hidden sm:inline">Search help</span>
          <kbd className="ml-auto hidden font-sans text-xs sm:inline">⌘K</kbd>
        </button>
        <a
          href="#ask"
          onClick={(e) => {
            e.preventDefault();
            if (window.location.hash !== href(project)) navigate(`site-${project.id}`);
            window.setTimeout(
              () => document.getElementById("ask")?.scrollIntoView({ behavior: "smooth" }),
              50,
            );
          }}
          className="hidden h-9 items-center rounded-lg bg-(--cui-ink) px-3.5 text-sm font-medium text-(--cui-surface) transition-opacity hover:opacity-90 sm:flex"
        >
          Ask a question
        </a>
        <button
          type="button"
          aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
          onClick={() => setTheme(dark ? "light" : "dark")}
          className="grid size-9 place-items-center rounded-lg text-(--cui-muted) transition-colors hover:bg-(--cui-subtle) hover:text-(--cui-ink)"
        >
          {dark ? <SunIcon className="size-4" /> : <MoonIcon className="size-4" />}
        </button>
      </div>
    </header>
  );
}

function SiteFooter({ project }: { project: DocsProject }) {
  return (
    <footer className="border-t border-(--cui-line)">
      <div className="mx-auto flex max-w-[1280px] flex-col gap-4 px-5 py-8 text-sm text-(--cui-muted) sm:flex-row sm:items-center sm:justify-between md:px-8">
        <span>© 2026 Acme, Inc</span>
        <span className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <span>
            For AI tools: <code className="font-mono text-[13px]">{project.site}/llms.txt</code>
          </span>
          <a
            href="#projects"
            className="flex items-center gap-1.5 rounded-md border border-(--cui-line) px-2 py-1 text-[13px] text-(--cui-ink) transition-colors hover:bg-(--cui-subtle)"
          >
            <CorpusMark className="size-3.5" />
            Built with Corpus
          </a>
        </span>
      </div>
    </footer>
  );
}

/** The prototype's way back to the editor. Not part of the published site. */
function BackToCorpus({ project }: { project: DocsProject }) {
  return (
    <a
      href={`#${project.id}`}
      data-prototype-only
      className="fixed right-4 bottom-4 z-40 flex items-center gap-2 rounded-full bg-foreground px-3.5 py-2 text-[13px] font-medium text-background shadow-lg"
    >
      <CorpusMark className="size-3.5" />
      Back to Corpus
    </a>
  );
}

/* Search ------------------------------------------------------------------- */

function SearchBox({
  project,
  inputRef,
  large,
}: {
  project: DocsProject;
  inputRef: React.RefObject<HTMLInputElement | null>;
  large?: boolean;
}) {
  const [query, setQuery] = React.useState("");
  const results = searchPages(project.pages, query);
  return (
    <div className="relative">
      <SearchIcon
        className={cn(
          "pointer-events-none absolute top-1/2 -translate-y-1/2 text-(--cui-muted)",
          large ? "left-4 size-5" : "left-3 size-4",
        )}
      />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search refunds, licenses, installing…"
        aria-label="Search help"
        className={cn(
          "w-full rounded-xl border border-(--cui-line) bg-(--cui-surface) text-(--cui-ink) shadow-xs transition outline-none placeholder:text-(--cui-muted) focus:border-(--cui-charge) focus:ring-4 focus:ring-(--cui-charge-soft)",
          large ? "h-14 pr-4 pl-12 text-[17px]" : "h-10 pr-3 pl-9 text-sm",
        )}
      />
      {query.trim().length > 1 && (
        <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-xl border border-(--cui-line) bg-(--cui-surface) shadow-lg">
          {results.length ? (
            <ul className="divide-y divide-(--cui-line)">
              {results.map((p) => (
                <li key={p.id}>
                  <a
                    href={href(project, p)}
                    className="flex items-start gap-3 px-4 py-3 transition-colors hover:bg-(--cui-subtle)"
                  >
                    <FileTextIcon className="mt-0.5 size-4 shrink-0 text-(--cui-muted)" />
                    <span className="min-w-0">
                      <span className="block text-[15px] font-medium">{p.title}</span>
                      <span className="block truncate text-sm text-(--cui-muted)">
                        {p.folder}, {p.description}
                      </span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-4 py-3 text-sm text-(--cui-muted)">
              No page matches. Try asking below instead.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/* Ask ---------------------------------------------------------------------- */

function Ask({ project }: { project: DocsProject }) {
  const [question, setQuestion] = React.useState("");
  const [asked, setAsked] = React.useState<{ q: string; reply: BotReply } | null>(null);
  const ask = (q: string) => {
    const text = q.trim();
    if (!text) return;
    setQuestion(text);
    setAsked({ q: text, reply: answerFrom(text, project.pages) });
  };
  const examples = project.questions.filter((q) => q.status === "answered").slice(0, 3);
  return (
    <section id="ask" className="scroll-mt-24">
      <h2 className="text-xl font-semibold tracking-[-0.02em]">Ask a question</h2>
      <p className="mt-1 text-[15px] text-(--cui-muted)">
        Answers come from these pages, with a link to the one used.
      </p>
      <div className="mt-5 overflow-hidden rounded-2xl border border-(--cui-line) bg-(--cui-surface)">
        <form
          className="flex gap-2 border-b border-(--cui-line) p-3"
          onSubmit={(e) => {
            e.preventDefault();
            ask(question);
          }}
        >
          <input
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask in your own words"
            aria-label="Your question"
            className="h-10 min-w-0 flex-1 rounded-lg bg-transparent px-2 text-[15px] outline-none placeholder:text-(--cui-muted)"
          />
          <button
            type="submit"
            disabled={!question.trim()}
            className="h-10 rounded-lg bg-(--cui-charge) px-4 text-sm font-medium text-white transition-colors hover:bg-(--cui-charge-deep) disabled:opacity-50"
          >
            Ask
          </button>
        </form>
        <div className="px-5 py-4" aria-live="polite">
          {asked ? (
            asked.reply.kind === "answer" ? (
              <>
                <p className="text-[15px] leading-relaxed text-pretty">{asked.reply.text}</p>
                <a
                  href={href(project, asked.reply.page)}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-(--cui-charge) hover:underline"
                >
                  <FileTextIcon className="size-4" />
                  {asked.reply.page.title}
                  {asked.reply.section ? `, ${asked.reply.section}` : ""}
                </a>
              </>
            ) : (
              <p className="text-[15px] leading-relaxed text-pretty">
                <span className="font-medium">No page answers that yet.</span>{" "}
                <span className="text-(--cui-muted)">
                  We’ve passed it to the team, and a person will reply by email.
                </span>
              </p>
            )
          ) : (
            <div className="flex flex-wrap gap-2">
              {examples.map((q) => (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => ask(q.text)}
                  className="rounded-full border border-(--cui-line) px-3 py-1.5 text-sm text-(--cui-muted) transition-colors hover:border-(--cui-charge) hover:text-(--cui-ink)"
                >
                  {q.text}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* Home --------------------------------------------------------------------- */

function SiteHome({
  project,
  searchRef,
}: {
  project: DocsProject;
  searchRef: React.RefObject<HTMLInputElement | null>;
}) {
  const popular = project.questions.filter((q) => q.status === "answered");
  return (
    <main>
      <section className="border-b border-(--cui-line) bg-(--cui-subtle)">
        <div className="mx-auto max-w-[1280px] px-5 py-14 md:px-8 md:py-20">
          <div className="max-w-[640px]">
            <h1 className="text-[36px] leading-tight font-semibold tracking-[-0.035em] md:text-[44px]">
              How can we help?
            </h1>
            <p className="mt-3 text-[17px] text-(--cui-muted)">
              Installing, updating, and paying for themes from Acme, Inc.
            </p>
            <div className="mt-7">
              <SearchBox project={project} inputRef={searchRef} large />
            </div>
            <p className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-(--cui-muted)">
              <span>Popular:</span>
              {popular.slice(0, 3).map((q) => (
                <a
                  key={q.id}
                  href={q.source ? `#site-${q.source.route}` : undefined}
                  className="text-(--cui-ink) underline decoration-(--cui-line) underline-offset-4 hover:decoration-(--cui-charge)"
                >
                  {q.source?.label}
                </a>
              ))}
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1280px] gap-14 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-16">
        <section>
          <h2 className="text-xl font-semibold tracking-[-0.02em]">Browse by topic</h2>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {topics(project.pages).map(([folder, pages]) => {
              const Icon = FOLDER_ICON[folder] ?? BookOpenIcon;
              return (
                <div
                  key={folder}
                  className="rounded-2xl border border-(--cui-line) bg-(--cui-surface) p-5"
                >
                  <div className="flex items-center gap-3">
                    <span className="grid size-9 place-items-center rounded-lg bg-(--cui-charge-soft) text-(--cui-charge)">
                      <Icon className="size-[18px]" />
                    </span>
                    <span>
                      <span className="block text-[16px] font-semibold">{folder}</span>
                      <span className="block text-[13px] text-(--cui-muted)">
                        {pages.length} {pages.length === 1 ? "article" : "articles"}
                      </span>
                    </span>
                  </div>
                  <ul className="mt-4 divide-y divide-(--cui-line) border-t border-(--cui-line)">
                    {pages.map((p) => (
                      <li key={p.id}>
                        <a href={href(project, p)} className="group block py-3">
                          <span className="block text-[15px] font-medium group-hover:text-(--cui-charge)">
                            {p.title}
                          </span>
                          <span className="mt-0.5 block text-sm text-pretty text-(--cui-muted)">
                            {p.description}
                          </span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>
        <Ask project={project} />
      </div>
    </main>
  );
}

/* A page ------------------------------------------------------------------- */

function SitePage({ project, page }: { project: DocsProject; page: DocPage }) {
  const [helpful, setHelpful] = React.useState<"yes" | "no" | null>(null);
  const ordered = topics(project.pages).flatMap(([, pages]) => pages);
  const i = ordered.findIndex((p) => p.id === page.id);
  const prev = ordered[i - 1];
  const next = ordered[i + 1];
  const headings = headingsOf(page.body);
  // Relative links in the page open the page they point to on the site.
  const resolve = (target: string) => {
    const path = resolveLink(page.path, target);
    const hit = project.pages.find((p) => p.path === path);
    return hit ? href(project, hit) : undefined;
  };
  const md = `# ${page.title}\n\n${page.description}\n\n${page.body}`;

  return (
    <main className="mx-auto grid max-w-[1280px] gap-10 px-5 py-10 md:grid-cols-[220px_minmax(0,1fr)] md:px-8 xl:grid-cols-[220px_minmax(0,1fr)_200px]">
      <nav aria-label="Articles" className="hidden md:block">
        <div className="sticky top-24 grid gap-6 text-sm">
          {topics(project.pages).map(([folder, pages]) => (
            <div key={folder}>
              <p className="mb-1.5 px-2.5 text-[13px] font-medium text-(--cui-muted)">{folder}</p>
              <ul className="grid gap-0.5">
                {pages.map((p) => (
                  <li key={p.id}>
                    <a
                      href={href(project, p)}
                      aria-current={p.id === page.id ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-2.5 py-1.5 transition-colors hover:bg-(--cui-subtle)",
                        p.id === page.id &&
                          "bg-(--cui-charge-soft) font-medium text-(--cui-charge)",
                      )}
                    >
                      {p.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      <article className="min-w-0">
        <p className="text-sm text-(--cui-muted)">
          <a href={href(project)} className="hover:text-(--cui-ink)">
            Help
          </a>
          <span className="mx-2">/</span>
          {page.folder}
        </p>
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[32px] leading-tight font-semibold tracking-[-0.03em]">
              {page.title}
            </h1>
            <p className="mt-2 text-[17px] text-(--cui-muted)">{page.description}</p>
          </div>
          <button
            type="button"
            onClick={async () => {
              if (await copyText(md))
                toast.add({
                  title: "Page copied as Markdown",
                  description: "Paste it into any AI tool.",
                });
            }}
            className="flex shrink-0 items-center gap-2 self-start rounded-lg border border-(--cui-line) px-3 py-1.5 text-sm transition-colors hover:bg-(--cui-subtle)"
          >
            <CopyIcon className="size-3.5" />
            Copy page
          </button>
        </div>
        <p className="mt-3 text-[13px] text-(--cui-muted)">Updated {page.updated.toLowerCase()}</p>

        <div className="mt-8 border-t border-(--cui-line) pt-8">
          <LinkResolver.Provider value={resolve}>
            <MdxPeople body={page.body} />
          </LinkResolver.Provider>
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-3 border-t border-(--cui-line) pt-6 text-sm">
          {helpful ? (
            <span className="flex items-center gap-2 text-(--cui-muted)">
              <CheckIcon className="size-4 text-(--cui-success)" />
              Thanks. That helps us improve this page.
            </span>
          ) : (
            <>
              <span className="text-(--cui-muted)">Was this page helpful?</span>
              {(
                [
                  ["yes", "Yes", ThumbsUpIcon],
                  ["no", "No", ThumbsDownIcon],
                ] as const
              ).map(([v, label, Icon]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setHelpful(v)}
                  className="flex items-center gap-1.5 rounded-lg border border-(--cui-line) px-3 py-1.5 transition-colors hover:bg-(--cui-subtle)"
                >
                  <Icon className="size-3.5" />
                  {label}
                </button>
              ))}
            </>
          )}
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <a
              href={href(project, prev)}
              className="rounded-xl border border-(--cui-line) p-4 transition-colors hover:border-(--cui-charge)"
            >
              <span className="block text-[13px] text-(--cui-muted)">Previous</span>
              <span className="mt-0.5 block font-medium">{prev.title}</span>
            </a>
          ) : (
            <span />
          )}
          {next && (
            <a
              href={href(project, next)}
              className="rounded-xl border border-(--cui-line) p-4 text-right transition-colors hover:border-(--cui-charge)"
            >
              <span className="block text-[13px] text-(--cui-muted)">Next</span>
              <span className="mt-0.5 block font-medium">{next.title}</span>
            </a>
          )}
        </div>
      </article>

      {headings.length > 0 && (
        <aside className="hidden xl:block">
          <div className="sticky top-24 text-sm">
            <p className="mb-2 text-[13px] font-medium">On this page</p>
            <ul className="grid gap-1.5 border-l border-(--cui-line)">
              {headings.map((h) => (
                <li
                  key={h}
                  className="-ml-px border-l border-transparent pl-3 text-(--cui-muted) hover:border-(--cui-ink) hover:text-(--cui-ink)"
                >
                  {h}
                </li>
              ))}
            </ul>
          </div>
        </aside>
      )}
    </main>
  );
}

/* The site ---------------------------------------------------------------- */

/** A docs project's published site: its home page, or one page with the article list beside it. */
export function PublishedSite({
  project,
  pageId,
}: {
  project: DocsProject;
  pageId: string | null;
}) {
  const { dark } = useStore();
  const searchRef = React.useRef<HTMLInputElement>(null);
  const page = pageId ? project.pages.find((p) => p.id === pageId) : undefined;

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        if (pageId) navigate(`site-${project.id}`);
        window.setTimeout(() => searchRef.current?.focus(), 50);
      }
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, [pageId, project.id]);

  return (
    <div className="cui min-h-svh bg-(--cui-surface)" data-canvas={dark ? "dark" : "light"}>
      <SiteHeader
        project={project}
        onSearch={() => {
          if (pageId) navigate(`site-${project.id}`);
          window.setTimeout(() => searchRef.current?.focus(), 50);
        }}
      />
      {page ? (
        <SitePage project={project} page={page} />
      ) : (
        <SiteHome project={project} searchRef={searchRef} />
      )}
      <SiteFooter project={project} />
      <BackToCorpus project={project} />
    </div>
  );
}
