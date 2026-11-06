// Exploration: edits to docs pages live here until Phase 5 can write files.
// They last as long as the tab. A reload clears them. Phase 5 replaces this
// with PUT /api/files and the commit flow. See docs/decisions/proposed-docs-editor.md.
import * as React from "react";

import type { DocPage } from "@/data/workspace";

export type DocDraft = { title: string; description: string; body: string };

let drafts: Record<string, DocDraft> = {};
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

export function setDraft(id: string, draft: DocDraft) {
  drafts = { ...drafts, [id]: draft };
  emit();
}

export function clearDraft(id: string) {
  const next = { ...drafts };
  delete next[id];
  drafts = next;
  emit();
}

export function getDraft(id: string): DocDraft | undefined {
  return drafts[id];
}

export function useDocDrafts() {
  return React.useSyncExternalStore(
    (listener) => {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    () => drafts,
  );
}

/** A page as it reads right now: its draft if there is one, otherwise the file. */
export function withDraft(page: DocPage, all: Record<string, DocDraft>): DocPage {
  const draft = all[page.id];
  return draft ? { ...page, ...draft } : page;
}

export function isChanged(page: DocPage, draft: DocDraft | undefined) {
  return (
    !!draft &&
    (draft.title !== page.title ||
      draft.description !== page.description ||
      draft.body !== page.body)
  );
}
