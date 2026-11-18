// Exploration: one inbox for everything that waits on a person. Questions nobody could
// answer, and notes agents saved, each with the page it belongs on and a draft to add.
// Sample data only; adding an answer uses the prototype's simulated commit and the
// docs editor's in-tab drafts. See docs/decisions/proposed-library-and-inbox.md.
import * as React from "react";

import { drafts as componentDrafts, handbook, helpCenter } from "@/data/workspace";
import { savedNotes } from "@/data/plugins";
import { useStore } from "@/lib/store";

/** Where an answer lands: a component's MDX file, or a docs page. */
export type InboxTarget =
  | { kind: "component"; fileId: string; title: string; route: string }
  | { kind: "page"; projectId: "handbook" | "help"; pageId: string; title: string; route: string };

export type InboxItem = {
  /** Also the route suffix: `inbox-<id>`. */
  id: string;
  kind: "question" | "note";
  /** The question as asked, or the note as saved. */
  title: string;
  project: string;
  /** Questions: times asked this week. */
  asks?: number;
  /** Notes: the tool and the person that saved it, and when. */
  from?: string;
  target?: InboxTarget;
  /**
   * Markdown to add to the target. For questions, `source` is what the AI drafted it
   * from; for notes, who saved it. `summary` says what the change adds.
   */
  draft?: { text: string; source: string; summary: string; commit: string };
};

let done: string[] = [];
const listeners = new Set<() => void>();

/** Mark an item handled for the rest of this tab: added, assigned, or dismissed. */
export function markDone(id: string) {
  done = [...done, id];
  listeners.forEach((l) => l());
}

function useDone() {
  return React.useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
    () => done,
  );
}

const rollbackNote = savedNotes.find((n) => n.id === "n-rollback")!;
const loadingNote = savedNotes.find((n) => n.id === "n-loading")!;

/** Everything waiting on a person, unanswered questions first, most asked first. */
export function useInbox(): InboxItem[] {
  const { resolved } = useStore();
  const handled = useDone();
  const loading = componentDrafts["q-loading"];
  const nesting = componentDrafts["q-nesting"];
  const items: InboxItem[] = [
    {
      id: "q-loading",
      kind: "question",
      title: loading.prompt,
      project: "Charged UI",
      asks: 14,
      target: { kind: "component", fileId: "button", title: "Button", route: "component-button" },
      draft: {
        text: loading.text.trim(),
        source: "Button’s props",
        summary: "a Loading state section",
        commit: loading.commit,
      },
    },
    {
      id: "h-rollback",
      kind: "question",
      title: "How do I roll back a deploy?",
      project: handbook.name,
      asks: 9,
      target: {
        kind: "page",
        projectId: "handbook",
        pageId: "deploying",
        title: "Deploying a site",
        route: "handbook-deploying",
      },
      draft: {
        text: `## Rolling back\n\n${rollbackNote.text} The previous build goes live again in about a minute.`,
        source: `a note ${rollbackNote.by} saved in ${rollbackNote.from}`,
        summary: "a Rolling back section",
        commit: "Document rolling back a deploy",
      },
    },
    {
      id: "c-nonprofit",
      kind: "question",
      title: "Do you offer discounts for nonprofits?",
      project: helpCenter.name,
      asks: 8,
    },
    {
      id: "q-nesting",
      kind: "question",
      title: nesting.prompt,
      project: "Charged UI",
      asks: 7,
      target: { kind: "component", fileId: "card", title: "Card", route: "component-card" },
      draft: {
        text: nesting.text.trim(),
        source: "Card’s slots and rules",
        summary: "a Nesting section",
        commit: nesting.commit,
      },
    },
    {
      id: loadingNote.id,
      kind: "note",
      title: loadingNote.text,
      project: loadingNote.page.project,
      from: `${loadingNote.from}, ${loadingNote.by}, ${loadingNote.when.toLowerCase()}`,
      target: { kind: "component", fileId: "button", title: "Button", route: "component-button" },
      draft: {
        text: loadingNote.text,
        source: `Saved by ${loadingNote.by} in ${loadingNote.from}`,
        summary: "the note as a new paragraph",
        commit: `Add ${loadingNote.by}’s note on loading state`,
      },
    },
  ];
  return items.filter((i) => !handled.includes(i.id) && !resolved.includes(i.id));
}
