import * as React from "react"
import { DownloadIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/components/ui/toast"
import { AgentPane, CodeBlock, PageHeader, ReaderSwitch, linkClass, useEffectiveReader } from "@/components/common"
import { tokens, type Token } from "@/data/workspace"
import { tokenExport, tokenLines } from "@/lib/agent-format"
import { useStore } from "@/lib/store"
import { cn } from "@/lib/utils"

const GROUPS = [
  { id: "color", label: "Color" },
  { id: "type", label: "Type" },
  { id: "space", label: "Space" },
  { id: "radius", label: "Radius" },
] as const

function Changed({ t }: { t: Token }) {
  if (!t.changed) return null
  return (
    <p className="mt-1 text-xs text-warn">
      Changed from <code className="font-mono">{t.changed}</code>
    </p>
  )
}

/** Swatches sit on the page like a palette. The inset ring keeps ones close to the page color visible. */
function ColorTokens({ list }: { list: Token[] }) {
  const groups = [
    { label: "Base", ids: list.filter((t) => !t.id.includes(".action.") && !t.id.includes(".status.") && t.id !== "color.focus") },
    { label: "Action", ids: list.filter((t) => t.id.includes(".action.") || t.id === "color.focus") },
    { label: "Status", ids: list.filter((t) => t.id.includes(".status.")) },
  ].filter((g) => g.ids.length)
  return (
    <div className="grid gap-12">
      {groups.map((g) => (
        <section key={g.label}>
          <h3 className="text-sm font-semibold">{g.label}</h3>
          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4">
            {g.ids.map((t) => (
              <div key={t.id} className="min-w-0">
                <div className="h-20 rounded-lg ring-1 ring-foreground/10 ring-inset" style={{ background: t.value }} />
                <p className="mt-3 truncate font-mono text-[13px] font-medium">{t.id.replace("color.", "")}</p>
                <p className="font-mono text-xs text-muted-foreground uppercase">{t.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
                <Changed t={t} />
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}

function TypeTokens({ list }: { list: Token[] }) {
  const sample: Record<string, { cls: string; text: string }> = {
    "font.display": { cls: "text-4xl font-bold tracking-[-0.035em] md:text-5xl", text: "Build what’s next" },
    "font.heading": { cls: "text-3xl font-bold tracking-[-0.035em]", text: "Programs and degrees" },
    "font.subhead": { cls: "text-xl text-muted-foreground", text: "Find the studio that fits how you work." },
    "font.body": { cls: "text-base leading-[1.7] max-w-[60ch]", text: "Applications open in September. Visit a studio, meet the faculty, and see student work before you apply." },
    "font.label": { cls: "text-sm font-medium", text: "Save changes" },
    "font.mono": { cls: "font-mono text-[13px]", text: "charged_ui:button" },
  }
  return (
    <ul className="divide-y border-y">
      {list.map((t) => (
        <li key={t.id} className="grid gap-3 py-6 md:grid-cols-[220px_minmax(0,1fr)] md:gap-8">
          <div className="grid content-start gap-0.5">
            <p className="font-mono text-[13px] font-medium">{t.id}</p>
            <p className="font-mono text-xs text-muted-foreground">{t.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{t.note}</p>
            <Changed t={t} />
          </div>
          <p className={cn("min-w-0 break-words", sample[t.id]?.cls)}>{sample[t.id]?.text}</p>
        </li>
      ))}
    </ul>
  )
}

function SpaceTokens({ list }: { list: Token[] }) {
  return (
    <ul className="divide-y border-y">
      {list.map((t) => (
        <li key={t.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 py-3.5 sm:grid-cols-[180px_90px_minmax(0,1fr)]">
          <div>
            <p className="font-mono text-[13px] font-medium">{t.id}</p>
            <p className="text-sm text-muted-foreground sm:hidden">{t.note}</p>
          </div>
          <div>
            <span className="font-mono text-xs text-muted-foreground">{t.value}</span>
            <Changed t={t} />
          </div>
          <div className="col-span-2 flex items-center gap-4 sm:col-span-1">
            <span className="h-4 shrink-0 rounded-[3px] bg-foreground/80" style={{ width: t.value }} />
            <span className="hidden text-sm text-muted-foreground sm:inline">{t.note}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}

function RadiusTokens({ list }: { list: Token[] }) {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3">
      {list.map((t) => (
        <div key={t.id} className="flex items-center gap-4">
          <div className="size-14 shrink-0 border-2 border-foreground/70 bg-muted" style={{ borderRadius: t.value }} />
          <div className="min-w-0">
            <p className="truncate font-mono text-[13px] font-medium">{t.id}</p>
            <p className="font-mono text-xs text-muted-foreground">{t.value}</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{t.note}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function ExportDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [fmt, setFmt] = React.useState("tailwind")
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Export tokens</DialogTitle>
          <DialogDescription>Generated from the same source agents read. Commit it to your theme or copy it into a project.</DialogDescription>
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
                header={<span className="font-mono">{f === "tailwind" ? "app.css" : f === "css" ? "tokens.css" : "tokens.json"}</span>}
                className="[&_pre]:max-h-[46svh]"
              />
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

export function Tokens() {
  const { reader, setReader } = useStore()
  const mode = useEffectiveReader(reader)
  const [group, setGroup] = React.useState<string>("color")
  const [onlyChanged, setOnlyChanged] = React.useState(false)
  const [syncing, setSyncing] = React.useState(false)
  const [exportOpen, setExportOpen] = React.useState(false)
  const filter = (g: string) => tokens.filter((t) => t.group === g && (!onlyChanged || t.changed))

  const sync = () => {
    setSyncing(true)
    window.setTimeout(() => {
      setSyncing(false)
      toast.add({ title: "Tokens are up to date", description: "Figma variables match main. Nothing to commit." })
    }, 1100)
  }

  const agentPane = (
    <AgentPane
      request={
        <>
          <span className="text-muted-foreground">mcp</span> get_tokens <span className="text-muted-foreground">{`{ "category": "${group}" }`}</span>
        </>
      }
      lines={tokenLines(group)}
      className={mode === "split" ? "sticky top-16 max-h-[calc(100svh-5.5rem)]" : undefined}
    />
  )

  return (
    <div className={cn("mx-auto w-full px-4 py-8 md:px-8 md:py-12", mode === "split" ? "max-w-[1480px]" : "max-w-[1120px]")}>
      <PageHeader
        title="Tokens"
        description={
          <>
            Synced from Charged UI Tokens in Figma 2 hours ago. 4 values changed in <code className="font-mono text-[0.88em]">3e1a9f2</code>.{" "}
            <button type="button" onClick={sync} disabled={syncing} className={cn(linkClass, "font-normal text-foreground disabled:no-underline")}>
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

      <Tabs value={group} onValueChange={(v: string) => setGroup(v)} className="mt-10">
        {/* Phones: the tabs keep their own rule and the filter sits under it. Wider: one shared row. */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 sm:border-b">
          <TabsList variant="line" className="w-full justify-start border-b sm:w-auto sm:border-b-0">
            {GROUPS.map((g) => (
              <TabsTrigger key={g.id} value={g.id} className="flex-none px-3">
                {g.label}
                <span className="text-xs text-muted-foreground tabular">{tokens.filter((t) => t.group === g.id).length}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          <div className="flex items-center gap-2">
            <Switch id="only-changed" size="sm" checked={onlyChanged} onCheckedChange={(v: boolean) => setOnlyChanged(v)} />
            <Label htmlFor="only-changed" className="text-sm font-normal whitespace-nowrap">
              Only changed
            </Label>
          </div>
        </div>
        {GROUPS.map((g) => {
          const list = filter(g.id)
          const people =
            list.length === 0 ? (
              <p className="py-10 text-sm text-muted-foreground">No {g.label.toLowerCase()} tokens changed in the last sync.</p>
            ) : g.id === "color" ? (
              <ColorTokens list={list} />
            ) : g.id === "type" ? (
              <TypeTokens list={list} />
            ) : g.id === "space" ? (
              <SpaceTokens list={list} />
            ) : (
              <RadiusTokens list={list} />
            )
          return (
            <TabsContent key={g.id} value={g.id} className="mt-8">
              {mode === "people" && people}
              {mode === "agents" && agentPane}
              {mode === "split" && (
                <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)] gap-8">
                  <div className="min-w-0">{people}</div>
                  <div className="min-w-0">{agentPane}</div>
                </div>
              )}
            </TabsContent>
          )
        })}
      </Tabs>

      <ExportDialog open={exportOpen} onOpenChange={setExportOpen} />
    </div>
  )
}
