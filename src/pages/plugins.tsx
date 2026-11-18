// Exploration: plugins that put Corpus inside AI harnesses, both ways. Agents recall
// what's in Corpus and save what they learn back as drafts a person approves.
// Nothing here is built; installs and reviews show a toast. See 0001, decision 6.
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dot, PageHeader, RailBlock, Section, SideRail, linkClass } from "@/components/common";
import { plugins, savedNotes, type SavedNote } from "@/data/plugins";
import { cn } from "@/lib/utils";
import { ToolLogo, type ToolId } from "@/components/tool-logo";

/** The logo for the tool a note came from: "Claude Code" and "Claude Desktop" both use Claude's. */
function toolOf(from: string): ToolId | undefined {
  return plugins.find((p) => from.startsWith(p.name))?.tile;
}

/** Days of the week keep their capital; "Today" and "Yesterday" read as part of the sentence. */
function whenOf(when: string) {
  return when === "Today" || when === "Yesterday" ? when.toLowerCase() : when;
}

function installLater() {
  toast.add({
    title: "Plugins arrive with the beta",
    description: "Until then, any MCP client can connect from the Agents screen.",
  });
}

/** One fact, saved from one tool and recalled from another: the point of a shared memory. */
export function MemoryDemo({ className }: { className?: string }) {
  const turn = (tile: ToolId, tool: string, when: string, ask: string, reply: React.ReactNode) => (
    <div className="grid gap-3 p-4">
      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <ToolLogo id={tile} className="size-4 text-foreground" />
        <span className="font-medium text-foreground">{tool}</span>
        {when}
      </p>
      <p className="justify-self-end rounded-2xl rounded-br-md bg-foreground px-3.5 py-2 text-[14px] text-background">
        {ask}
      </p>
      <div className="text-[14px] leading-relaxed">{reply}</div>
    </div>
  );
  return (
    <div className={cn("divide-y overflow-hidden rounded-xl border bg-card", className)}>
      {turn(
        "claude",
        "Claude Code",
        "Monday",
        "Remember that refunds now take 3 business days.",
        <>
          <Dot tone="good">Saved to Customer help, Refunds</Dot>
          <p className="mt-1 pl-3 text-[13px] text-muted-foreground">
            As a draft. Mitch approved it the same day.
          </p>
        </>,
      )}
      {turn(
        "codex",
        "Codex",
        "Today",
        "How long do refunds take?",
        <>
          <p>3 business days once the refund is approved.</p>
          <p className="mt-1.5 flex items-center gap-1.5 text-[13px] text-muted-foreground">
            <FileTextIcon className="size-3.5" />
            From Customer help, Refunds
          </p>
        </>,
      )}
    </div>
  );
}

/**
 * The page a note would change, linked, with its project. Notes always land on an
 * existing page as a draft; nothing an agent saves reaches readers until a person approves it.
 */
function Target({ n }: { n: SavedNote }) {
  return (
    <span>
      <a href={`#${n.page.route}`} className={cn(linkClass, "font-normal text-foreground")}>
        {n.page.title}
      </a>{" "}
      in {n.page.project}
    </span>
  );
}

/** The work queue: notes agents saved that wait for a person, each with the page it would change. */
function NeedsReview({ notes }: { notes: SavedNote[] }) {
  if (!notes.length)
    return (
      <div className="border-y py-8">
        <Dot tone="good" className="text-[17px] font-medium">
          Nothing to review
        </Dot>
        <p className="mt-1.5 pl-3 text-sm text-muted-foreground">
          Every note agents saved this week is approved.
        </p>
      </div>
    );
  return (
    <ol className="divide-y border-y">
      {notes.map((n, i) => {
        const tile = toolOf(n.from);
        return (
          <li
            key={n.id}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-3 py-5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4"
          >
            <span className="pt-0.5 sm:self-start">
              {tile && <ToolLogo id={tile} className="size-5" />}
            </span>
            <div className="min-w-0">
              <p className="text-[17px] leading-snug font-medium text-pretty">{n.text}</p>
              <p className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>
                  {n.from}, {n.by}, {whenOf(n.when)}
                </span>
                <span>
                  Draft for <Target n={n} />
                </span>
              </p>
            </div>
            <Button
              variant={i === 0 ? "default" : "outline"}
              className="col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end"
              onClick={() =>
                toast.add({
                  title: "Reviewing saved notes arrives with the beta",
                  description: `It would open ${n.page.title} with the note as a draft to approve or edit.`,
                })
              }
            >
              Review
            </Button>
          </li>
        );
      })}
    </ol>
  );
}

/** Notes already on their pages, in the same columns as the queue but quiet. */
function Approved({ notes }: { notes: SavedNote[] }) {
  return (
    <ul className="divide-y border-y">
      {notes.map((n) => {
        const tile = toolOf(n.from);
        return (
          <li
            key={n.id}
            className="grid grid-cols-[1.75rem_minmax(0,1fr)] gap-x-3 gap-y-1 py-3.5 sm:grid-cols-[2rem_minmax(0,1fr)_auto] sm:gap-x-4"
          >
            <span className="pt-0.5 text-muted-foreground">
              {tile && <ToolLogo id={tile} className="size-4" />}
            </span>
            <div className="min-w-0">
              <p className="text-[15px] text-pretty">{n.text}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {n.from}, {n.by}, {whenOf(n.when)}
              </p>
            </div>
            <p className="col-start-2 text-sm text-muted-foreground sm:col-start-3 sm:pt-0.5 sm:text-right">
              <Target n={n} />
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function Plugins() {
  const installed = plugins.filter((p) => p.installed);
  const waiting = savedNotes.filter((n) => n.status === "review");
  const approved = savedNotes.filter((n) => n.status === "approved");
  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Plugins"
        description={
          waiting.length
            ? `Agents saved ${savedNotes.length} notes this week. ${waiting.length} wait for your review before readers see them.`
            : `Agents saved ${savedNotes.length} notes this week, and every one is approved.`
        }
      />

      {/* The review queue on the left. The tools and how the memory works on the right. */}
      <div className="mt-10 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="grid min-w-0 content-start gap-14">
          <Section title="Needs review" aside={<span>Saved by agents, newest first</span>}>
            <NeedsReview notes={waiting} />
          </Section>
          {approved.length > 0 && (
            <Section title="Approved">
              <Approved notes={approved} />
            </Section>
          )}
        </div>

        <SideRail>
          <RailBlock title="Your AI tools" aside={`${installed.length} installed`}>
            <ul className="grid gap-3">
              {plugins.map((p) => (
                <li key={p.id} className="flex items-start gap-3">
                  <ToolLogo id={p.tile} className="mt-0.5 size-4 shrink-0" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm">{p.name}</span>
                    <span className="block text-[13px] leading-snug text-muted-foreground">
                      {p.covers}
                    </span>
                  </span>
                  {p.installed ? (
                    <Dot tone="good" className="shrink-0 text-[13px] text-muted-foreground">
                      {p.people} people
                    </Dot>
                  ) : (
                    <Button size="xs" variant="outline" className="shrink-0" onClick={installLater}>
                      Install
                    </Button>
                  )}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm text-muted-foreground">
              Another tool?{" "}
              <a href="#agents" className={linkClass}>
                Connect any MCP client
              </a>
            </p>
          </RailBlock>
          <RailBlock title="One memory, every tool">
            <MemoryDemo />
          </RailBlock>
        </SideRail>
      </div>
    </div>
  );
}
