import * as React from "react";
import {
  CheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MonitorIcon,
  MoonIcon,
  SunIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
  FieldSet,
  FieldLegend,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { RadioGroup } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { ChoiceTile, CopyButton, PageHeader } from "@/components/common";
import { workspace } from "@/data/workspace";
import { useStore, type Base, type Provider, type Theme } from "@/lib/store";
import { cn } from "@/lib/utils";
import { modelLabel } from "@/pages/editor";

function ToggleRow({
  id,
  title,
  description,
  checked,
  onChange,
  disabled,
  extra,
}: {
  id: string;
  title: string;
  description: React.ReactNode;
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  extra?: React.ReactNode;
}) {
  return (
    <Field orientation="horizontal" data-disabled={disabled || undefined}>
      <FieldContent>
        <FieldLabel htmlFor={id}>{title}</FieldLabel>
        <FieldDescription>{description}</FieldDescription>
        {extra}
      </FieldContent>
      <Switch
        id={id}
        checked={checked}
        disabled={disabled}
        onCheckedChange={(v: boolean) => onChange(v)}
      />
    </Field>
  );
}

function General() {
  const [name, setName] = React.useState(workspace.name);
  const [description, setDescription] = React.useState(workspace.description);
  const [domain, setDomain] = React.useState(workspace.site);
  return (
    <FieldSet>
      <FieldGroup>
        <Field>
          <FieldLabel htmlFor="ws-name">Name</FieldLabel>
          <Input id="ws-name" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor="ws-desc">Description</FieldLabel>
          <Textarea
            id="ws-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="min-h-20"
          />
          <FieldDescription>
            Shown at the top of llms.txt, so agents know what this system is for.
          </FieldDescription>
        </Field>
        <Field>
          <FieldLabel htmlFor="ws-domain">Site address</FieldLabel>
          <InputGroup>
            <InputGroupAddon>
              <InputGroupText>https://</InputGroupText>
            </InputGroupAddon>
            <InputGroupInput
              id="ws-domain"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              className="pl-0.5"
            />
          </InputGroup>
          <FieldDescription>
            Point a CNAME at your server. Corpus issues the certificate.
          </FieldDescription>
        </Field>
        <Hosting />
        <Button
          className="justify-self-start"
          onClick={() => toast.add({ type: "success", title: "Settings saved" })}
        >
          Save changes
        </Button>
      </FieldGroup>
    </FieldSet>
  );
}

const HOSTING = [
  {
    value: "self",
    title: "Your server",
    body: "One container you run. Your files and keys never leave it.",
  },
  {
    value: "cloud",
    title: "Corpus cloud",
    body: "We run it for you. Your pages stay a folder of Markdown you can take anywhere.",
  },
];

/** Where Corpus runs. The content is the same folder of Markdown either way. */
function Hosting() {
  const [where, setWhere] = React.useState("self");
  return (
    <Field>
      <FieldLabel id="hosting-label">Where Corpus runs</FieldLabel>
      <RadioGroup
        value={where}
        onValueChange={(v) => setWhere(v as string)}
        aria-labelledby="hosting-label"
        className="grid-cols-1 sm:grid-cols-2"
      >
        {HOSTING.map((h) => (
          <ChoiceTile key={h.value} value={h.value} className="grid gap-1 text-left">
            <span className="flex items-center justify-between font-medium">
              {h.title}
              {where === h.value && <CheckIcon className="size-4" />}
            </span>
            <span className="text-muted-foreground">{h.body}</span>
          </ChoiceTile>
        ))}
      </RadioGroup>
      <FieldDescription>
        Moving between the two means copying a folder. Hosting arrives with the private beta.
      </FieldDescription>
    </Field>
  );
}

const PROVIDERS: { label: string; value: Provider }[] = [
  { label: "Anthropic", value: "anthropic" },
  { label: "OpenAI", value: "openai" },
  { label: "Z.ai", value: "zai" },
  { label: "DeepSeek", value: "deepseek" },
  { label: "OpenRouter", value: "openrouter" },
  { label: "Ollama on this server", value: "ollama" },
];

/** The model a provider starts on. Empty means the owner types a model ID. */
const DEFAULT_MODEL: Partial<Record<Provider, string>> = {
  anthropic: "claude-sonnet-5-5",
  deepseek: "deepseek-chat",
};

const CLAUDE = ["claude-sonnet-5-5", "claude-haiku-5-5", "claude-opus-5-5"].map((v) => ({
  value: v,
  label: modelLabel("anthropic", v),
}));

function AISettings() {
  const { ai, setAI } = useStore();
  const [show, setShow] = React.useState(false);
  const [testing, setTesting] = React.useState(false);
  return (
    <FieldSet>
      <FieldLegend>Bring your own key</FieldLegend>
      <FieldDescription>
        Use any provider, and switch whenever you like. Your docs stay the same. Corpus calls the
        provider straight from your server with your key, so usage is billed by the provider and
        nothing passes through Corpus.
      </FieldDescription>
      <FieldGroup className="mt-2">
        <Field>
          <FieldLabel>Provider</FieldLabel>
          <Select
            items={PROVIDERS}
            value={ai.provider}
            onValueChange={(v) =>
              v &&
              setAI({
                provider: v as Provider,
                model: DEFAULT_MODEL[v as Provider] ?? "",
              })
            }
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PROVIDERS.map((p) => (
                <SelectItem key={p.value} value={p.value}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        {ai.provider !== "ollama" && (
          <Field>
            <FieldLabel htmlFor="ai-key">API key</FieldLabel>
            <InputGroup>
              <InputGroupInput
                id="ai-key"
                type={show ? "text" : "password"}
                value={ai.key}
                onChange={(e) => setAI({ key: e.target.value })}
                className="font-mono text-[13px] md:text-[13px]"
                autoComplete="off"
              />
              <InputGroupAddon align="inline-end">
                <InputGroupButton
                  size="icon-xs"
                  aria-label={show ? "Hide key" : "Show key"}
                  onClick={() => setShow((s) => !s)}
                >
                  {show ? <EyeOffIcon /> : <EyeIcon />}
                </InputGroupButton>
                <InputGroupButton
                  variant="secondary"
                  disabled={testing}
                  onClick={() => {
                    setTesting(true);
                    window.setTimeout(() => {
                      setTesting(false);
                      toast.add({
                        type: "success",
                        title: "The key works",
                        description: `${modelLabel(ai.provider, ai.model)} answered in 0.8 seconds.`,
                      });
                    }, 900);
                  }}
                >
                  {testing && <Spinner />}
                  Test
                </InputGroupButton>
              </InputGroupAddon>
            </InputGroup>
            <FieldDescription>Stored encrypted on your server.</FieldDescription>
          </Field>
        )}
        <Field>
          <FieldLabel htmlFor="ai-model">Model</FieldLabel>
          {ai.provider === "anthropic" ? (
            <Select items={CLAUDE} value={ai.model} onValueChange={(v) => v && setAI({ model: v })}>
              <SelectTrigger id="ai-model" className="w-full sm:w-72">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CLAUDE.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="ai-model"
              value={ai.model}
              placeholder={
                ai.provider === "ollama" ? "llama3.3:70b" : "Model ID from your provider"
              }
              onChange={(e) => setAI({ model: e.target.value })}
              className="font-mono text-[13px] sm:w-72 md:text-[13px]"
            />
          )}
        </Field>
        <FieldSeparator />
        <ToggleRow
          id="ai-editor"
          title="Writing assistant in the editor"
          description="Drafts sections and answers to agent questions for you to review."
          checked={ai.editor}
          onChange={(v) => setAI({ editor: v })}
        />
        <ToggleRow
          id="ai-site"
          title="Ask AI on the published site"
          description="Visitors can ask questions and get answers with links to the source page."
          checked={ai.site}
          onChange={(v) => setAI({ site: v })}
        />
        <Field>
          <FieldLabel htmlFor="ai-rate">Site questions per visitor per hour</FieldLabel>
          <Input
            id="ai-rate"
            type="number"
            min={1}
            value={ai.perHour}
            disabled={!ai.site}
            onChange={(e) => setAI({ perHour: Number(e.target.value) || 1 })}
            className="w-28 tabular"
          />
          <FieldDescription>Keeps a busy day from turning into a surprise bill.</FieldDescription>
        </Field>
      </FieldGroup>
    </FieldSet>
  );
}

function Publishing({ toLicense }: { toLicense: () => void }) {
  const { publishing, setPublishing } = useStore();
  return (
    <FieldSet>
      <FieldLegend>What gets published</FieldLegend>
      <FieldDescription>
        Corpus builds static files on every push. Your CMS and your editor never face the public
        internet.
      </FieldDescription>
      <FieldGroup className="mt-2">
        <ToggleRow
          id="pub-build"
          title="Rebuild on push to main"
          description="Commits from the editor, Figma sync, or your own git client all trigger it."
          checked={publishing.buildOnPush}
          onChange={(v) => setPublishing({ buildOnPush: v })}
        />
        <FieldSeparator />
        <ToggleRow
          id="pub-mcp"
          title="MCP server"
          description={<span className="font-mono text-xs">{workspace.mcp}</span>}
          checked={publishing.mcp}
          onChange={(v) => setPublishing({ mcp: v })}
        />
        <ToggleRow
          id="pub-token"
          title="Require a token"
          description="For private design systems. Each teammate’s agent gets its own token."
          checked={publishing.mcpToken}
          disabled={!publishing.mcp}
          onChange={(v) => setPublishing({ mcpToken: v })}
        />
        <ToggleRow
          id="pub-llms"
          title="llms.txt"
          description="An index of every page for agents that don’t use MCP."
          checked={publishing.llms}
          onChange={(v) => setPublishing({ llms: v })}
        />
        <ToggleRow
          id="pub-md"
          title="Markdown pages"
          description="Serve any page as plain Markdown by adding .md to its URL."
          checked={publishing.markdown}
          onChange={(v) => setPublishing({ markdown: v })}
        />
        <FieldSeparator />
        <ToggleRow
          id="pub-badge"
          title="Show “Powered by Corpus”"
          description="A small link in the site footer."
          checked={publishing.badge}
          disabled
          onChange={(v) => setPublishing({ badge: v })}
          extra={
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs text-muted-foreground">
              <LockIcon className="size-3" />
              Removing it comes with the 5-site and unlimited licenses.
              <button
                type="button"
                onClick={toLicense}
                className="underline underline-offset-4 hover:text-foreground"
              >
                Compare licenses
              </button>
            </p>
          }
        />
      </FieldGroup>
    </FieldSet>
  );
}

const TIERS = [
  {
    id: "one",
    name: "1 site",
    price: 89,
    points: ["One docs site", "A year of updates", "Your own AI key, no usage fees"],
  },
  {
    id: "five",
    name: "5 sites",
    price: 199,
    points: ["Five docs sites", "Remove the Corpus badge", "A year of updates"],
  },
  {
    id: "unlimited",
    name: "Unlimited",
    price: 349,
    points: ["Unlimited sites for client work", "Remove the Corpus badge", "A year of updates"],
  },
];

function License() {
  return (
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-sm font-medium">1 site license</p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Paid once. Updates through November 3, 2027. Installed on {workspace.site}.
          </p>
          <p className="mt-2 flex items-center gap-1 font-mono text-xs text-muted-foreground">
            CRPS-7Q2M-••••-••••-K9VD
            <CopyButton
              text="CRPS-7Q2M-4H8T-XW31-K9VD"
              label="Copy license key"
              className="size-6"
            />
          </p>
        </div>
        <Badge variant="outline" className="gap-1.5 self-start font-normal sm:self-auto">
          <span className="size-1.5 rounded-full bg-good" />
          Active
        </Badge>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {TIERS.map((t) => {
          const current = t.id === "one";
          return (
            <div
              key={t.id}
              className={cn(
                "flex flex-col rounded-xl border p-4",
                current && "border-foreground/30 bg-muted/40",
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t.name}</p>
                {current && (
                  <Badge variant="secondary" className="font-normal">
                    Current
                  </Badge>
                )}
              </div>
              <p className="mt-2 text-2xl font-semibold tracking-tight tabular">
                ${t.price}
                <span className="ml-1 text-sm font-normal text-muted-foreground">once</span>
              </p>
              <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground">
                {t.points.map((p) => (
                  <li key={p} className="flex gap-2">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-foreground/70" />
                    {p}
                  </li>
                ))}
              </ul>
              <Button
                variant={current ? "outline" : "default"}
                disabled={current}
                className="mt-4"
                onClick={() =>
                  toast.add({
                    title: "Checkout isn’t part of this prototype",
                    description: `The ${t.name} license would open a checkout here.`,
                  })
                }
              >
                {current ? "Your license" : `Upgrade for $${t.price - 89}`}
              </Button>
            </div>
          );
        })}
      </div>
      <p className="text-sm text-muted-foreground">
        Renew updates for $35 a year. If you don’t, your version keeps working.
      </p>
    </div>
  );
}

const PALETTES: Base[] = ["neutral", "zinc", "stone", "slate", "gray"];

function Appearance() {
  const { theme, setTheme, base, setBase } = useStore();
  const themes: {
    value: Theme;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { value: "system", label: "System", icon: MonitorIcon },
    { value: "light", label: "Light", icon: SunIcon },
    { value: "dark", label: "Dark", icon: MoonIcon },
  ];
  return (
    <div className="grid gap-8">
      <section>
        <h3 id="theme-label" className="text-sm font-medium">
          Theme
        </h3>
        <RadioGroup
          value={theme}
          onValueChange={(v) => setTheme(v as Theme)}
          aria-labelledby="theme-label"
          className="mt-3 grid-cols-3 sm:max-w-md"
        >
          {themes.map((t) => (
            <ChoiceTile key={t.value} value={t.value} className="flex flex-col items-center gap-2">
              <t.icon className="size-4 text-muted-foreground" />
              {t.label}
            </ChoiceTile>
          ))}
        </RadioGroup>
      </section>
      <section>
        <h3 id="palette-label" className="text-sm font-medium">
          Neutral palette
        </h3>
        <p className="mt-1 max-w-[60ch] text-sm text-muted-foreground">
          Gray scales from the Tailwind 4 palette. Corpus stays neutral so the design system you
          document is the only color on screen.
        </p>
        <RadioGroup
          value={base}
          onValueChange={(v) => setBase(v as Base)}
          aria-labelledby="palette-label"
          className="mt-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5"
        >
          {PALETTES.map((p) => (
            <ChoiceTile key={p} value={p} className="grid gap-2.5 text-left">
              <span className="flex overflow-hidden rounded-md border">
                {[50, 200, 400, 600, 800, 950].map((s) => (
                  <span
                    key={s}
                    className="h-6 flex-1"
                    style={{ background: `var(--color-${p}-${s})` }}
                  />
                ))}
              </span>
              <span className="flex items-center justify-between capitalize">
                {p}
                {base === p && <CheckIcon className="size-4" />}
              </span>
            </ChoiceTile>
          ))}
        </RadioGroup>
      </section>
    </div>
  );
}

export function WorkspaceSettings() {
  const [tab, setTab] = React.useState("ai");
  return (
    <div className="mx-auto w-full max-w-[920px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Settings"
        description={
          <>
            Saved to <code className="font-mono text-[0.88em]">corpus.config.json</code> in your
            content repository.
          </>
        }
      />
      <Tabs value={tab} onValueChange={(v: string) => setTab(v)} className="mt-10">
        <div className="-mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
          <TabsList variant="line" className="w-full min-w-max justify-start border-b">
            <TabsTrigger value="general" className="flex-none px-3">
              General
            </TabsTrigger>
            <TabsTrigger value="ai" className="flex-none px-3">
              AI
            </TabsTrigger>
            <TabsTrigger value="publishing" className="flex-none px-3">
              Publishing
            </TabsTrigger>
            <TabsTrigger value="license" className="flex-none px-3">
              License
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex-none px-3">
              Appearance
            </TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="general" className="mt-6 max-w-xl">
          <General />
        </TabsContent>
        <TabsContent value="ai" className="mt-6 max-w-xl">
          <AISettings />
        </TabsContent>
        <TabsContent value="publishing" className="mt-6 max-w-xl">
          <Publishing toLicense={() => setTab("license")} />
        </TabsContent>
        <TabsContent value="license" className="mt-6">
          <License />
        </TabsContent>
        <TabsContent value="appearance" className="mt-6">
          <Appearance />
        </TabsContent>
      </Tabs>
    </div>
  );
}
