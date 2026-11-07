# Proposed: Corpus as a knowledge notebook for any AI

Date: November 7, 2026. Status: exploration, approved by the owner for the prototype and the Ignite Grant pitch. It conflicts with "What Corpus is" in CLAUDE.md and with parts of `0000-foundations.md`, which still lead with design system docs. Those change only when the owner says so.

## The positioning

Corpus is one notebook for what a company knows: docs, a help center, plans and decisions, and design systems. People read it as a site. Any AI reads the same pages: coding agents over MCP, a support bot answering customers, and whichever model the owner picks for drafting. It's hosted or self-hosted, and sold as a one-time license.

Design systems are one of four jobs, not the product. The others are AI context, support answers, and docs or a help center. Corpus competes with Mintlify, GitBook, Obsidian, Zendesk, and zeroheight, mostly on price (pay once) and on ownership (a folder of Markdown that works with any AI vendor).

It isn't tied to Drupal or WordPress. Plugins for them, and Notion imports, may come later because of their reach.

## What changed in the prototype

- A third project, **Customer help**, a help center whose pages are Markdown in `fixtures/help`. Its overview has a support bot that answers only from those pages, links the page it used, and says it doesn't know when under half of the question's words match (the same coverage idea as gaps). It's simulated in the browser (`src/lib/support.ts`).
- Docs pages (the handbook and the help center) get the People, Split, and Agents reader that components and guidelines already had.
- The Agents screen shows setup for Codex and for any MCP client, beside Claude Code, Cursor, and VS Code.
- AI settings add Z.ai and DeepSeek as providers. The writing assistant and the support bot name the provider in use.
- General settings show where Corpus runs: your server or Corpus cloud. Hosting isn't built.
- The search button says "Search everything".

All of it is sample data and goes away with the rest in Phase 2.

## Open questions

- **Hosting and the one-time price.** Hosting has running costs. Is the hosted plan a yearly fee, included for a first year, or priced some other way?
- **The support bot in production.** Which model answers, who pays for it (the owner's key, like drafting), and how it hands off to a person.
- **Foundations.** If this direction holds, `0000-foundations.md`, CLAUDE.md, and PLAN.md need a pass: the MCP tools, the gap signal for customer questions, and which content types Phase 1 loads first.
