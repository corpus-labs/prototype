import * as React from "react";
import {
  CheckIcon,
  CircleAlertIcon,
  DownloadIcon,
  PenLineIcon,
  SearchIcon,
  XIcon,
} from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { toast } from "@/components/ui/toast";
import {
  CButton,
  ComponentThumb,
  CuiScope,
  ExamplePreview,
  type CButtonProps,
} from "@/components/charged-ui";
import {
  AgentPane,
  CodeBlock,
  DocSection,
  Facts,
  PageHeader,
  ReaderSwitch,
  SegmentedControl,
  StatusLabel,
  linkClass,
  proseClass,
  useEffectiveReader,
  type Hover,
} from "@/components/common";
import { components, questions, tokens, type ComponentDoc } from "@/data/workspace";
import {
  componentJSON,
  componentLines,
  componentRules,
  extraSections,
  includeSnippet,
} from "@/lib/agent-format";
import { Inline } from "@/lib/mdx-lite";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Gallery */

export function ComponentsIndex() {
  const { dark } = useStore();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const list = components.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (c.name + c.machine + c.category).toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title="Components"
        description="Props and slots sync from each component.yml. Everything else on a component page is written here."
        actions={
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="outline" />}>
              <DownloadIcon />
              Import
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-64">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Import components from</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() =>
                    toast.add({
                      title: "Rescanned components",
                      description: "12 components found. Nothing changed since the last import.",
                    })
                  }
                >
                  Drupal SDC
                  <span className="ml-auto text-xs text-muted-foreground">Connected</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("integrations")}>
                  WordPress block.json
                </DropdownMenuItem>
                <DropdownMenuItem disabled>
                  Storybook
                  <span className="ml-auto text-xs">Planned</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />

      <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <InputGroup className="sm:max-w-72">
          <InputGroupAddon>
            <SearchIcon />
          </InputGroupAddon>
          <InputGroupInput
            placeholder="Filter components"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </InputGroup>
        <SegmentedControl
          value={status}
          onChange={setStatus}
          aria-label="Status"
          className="self-start sm:self-auto"
          options={[
            { value: "all", label: "All" },
            { value: "stable", label: "Stable" },
            { value: "beta", label: "Beta" },
            { value: "deprecated", label: "Deprecated" },
          ]}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
        {list.map((c) => {
          const noUsage = !c.whenToUse?.length && !c.agentRules?.length;
          return (
            <a
              key={c.id}
              href={`#component-${c.id}`}
              className="group flex flex-col overflow-hidden rounded-xl border transition-colors outline-none hover:border-foreground/25 focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <CuiScope
                dark={dark}
                className={cn(
                  "pointer-events-none flex h-40 items-center justify-center bg-(--cui-subtle) p-5",
                  c.status === "deprecated" && "opacity-50 grayscale",
                )}
              >
                <ComponentThumb id={c.id} />
              </CuiScope>
              <div className="grid gap-1 border-t px-4 py-3.5">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="truncate text-[15px] font-medium">{c.name}</p>
                  <StatusLabel
                    status={c.status}
                    className="shrink-0 text-sm text-muted-foreground"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  {c.status === "deprecated" ? (
                    <>Replaced by {components.find((x) => x.id === c.replacedBy)?.name}</>
                  ) : noUsage ? (
                    <>
                      <span className="text-warn">No usage guidance</span>,{" "}
                      <span className="tabular">{c.requests} requests this week</span>
                    </>
                  ) : (
                    <span className="tabular">{c.requests} agent requests this week</span>
                  )}
                </p>
              </div>
            </a>
          );
        })}
        {list.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-muted-foreground">
            No components match “{query}”. Clear the filter to see all {components.length}.
          </p>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- Preview */

function twigFor(
  p: Required<Pick<CButtonProps, "variant" | "size" | "label">> & {
    icon: boolean;
    disabled: boolean;
    loading: boolean;
  },
) {
  const args: Record<string, string> = {};
  if (p.variant !== "secondary") args.variant = p.variant;
  if (p.size !== "md") args.size = p.size;
  args.label = p.label;
  if (p.icon) args.icon = "plus";
  let s = includeSnippet("charged_ui:button", args);
  const flags = [p.disabled && "disabled: true", p.loading && "loading: true"].filter(Boolean);
  if (flags.length) s = s.replace(" }) }}", `, ${flags.join(", ")} }) }}`);
  return s;
}

function htmlFor(p: {
  variant: string;
  size: string;
  label: string;
  icon: boolean;
  disabled: boolean;
  loading: boolean;
}) {
  const attrs = [`class="c-button c-button--${p.variant} c-button--${p.size}"`, `type="button"`];
  if (p.loading) attrs.push(`aria-busy="true"`);
  if (p.disabled) attrs.push("disabled");
  const icon = p.loading
    ? `\n  <span class="c-spinner" aria-hidden="true"></span>`
    : p.icon
      ? `\n  <svg class="c-icon" aria-hidden="true"><use href="#plus"></use></svg>`
      : "";
  return `<button ${attrs.join(" ")}>${icon}${icon ? "\n  " : ""}${p.label}${icon ? "\n" : ""}</button>`;
}

/** A preview follows the app theme until someone flips it. */
function useCanvasTheme() {
  const { dark } = useStore();
  const [canvasDark, setCanvasDark] = React.useState(dark);
  React.useEffect(() => setCanvasDark(dark), [dark]);
  return [canvasDark, setCanvasDark] as const;
}

/** Code that sits under a preview, inside the same frame. */
function FramedCode(props: React.ComponentProps<typeof CodeBlock>) {
  return <CodeBlock {...props} className="rounded-none border-x-0 border-b-0" />;
}

/**
 * The live preview, its controls, and its code as one object. The canvas uses
 * the documented system’s own surface color, so Light and Dark show the
 * component the way a site would.
 */
function PreviewFrame({
  dark,
  onDarkChange,
  controls,
  code,
  children,
}: {
  dark: boolean;
  onDarkChange: (dark: boolean) => void;
  controls?: React.ReactNode;
  code: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-xl border">
      <div className={cn("grid", controls && "lg:grid-cols-[minmax(0,1fr)_15rem]")}>
        <CuiScope
          dark={dark}
          className="relative flex min-h-52 items-center justify-center bg-(--cui-subtle) px-6 py-14 transition-colors sm:min-h-64 sm:py-16"
        >
          <SegmentedControl
            value={dark ? "dark" : "light"}
            onChange={(v) => onDarkChange(v === "dark")}
            aria-label="Preview background"
            className="absolute top-3 right-3"
            options={[
              { value: "light", label: "Light" },
              { value: "dark", label: "Dark" },
            ]}
          />
          {children}
        </CuiScope>
        {controls && (
          <div className="grid content-start gap-4 border-t p-4 lg:border-t-0 lg:border-l">
            {controls}
          </div>
        )}
      </div>
      {code}
    </div>
  );
}

const VARIANTS = (["primary", "secondary", "ghost", "danger"] as const).map((v) => ({
  value: v,
  label: v,
}));

/** Prop names are literal code, so the controls label them in mono. */
const PROP_LABEL = "font-mono text-xs font-normal text-muted-foreground";

function ButtonPlayground() {
  const [canvasDark, setCanvasDark] = useCanvasTheme();
  const [variant, setVariant] = React.useState<NonNullable<CButtonProps["variant"]>>("primary");
  const [size, setSize] = React.useState<NonNullable<CButtonProps["size"]>>("md");
  const [label, setLabel] = React.useState("Save changes");
  const [icon, setIcon] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [lang, setLang] = React.useState("Twig");
  const state = { variant, size, label: label || "Button", icon, disabled, loading };
  const labelWords = label.trim().split(/\s+/).filter(Boolean).length;
  const vague = /^(click here|submit|ok|go)$/i.test(label.trim());

  return (
    <PreviewFrame
      dark={canvasDark}
      onDarkChange={setCanvasDark}
      controls={
        <>
          <div className="grid gap-1.5">
            <Label className={PROP_LABEL}>variant</Label>
            <Select
              items={VARIANTS}
              value={variant}
              onValueChange={(v) => v && setVariant(v as typeof variant)}
            >
              <SelectTrigger className="w-full font-mono text-xs" aria-label="variant">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {VARIANTS.map((v) => (
                  <SelectItem key={v.value} value={v.value} className="font-mono text-xs">
                    {v.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label className={PROP_LABEL}>size</Label>
            <ToggleGroup
              variant="outline"
              size="sm"
              value={[size]}
              onValueChange={(v: string[]) => v[0] && setSize(v[0] as typeof size)}
              className="w-full"
            >
              {(["sm", "md", "lg"] as const).map((v) => (
                <ToggleGroupItem key={v} value={v} className="flex-1 font-mono text-xs">
                  {v}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="pg-label" className={PROP_LABEL}>
              label
            </Label>
            <Input
              id="pg-label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              aria-invalid={vague || labelWords > 3 || undefined}
            />
            {(vague || labelWords > 3) && (
              <p className="text-xs text-bad">
                {vague
                  ? "Breaks a rule: say what happens, like “Save changes”."
                  : "Breaks a rule: three words or fewer."}
              </p>
            )}
          </div>
          <div className="grid gap-2.5">
            {(
              [
                ["icon", icon, setIcon],
                ["disabled", disabled, setDisabled],
                ["loading", loading, setLoading],
              ] as const
            ).map(([name, value, set]) => (
              <div key={name} className="flex items-center justify-between">
                <Label htmlFor={`pg-${name}`} className={PROP_LABEL}>
                  {name}
                </Label>
                <Switch
                  id={`pg-${name}`}
                  size="sm"
                  checked={value}
                  onCheckedChange={(v: boolean) => set(v)}
                />
              </div>
            ))}
          </div>
        </>
      }
      code={
        <FramedCode
          code={lang === "Twig" ? twigFor(state) : htmlFor(state)}
          header={
            <SegmentedControl
              value={lang}
              onChange={setLang}
              aria-label="Code language"
              className="-ml-2"
              options={[
                { value: "Twig", label: "Twig" },
                { value: "HTML", label: "HTML" },
              ]}
            />
          }
          wrap
        />
      }
    >
      <CButton {...state} />
    </PreviewFrame>
  );
}

function StaticPreview({ c }: { c: ComponentDoc }) {
  const [canvasDark, setCanvasDark] = useCanvasTheme();
  const variant = c.props.find((p) => p.name === "variant" || p.name === "tone");
  const label = c.props.find(
    (p) => p.name === "label" || p.name === "title" || p.name === "heading",
  );
  const args: Record<string, string> = {};
  if (variant) args[variant.name] = variant.type.split(" | ")[0];
  if (label) args[label.name] = "Example";
  return (
    <PreviewFrame
      dark={canvasDark}
      onDarkChange={setCanvasDark}
      code={<FramedCode code={includeSnippet(c.machine, args)} header={<span>Twig</span>} wrap />}
    >
      <div className={cn(c.status === "deprecated" && "opacity-60")}>
        <ComponentThumb id={c.id} />
      </div>
    </PreviewFrame>
  );
}

/* ---------------------------------------------------------------- People */

/** Which sections a component’s page shows. The page and its “On this page” list both read this. */
function outline(c: ComponentDoc, resolved: string[]) {
  const deprecated = c.status === "deprecated";
  const rules = componentRules(c, { resolved });
  const extras = extraSections(c, { resolved });
  // Empty sections show as gaps to fill, except on deprecated components, where they’re left out.
  const show = (has: boolean) => has || !deprecated;
  const usage = show(!!(c.whenToUse?.length || c.whenNotToUse?.length));
  const hasRules = show(rules.length > 0);
  const examples = show(!!c.examples?.length);
  const a11y = show(!!c.a11y?.length);
  const toc: [string, string][] = [["preview", "Preview"]];
  if (usage) toc.push(["usage", "Usage"]);
  if (hasRules) toc.push(["rules", "Rules"]);
  if (examples) toc.push(["dodont", "Do and don’t"]);
  extras.forEach((x) => toc.push([x.key, x.title]));
  toc.push(["props", "Props"]);
  if (a11y) toc.push(["a11y", "Accessibility"]);
  if (c.tokens?.length) toc.push(["tokens", "Tokens"]);
  return { rules, extras, usage, hasRules, examples, a11y, toc };
}

function MetaRow({ c }: { c: ComponentDoc }) {
  return (
    <Facts
      items={[
        ["Status", <StatusLabel status={c.status} />],
        ["Category", c.category],
        ["Machine name", <code className="font-mono text-[13px]">{c.machine}</code>],
        ["Updated", c.updated.toLowerCase()],
      ]}
    />
  );
}

const PROSE = proseClass;
const BULLETS = cn(PROSE, "grid list-disc gap-2 pl-5 marker:text-muted-foreground/60");

function UsageList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h3 className="text-sm font-semibold">{title}</h3>
      <ul className={cn(BULLETS, "mt-3")}>
        {items.map((x) => (
          <li key={x}>
            <Inline text={x} />
          </li>
        ))}
      </ul>
    </div>
  );
}

const KEYWORD = /^(MUST NOT|MUST|SHOULD NOT|SHOULD)\s+([\s\S]*)$/;

/** Rules as agents get them. The keyword is literal text, so it’s set in mono and given its own column. */
function RuleList({ rules }: { rules: string[] }) {
  return (
    <ul className="divide-y border-y">
      {rules.map((rule) => {
        const m = rule.match(KEYWORD);
        return (
          <li
            key={rule}
            className="grid grid-cols-[5.25rem_minmax(0,1fr)] items-baseline gap-x-4 py-3 sm:grid-cols-[6rem_minmax(0,1fr)]"
          >
            <span
              className={cn(
                "font-mono text-xs font-medium",
                m?.[1].startsWith("MUST") ? "text-foreground" : "text-muted-foreground",
              )}
            >
              {m?.[1]}
            </span>
            <span className="text-[15px] leading-relaxed">
              <Inline text={m ? m[2] : rule} />
            </span>
          </li>
        );
      })}
    </ul>
  );
}

function DoDont({
  kind,
  title,
  caption,
  preview,
  dark,
}: {
  kind: "do" | "dont";
  title: string;
  caption: string;
  preview?: string;
  dark: boolean;
}) {
  const good = kind === "do";
  return (
    <figure className="grid content-start gap-3">
      {preview && (
        <div className="overflow-hidden rounded-lg">
          <CuiScope
            dark={dark}
            className="pointer-events-none flex min-h-36 items-center justify-center bg-(--cui-subtle) p-6"
          >
            <ExamplePreview name={preview} />
          </CuiScope>
          <div className={cn("h-0.5", good ? "bg-good" : "bg-bad")} />
        </div>
      )}
      <figcaption
        className={cn(
          "text-sm leading-relaxed",
          !preview && cn("border-l-2 pl-3", good ? "border-good" : "border-bad"),
        )}
      >
        <span
          className={cn(
            "inline-flex items-center gap-1 font-medium",
            good ? "text-good" : "text-bad",
          )}
        >
          {good ? <CheckIcon className="size-4" /> : <XIcon className="size-4" />}
          {good ? "Do" : "Don’t"}
        </span>
        <span className="ml-1.5 font-medium">{title}</span>
        <span className="mt-0.5 block text-muted-foreground">{caption}</span>
      </figcaption>
    </figure>
  );
}

function MissingHint({ c, what }: { c: ComponentDoc; what: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg bg-muted/60 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">
        <span className="font-medium">No {what} yet.</span>{" "}
        <span className="text-muted-foreground">
          Agents requested {c.name} {c.requests} times this week. Without {what}, they guess.
        </span>
      </p>
      <Button
        size="sm"
        variant="outline"
        className="shrink-0 self-start bg-background sm:self-auto"
        onClick={() => navigate(`edit-${c.id}`)}
      >
        <PenLineIcon />
        Write {what}
      </Button>
    </div>
  );
}

function RelatedLinks({ ids }: { ids: string[] }) {
  // Keep the order the doc gives.
  const documented = ids
    .map((id) => components.find((x) => x.id === id))
    .filter((x): x is ComponentDoc => !!x);
  const missing = ids
    .filter((id) => !components.some((x) => x.id === id))
    .map((id) => id[0].toUpperCase() + id.slice(1).replace(/-/g, " "));
  const names =
    missing.length > 1
      ? `${missing.slice(0, -1).join(", ")} and ${missing[missing.length - 1]}`
      : missing[0];
  return (
    <p className={PROSE}>
      {documented.map((r, i) => (
        <React.Fragment key={r.id}>
          {i > 0 && ", "}
          <a href={`#component-${r.id}`} className={linkClass}>
            {r.name}
          </a>
        </React.Fragment>
      ))}
      {documented.length > 0 && missing.length > 0 && ". "}
      {missing.length > 0 && (
        <span className="text-muted-foreground">
          {names} {missing.length > 1 ? "aren’t" : "isn’t"} documented yet.
        </span>
      )}
    </p>
  );
}

function ComponentPeople({
  c,
  hover,
  onHover,
}: {
  c: ComponentDoc;
  hover?: Hover;
  onHover?: (h: Hover) => void;
}) {
  const { dark, resolved } = useStore();
  const page = outline(c, resolved);
  const link = { hover, onHover };

  return (
    <div>
      <DocSection k="summary" {...link}>
        <MetaRow c={c} />
      </DocSection>

      <div className="mt-8 grid gap-16">
        <DocSection k="preview" id="sec-preview" {...link}>
          {c.id === "button" ? <ButtonPlayground /> : <StaticPreview c={c} />}
        </DocSection>

        {page.usage && (
          <DocSection k="usage" id="sec-usage" title="Usage" {...link}>
            {c.whenToUse?.length || c.whenNotToUse?.length ? (
              <div className="grid gap-8 sm:grid-cols-2">
                {c.whenToUse?.length ? <UsageList title="When to use" items={c.whenToUse} /> : null}
                {c.whenNotToUse?.length ? (
                  <UsageList title="When not to use" items={c.whenNotToUse} />
                ) : null}
              </div>
            ) : (
              <MissingHint c={c} what="usage guidance" />
            )}
          </DocSection>
        )}

        {page.hasRules && (
          <DocSection
            k="rules"
            id="sec-rules"
            title="Rules"
            description="Agents receive these word for word."
            {...link}
          >
            {page.rules.length ? (
              <RuleList rules={page.rules} />
            ) : (
              <MissingHint c={c} what="rules" />
            )}
          </DocSection>
        )}

        {page.examples && (
          <DocSection k="dodont" id="sec-dodont" title="Do and don’t" {...link}>
            {c.examples?.length ? (
              <div className="grid gap-10">
                {c.examples.map((e) => (
                  <div key={e.key} className="grid gap-x-6 gap-y-8 sm:grid-cols-2">
                    <DoDont kind="do" dark={dark} {...e.do} />
                    <DoDont kind="dont" dark={dark} {...e.dont} />
                  </div>
                ))}
              </div>
            ) : (
              <MissingHint c={c} what="examples" />
            )}
          </DocSection>
        )}

        {page.extras.map((x) => (
          <DocSection
            key={x.key}
            k={x.key}
            id={`sec-${x.key}`}
            title={x.title}
            description="Written to answer an agent question."
            {...link}
          >
            <p className={PROSE}>
              <Inline text={x.body} />
            </p>
            <div className="mt-6 grid gap-x-6 gap-y-8 sm:grid-cols-2">
              <DoDont
                kind="do"
                dark={dark}
                title={x.key === "loading" ? "Keep the label" : "List inside a card"}
                caption={x.do}
                preview={x.key === "loading" ? "loading-good" : "nesting-good"}
              />
              <DoDont
                kind="dont"
                dark={dark}
                title={x.key === "loading" ? "Swap the label" : "Card in a card"}
                caption={x.dont}
                preview={x.key === "loading" ? "loading-bad" : "nesting-bad"}
              />
            </div>
          </DocSection>
        ))}

        <DocSection
          k="props"
          id="sec-props"
          title="Props"
          description={
            <>
              From <code className="font-mono text-[13px]">{c.file}</code>
            </>
          }
          {...link}
        >
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="h-9 pl-0 text-xs font-medium text-muted-foreground">
                  Prop
                </TableHead>
                <TableHead className="hidden h-9 text-xs font-medium text-muted-foreground md:table-cell">
                  Default
                </TableHead>
                <TableHead className="h-9 pr-0 text-xs font-medium text-muted-foreground">
                  Description
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {c.props.map((p) => (
                <TableRow key={p.name} className="hover:bg-transparent">
                  <TableCell className="py-3.5 pl-0 align-top">
                    <div className="flex items-baseline gap-2">
                      <code className="font-mono text-[13px] font-medium">{p.name}</code>
                      {p.required && (
                        <span className="text-xs text-muted-foreground">Required</span>
                      )}
                    </div>
                    <div className="mt-1 max-w-48 font-mono text-xs whitespace-normal text-muted-foreground">
                      {p.type}
                    </div>
                    {p.default && (
                      <div className="mt-1 text-xs text-muted-foreground md:hidden">
                        Default <code className="font-mono">{p.default}</code>
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="hidden py-3.5 align-top font-mono text-xs text-muted-foreground md:table-cell">
                    {p.default ?? ""}
                  </TableCell>
                  <TableCell className="py-3.5 pr-0 align-top text-sm whitespace-normal">
                    {p.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {c.slots && (
            <div className="mt-8">
              <h3 className="text-sm font-semibold">Slots</h3>
              <dl className="mt-3 grid gap-2 text-sm">
                {c.slots.map((s) => (
                  <div key={s.name} className="flex gap-3">
                    <dt>
                      <code className="font-mono text-[13px] font-medium">{s.name}</code>
                    </dt>
                    <dd className="text-muted-foreground">{s.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
          {c.id === "button" && (
            <p className="mt-4 text-xs text-muted-foreground">
              Agents asked “Is there a danger variant for Button?” 6 times. This table answered it.
            </p>
          )}
        </DocSection>

        {page.a11y && (
          <DocSection k="a11y" id="sec-a11y" title="Accessibility" {...link}>
            {c.a11y?.length ? (
              <ul className={BULLETS}>
                {c.a11y.map((x) => (
                  <li key={x}>
                    <Inline text={x} />
                  </li>
                ))}
              </ul>
            ) : (
              <MissingHint c={c} what="accessibility notes" />
            )}
          </DocSection>
        )}

        {c.tokens?.length ? (
          <DocSection k="tokens" id="sec-tokens" title="Tokens" {...link}>
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {c.tokens.map((id) => {
                const t = tokens.find((x) => x.id === id);
                return (
                  <li key={id} className="flex items-center gap-3 border-b py-2.5">
                    {t?.group === "color" ? (
                      <span
                        className="size-4 shrink-0 rounded-[5px] ring-1 ring-foreground/10 ring-inset"
                        style={{ background: t.value }}
                      />
                    ) : (
                      <span className="size-4 shrink-0" aria-hidden />
                    )}
                    <a
                      href="#tokens"
                      className="truncate font-mono text-[13px] underline-offset-4 hover:underline"
                    >
                      {id}
                    </a>
                    <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">
                      {t?.value}
                    </span>
                  </li>
                );
              })}
            </ul>
          </DocSection>
        ) : null}

        {c.related?.length ? (
          <DocSection k="related" title="Related" {...link}>
            <RelatedLinks ids={c.related} />
          </DocSection>
        ) : null}
      </div>
    </div>
  );
}

/** Which section sits under the top bar, for the “On this page” list. */
function useScrollSpy(ids: string[]) {
  const [active, setActive] = React.useState(ids[0]);
  // A clicked section stays selected until the reader scrolls on their own.
  const pinned = React.useRef<string | null>(null);
  const key = ids.join(" ");

  React.useEffect(() => {
    const list = key.split(" ");
    let frame = 0;
    const measure = () => {
      frame = 0;
      if (pinned.current) return;
      let current = list[0];
      for (const id of list) {
        const top = document.getElementById(`sec-${id}`)?.getBoundingClientRect().top;
        if (top !== undefined && top <= 112) current = id;
      }
      // Short sections at the end never reach the top, so the end of the page selects the last one.
      // On desktop the content panel scrolls; on phones the window does.
      const panel = document.querySelector<HTMLElement>("[data-scroll-root]");
      const inPanel = !!panel && panel.scrollHeight > panel.clientHeight;
      const atEnd = inPanel
        ? panel.scrollTop > 0 && panel.scrollTop + panel.clientHeight >= panel.scrollHeight - 4
        : window.scrollY > 0 &&
          window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;
      setActive(atEnd ? list[list.length - 1] : current);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    const release = () => {
      pinned.current = null;
    };
    measure();
    const panel = document.querySelector<HTMLElement>("[data-scroll-root]");
    panel?.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    window.addEventListener("wheel", release, { passive: true });
    window.addEventListener("touchstart", release, { passive: true });
    window.addEventListener("keydown", release);
    return () => {
      cancelAnimationFrame(frame);
      panel?.removeEventListener("scroll", schedule);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("wheel", release);
      window.removeEventListener("touchstart", release);
      window.removeEventListener("keydown", release);
    };
  }, [key]);

  const jump = React.useCallback((id: string) => {
    pinned.current = id;
    setActive(id);
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return [active, jump] as const;
}

function Rail({ c }: { c: ComponentDoc }) {
  const { resolved, setPendingDraft } = useStore();
  const asked = questions.filter(
    (q) => q.source?.route === `component-${c.id}` || q.fileId === c.id,
  );
  const sections = outline(c, resolved).toc;
  const [active, jump] = useScrollSpy(sections.map(([k]) => k));
  return (
    <aside className="sticky top-20 hidden h-fit w-52 shrink-0 xl:block">
      <p className="text-xs font-medium text-muted-foreground">On this page</p>
      <ul className="mt-3 grid border-l">
        {sections.map(([k, label]) => (
          <li key={k}>
            <button
              type="button"
              aria-current={active === k ? "location" : undefined}
              className={cn(
                "-ml-px w-full border-l py-1 pr-2 pl-3 text-left text-sm transition-colors outline-none focus-visible:bg-muted focus-visible:text-foreground",
                active === k
                  ? "border-foreground text-foreground"
                  : "border-transparent text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
              onClick={() => jump(k)}
            >
              {label}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-10">
        <p className="text-xs font-medium text-muted-foreground">Agents</p>
        <p className="mt-3 text-sm tabular">{c.requests} requests this week</p>
        {asked.length > 0 && (
          <ul className="mt-4 grid gap-4">
            {asked.map((q) => {
              const open = q.status === "gap" && !resolved.includes(q.id);
              return (
                <li key={q.id} className="text-sm leading-snug">
                  <p>{q.text}</p>
                  <p className="mt-1 text-xs text-muted-foreground tabular">
                    {q.count} times
                    {q.status === "gap" &&
                      (open ? (
                        <span className="text-bad">, no answer yet</span>
                      ) : (
                        <span className="text-good">, answered now</span>
                      ))}
                  </p>
                  {open && q.fileId && (
                    <button
                      type="button"
                      onClick={() => {
                        setPendingDraft(q.id);
                        navigate(`edit-${q.fileId}`);
                      }}
                      className="mt-1.5 rounded-sm text-xs font-medium underline decoration-border underline-offset-4 transition-colors outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      Write the answer
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}

/* ---------------------------------------------------------------- Detail */

export function ComponentDetail({ id }: { id: string }) {
  const { reader, setReader, resolved } = useStore();
  const mode = useEffectiveReader(reader);
  const [format, setFormat] = React.useState("Markdown");
  const [hover, setHover] = React.useState<Hover>({ key: null, from: null });
  const c = components.find((x) => x.id === id);

  if (!c) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">There’s no component called “{id}”.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("components")}>
          Back to components
        </Button>
      </div>
    );
  }

  const lines =
    format === "JSON" ? componentJSON(c, { resolved }) : componentLines(c, { resolved });
  const request = (
    <>
      <span className="text-muted-foreground">mcp</span> get_component{" "}
      <span className="text-muted-foreground">{`{ "name": "${c.id}" }`}</span>
    </>
  );

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8 md:py-12",
        mode === "split" ? "max-w-[1480px]" : "max-w-[1180px]",
      )}
    >
      <PageHeader
        title={c.name}
        description={c.summary}
        actions={
          <>
            <ReaderSwitch value={reader} onChange={setReader} />
            <Button variant="outline" size="sm" onClick={() => navigate(`edit-${c.id}`)}>
              <PenLineIcon />
              Edit
            </Button>
          </>
        }
      />

      {c.replacedBy && (
        <Alert className="mt-6">
          <CircleAlertIcon />
          <AlertTitle>Deprecated</AlertTitle>
          <AlertDescription>
            Use{" "}
            <a
              href={`#component-${c.replacedBy}`}
              className="font-medium text-foreground underline underline-offset-4"
            >
              {components.find((x) => x.id === c.replacedBy)?.name}
            </a>{" "}
            instead. Agents are told the same thing.
          </AlertDescription>
        </Alert>
      )}

      <div className="mt-8">
        {mode === "people" && (
          <div className="flex gap-14">
            <div className="min-w-0 flex-1">
              <ComponentPeople c={c} />
            </div>
            <Rail c={c} />
          </div>
        )}
        {mode === "agents" && (
          <div className="grid gap-3">
            <p className="max-w-[68ch] text-sm text-muted-foreground">
              What a coding agent receives when it asks for {c.name}, built from the same source as
              this page.
            </p>
            <AgentPane
              request={request}
              lines={lines}
              formats={["Markdown", "JSON"]}
              format={format}
              onFormat={setFormat}
            />
          </div>
        )}
        {mode === "split" && (
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-8">
            <div className="min-w-0">
              <ComponentPeople c={c} hover={hover} onHover={setHover} />
            </div>
            <div className="min-w-0">
              <AgentPane
                className="sticky top-16 max-h-[calc(100svh-5.5rem)]"
                request={request}
                lines={lines}
                hover={hover}
                onHover={setHover}
                formats={["Markdown", "JSON"]}
                format={format}
                onFormat={setFormat}
              />
              <p className="mt-2 px-1 text-xs text-muted-foreground">
                Hover a section on either side to see its counterpart.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
