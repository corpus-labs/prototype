// Exploration: plugins that put Corpus inside AI harnesses, both ways. Agents recall
// what's in Corpus and save what they learn back as drafts a person approves.
// Nothing here is built; installs and reviews show a toast. See 0001, decision 6.
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dot, PageHeader, Section, linkClass } from "@/components/common";
import { plugins, savedNotes, type Plugin } from "@/data/plugins";
import { cn } from "@/lib/utils";
import { ToolLogo, type ToolId } from "@/components/tool-logo";

export function PluginTile({ tile, className }: { tile: ToolId; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid size-9 shrink-0 place-items-center rounded-lg border bg-background text-foreground",
        className,
      )}
    >
      <ToolLogo id={tile} className="size-1/2" />
    </span>
  );
}

function PluginRow({ p }: { p: Plugin }) {
  return (
    <li className="flex items-center gap-3 py-3">
      <PluginTile tile={p.tile} />
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{p.name}</span>
        <span className="block truncate text-sm text-muted-foreground">{p.covers}</span>
      </span>
      {p.installed ? (
        <Dot tone="good" className="shrink-0 text-sm">
          <span>
            Installed<span className="text-muted-foreground">, {p.people} people</span>
          </span>
        </Dot>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() =>
            toast.add({
              title: "Plugins arrive with the beta",
              description: "Until then, any MCP client can connect from the Agents screen.",
            })
          }
        >
          Install
        </Button>
      )}
    </li>
  );
}

/** One fact, saved from one tool and recalled from another: the point of a shared memory. */
export function MemoryDemo({ className }: { className?: string }) {
  const turn = (tile: ToolId, tool: string, when: string, ask: string, reply: React.ReactNode) => (
    <div className="grid gap-3 p-4">
      <p className="flex items-center gap-2 text-[13px] text-muted-foreground">
        <PluginTile tile={tile} className="size-6 rounded-md" />
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
          <p className="mt-1 pl-4 text-[13px] text-muted-foreground">
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

export function Plugins() {
  const installed = plugins.filter((p) => p.installed).length;
  const waiting = savedNotes.filter((n) => n.status === "review").length;
  const cols = "sm:grid-cols-[minmax(0,1fr)_140px_200px_120px]";
  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Plugins"
        description={`${installed} installed. Agents saved ${savedNotes.length} notes this week, and ${waiting} wait for review.`}
      />

      <div className="mt-10 grid gap-14 lg:grid-cols-[minmax(0,1fr)_400px] lg:gap-12">
        <Section title="Your AI tools">
          <ul className="divide-y border-y">
            {plugins.map((p) => (
              <PluginRow key={p.id} p={p} />
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            Another tool?{" "}
            <a href="#agents" className={linkClass}>
              Connect any MCP client
            </a>
          </p>
        </Section>
        <Section title="One memory, every tool">
          <MemoryDemo />
        </Section>
      </div>

      <Section title="Saved by agents" className="mt-14">
        <div role="table" aria-label="Saved by agents" className="border-b text-sm">
          <div
            role="row"
            className={cn(
              "hidden gap-6 border-b pb-2 text-[13px] text-muted-foreground sm:grid",
              cols,
            )}
          >
            <span role="columnheader">Note</span>
            <span role="columnheader">From</span>
            <span role="columnheader">Page</span>
            <span role="columnheader">Status</span>
          </div>
          {savedNotes.map((n) => (
            <div
              key={n.id}
              role="row"
              className={cn(
                "grid gap-x-6 gap-y-1.5 border-t py-3 first-of-type:border-t-0 sm:min-h-14 sm:items-center",
                cols,
              )}
            >
              <span role="cell" className="text-[15px] text-pretty">
                {n.text}
              </span>
              <span role="cell" className="text-muted-foreground">
                {n.from}, {n.by}
              </span>
              <span role="cell">
                <a href={`#${n.page.route}`} className={cn(linkClass, "font-normal")}>
                  {n.page.title}
                </a>
                <span className="ml-1.5 text-muted-foreground">{n.page.project}</span>
              </span>
              <span role="cell">
                {n.status === "approved" ? (
                  <Dot tone="good">Approved</Dot>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      toast.add({
                        title: "Reviewing saved notes arrives with the beta",
                        description: `It would open ${n.page.title} with the note as a draft to approve or edit.`,
                      })
                    }
                  >
                    Review
                  </Button>
                )}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </div>
  );
}
