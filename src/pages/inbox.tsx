// Exploration: the inbox. Everything waiting on a person, in one list beside the item
// you're working on, the way Linear's inbox works. A question opens with a draft written
// into the page it belongs on. See docs/decisions/proposed-library-and-inbox.md.
import * as React from "react";
import { CheckIcon, InboxIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dot, linkClass } from "@/components/common";
import { docsProjects } from "@/data/workspace";
import { getDraft, setDraft } from "@/lib/docs-drafts";
import { markDone, useInbox, type InboxItem } from "@/lib/inbox";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { modelLabel } from "@/pages/editor";
import { MdxPeople } from "@/pages/guidelines";

function useIsDesktop() {
  const [wide, setWide] = React.useState(() => window.matchMedia("(min-width: 768px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return wide;
}

function statusOf(item: InboxItem) {
  if (item.kind === "note") return <Dot tone="warn">Waiting for review</Dot>;
  if (item.draft) return <Dot tone="good">Draft ready</Dot>;
  return <Dot tone="off">Nothing to draft from</Dot>;
}

function Row({ item, selected }: { item: InboxItem; selected: boolean }) {
  return (
    <li>
      <a
        href={`#inbox-${item.id}`}
        aria-current={selected ? "true" : undefined}
        className={cn(
          "block border-b px-4 py-3.5 transition-colors outline-none hover:bg-muted/50 focus-visible:bg-muted/60 md:px-5",
          selected && "bg-muted/70 hover:bg-muted/70",
        )}
      >
        <p className="text-[15px] leading-snug font-medium text-pretty">{item.title}</p>
        <p className="mt-1 text-[13px] text-muted-foreground">
          {item.project}
          {item.asks ? `, asked ${item.asks} times` : `, ${item.from}`}
        </p>
        <p className="mt-1.5 text-[13px]">{statusOf(item)}</p>
      </a>
    </li>
  );
}

/** Add the draft to its page: a commit for a component file, an in-tab draft for a docs page. */
function useApply() {
  const store = useStore();
  return (item: InboxItem) => {
    const { target, draft } = item;
    if (!target || !draft) return;
    if (target.kind === "component") {
      const body = store.files[target.fileId] ?? store.saved[target.fileId] ?? "";
      store.commit({
        fileId: target.fileId,
        message: draft.commit,
        mode: "main",
        body: `${body.replace(/\s*$/, "")}\n\n${draft.text}\n`,
      });
    } else {
      const project = docsProjects.find((p) => p.id === target.projectId)!;
      const page = project.pages.find((p) => p.id === target.pageId)!;
      const current = getDraft(page.id) ?? {
        title: page.title,
        description: page.description,
        body: page.body,
      };
      setDraft(page.id, {
        ...current,
        body: `${current.body.replace(/\s*$/, "")}\n\n${draft.text}\n`,
      });
    }
    markDone(item.id);
  };
}

function Detail({ item, next }: { item: InboxItem; next: InboxItem | undefined }) {
  const { ai, setPendingDraft } = useStore();
  const apply = useApply();
  const goNext = () => navigate(next ? `inbox-${next.id}` : "inbox");
  const { target, draft } = item;

  const add = () => {
    apply(item);
    const id = toast.add({
      title: `Added to ${target!.title}`,
      description:
        target!.kind === "component"
          ? "Committed to main. Agents get the new section on their next request."
          : "Kept in this tab with the page’s other edits, until Phase 5 can write the file.",
      actionProps: {
        children: "Open page",
        onClick: () => {
          toast.close(id);
          navigate(target!.route);
        },
      },
    });
    goNext();
  };

  const open = () => {
    if (!target) return;
    if (target.kind === "component" && item.kind === "question") {
      // The component editor streams the draft in, ready to adjust before committing.
      setPendingDraft(item.id);
      navigate(`edit-${target.fileId}`);
      return;
    }
    if (target.kind === "page") {
      apply(item);
    }
    navigate(target.route);
  };

  const dismiss = (title: string) => {
    markDone(item.id);
    toast.add({ title });
    goNext();
  };

  return (
    <article className="mx-auto w-full max-w-[760px] px-4 py-8 md:px-10 md:py-10">
      <a href="#inbox" className={cn(linkClass, "mb-6 inline-block text-sm font-normal md:hidden")}>
        Inbox
      </a>
      <p className="text-sm text-muted-foreground">
        {item.project}
        {target && (
          <>
            {", "}
            {item.kind === "question" ? "belongs on " : "for "}
            <a href={`#${target.route}`} className={cn(linkClass, "font-normal text-foreground")}>
              {target.title}
            </a>
          </>
        )}
      </p>
      <h1 className="mt-2 text-[24px] leading-tight font-semibold tracking-[-0.02em] text-balance md:text-[28px]">
        {item.title}
      </h1>
      <p className="mt-2 text-[15px] text-pretty text-muted-foreground">
        {item.kind === "question"
          ? `Asked ${item.asks} times this week. No page answered it, so agents and the support bot said they didn’t know.`
          : `${item.from}. Readers and agents see it only after you approve it.`}
      </p>

      {target && draft ? (
        <section className="mt-8">
          <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
            <h2 className="text-sm font-medium">
              {item.kind === "question" ? `Draft for ${target.title}` : "The note"}
            </h2>
            <p className="text-[13px] text-muted-foreground">
              {item.kind === "question"
                ? `Drafted by ${modelLabel(ai.provider, ai.model)} from ${draft.source}`
                : draft.source}
            </p>
          </div>
          {/* The draft as it will read on the page. */}
          <div className="mt-3 rounded-xl border bg-card px-5 py-5 md:px-7">
            <MdxPeople body={draft.text} />
          </div>
          <p className="mt-2.5 text-[13px] text-muted-foreground">
            Adds {draft.summary} to the end of {target.title}.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Button onClick={add}>
              <CheckIcon />
              Add to {target.title}
            </Button>
            <Button variant="outline" onClick={open}>
              {item.kind === "question" ? "Edit it in the page" : `Open ${target.title}`}
            </Button>
            <Button
              variant="ghost"
              onClick={() =>
                dismiss(item.kind === "note" ? "Note dismissed" : "Question dismissed")
              }
            >
              Dismiss
            </Button>
          </div>
        </section>
      ) : (
        <section className="mt-8 border-y py-6">
          <p className="text-[15px] font-medium">Nothing to draft from</p>
          <p className="mt-1 max-w-[60ch] text-[15px] text-pretty text-muted-foreground">
            No page or saved note covers this, so Corpus won’t guess at an answer. A person who
            knows the policy writes it once, and every reader gets it.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={() => dismiss("Asked Priya to answer it")}>Ask a teammate</Button>
            <Button variant="ghost" onClick={() => dismiss("Question dismissed")}>
              Dismiss
            </Button>
          </div>
        </section>
      )}
    </article>
  );
}

/**
 * On a project's home page: what of this project is waiting in the inbox, one click from
 * the first item. Nothing shows when nothing is waiting.
 */
export function InboxNotice({ project, className }: { project: string; className?: string }) {
  const items = useInbox().filter((i) => i.project === project);
  if (!items.length) return null;
  const questions = items.filter((i) => i.kind === "question").length;
  const notes = items.length - questions;
  const parts = [
    questions && `${questions} ${questions === 1 ? "question" : "questions"} nobody could answer`,
    notes && `${notes} ${notes === 1 ? "note" : "notes"} to review`,
  ].filter(Boolean);
  return (
    <a
      href={`#inbox-${items[0].id}`}
      className={cn(
        "group flex flex-wrap items-center justify-between gap-x-6 gap-y-2 rounded-lg border px-4 py-3 transition-colors outline-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50",
        className,
      )}
    >
      <span className="flex min-w-0 items-center gap-3 text-[15px]">
        <InboxIcon className="size-4 shrink-0 text-muted-foreground" />
        <span className="text-pretty">
          <span className="font-medium">{parts.join(" and ")}</span>, waiting in the inbox
        </span>
      </span>
      <span className="text-sm text-muted-foreground group-hover:text-foreground">
        Open the inbox
      </span>
    </a>
  );
}

export function Inbox({ id }: { id: string | null }) {
  const items = useInbox();
  const desktop = useIsDesktop();
  const index = items.findIndex((i) => i.id === id);
  // On wide screens something is always open; on phones the list shows until you pick one.
  const selected = index >= 0 ? items[index] : desktop ? items[0] : undefined;
  const next = selected ? (items[items.indexOf(selected) + 1] ?? items[0]) : undefined;
  const questions = items.filter((i) => i.kind === "question");
  const notes = items.filter((i) => i.kind === "note");
  const showList = desktop || !selected;

  return (
    <div className="flex min-h-[calc(100svh-7rem)] md:h-[calc(100svh-3.5rem)] md:min-h-0">
      {showList && (
        <section
          aria-label="Inbox"
          className="flex w-full shrink-0 flex-col md:w-[360px] md:overflow-y-auto md:border-r"
        >
          <header className="border-b px-4 pt-6 pb-4 md:px-5">
            <h1 className="text-[24px] leading-tight font-semibold tracking-[-0.02em]">Inbox</h1>
            <p className="mt-1 text-sm text-pretty text-muted-foreground">
              {items.length
                ? `${questions.length} ${questions.length === 1 ? "question" : "questions"} nobody could answer, and ${notes.length} ${notes.length === 1 ? "note" : "notes"} to review.`
                : "Nothing waiting. Every question found an answer."}
            </p>
          </header>
          {questions.length > 0 && (
            <>
              <p className="px-4 pt-4 pb-1.5 text-[13px] font-medium text-muted-foreground md:px-5">
                Unanswered, most asked first
              </p>
              <ul className="border-t">
                {questions.map((i) => (
                  <Row key={i.id} item={i} selected={i.id === selected?.id} />
                ))}
              </ul>
            </>
          )}
          {notes.length > 0 && (
            <>
              <p className="px-4 pt-5 pb-1.5 text-[13px] font-medium text-muted-foreground md:px-5">
                Saved by agents
              </p>
              <ul className="border-t">
                {notes.map((i) => (
                  <Row key={i.id} item={i} selected={i.id === selected?.id} />
                ))}
              </ul>
            </>
          )}
        </section>
      )}
      {selected ? (
        <section aria-label="Selected item" className="min-w-0 flex-1 md:overflow-y-auto">
          <Detail
            key={selected.id}
            item={selected}
            next={next?.id === selected.id ? undefined : next}
          />
        </section>
      ) : (
        desktop && (
          <section className="grid flex-1 place-items-center p-10 text-center">
            <div>
              <p className="text-[17px] font-medium">Inbox zero</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Agents and customers found an answer to everything they asked.
              </p>
            </div>
          </section>
        )
      )}
    </div>
  );
}
