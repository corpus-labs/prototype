import * as React from "react";
import { RefreshCwIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "@/components/ui/toast";
import { Dot } from "@/components/common";
import { workspace } from "@/data/workspace";

function State({ s }: { s: "connected" | "available" | "planned" }) {
  if (s === "connected")
    return (
      <Dot tone="good" className="text-sm">
        Connected
      </Dot>
    );
  return (
    <span className="text-sm font-normal text-muted-foreground">
      {s === "available" ? "Available" : "Planned"}
    </span>
  );
}

function useFakeTask(ms = 900) {
  const [busy, setBusy] = React.useState(false);
  const run = (done: () => void) => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      done();
    }, ms);
  };
  return [busy, run] as const;
}

const BLOCKS = [
  ["campus/hero", 6],
  ["campus/program-card", 8],
  ["campus/event-list", 5],
  ["campus/faq", 3],
  ["campus/callout", 4],
  ["campus/stats", 4],
] as const;

function BlockImport({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [path, setPath] = React.useState("wp-content/plugins/campus-blocks");
  const [found, setFound] = React.useState(false);
  const [busy, run] = useFakeTask();
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setFound(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import WordPress blocks</DialogTitle>
          <DialogDescription>
            Each block.json becomes a component page. Attributes become props, so agents see the
            same contract the editor enforces.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="block-path">Theme or plugin folder</Label>
          <div className="flex gap-2">
            <Input
              id="block-path"
              value={path}
              onChange={(e) => setPath(e.target.value)}
              className="font-mono text-[13px] md:text-[13px]"
            />
            <Button
              variant="outline"
              disabled={busy || !path.trim()}
              onClick={() => run(() => setFound(true))}
            >
              {busy && <Spinner />}
              Scan
            </Button>
          </div>
        </div>
        {found && (
          <div className="rounded-lg border">
            <p className="border-b px-3 py-2 text-xs text-muted-foreground">
              Found {BLOCKS.length} blocks
            </p>
            <ul className="divide-y">
              {BLOCKS.map(([name, n]) => (
                <li key={name} className="flex items-center justify-between px-3 py-2 text-sm">
                  <code className="font-mono text-[13px]">{name}</code>
                  <span className="text-xs text-muted-foreground tabular">{n} attributes</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!found}
            onClick={() => {
              onOpenChange(false);
              setFound(false);
              toast.add({
                type: "success",
                title: `Imported ${BLOCKS.length} blocks`,
                description:
                  "Props came from block.json. Usage rules start empty, and agent questions will show you which to write first.",
              });
            }}
          >
            Import {found ? `${BLOCKS.length} blocks` : "blocks"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function MintlifyImport({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [repo, setRepo] = React.useState("github.com/acme/old-docs");
  const [found, setFound] = React.useState(false);
  const [busy, run] = useFakeTask();
  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        onOpenChange(o);
        if (!o) setFound(false);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import from Mintlify</DialogTitle>
          <DialogDescription>
            Corpus reads docs.json and MDX as they are, so moving over is an import, not a rewrite.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-1.5">
          <Label htmlFor="mint-repo">Repository</Label>
          <div className="flex gap-2">
            <Input
              id="mint-repo"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="font-mono text-[13px] md:text-[13px]"
            />
            <Button
              variant="outline"
              disabled={busy || !repo.trim()}
              onClick={() => run(() => setFound(true))}
            >
              {busy && <Spinner />}
              Check
            </Button>
          </div>
        </div>
        {found && (
          <div className="grid gap-1 rounded-lg border p-3 text-sm">
            <p>
              <span className="font-medium">docs.json</span> with 34 pages in 5 groups.
            </p>
            <p className="text-muted-foreground">
              Callout, Tabs, CodeGroup, and Steps map to Corpus blocks. 2 pages use custom React
              components and will import as plain MDX.
            </p>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            disabled={!found}
            onClick={() => {
              onOpenChange(false);
              setFound(false);
              toast.add({
                type: "success",
                title: "Imported 34 pages",
                description: "Committed to a new branch, docs/mintlify-import, for review.",
              });
            }}
          >
            Import 34 pages
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * One kind of source, named once on the left, with its integrations as rows beside it.
 * The page is a single ruled index, so state and actions each line up in their own column.
 */
function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section aria-label={title} className="grid gap-x-6 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <h2 className="pt-5 text-sm font-medium sm:py-[1.15rem]">{title}</h2>
      <ul className="divide-y">{children}</ul>
    </section>
  );
}

function Row({
  name,
  state,
  action,
  children,
}: {
  name: React.ReactNode;
  state: "connected" | "available" | "planned";
  action?: React.ReactNode;
  /** One or two plain sentences on what it reads or does. */
  children: React.ReactNode;
}) {
  return (
    <li className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-2.5 py-4 md:grid-cols-[minmax(0,1fr)_6.5rem_8.5rem]">
      <div className="col-span-2 min-w-0 md:col-span-1">
        <p className="text-[15px] font-medium">{name}</p>
        <p className="mt-0.5 text-sm text-pretty text-muted-foreground">{children}</p>
      </div>
      <State s={state} />
      <div className="justify-self-end">{action}</div>
    </li>
  );
}

/** Where Corpus reads components, tokens, and existing docs from, as one section of Settings. */
export function IntegrationsSettings() {
  const [provider, setProvider] = React.useState("github");
  const [blockOpen, setBlockOpen] = React.useState(false);
  const [mintOpen, setMintOpen] = React.useState(false);
  const [figmaBusy, runFigma] = useFakeTask(1100);
  const [sdcBusy, runSdc] = useFakeTask(800);
  const providers = [
    { label: "GitHub", value: "github" },
    { label: "GitLab", value: "gitlab" },
    { label: "Forgejo", value: "forgejo" },
  ];

  return (
    <>
      <div className="divide-y border-y">
        <Group title="Source of truth">
          <Row
            name={<span className="font-mono text-[13px]">{workspace.repo}</span>}
            state="connected"
            action={
              <Select
                items={providers}
                value={provider}
                onValueChange={(v) => {
                  if (!v) return;
                  setProvider(v);
                  toast.add({
                    title: `Using ${providers.find((p) => p.value === v)?.label}`,
                    description:
                      "Point Corpus at the same repository on the new host to keep history.",
                  });
                }}
              >
                <SelectTrigger size="sm" className="min-w-28" aria-label="Git provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {providers.map((p) => (
                    <SelectItem key={p.value} value={p.value}>
                      {p.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            }
          >
            The content repository, on branch main. Corpus never holds the only copy.
          </Row>
        </Group>

        <Group title="Components">
          <Row
            name="Drupal single directory components"
            state="connected"
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={sdcBusy}
                onClick={() =>
                  runSdc(() =>
                    toast.add({
                      title: "Rescanned components",
                      description: "12 found. Nothing changed since the last import.",
                    }),
                  )
                }
              >
                {sdcBusy ? <Spinner /> : <RefreshCwIcon />}
                Rescan
              </Button>
            }
          >
            Reads <code className="font-mono text-xs">components/**/*.component.yml</code>. 12
            components in sync.
          </Row>
          <Row
            name="WordPress block.json"
            state="available"
            action={
              <Button variant="outline" size="sm" onClick={() => setBlockOpen(true)}>
                Connect
              </Button>
            }
          >
            Import blocks from a theme or plugin. Attributes become props.
          </Row>
          <Row name="Storybook" state="planned">
            Use existing React and web component stories as live previews.
          </Row>
        </Group>

        <Group title="Tokens">
          <Row
            name="Figma variables"
            state="connected"
            action={
              <Button
                variant="outline"
                size="sm"
                disabled={figmaBusy}
                onClick={() =>
                  runFigma(() =>
                    toast.add({
                      title: "Tokens are up to date",
                      description: "Figma variables match main.",
                    }),
                  )
                }
              >
                {figmaBusy ? <Spinner /> : <RefreshCwIcon />}
                Sync now
              </Button>
            }
          >
            Charged UI Tokens. Last sync 2 hours ago, 4 values changed.
          </Row>
        </Group>

        <Group title="Existing docs">
          <Row
            name="Mintlify"
            state="available"
            action={
              <Button variant="outline" size="sm" onClick={() => setMintOpen(true)}>
                Import
              </Button>
            }
          >
            Reads docs.json and MDX pages from your repository.
          </Row>
        </Group>
      </div>

      <BlockImport open={blockOpen} onOpenChange={setBlockOpen} />
      <MintlifyImport open={mintOpen} onOpenChange={setMintOpen} />
    </>
  );
}
