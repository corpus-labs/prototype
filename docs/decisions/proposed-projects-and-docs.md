# Proposed: projects, and docs alongside design systems

Date: November 4, 2026. Status: exploration. Nothing here is decided yet. When it is, this becomes a numbered record.

## What changed in the prototype

The clickable prototype now assumes one Corpus install with two projects:

- **Charged UI**, a design system (the existing sample).
- **Web team handbook**, a docs project: folders of Markdown pages, read by people and agents the same way.

It opens on a projects dashboard. The Corpus logo leads back to it, and the breadcrumb menu switches projects. A docs project gets its own sidebar (its page tree), an overview, and a page reader. It has no editor yet.

The owner approved extending the sample data in `src/data/workspace.ts` for this. That data still goes away in Phase 2.

## Why

Design systems are one part of the vision. The other part is docs in general: an Obsidian alternative where notes live as files in git. People read them on a site, and agents read the same files over MCP. The loop is the same as for components: an agent asks, the docs fall short, and someone writes the answer.

## Open questions

- **Containers.** Corpus is planned as one container per content repository (PLAN.md, Phase 8). Do several projects mean one container serving several repositories, or one container each behind a shared dashboard?
- **Agent endpoints.** Does each project get its own MCP endpoint and llms.txt, or does one endpoint take a project argument?
- **Settings.** Some settings belong to the install (AI key, license, appearance) and some to a project (site address, publishing). Settings is one screen today.
- **Licensing.** The 1-site license doesn't cover two projects. Does a docs project count as a site?
- **The docs editor.** Milkdown is the candidate. It's a new runtime dependency, so it needs approval and its own plan. That plan should also cover how it fits the MDX dialect and the rule about never executing MDX.
- **Rules in docs.** Rules live in a component's `## Rules` section. Should docs pages have rules too, or are they guidance only?
- **Naming.** The UI says "project", and the code model says Workspace. Pick one before Phase 1 names things in `core/`.
