// Exploration: plugins that put Corpus inside AI harnesses, both ways. Agents recall
// what's in Corpus and save what they learn back as drafts a person approves.
// Nothing here is built; installs show a toast, and saved notes wait in the inbox. See 0001,
// decision 6, and proposed-library-and-inbox.md.
import { FileTextIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dot, linkClass } from "@/components/common";
import { plugins } from "@/data/plugins";
import { cn } from "@/lib/utils";
import { ToolLogo, type ToolId } from "@/components/tool-logo";

function installLater() {
  toast.add({
    title: "Plugins arrive with the beta",
    description: "Until then, any MCP client can connect under Agents and MCP.",
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
 * The AI tools Corpus plugs into, as one section of Settings. Notes they save wait in the
 * inbox, so this is only which tools are installed and how the shared memory works.
 */
export function PluginsSettings() {
  const installed = plugins.filter((p) => p.installed);
  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
      <div className="min-w-0">
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h3 className="text-sm font-medium">Your AI tools</h3>
          <span className="text-[13px] text-muted-foreground">{installed.length} installed</span>
        </div>
        <ul className="divide-y border-y">
          {plugins.map((p) => (
            <li key={p.id} className="flex items-center gap-3 py-3">
              <ToolLogo id={p.tile} className="size-5 shrink-0" />
              <span className="min-w-0 flex-1">
                <span className="block text-[15px]">{p.name}</span>
                <span className="block text-sm text-muted-foreground">{p.covers}</span>
              </span>
              {p.installed ? (
                <Dot tone="good" className="shrink-0 text-sm text-muted-foreground">
                  {p.people} people
                </Dot>
              ) : (
                <Button size="sm" variant="outline" className="shrink-0" onClick={installLater}>
                  Install
                </Button>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Another tool? Any MCP client connects under{" "}
          <a href="#agents" className={linkClass}>
            Agents and MCP
          </a>
          .
        </p>
      </div>
      <div className="min-w-0">
        <h3 className="mb-3 text-sm font-medium">One memory, every tool</h3>
        <MemoryDemo />
      </div>
    </div>
  );
}
