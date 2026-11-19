# Proposed: one library, an inbox, and pages you can always edit

Date: November 18, 2026. Status: exploration on the `reimagine` branch, approved by the owner to try. Nothing here replaces a phase in `PLAN.md`.

The prototype read like an analytics product wrapped around a library: it opened on a dashboard, each project had its own sidebar and overview of counts, and pages needed an Edit button. Notion, GitBook, and Obsidian open on content. This exploration tries the same for Corpus, and makes the thing none of them have, answering what agents and customers couldn't find, the center of the app.

## 1. The sidebar is one page tree across the library

**Decision.** The sidebar lists every project as a top-level space, with its pages beneath, in one tree (`src/components/library-nav.tsx`). Components and guidelines are pages in the design system's tree like any other. The settings screens (Agents and MCP, Plugins, Integrations, Settings) move into the workspace menu at the top, so the sidebar below it is only pages. The project switcher goes away, because every project is already in view.

**Why.** Switching projects to find a page is a step Notion and GitBook don't ask for. One tree also makes the library read as one body of knowledge, which is what Corpus sells.

## 2. The app opens on an inbox

**Decision.** `#inbox` lists everything waiting on a person: questions nobody could answer, most asked first, then notes agents saved for review (`src/pages/inbox.tsx`, `src/lib/inbox.ts`). Opening one shows the page it belongs on and a draft written into that page. One click adds it: a component file gets a commit through the prototype's simulated `commit()`, which now accepts the text directly, and a docs page gets an in-tab draft. A question no page or note covers says so and offers to ask a teammate, instead of drafting a guess.

**Why.** Gaps were spread across four screens as counts. Here they're one queue of work, and each item ends in a changed page.

**Sample data.** The drafts are canned: the existing component drafts in `src/data/workspace.ts`, and a rollback section built from a note in `src/data/plugins.ts`. Handled items are remembered for the tab only.

## 3. Docs pages are always editable

**Decision.** A docs page has no Edit button. The title, description, and body are fields, with the editor from `proposed-docs-editor.md` in place of the reading view. Markdown switches the body to its source. People, Split, and Agents still switch what sits beside the text, so Split shows the agent's copy updating as you type. Changes stay in the tab, with Discard in the page's facts line, until Phase 5 writes files.

**Why.** An edit mode is the clearest way the prototype felt unlike Notion. Showing the agent's copy beside the text you're typing is the product's idea made visible.

## 4. A project's home is a page

**Decision.** Charged UI's Overview and each docs project's overview become home pages: what the project is, one line linking what of it is waiting in the inbox, and an index of its pages. The weekly request counts and client shares move to Settings, and the questions to the inbox.

**Why.** The numbers were the first thing on every project, which made each one read as a dashboard. They matter less day to day than what's in the project and what's waiting.

## 5. One Settings screen

**Decision.** Agents and MCP, Plugins, and Integrations become sections of the one Settings screen, next to General, AI, Publishing, License, and Appearance. Their old routes open Settings at their section, and the workspace menu links to each.

**Why.** Five screens of configuration were five places to look. What's left on them that's about content, like questions and saved notes, lives in the inbox.

## 6. One editor for docs pages, guidelines, and component files

**Decision.** Guidelines are always editable in the docs editor, like docs pages. Component files open in the same editor, on their own page (see 7) and on the Edit screen the inbox opens to adjust a draft, with Markdown for the source. On these MDX pages, `<Do>`, `<Dont>`, `<Callout>`, and `<Preview>` blocks show as cards that read like the page, each with a small form; the slash menu adds Do, Don't, and Callout blocks. The file keeps each block's exact source: a test reads every guideline and component file through the editor and expects the same text back. Guideline and component edits wait as "not committed" until Commit, through the prototype's simulated commit.

**Why.** Three ways to write (a rich editor for docs, a source textarea with a preview for MDX, and a separate screen per file) made the design system feel like a different product from the docs.

**Revisit if** writing the block forms by hand costs more than a general MDX block editor.

## 7. A component page is its MDX file

**Decision.** Approved by the owner on November 19, 2026. Do and Dont blocks may carry `<Preview />` lines and one code fence after their caption, so an example keeps its rendering and code in the file (the dialect in `CLAUDE.md`). Each Charged UI component's written page now lives in `fixtures/charged-ui/docs/components/<id>.mdx`: summary, When to use, When not to use, Rules, Do and don't, Accessibility, and any section added later. The usage, rules, examples, and accessibility fields left `src/data/workspace.ts`; `src/lib/component-docs.ts` reads them back from the file. The component page edits that file in place, like a docs page: the summary is a field, the rest is the shared editor, and Commit or Discard sits in the facts line. Props, tokens, and the live preview still come from the schema. The agent payload is built from the committed file, so Split shows it change as you type, and an answer added from the inbox reaches agents as its own section. Payloads match the old ones except Button's rule about raw anchors, which now writes `<a>` as code.

**Why.** Component pages were the last place that read and edited differently from every other page, and the payload couldn't follow an edit. One file per page is also what Phase 1 loads.

**Revisit if** Phase 1's loader needs the sections in a different shape. The parser in `component-docs.ts` is small and moves to `core/` with it.

## Not in this exploration

- The Projects dashboard still exists at `#projects`, reachable from the workspace menu.
- Publishing, history, and who changed what wait for Phase 5.
