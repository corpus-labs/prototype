# Build plan: from clickable prototype to working prototype

The goal is one working loop on real content: read a design system repo, serve it to people and agents from the same source, see what agents needed, write the answer, commit it, and have every agent pick it up.

Work one phase at a time. Each phase ends with a "Done when" check. Phase 4 is a decision gate: what we learn there can change the Overview screen and the shape of later phases. The foundations are already settled in `docs/decisions/0000-foundations.md`.

## Phase 0: Baseline

- [ ] Unzip the prototype into a new repo, `git init`, and commit it as "Prototype baseline". (Deferred. `.gitignore` is already in place.)
- [x] Re-add the shadcn components with the CLI so they match what `npx shadcn add` produces:
      `npx shadcn add alert avatar badge breadcrumb button button-group card collapsible command dialog dropdown-menu empty field input input-group item kbd label popover progress scroll-area select separator sheet sidebar skeleton spinner switch table tabs textarea toast toggle toggle-group tooltip --overwrite`
- [x] Review the diff. Expect formatting differences only. Investigate anything else, then reapply the `viewportClassName` change to `Toaster` in `toast.tsx`.
      Result: class order and wrapping only, plus duplicate classes dropped. The compiled CSS is identical to the baseline. The CLI now imports `cn` from the `cn` package (pinned to 0.5.0) and adds an unused `React` import to `scroll-area.tsx`, which strict mode rejects, so that import is removed.
- [x] Add `CLAUDE.md`, this file, and `docs/decisions/0000-foundations.md`.

**Done when:** `npm run dev` and `npm run typecheck` pass and the app looks the same as the published prototype.

## Phase 1: Content on disk

Turn the sample data into a real content repo, and build the code that reads it.

- [x] Add vitest and an `npm test` script.
- [ ] Write a one-off script that converts `src/data/workspace.ts` into `fixtures/charged-ui/`:
  - `components/<name>/<name>.component.yml` in SDC metadata format (`name`, `status`, `props` as JSON Schema with `required`, `enum`, and `default`, plus `slots`)
  - `docs/components/<id>.mdx` with frontmatter, summary, `## When to use`, `## When not to use`, `## Rules`, Do and Dont blocks, and `## Accessibility`. `## Rules` collects every rule from the sample data (each example's `rule` and each `agentRules` entry). Each Do and Dont block carries its example code in one fenced block.
  - `docs/guidelines/<id>.mdx` (copy the existing bodies)
  - `tokens/charged-ui.tokens.json` in DTCG format
  - `corpus.config.json` with the workspace name, site, and source globs
- [ ] Run it once, commit the output, delete the script.
- [ ] `core/model.ts`: Workspace, ComponentSpec, Implementation, DocBlock, Rule, Token, AgentEvent, and ValidationIssue (file, line, message, severity).
- [ ] `core/load/`: a config loader (zod), an SDC loader (yaml), an MDX loader (unified with remark-parse, remark-frontmatter, and remark-mdx, mapped to DocBlocks), a DTCG token loader, and a workspace assembler that merges each component's MDX with its SDC props.
- [ ] Parse `## Rules` list items into Rule objects. An item without MUST, MUST NOT, SHOULD, or SHOULD NOT is a warning. Nothing outside that section counts as a rule.
- [ ] `npm run corpus:inspect -- <dir>` prints counts and validation issues.
- [ ] Tests for each loader against the fixtures, plus one test that the fixture workspace matches the prototype's sample data (component, token, and guideline counts; Button's props and rules).

**Done when:** inspecting `fixtures/charged-ui` reports 12 components, 29 tokens, and 5 guidelines with no errors, and the tests pass.

## Phase 2: Server, and the UI on real data

- [ ] `server/` with Hono on port 4400. The content directory comes from `CORPUS_CONTENT_DIR` (default `fixtures/charged-ui`). Load the workspace at startup and reload on file changes (chokidar).
- [ ] Read endpoints: `GET /api/workspace`, `/api/components`, `/api/components/:id`, `/api/guidelines`, `/api/guidelines/:id`, `/api/tokens`, and `/api/files/*` for raw file content.
- [ ] `npm run dev` starts Vite and the server together. Vite proxies `/api`, `/mcp`, `/llms.txt`, and `*.md` to the server.
- [ ] Move the formatters from `src/lib/agent-format.ts` into `core/format/` and rewrite them against ComponentSpec and DocBlock. Add snapshot tests for Button and one guideline. Compare against the prototype's output first, and keep only intentional differences.
- [ ] In the web app, replace imports from `src/data/workspace.ts` with data fetching. Ask before adding TanStack Query. The store keeps UI preferences only.
- [ ] The People view renders DocBlocks, replacing `src/lib/mdx-lite.tsx`. The Agents view calls the same core formatter the server uses.
- [ ] Previews stay hand-drawn in `charged-ui.tsx` for now (see Open questions).
- [ ] Optional: switch from hash routes to path routes now that a server can serve the app.

