import * as React from "react";
import { DownloadIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/components/ui/toast";
import {
  AgentPane,
  CodeBlock,
  PageHeader,
  ReaderSwitch,
  linkClass,
  useEffectiveReader,
  type Hover,
} from "@/components/common";
import { tokens, type Token } from "@/data/workspace";
import { tokenExport, tokenLines } from "@/lib/agent-format";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/**
 * The index, top to bottom. Colors split into their three roles, so each label on the
 * left names one job. `key` is the token group, which the agent payload's sections use.
 */
const SECTIONS: { id: string; key: Token["group"]; label: string; match: (t: Token) => boolean }[] =
  [
    {
      id: "color-base",
      key: "color",
      label: "Base colors",
      match: (t) =>
        t.group === "color" &&
        !t.id.includes(".action.") &&
        !t.id.includes(".status.") &&
        t.id !== "color.focus",
    },
    {
      id: "color-action",
      key: "color",
      label: "Action colors",
      match: (t) => t.id.includes(".action.") || t.id === "color.focus",
    },
    {
      id: "color-status",
      key: "color",
      label: "Status colors",
      match: (t) => t.id.includes(".status."),
    },
    { id: "type", key: "type", label: "Type", match: (t) => t.group === "type" },
    { id: "space", key: "space", label: "Space", match: (t) => t.group === "space" },
    { id: "radius", key: "radius", label: "Radius", match: (t) => t.group === "radius" },
  ];

/** One grid for every row, so value and usage line up down the whole page. */
const ROW =
  "grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-1.5 md:grid-cols-[4rem_minmax(0,1fr)_10rem_7rem]";

const TYPE_SAMPLE: Record<string, { cls: string; text: string }> = {
  "font.display": {
    cls: "text-4xl font-bold tracking-[-0.035em] md:text-5xl",
    text: "Build what’s next",
  },
  "font.heading": { cls: "text-3xl font-bold tracking-[-0.035em]", text: "Programs and degrees" },
  "font.subhead": {
    cls: "text-xl text-muted-foreground",
    text: "Find the studio that fits how you work.",
  },
  "font.body": {
    cls: "text-base leading-[1.7] max-w-[60ch]",
    text: "Applications open in September. Visit a studio, meet the faculty, and see student work before you apply.",
  },
  "font.label": { cls: "text-sm font-medium", text: "Save changes" },
  "font.mono": { cls: "font-mono text-[13px]", text: "charged_ui:button" },
};

/** Split view's narrower column: value and usage go under the name. */
const ROW_NARROW = "grid grid-cols-[4rem_minmax(0,1fr)] gap-x-4 gap-y-1.5";

/** The token drawn as what it is: a swatch, a bar of that width, or a corner of that radius. */
function Visual({ t }: { t: Token }) {
  if (t.group === "color")
    return (
      <span
        className="block h-9 w-16 rounded-md ring-1 ring-foreground/10 ring-inset"
        style={{ background: t.value }}
      />
    );
  if (t.group === "space")
    return (
      <span className="flex h-9 w-16 items-center">
        <span
          className="h-3 max-w-full rounded-[2px] bg-foreground/70"
          style={{ width: t.value }}
        />
      </span>
    );
  return (
    <span
      className="block size-9 border-2 border-foreground/60 bg-muted"
      style={{ borderRadius: t.value }}
    />
  );
}

/** Value and usage: their own columns on wide screens, one line under the name on phones. */
function TokenFacts({ t, compact }: { t: Token; compact?: boolean }) {
  return (
    <div
      className={cn(
        "col-start-2 flex flex-wrap items-baseline gap-x-4 gap-y-1",
        !compact && "md:contents",
      )}
    >
      <div className="min-w-0 md:pt-0.5">
        <p className="font-mono text-xs break-words text-muted-foreground">{t.value}</p>
        {t.changed && (
          <p className="mt-1 text-xs text-warn">
            Was <code className="font-mono">{t.changed}</code>
          </p>
        )}
      </div>
      <p className={cn("text-sm text-muted-foreground tabular", !compact && "md:text-right")}>
        {t.usedBy} {t.usedBy === 1 ? "component" : "components"}
      </p>
    </div>
  );
}

function TokenRow({ t, compact }: { t: Token; compact?: boolean }) {
  const row = compact ? ROW_NARROW : ROW;
  if (t.group === "type") {
    const sample = TYPE_SAMPLE[t.id];
    return (
      <li className={cn(row, "py-5")}>
        <div className="col-span-2 min-w-0">
          <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <code className="font-mono text-[13px] font-medium">{t.id}</code>
            <span className="text-sm text-muted-foreground">{t.note}</span>
          </p>
          {sample && (
            <p className={cn("mt-3 min-w-0 break-words text-foreground", sample.cls)}>
              {sample.text}
            </p>
          )}
        </div>
        <TokenFacts t={t} compact={compact} />
      </li>
    );
  }
  return (
    <li className={cn(row, "items-center py-3")}>
      <Visual t={t} />
      <div className="min-w-0">
        <code className="block truncate font-mono text-[13px] font-medium">{t.id}</code>
        <p className="mt-0.5 text-sm text-muted-foreground">{t.note}</p>
      </div>
      <TokenFacts t={t} compact={compact} />
    </li>
  );
}

/**
 * Every token on one page. Each section is named once on the left, or above its rows when
 * the page shares the screen with the agent payload. In Split view, pointing at a section
 * lights up the same lines in the payload, and the other way round.
 */
function TokenIndex({
  onlyChanged,
  compact,
  hover,
  onHover,
}: {
  onlyChanged: boolean;
  compact?: boolean;
  hover?: Hover;
  onHover?: (h: Hover) => void;
}) {
  const sections = SECTIONS.map((sec) => ({
    ...sec,
    list: tokens.filter((t) => sec.match(t) && (!onlyChanged || t.changed)),
  })).filter((sec) => sec.list.length);
  const side = compact ? "" : "sm:grid-cols-[9rem_minmax(0,1fr)]";
  if (!sections.length)
    return (
      <p className="border-y py-10 text-sm text-muted-foreground">
        No tokens changed in the last sync.
      </p>
    );
  return (
    <div>
      <div
        className={cn(
          "hidden gap-x-6 pb-2 text-[13px] text-muted-foreground",
          !compact && "md:grid",
          side,
        )}
      >
        <span className={cn(compact && "hidden")} />
        <div className={ROW}>
          <span className="col-span-2">Token</span>
          <span>Value</span>
          <span className="text-right">Used by</span>
        </div>
      </div>
      <div className="divide-y border-y">
        {sections.map((sec) => {
          const active = !!hover?.key && hover.key === sec.key;
          return (
            <section
              key={sec.id}
              aria-label={sec.label}
              onMouseEnter={onHover ? () => onHover({ key: sec.key, from: "people" }) : undefined}
              onMouseLeave={onHover ? () => onHover({ key: null, from: null }) : undefined}
              className={cn(
                "grid gap-x-6 transition-colors duration-150",
                side,
                active && "bg-foreground/[0.035]",
              )}
            >
              <h2
                className={cn(
                  "pt-5 text-sm font-medium",
                  !compact && "sm:sticky sm:top-12 sm:self-start sm:py-[1.15rem]",
                )}
              >
                {sec.label}
                <span className="ml-2 font-normal text-muted-foreground tabular">
                  {sec.list.length}
                </span>
              </h2>
              <ul className="divide-y">
                {sec.list.map((t) => (
                  <TokenRow key={t.id} t={t} compact={compact} />
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function ExportDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [fmt, setFmt] = React.useState("tailwind");
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export tokens</DialogTitle>
          <DialogDescription>
            Generated from the same source agents read. Commit it to your theme or copy it into a
            project.
          </DialogDescription>
        </DialogHeader>
        <Tabs value={fmt} onValueChange={(v: string) => setFmt(v)} className="min-w-0">
          <TabsList>
            <TabsTrigger value="tailwind">Tailwind @theme</TabsTrigger>
            <TabsTrigger value="css">CSS variables</TabsTrigger>
            <TabsTrigger value="dtcg">DTCG JSON</TabsTrigger>
          </TabsList>
          {(["tailwind", "css", "dtcg"] as const).map((f) => (
            <TabsContent key={f} value={f} className="min-w-0">
              <CodeBlock
                code={tokenExport(f)}
                header={
                  <span className="font-mono">
                    {f === "tailwind" ? "app.css" : f === "css" ? "tokens.css" : "tokens.json"}
                  </span>
                }
                className="[&_pre]:max-h-[46svh]"
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export function Tokens() {
  const { reader, setReader } = useStore();
  const mode = useEffectiveReader(reader);
  const [onlyChanged, setOnlyChanged] = React.useState(false);
  const [syncing, setSyncing] = React.useState(false);
  const [exportOpen, setExportOpen] = React.useState(false);
  const [hover, setHover] = React.useState<Hover>({ key: null, from: null });
  const changed = tokens.filter((t) => t.changed).length;

  const sync = () => {
    setSyncing(true);
    window.setTimeout(() => {
      setSyncing(false);
      toast.add({
        title: "Tokens are up to date",
        description: "Figma variables match main. Nothing to commit.",
      });
    }, 1100);
  };

  const agentPane = (
    <AgentPane
      request={
        <>
          <span className="text-muted-foreground">mcp</span> get_tokens{" "}
          <span className="text-muted-foreground">{"{}"}</span>
        </>
      }
      lines={tokenLines()}
      hover={mode === "split" ? hover : undefined}
      onHover={mode === "split" ? setHover : undefined}
      className={mode === "split" ? "sticky top-16 max-h-[calc(100svh-5.5rem)]" : undefined}
    />
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8 md:py-10",
        mode === "split" ? "max-w-[1480px]" : "max-w-[1120px]",
      )}
    >
      <PageHeader
        title="Tokens"
        description={
          <>
            {tokens.length} tokens from Charged UI Tokens in Figma, synced 2 hours ago. {changed}{" "}
            values changed in <code className="font-mono text-[0.88em]">3e1a9f2</code>.{" "}
            <button
              type="button"
              onClick={sync}
              disabled={syncing}
              className={cn(linkClass, "font-normal text-foreground disabled:no-underline")}
            >
              {syncing ? "Syncing…" : "Sync now"}
            </button>
          </>
        }
        actions={
          <>
            <ReaderSwitch value={reader} onChange={setReader} />
            <Button size="sm" onClick={() => setExportOpen(true)}>
              <DownloadIcon />
              Export
            </Button>
          </>
        }
      />

      {mode !== "agents" && (
        <div className="mt-8 flex items-center gap-2">
          <Switch
            id="only-changed"
            size="sm"
            checked={onlyChanged}
            onCheckedChange={(v: boolean) => setOnlyChanged(v)}
          />
          <Label htmlFor="only-changed" className="text-sm font-normal whitespace-nowrap">
            Only the {changed} changed in the last sync
          </Label>
        </div>
      )}

      <div className="mt-6">
        {mode === "people" && <TokenIndex onlyChanged={onlyChanged} />}
        {mode === "agents" && agentPane}
        {mode === "split" && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8">
            <div className="min-w-0">
              <TokenIndex onlyChanged={onlyChanged} compact hover={hover} onHover={setHover} />
            </div>
            <div className="min-w-0">{agentPane}</div>
          </div>
        )}
      </div>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  );
}
