# Proposed: the docs editor

Date: November 4, 2026. Status: accepted for the prototype. Revisit when Phase 5 starts writing files.

This builds on [proposed-projects-and-docs.md](proposed-projects-and-docs.md). Docs projects are Markdown files in git, and this record covers how people write them.

## 1. Milkdown, from its separate packages

**Decision.** Use Milkdown 7.22.3, installed as individual `@milkdown/*` packages, with a small React wrapper of our own. Don't use `@milkdown/crepe`, `@milkdown/react`, or `@milkdown/kit`.

**Why.** Milkdown is ProseMirror with remark as its Markdown layer, which is the same unified toolchain Phase 1 uses. The ready-made pieces carry other baggage. Crepe depends on Vue, CodeMirror with every language, and KaTeX. `@milkdown/react` depends on Crepe. `@milkdown/kit` depends on `@milkdown/components`, which is built with Vue. Our toolbar and menus use shadcn so they match the rest of Corpus.

**Revisit if** keeping our own toolbar, slash menu, and page picker costs more than adopting Crepe's.

## 2. One Markdown style, so saving never reformats

**Decision.** Corpus writes Markdown one way, set in `core/markdown/style.ts`: `-` bullets, `_` emphasis, `**` strong, fenced code, `---` rules, one-space list indent, and ATX headings. The editor writes with it, and `normalizeMarkdown()` in `core/` applies it. Fixtures are stored normalized. A test loads every fixture into the editor and expects the same text back.

**Why.** Files live in git. If opening and saving a page rewrote bullets or emphasis markers, every edit would come with noise that hides the real change.

**Consequence.** A repository written in another style gets one separate "Format" commit the first time, in Phase 5, before any real edit.

## 3. Standard Markdown links between pages

**Decision.** Links between pages are relative Markdown links, such as `[Deploying a site](../engineering/deploying.md)`. Typing `[[` in the editor opens a page picker that inserts one. Pages show which other pages link to them.

**Why.** The files read correctly on GitHub and in any Markdown tool, and agents get them as they are. Obsidian can be set to write the same format. Wikilinks would need resolving before agents or GitHub could follow them.

## 4. Frontmatter stays out of the editor, and raw HTML stays inert

**Decision.** `title` and `description` are edited as fields above the page, and every other frontmatter line is kept exactly as it was. Raw HTML in a page shows as text and is never rendered as markup.

**Why.** Rich text editors aren't built for YAML. Showing HTML as text keeps the rule that Corpus never executes what's in a file.

## 5. Docs pages first, and saving waits for the server

**Decision.** The editor is used for docs pages only. Component and guideline pages keep the textarea editor until their custom blocks (Do, Dont, Preview, Callout) have editor nodes of their own. Until Phase 5 can write files, edits stay in the browser tab.

**Why.** Plain Markdown proves the editor and the round-trip before the harder blocks. A save button that saves nothing would mislead people.

## 6. The polish pass: vanilla plugins, reicon, and embedded images

Date: November 17, 2026.

**Decision.** Four more official plugins join, all vanilla and pinned at 7.22.3: `plugin-block` (the drag gutter), `plugin-cursor` (drop and gap cursors), `plugin-upload` (paste and drop of images), and `plugin-prism` (code highlighting through refractor). None brings Vue, CodeMirror, or KaTeX, so decision 1 stands. Editor icons come from Heroicons (`@heroicons/react`, outline weight) through one `icons.tsx` module; headings are drawn as type, because Heroicons has no glyphs for them. Images pasted or dropped are shrunk to a 1600px edge, re-encoded, and embedded as data URLs, refused over 1.5 MB. Tables get a floating bar (rows, columns, header row, alignment, delete) and column resizing, which the gfm preset ships but does not enable. Code blocks get a language chip; commonmark exports `updateCodeBlockLanguageCommand` without registering it, so the editor registers it.

**Why.** Each plugin is the plain prose plugin Crepe wraps with its own UI. Wrapping them ourselves keeps the toolbar, menus, and bars in shadcn and the theme tokens. Data URLs keep the editor fully working in the tab until Phase 5, where the uploader is the single swap point for writing files to the repository.

**Consequence.** Refractor arrives aliased to its empty core, and the editor registers the 18 languages its picker offers, so none of the other 44 travel with the chunk. Two floats (the block gutter and the table bar) hide by visibility rather than display, because their plugins measure them while still hidden, and a `display:none` box has no offset parent. Block commands are read lazily, at run time, because the editor module sits in an import cycle where a command's key is not yet set at load time.
