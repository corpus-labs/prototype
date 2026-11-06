# CLAUDE.md

## What Corpus is

Corpus is self-hosted documentation for design systems. The idea in one line: document a design system once, and designers, developers, and coding agents all read the same source.

- People read a site: component pages with live previews, usage rules, do and don't examples, props, and tokens.
- Agents read the same content over MCP, llms.txt, and Markdown URLs (any page plus `.md`).
- Agent traffic shows what's missing. When the docs can't answer something, it becomes a writing task, and an AI assistant running on the owner's own API key drafts the answer for review.

Content lives as files in the customer's git repo: MDX pages, component schemas, and token JSON. Corpus never holds the only copy. It ships as one container the customer runs.

The first customer is Charged UI: Drupal single directory components (SDC) and Lit web components, with Charged Native (React Native + Uniwind) coming later. All three are built to one spec per component.

## Current state

This repo started as a clickable prototype. Everything in `src/` runs in the browser on sample data from `src/data/workspace.ts`. Git commits, MCP calls, AI drafting, Figma sync, and imports are all simulated.

We are turning it into a working prototype. Follow `PLAN.md` one phase at a time. Check off tasks in `PLAN.md` as they land, and don't start a phase until the previous phase's "Done when" is true.

Simulated pieces get replaced, not extended. Don't add features on top of `src/data/workspace.ts` or the fake `commit()` in `src/lib/store.tsx`.

## Commands

```bash
npm run dev            # Vite dev server (from Phase 2: Vite and the API server together)
npm run typecheck      # tsc, strict
npm run build:single   # the static single-file prototype in dist/index.html
npm test               # vitest (from Phase 1)
npm run corpus:inspect -- <content-dir>   # from Phase 1: print the parsed workspace and validation issues
```

## Layout

```
src/                  React app (the editor). Becomes the web client.
  components/ui/      shadcn components, base-nova style. Added with the CLI.
  components/         app shell, shared pieces, Charged UI previews (charged-ui.tsx)
  pages/              one file per screen
  lib/                store, router, formatters (formatters move to core/ in Phase 2)
  data/               sample data. Becomes fixtures in Phase 1, then deleted.
core/                 Phase 1. Framework-free TypeScript: model, loaders, formatters, search, checks.
  load/               the only part of core/ that uses Node APIs (fs). Never import it from src/.
server/               Phase 2. Hono server: editor API, MCP endpoint, llms.txt and .md routes, git, AI.
fixtures/charged-ui/  Phase 1. A sample content repo used in dev and tests.
docs/decisions/       Short decision records. Read 0000-foundations.md first.
```

Everything in `core/` except `core/load/` must stay importable from the browser.

## Domain model

- **Workspace**: config plus everything loaded from one content repo.
- **ComponentSpec**: the canonical, platform-free description of a component: id, name, status, category, summary, props, slots, rules, examples, accessibility notes, tokens used, related components. One spec per component.
- **Implementation**: how one platform realizes a spec. `drupal-sdc` (component.yml and Twig) first, then `lit` (custom-elements.json), later `react-native` and `wp-block` (block.json). Props come from the implementation's schema and get checked against the spec for drift.
- **DocBlock**: one parsed MDX block. Both renderers consume DocBlocks: React for people, Markdown or JSON for agents. Never compile or execute MDX or JSX.
- **Rule**: one list item in the `## Rules` section of a component's MDX, starting with MUST, MUST NOT, SHOULD, or SHOULD NOT. That section is the only place rules live. Do and Dont blocks are examples, not rules. Agents receive rules verbatim. An item without one of those keywords is a validation warning.
- **Token**: DTCG JSON in `tokens/`.
- **AgentEvent**: one MCP call, appended to `.corpus/events.jsonl` (gitignored): time, client, tool, args, result ids, and top match coverage. The file is the source of truth and is never rewritten. Counts and gaps are computed from it in memory. No database.
- **Gap**: a `search_docs` query whose top result has match coverage under 0.5, meaning fewer than half of the query's meaningful words appear in it. It's resolved when the same query clears 0.5 against current content. Resolution is derived, never stored. Phase 4 may tune the threshold or the signal.

### Content repo layout (default, configurable in `corpus.config.json`)

```
corpus.config.json
components/<name>/<name>.component.yml   SDC schema
components/<name>/<name>.twig
docs/components/<id>.mdx                 summary, when to use, rules, examples, accessibility
docs/guidelines/<id>.mdx
tokens/*.tokens.json                     DTCG
```

### MDX dialect

Frontmatter, headings, paragraphs, lists, code fences, and these blocks: `<Do title="">`, `<Dont title="">`, `<Preview component="" ...props />`, `<Callout tone="">`. Unknown JSX is a validation error with file and line, never silently dropped.

## Agent-facing output

Agent payloads are product UI. Treat formatter changes like UI changes.

