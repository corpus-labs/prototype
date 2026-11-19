import * as React from "react";
import { CircleAlertIcon, DownloadIcon, FileCodeIcon, SearchIcon } from "lucide-react";

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
import { Textarea } from "@/components/ui/textarea";
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
import { CButton, ComponentThumb, CuiScope, type CButtonProps } from "@/components/charged-ui";
import {
  AgentPane,
  CodeBlock,
  DocSection,
  Dot,
  Facts,
  PageHeader,
  ReaderSwitch,
  SegmentedControl,
  StatusLabel,
  ViewSwitch,
  linkClass,
  proseClass,
  useEffectiveReader,
  useViewMode,
} from "@/components/common";
import { components, questions, tokens, type ComponentDoc } from "@/data/workspace";
import { componentJSON, componentLines, includeSnippet } from "@/lib/agent-format";
import { useComponentDocs, withWritten } from "@/lib/component-docs";
import { parseMdx, slug } from "@/lib/mdx-lite";
import { joinFrontmatter, splitFrontmatter } from "@core/markdown/frontmatter";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

/* ---------------------------------------------------------------- Gallery */

export function ComponentsIndex() {
  const { dark } = useStore();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState("all");
  const [view, setView] = useViewMode("components");
  const docs = useComponentDocs();
  const list = docs.filter(
    (c) =>
      (status === "all" || c.status === status) &&
      (c.name + c.machine + c.category).toLowerCase().includes(query.toLowerCase()),
  );

  // Categories in the order they first appear, each with its most requested component first.
  const groups: [string, ComponentDoc[]][] = [];
  for (const c of list) {
    const g = groups.find(([name]) => name === c.category);
    if (g) g[1].push(c);
    else groups.push([c.category, [c]]);
  }
  for (const [, items] of groups) items.sort((x, y) => y.requests - x.requests);
  const thin = docs.filter(
    (c) => c.status !== "deprecated" && !c.whenToUse?.length && !c.rules?.length,
  ).length;

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title="Components"
        description={
          thin
            ? `${components.length} components in ${new Set(components.map((c) => c.category)).size} categories. ${thin} have no usage guidance yet.`
            : `${components.length} components in ${new Set(components.map((c) => c.category)).size} categories, all with usage guidance.`
        }
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

      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <SegmentedControl
            value={status}
            onChange={setStatus}
            aria-label="Status"
            options={[
              { value: "all", label: "All" },
              { value: "stable", label: "Stable" },
              { value: "beta", label: "Beta" },
              { value: "deprecated", label: "Deprecated" },
            ]}
          />
          <ViewSwitch value={view} onChange={setView} />
        </div>
      </div>

      {view === "grid" ? (
        <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((c) => {
            const noUsage = !c.whenToUse?.length && !c.rules?.length;
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
      ) : (
        <>
          {/* An index by category: each category named once on the left, its components as rows beside it. */}
          <div className="mt-6 divide-y border-y">
            {groups.map(([category, items]) => (
              <section
                key={category}
                aria-label={category}
                className="grid gap-x-6 sm:grid-cols-[8rem_minmax(0,1fr)]"
              >
                <h2 className="pt-5 text-sm font-medium sm:sticky sm:top-12 sm:self-start sm:py-6">
                  {category}
                  <span className="ml-2 font-normal text-muted-foreground tabular">
                    {items.length}
                  </span>
                </h2>
                <ul className="divide-y">
                  {items.map((c) => {
                    const noUsage = !c.whenToUse?.length && !c.rules?.length;
                    const retired = c.status === "deprecated";
                    return (
                      <li key={c.id}>
                        <a
                          href={`#component-${c.id}`}
                          className="group grid grid-cols-[minmax(0,1fr)] items-center gap-x-6 gap-y-3 py-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 md:grid-cols-[13rem_minmax(0,1fr)_8.5rem]"
                        >
                          <CuiScope
                            dark={dark}
                            className={cn(
                              "pointer-events-none flex h-28 items-center justify-center overflow-hidden rounded-lg border bg-(--cui-subtle) transition-colors group-hover:border-foreground/25",
                              retired && "opacity-50 grayscale",
                            )}
                          >
                            <div className="scale-[0.8]">
                              <ComponentThumb id={c.id} />
                            </div>
                          </CuiScope>
                          <div className="min-w-0">
                            <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                              <span className="text-[17px] font-semibold tracking-[-0.01em] decoration-foreground/30 underline-offset-4 group-hover:underline">
                                {c.name}
                              </span>
                              <code className="font-mono text-xs text-muted-foreground">
                                {c.machine}
                              </code>
                            </p>
                            <p className="mt-1 line-clamp-2 max-w-[56ch] text-sm leading-relaxed text-pretty text-foreground/75">
                              {c.summary}
                            </p>
                            {retired ? (
                              <p className="mt-2 text-sm text-muted-foreground">
                                Replaced by {components.find((x) => x.id === c.replacedBy)?.name}
                              </p>
                            ) : (
                              noUsage && (
                                <p className="mt-2 text-sm">
                                  <Dot tone="warn" className="text-warn">
                                    No usage guidance
                                  </Dot>
                                </p>
                              )
                            )}
                          </div>
                          <div className="flex items-baseline gap-x-4 md:block md:self-stretch md:border-l md:pt-1 md:pl-6">
                            <p className="flex items-baseline gap-1.5">
                              <span className="text-xl leading-none font-semibold tracking-[-0.02em] tabular">
                                {c.requests}
                              </span>
                              <span className="text-sm text-muted-foreground">requests</span>
                            </p>
                            <StatusLabel
                              status={c.status}
                              className="text-sm text-muted-foreground md:mt-2"
                            />
                          </div>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
            {list.length === 0 && (
              <p className="py-10 text-center text-sm text-muted-foreground">
                No components match “{query}”. Clear the filter to see all {components.length}.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

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

/**
 * The page's sections for “On this page”: the preview, then the written page's own headings,
 * then what comes from the schema.
 */
type PageDoc = ComponentDoc & { writtenBody?: string };

function outline(c: PageDoc): [string, string][] {
  const written = parseMdx(c.writtenBody ?? "")
    .filter((b) => b.t === "h2")
    .map((b) => [slug(b.t === "h2" ? b.text : ""), b.t === "h2" ? b.text : ""] as [string, string]);
  const toc: [string, string][] = [["preview", "Preview"], ...written, ["props", "Props"]];
  if (c.tokens?.length) toc.push(["tokens", "Tokens"]);
  return toc;
}

/** A section's element: one of the page's own, or a heading in the written page by its slug. */
function sectionEl(id: string): HTMLElement | null {
  return (
    document.getElementById(`sec-${id}`) ??
    [...document.querySelectorAll<HTMLElement>(".docs-prose h2")].find(
      (h) => slug(h.textContent ?? "") === id,
    ) ??
    null
  );
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
    <p className={proseClass}>
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

/**
 * A component's page. The preview, props, tokens, and related components come from its
 * schema; between them, the written page is its MDX file in the shared editor, always
 * editable, with its examples as cards.
 */
function ComponentPeople({ c, written }: { c: ComponentDoc; written: React.ReactNode }) {
  return (
    <div>
      <MetaRow c={c} />

      <div className="mt-8 grid gap-16">
        <section id="sec-preview" className="scroll-mt-20">
          {c.id === "button" ? <ButtonPlayground /> : <StaticPreview c={c} />}
        </section>

        <section aria-label="Written page" className="min-w-0">
          {written}
        </section>

        <DocSection
          k="props"
          id="sec-props"
          title="Props"
          description={
            <>
              From <code className="font-mono text-[13px]">{c.file}</code>
            </>
          }
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

        {c.tokens?.length ? (
          <DocSection k="tokens" id="sec-tokens" title="Tokens">
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
          <DocSection k="related" title="Related">
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
        const top = sectionEl(id)?.getBoundingClientRect().top;
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
    sectionEl(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return [active, jump] as const;
}

function Rail({ c }: { c: PageDoc }) {
  const { resolved, setPendingDraft } = useStore();
  const asked = questions.filter(
    (q) => q.source?.route === `component-${c.id}` || q.fileId === c.id,
  );
  const sections = outline(c);
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

const DocsEditor = React.lazy(() =>
  import("@/components/docs-editor/docs-editor").then((m) => ({ default: m.DocsEditor })),
);

/** The page's opening paragraph is its summary, edited as the description under the title. */
function splitSummary(body: string) {
  const m = body.match(/^(?![#<`>|-])(\S[^\n]*(?:\n(?!\n)[^\n]+)*)\n\n/);
  return m ? { summary: m[1], rest: body.slice(m[0].length) } : { summary: "", rest: body };
}

function joinSummary(summary: string, rest: string) {
  return summary.trim() ? `${summary.trim()}\n\n${rest}` : rest;
}

export function ComponentDetail({ id }: { id: string }) {
  const { reader, setReader, resolved, files, saved, setFile, commit } = useStore();
  const mode = useEffectiveReader(reader);
  const [format, setFormat] = React.useState("Markdown");
  const [source, setSource] = React.useState(false);
  // The rich editor loads its text once. Discard and Undo replace it from outside, so they remount it.
  const [revision, setRevision] = React.useState(0);
  const schema = components.find((x) => x.id === id);

  if (!schema) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <p className="text-sm text-muted-foreground">There’s no component called “{id}”.</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("components")}>
          Back to components
        </Button>
      </div>
    );
  }

  const original = saved[id] ?? "";
  const text = files[id] ?? original;
  const changed = text !== original;
  const { lines: front, body } = splitFrontmatter(text);
  const { summary, rest } = splitSummary(body);
  // What people see and agents get, read from the text as it is now.
  const c = { ...withWritten(schema, text), writtenBody: rest };
  const write = (nextSummary: string, nextRest: string) =>
    setFile(id, joinFrontmatter({ lines: front, body: joinSummary(nextSummary, nextRest) }));

  const discard = () => {
    const kept = text;
    setFile(id, original);
    setRevision((r) => r + 1);
    const toastId = toast.add({
      title: "Changes discarded",
      description: `${schema.name}’s page matches the last commit again.`,
      actionProps: {
        children: "Undo",
        onClick: () => {
          setFile(id, kept);
          setRevision((r) => r + 1);
          toast.close(toastId);
        },
      },
    });
  };
  const commitNow = () => {
    const done = commit({ fileId: id, message: `Update ${schema.name}`, mode: "main" });
    toast.add({
      title: "Committed to main",
      description: `${done.sha}: Update ${schema.name}. Agents get it on their next request.`,
    });
  };

  const lines =
    format === "JSON" ? componentJSON(c, { resolved }) : componentLines(c, { resolved });
  const request = (
    <>
      <span className="text-muted-foreground">mcp</span> get_component{" "}
      <span className="text-muted-foreground">{`{ "name": "${c.id}" }`}</span>
    </>
  );

  const written = source ? (
    <Textarea
      value={rest}
      onChange={(e) => write(summary, e.target.value)}
      spellCheck={false}
      aria-label={`${schema.name} page source`}
      className="min-h-[50svh] w-full max-w-[72ch] resize-y rounded-none border-0 bg-transparent p-0 font-mono text-[13px] leading-6 shadow-none focus-visible:ring-0 dark:bg-transparent"
    />
  ) : (
    <React.Suspense fallback={<p className="text-sm text-muted-foreground">Loading the page…</p>}>
      <DocsEditor
        key={`${id}-${revision}`}
        value={rest}
        onChange={(next) => write(summary, next)}
        pagePath={`docs/components/${id}.mdx`}
        pages={[]}
        mdx
      />
    </React.Suspense>
  );

  // The same quiet hover as a sidebar row, so the summary reads as a field.
  const field =
    "-mx-2 w-[calc(100%+1rem)] rounded-md bg-transparent px-2 outline-none transition-colors hover:bg-muted/60 focus:bg-transparent";

  return (
    <div
      className={cn(
        "mx-auto w-full px-4 py-8 md:px-8 md:py-12",
        mode === "split" ? "max-w-[1480px]" : "max-w-[1180px]",
      )}
    >
      <header className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="max-w-[72ch] min-w-0 flex-1">
          <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] md:text-[32px]">
            {schema.name}
          </h1>
          <textarea
            value={summary}
            onChange={(e) => write(e.target.value.replace(/\n+/g, " "), rest)}
            aria-label="Summary"
            placeholder="Add a one-line summary"
            rows={2}
            className={cn(
              field,
              "mt-1 field-sizing-content resize-none py-0.5 text-base leading-relaxed text-foreground/75 placeholder:text-muted-foreground/60 md:text-[17px]",
            )}
          />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1.5">
          <ReaderSwitch value={reader} onChange={setReader} />
          {mode !== "agents" && (
            <Button
              variant="outline"
              size="sm"
              aria-pressed={source}
              className="aria-pressed:bg-muted"
              onClick={() => setSource((s) => !s)}
            >
              <FileCodeIcon />
              Markdown
            </Button>
          )}
        </div>
      </header>

      {changed && (
        <p className="mt-4 flex flex-wrap items-baseline gap-x-3 gap-y-1 text-sm">
          <Dot tone="warn" className="text-warn">
            Not committed
          </Dot>
          <button type="button" onClick={commitNow} className={cn(linkClass, "font-normal")}>
            Commit
          </button>
          <button type="button" onClick={discard} className={cn(linkClass, "font-normal")}>
            Discard
          </button>
        </p>
      )}

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
              <ComponentPeople c={c} written={written} />
            </div>
            <Rail c={c} />
          </div>
        )}
        {mode === "agents" && (
          <div className="grid gap-3">
            <p className="max-w-[68ch] text-sm text-muted-foreground">
              What a coding agent receives when it asks for {c.name}, built from the same file as
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
          // Type on the left and the agent's copy updates on the right.
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] gap-8">
            <div className="min-w-0">
              <ComponentPeople c={c} written={written} />
            </div>
            <div className="min-w-0">
              <AgentPane
                className="sticky top-16 max-h-[calc(100svh-5.5rem)]"
                request={request}
                lines={lines}
                formats={["Markdown", "JSON"]}
                format={format}
                onFormat={setFormat}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
