# 0000: Foundations

Date: November 4, 2026. Status: accepted.

These six decisions shape everything from Phase 1 on. Change them only by writing a new decision record that supersedes this one.

## 1. Rules live in one place

**Decision.** Rules live only in the `## Rules` section of a component's MDX. Each list item is one rule and starts with MUST, MUST NOT, SHOULD, or SHOULD NOT. Do and Dont blocks are examples, not rules. Each one may hold one fenced code block, which agents receive as the example.

**Why.** Agents need rules as plain, quotable lines. One location makes rules easy to lint, review in diffs, and count for coverage. Letting Do and Dont blocks carry rules spreads them across the page and invites duplicates that drift apart.

**Revisit if** writers keep restating the same rule in example captions and the copies start to disagree.

## 2. Agent events are a log file, not a database

**Decision.** Every MCP call is appended to `.corpus/events.jsonl` (gitignored). The file is the source of truth and is never rewritten. Counts, charts, and gaps are computed from it in memory at startup and updated as events arrive. Whether a gap is resolved is derived from current content, never stored.

**Why.** Volume is small (the prototype assumes about 1,300 calls a week). A text file is easy to inspect during the Phase 4 experiment, adds no native dependency to the container, and can't end up in a half-migrated state.

**Revisit if** a workspace passes about a million events, startup gets slow, or Corpus needs more than one server instance.

## 3. Lexical search, and gaps judged by coverage

**Decision.** Search uses minisearch over doc sections, with headings boosted over body text and prefix and light fuzzy matching. The index is built in `core/` so the server and the browser's search share it.

Gaps are not judged by raw search score, because those scores can't be compared across queries. Instead each result gets a **match coverage**: the share of the query's meaningful words (after dropping stopwords) found in the section. A `search_docs` query whose top result is under 0.5 coverage is a gap. It counts as resolved when the same query clears 0.5 against current content.

**Why.** Search needs no model calls or extra keys, it's deterministic in tests, and it runs in the browser. Coverage gives a threshold that means the same thing for every query.

**Revisit if** Phase 4 shows real answers being missed because agents phrase things differently from the docs. Then add embeddings as a second signal, running on the owner's key.

## 4. Five read-only MCP tools

**Decision.**

- `list_components`
- `get_component { name, platform? }`
- `get_tokens { category? }`
- `search_docs { query }`
- `get_page { path }`

**Why.** These cover browsing, exact lookup, and search. `get_page` lets an agent follow a search result to the full page instead of guessing a URL. All five are read-only, so the endpoint is safe to expose.

`check_usage` waits for Phase 7 and only does schema checks then (unknown props, invalid enum values, missing required props), because it needs per-platform parsing. Checking prose rules would need a model call, so it goes under Later.

**Revisit if** Phase 4 logs show agents picking the wrong tool, or using search for things `get_component` answers.

## 5. Platform is an explicit argument

**Decision.** `get_component` takes `platform` (`drupal-sdc`, `lit`, later `react-native`). When it's missing, the default from `corpus.config.json` applies. Corpus doesn't try to infer the platform from the agent's files.

**Why.** An explicit argument is testable, shows up in the logs, and is never wrong in surprising ways. Agents usually know what they're writing.

**Revisit if** logs show agents leaving it out and getting the wrong usage.

## 6. Ship a container only

**Decision.** Corpus ships as one Docker image. No single-binary build for now.

**Why.** One target to test, native dependencies stay simple, and it matches how agencies and university web teams already deploy tools.

**Revisit if** early users ask to run it without Docker.