- The editor's Agents view and the MCP response must be byte-for-byte identical for the same request. Both call the same function in `core/format/`. A parity test enforces this.
- Formatter output has snapshot tests. Review snapshot diffs, don't blindly update them.
- Keep payloads lean. No decorative text, no repeated boilerplate. The UI shows a token estimate for a reason.
- MCP tool names and descriptions are an interface agents read when deciding what to call. Change them deliberately and note why in the commit.
- There are five read-only tools: `list_components`, `get_component { name, platform? }`, `get_tokens { category? }`, `search_docs { query }`, and `get_page { path }`. `platform` defaults to the value in `corpus.config.json`. Never guess it from the agent's files.
- Search is minisearch over doc sections, built in `core/` and shared by the server and the browser. No embeddings unless Phase 4 shows lexical search missing real answers.

## UI conventions

- shadcn/ui, Base UI flavor, style `base-nova` (see `components.json`). Add components with `npx shadcn add <name>`. Base UI uses the `render` prop, not `asChild`.
- Two local changes to shadcn files. Reapply them if the components are re-added:
  - `Toaster` in `toast.tsx` takes `viewportClassName` so toasts clear the mobile tab bar.
  - `scroll-area.tsx` drops the unused `React` import the CLI adds, which strict `noUnusedLocals` rejects.
- shadcn components import `cn` from the `cn` package (pinned). App code imports it from `@/lib/utils`.
- If `npx shadcn add` times out reaching the registry, run it with `NODE_OPTIONS=--dns-result-order=ipv4first`.
- Tailwind CSS 4. Theme tokens live in `src/index.css`. Grays come from Tailwind 4 palettes through `--base-*` variables, switched with `data-base` on `<html>` (neutral, zinc, stone, slate, gray). Dark mode: `data-theme` on `<html>` wins, otherwise `prefers-color-scheme`. Use the `dark:` variant and semantic tokens. Don't hard-code colors in components.
- The Corpus chrome stays neutral. Color appears only in previews of the documented design system and in the good, bad, and warn signals (`text-good`, `bg-bad-soft`, `text-warn`, and so on).
- Geist for the UI. Geist Mono only for literal code, token names, file paths, and endpoints. Never for labels.
- Previews of the documented system render inside `CuiScope` with `--cui-*` tokens so they never leak into the chrome. Their canvas is the system's own surface, `bg-(--cui-subtle)`, so a preview's Light and Dark switch changes the background too.
- Every screen works at 390px wide. Phones get the bottom tab bar. The Split reader view needs 1280px or more.
- Page structure comes from `src/components/common.tsx`: `PageHeader` (title, a lead, an optional `Facts` line), then `Section`s. Use `SegmentedControl` to switch views, `Dot` or `StatusLabel` for state, and `linkClass` and `proseClass` for links and running text. The type scale is a 28 to 32px title, a 16 to 17px lead, 20px section titles, 15px prose, and 14px UI text.
- The lead says something the reader needs, such as a count, a state, or what to do next. It doesn't explain what the page is for. Don't put an explanatory sentence under every section title.
- Borders are for objects: previews, code, agent payloads, inputs, and dialogs. Lists are divided rows (`divide-y border-y`), not boxes, and nothing gets a box inside a box.
- Avoid: all-caps eyebrow labels, middle-dot meta strings like `A · B`, arrows appended to button labels, decorative gradients, identical shadowed cards for everything, rows of stat tiles, outlined badges for status, dotted canvases, and sparkle icons for AI features.

## Writing rules

These apply to UI copy, docs, MDX, fixtures, AI draft prompts, commit messages, PR descriptions, and code comments.

- Never use em dashes or en dashes. Use a period, comma, colon, or parentheses instead.
- Sentence case for headings, buttons, and menu items.
- In UI text, use curly apostrophes and quotes (’ “ ”). Keep straight quotes in code.
- Buttons start with a verb and say what happens. No "Click here" or "Submit".
- Plain words. Errors say what happened and what to do next.

## Code conventions

- TypeScript strict. No `any` without a comment explaining why.
- Validate everything from outside at the boundary with zod: config, YAML, MDX frontmatter, API bodies, MCP arguments.
- `core/` functions are pure and tested with vitest. Loaders are tested against `fixtures/`, not mocks.
- The server never builds shell commands from user input. Use simple-git's API. File writes stay inside the content repo's `docs/` and `tokens/` folders.
- Secrets come only from env (`ANTHROPIC_API_KEY`). Never write them to the content repo, logs, or the client bundle.
- Pin exact dependency versions and prefer releases at least two weeks old (`npm install --before=YYYY-MM-DD`). Ask before adding a new runtime dependency.

## Working agreements

- Start each phase in plan mode. Propose the approach, wait for approval, then build.
- Small commits, one concern each. Run `npm run typecheck` and `npm test` before every commit.
- Keep the app working while replacing pieces. Swap one data source at a time.
- Don't build anything under "Later" in `PLAN.md` without asking.
- When a product decision is unclear, ask instead of guessing. Record decisions as short notes in `docs/decisions/`.
- The foundations (rules, event log, search and gaps, MCP tools, platform, container) are settled in `docs/decisions/0000-foundations.md`. Don't change them without asking.