**Done when:** every screen renders from the fixtures, an MDX edit on disk shows up after a reload, and nothing imports `src/data/workspace.ts`.

## Phase 3: Agent outputs

This is the core of the product. Take care with tool descriptions and payload size.

- [ ] `GET /llms.txt`, `/components/:id.md`, `/guidelines/:id.md`, and `/tokens.md`, all from core formatters.
- [ ] `/mcp` using the official MCP TypeScript SDK with Streamable HTTP. Check the current package name and transport API before installing, since the SDK has been reorganized before.
- [ ] Five read-only tools: `list_components`, `get_component { name, platform? }` (platform defaults to `corpus.config.json`), `get_tokens { category? }`, `search_docs { query }`, and `get_page { path }` so an agent can follow a search result to the full page. Keep descriptions short and specific. Agents read them when deciding what to call.
- [ ] Search with minisearch over doc sections: headings boosted over text, prefix and light fuzzy matching. Return the top three with source path and match coverage (the share of the query's meaningful words, after dropping stopwords, found in the section). Build the index in `core/` so the browser's search can reuse it.
- [ ] Log every call to `.corpus/events.jsonl` (gitignored): time, client name and version from MCP initialize, tool, args, result ids, and top match coverage. Append only. The UI's counts are computed from this file in memory. No database.
- [ ] Parity test: for every component, the MCP `get_component` text equals the editor's Agents view text.
- [ ] Wire the Agents page (endpoints, setup snippets, tool counts, playground, activity) to the server.

**Done when:** `claude mcp add --transport http corpus http://localhost:4400/mcp` connects. Asking Claude Code to "add a primary button to this Twig template using Charged UI" produces a `get_component` call that shows up in the log and on the Agents page.

## Phase 4: Validate the gap signal (decision gate)

The prototype assumes agents send questions you can log. In practice most MCP calls are structured, like `get_component` with a name, and only searches carry anything like a question. Find out what really happens before building more on it.

- [ ] Use Corpus's MCP server from Claude Code during real Charged UI work for at least a week, or run a scripted set of 20 realistic tasks against the fixtures.
- [ ] Review `events.jsonl`: which tools get called, what `search_docs` queries look like, and whether queries under the 0.5 coverage threshold are real gaps. Tune the threshold. If real answers keep getting missed, add embeddings as a second signal on the owner's key.
- [ ] Measure an alternative signal that works even if agents rarely search: `get_component` requests for components missing rules or examples.
- [ ] Optional experiment: a `report_missing_guidance` tool agents can call when the docs don't cover their task. Check whether agents use it without being told.
- [ ] Write `docs/decisions/0001-gap-signal.md` with numbers from the log: what the Overview's agent section should show, and how a gap is detected and marked resolved.

**Done when:** the decision is written and the Overview matches it, even if that means replacing "What agents asked" with "most requested, least documented".

## Phase 5: The editor writes to git

- [ ] `PUT /api/files/*` writes to the working tree. Reject any path outside the content repo's `docs/` and `tokens/` folders.
- [ ] `GET /api/git/status`, `POST /api/git/commit { paths, message, mode }`, and `POST /api/git/discard { path }`, using simple-git. `mode` is "current" (commit to the current branch) or "branch" (create `docs/<slug>` and commit there). Pull requests come later.
- [ ] The editor loads and saves real files. Dirty state comes from git status, and diff stats from `git diff --numstat`.
- [ ] After a commit the server reloads, so MCP serves the new content right away.

**Done when:** editing in the browser and committing creates a real commit in the content repo, and the next `get_component` call reflects it.

## Phase 6: AI drafting on your own key

- [ ] `server/ai/` with `@anthropic-ai/sdk`. The key comes from `ANTHROPIC_API_KEY`, the model from `corpus.config.json` (default `claude-sonnet-5-5`). Put it behind a small provider interface so OpenAI, OpenRouter, and Ollama can come later.
- [ ] `POST /api/ai/draft { fileId, gapId?, prompt? }` streams an MDX section over SSE. Context: the component spec, the current MDX, related guidelines, the queries behind the gap, and the writing rules from `CLAUDE.md`.
- [ ] Lint drafts before inserting them: only allowed MDX blocks, rules starting with MUST or SHOULD, and no em or en dashes. Show problems inline instead of fixing them silently.
- [ ] The AI tab in Settings reads and writes config. It never shows the key, only whether `ANTHROPIC_API_KEY` is set.
- [ ] Rate-limit drafts per hour from config.

**Done when:** drafting an answer for a real gap gives a section that passes the lint, and after committing it, the gap shows as resolved by whatever rule Phase 4 decided.

## Phase 7: One spec, several implementations

- [ ] Add a Lit implementation source that reads `custom-elements.json` (Custom Elements Manifest) for Charged UI's web components.
- [ ] `get_component { platform }` returns usage for that platform: a Twig include for SDC, tag usage for Lit. The default platform comes from config.
- [ ] Drift check: props that differ between the spec and an implementation show as warnings on the component page and in `corpus:inspect`.
- [ ] `check_usage { code, platform }` with schema checks only: unknown components, unknown props, invalid enum values, and missing required props, checked against each implementation's schema. Prose rules stay unchecked.
- [ ] Design the React Native source for Charged Native (manifest format to be decided) and write it up in `docs/decisions/` before building it.

**Done when:** Button shows SDC and Lit usage side by side, and a deliberate prop mismatch in the fixtures shows a warning.

## Phase 8: One container

- [ ] Production build: the server serves the built web app plus the API, MCP, llms.txt, and `.md` routes from one process.
- [ ] Dockerfile with the content repo mounted as a volume, key and config via env, and a healthcheck.
- [ ] README section: run Corpus against your own design system repo in five minutes.

**Done when:** `docker run -p 4400:4400 -v "$PWD/charged-ui:/content" -e ANTHROPIC_API_KEY=... corpus` serves the editor, llms.txt, `.md` pages, and MCP.

## Exploration: docs projects and the editor

Corpus is meant to hold docs as well as design systems: an Obsidian alternative where notes are Markdown files in git. The prototype explores this with a second project, the Web team handbook, and a Milkdown editor for its pages. See `docs/decisions/proposed-projects-and-docs.md` and `docs/decisions/proposed-docs-editor.md`.

- [x] Projects dashboard and a docs project (page tree, overview, reader) in the prototype.
- [x] Milkdown editor for docs pages in the prototype. Edits stay in the browser tab. `core/markdown/` has the house Markdown style and the round-trip tests.

These tasks join the phases above when those phases start:

- **Phase 1:** load `fixtures/handbook` alongside `fixtures/charged-ui`: `.md` pages become DocBlocks, plus folders and links. `corpus:inspect` reports pages and broken links.
- **Phase 2:** the editor loads real files through `/api/files`.
- **Phase 3:** `get_page` and `search_docs` cover docs pages, and each docs project gets an llms.txt.
- **Phase 5:** `PUT /api/files` and the commit flow save `.md` pages under `docs/`, replacing the in-tab drafts. A repository in another Markdown style gets a separate one-time "Format" commit first.
- **Phase 6:** AI drafts stream into the editor (`@milkdown/plugin-streaming`) and arrive as a diff to apply or reject (`@milkdown/plugin-diff`), linted before they land.
- **Later:** editor nodes for Do, Dont, Preview, and Callout, so component and guideline pages can move off the textarea editor.

## Later (ask before starting)

- Building and publishing the public static site
- Logins, roles, and per-teammate tokens for private MCP
- Push, pull requests, and webhooks for GitHub, GitLab, and Forgejo
- Figma variables sync
- WordPress block.json and Mintlify imports
- Storybook previews
- `check_usage` for prose rules (needs a model call)
- Licensing, the Corpus badge, and checkout
- A hosted MCP relay

## Open questions

- **Live previews.** The prototype hand-draws Charged UI in React. A real version needs the real components. Lit could load Charged UI's built bundle in an isolated iframe, but SDC previews need Twig rendered somewhere (Drupal itself, or a Twig renderer in Node). Decide before the public site.
- **Public site.** Prerender the editor's React renderer, or use a separate static generator?
