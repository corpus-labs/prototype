# 0001: A knowledge notebook for any AI

Date: November 7, 2026. Status: accepted.

This replaces the product positioning in CLAUDE.md, which described Corpus as documentation for design systems. The six technical decisions in `0000-foundations.md` still hold. Where they speak of components, they now apply to the design system kind of project.

## 1. What Corpus is

**Decision.** Corpus is one notebook for what a company knows: docs, a help center, plans and decisions, and design systems. People read it as a site. Any AI reads the same pages: coding agents over MCP, a support bot answering customers, and whichever model the owner picks for drafting. It's hosted or self-hosted, and sold as a one-time license.

It does four jobs, and design systems are one of them:

- **AI context.** Claude, Codex, Cursor, or any MCP client reads the team's plans, decisions, and rules.
- **Support answers.** A support bot answers customers from the pages the team already keeps.
- **Docs and help center.** Public docs, a help center, or an internal handbook, published from the notebook.
- **Design systems.** Components, tokens, and usage rules, with live previews.

**Why.** Company knowledge is scattered across tools that each bill monthly, and AI context saved inside one vendor stays there. Corpus competes with Mintlify, GitBook, Obsidian, Zendesk, and zeroheight on ownership (a folder of Markdown that works with any AI vendor) and on price (pay once).

**Revisit if** the Ignite Grant demand test shows teams buy for one job far more than the others. Then lead with that job.

## 2. Projects come in kinds

**Decision.** One install holds several projects. Each is a design system, a docs project, or a help center. Docs and help center projects are folders of Markdown pages (`docs/<folder>/<page>.md`). Design system projects keep the layout in CLAUDE.md: component schemas, MDX pages, and tokens.

**Why.** The same page model, reader, editor, and agent output serve every kind. Only the overview and a few tools differ.

**Revisit if** a kind needs its own file format, or projects need to span more than one repository.

## 3. Any AI, on the owner's key

**Decision.** Agents of any vendor read through the same MCP endpoint, llms.txt, and Markdown URLs. AI features (drafting and the support bot) call the provider the owner picks, with the owner's key: Anthropic, OpenAI, Z.ai, DeepSeek, OpenRouter, or a local model through Ollama. Phase 2 builds Anthropic first behind the provider interface PLAN.md already calls for.

**Why.** Switching models shouldn't mean moving the knowledge. Model bills stay with the owner, so Corpus can sell a one-time license.

**Revisit if** a provider's API differs enough that the interface leaks into features.

## 4. Hosted or self-hosted, one license

**Decision.** Self-hosting is the container from `0000-foundations.md`, decision 6. Corpus cloud runs the same image for teams that don't want to run it. Either way the content is a folder of Markdown, so moving between them means copying a folder. The license is a one-time price.

**Why.** Owning the files is the point. One image keeps hosted and self-hosted from drifting apart.

**Revisit if** hosting costs can't be covered without a recurring fee. How hosting is priced is still open.

## 5. The support bot answers from pages or says it doesn't know

**Decision.** The support bot answers only from a help center's published pages and links the page it used. When the best section covers under half of the question's meaningful words (the coverage rule from `0000-foundations.md`, decision 3), it says it doesn't know and hands off to a person. Those questions are gaps, listed like agent gaps, so someone writes the page once and every reader gets it.

**Why.** A bot that guesses is worse than no bot. Reusing the coverage rule keeps one meaning for "unanswered" across agents and customers.

**Revisit if** customers phrase questions so differently from the pages that real answers get missed. Then add embeddings, as decision 3 in `0000-foundations.md` already allows.

## 6. Plugins for AI harnesses, both ways

**Decision.** This is the planned direction, not built yet. Corpus ships plugins for AI harnesses (Claude, Codex, Cursor, Z.ai, DeepSeek, Gemini CLI, and others) that install in one click. They recall from Corpus through the read-only tools in `0000-foundations.md`, decision 4, and they can also save: a saved note lands as a draft on the page it belongs to, and a person approves it before agents or readers see it. Saving needs a per-person token. The public MCP endpoint stays read-only.

**Why.** Shared memory across tools is the point of owning the knowledge: what one tool learns, every tool can recall, whichever model the team uses next. One-click plugins reach teammates who never open a terminal or edit a config file. Few knowledge tools ship harness plugins yet, so it's an early place to stand out.

**Revisit if** reviewing saved notes becomes a bottleneck, or harnesses converge on one plugin format that makes per-harness plugins unnecessary.

Open: which harness gets the first plugin, how a save picks its page, and how saves show up in `.corpus/events.jsonl`.

## In the prototype

- A third sample project, **Customer help**, keeps its pages in `fixtures/help`. Its overview has the support bot, simulated in the browser (`src/lib/support.ts`).
- Docs and help center pages have the People, Split, and Agents reader.
- The Agents screen shows setup for Codex and any MCP client. AI settings add Z.ai and DeepSeek.
- General settings show where Corpus runs. Hosting isn't built.
- `#plugins` shows the plugins for each AI tool, a conversation where one tool saves a note and another recalls it, and the notes agents saved this week waiting for review. Installing and reviewing show a toast.
- `#site-help` shows the help center as customers would see it once published: a home page with search, articles by topic, and the support bot, and article pages with a sidebar, "Copy page", and "On this page". The docs project's overview links to it with "View site". Publishing itself isn't built.

All of it is sample data and goes away with the rest in Phase 2.

## Open questions

- **Hosting price.** A yearly fee, a first year included, or something else.
- **Support bot in production.** Which model answers by default, how the handoff to a person works, and whether its questions go to `.corpus/events.jsonl` beside MCP calls.
- **PLAN.md.** Its phases still start from design systems. Decide which kind of project Phase 1 loads first, and whether `list_components` and `get_component` need docs counterparts or `search_docs` and `get_page` are enough.
