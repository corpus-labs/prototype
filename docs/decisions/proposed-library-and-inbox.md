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

## Not in this exploration

- Component and guideline pages still use their own MDX editor and Edit button.
- The Projects dashboard still exists at `#projects`, reachable from the workspace menu.
- Publishing, history, and who changed what wait for Phase 5.
