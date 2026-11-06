import * as React from "react";
import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { BookOpenTextIcon, BotIcon, CheckIcon, Columns2Icon, CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { Status } from "@/data/workspace";
import type { Line } from "@/lib/agent-format";
import { estimateTokens } from "@/lib/agent-format";
import type { Reader } from "@/lib/store";
import { cn } from "@/lib/utils";

/* Page structure. Every screen uses these so the type scale stays the same everywhere:
   page title 28 to 32px, lead 16 to 17px, section title 20px, prose 15px, UI text 14px. */

/** Underlined text link, for links that sit in running text or section headers. */
export const linkClass =
  "rounded-sm font-medium underline decoration-border underline-offset-4 transition-colors outline-none hover:decoration-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

/** Running text: a readable line length at the prose size. */
export const proseClass = "max-w-[68ch] text-[15px] leading-relaxed";

export function PageHeader({
  title,
  description,
  badges,
  actions,
  meta,
  className,
}: {
  title: React.ReactNode;
  /** The lead. Say something the reader needs, not what the page is for. */
  description?: React.ReactNode;
  badges?: React.ReactNode;
  actions?: React.ReactNode;
  /** A quiet line of facts under the lead, usually <Facts>. */
  meta?: React.ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("grid gap-6", className)}>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between md:gap-10">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <h1 className="text-[28px] leading-tight font-semibold tracking-[-0.03em] text-balance md:text-[32px]">
              {title}
            </h1>
            {badges}
          </div>
          {description && (
            <p className="mt-2 max-w-[60ch] text-base leading-relaxed text-pretty text-foreground/75 md:text-[17px]">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex shrink-0 flex-wrap items-center gap-2 md:pt-1.5">{actions}</div>
        )}
      </div>
      {meta}
    </header>
  );
}

/** A page section: a title, an optional aside on the right (a link or a count), then content. No box. */
export function Section({
  title,
  aside,
  description,
  children,
  className,
  id,
}: {
  title: React.ReactNode;
  aside?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={cn("min-w-0 scroll-mt-20", className)}>
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h2 className="text-xl leading-snug font-semibold tracking-[-0.02em]">{title}</h2>
        {aside && <div className="text-sm text-muted-foreground">{aside}</div>}
      </div>
      {description && (
        <p className="mt-1 max-w-[68ch] text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </section>
  );
}

/** Label and value pairs on one line that wraps. Replaces rows of stat boxes. */
export function Facts({
  items,
  className,
}: {
  items: [string, React.ReactNode][];
  className?: string;
}) {
  return (
    <dl className={cn("flex flex-wrap gap-x-6 gap-y-2 text-sm", className)}>
      {items.map(([label, value]) => (
        <div key={label} className="flex min-w-0 items-baseline gap-1.5">
          <dt className="shrink-0 text-muted-foreground">{label}</dt>
          <dd className="min-w-0 truncate">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

const DOT: Record<"good" | "warn" | "bad" | "off", string> = {
  good: "bg-good",
  warn: "bg-warn",
  bad: "bg-bad",
  off: "bg-muted-foreground/50",
};

/** A colored dot before a word. The one way state is shown, instead of outlined badges. */
export function Dot({
  tone,
  children,
  className,
}: {
  tone: keyof typeof DOT;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span className={cn("size-1.5 shrink-0 rounded-full", DOT[tone])} />
      {children}
    </span>
  );
}

export function StatusLabel({ status, className }: { status: Status; className?: string }) {
  const tone = status === "stable" ? "good" : status === "beta" ? "warn" : "off";
  return (
    <Dot tone={tone} className={className}>
      {status === "stable" ? "Stable" : status === "beta" ? "Beta" : "Deprecated"}
    </Dot>
  );
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = text;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand("copy");
    } catch {
      ok = false;
    }
    ta.remove();
    return ok;
  }
}

export function CopyButton({
  text,
  label = "Copy",
  className,
}: {
  text: string;
  label?: string;
  className?: string;
}) {
  const [done, setDone] = React.useState(false);
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Button
            variant="ghost"
            size="icon-sm"
            className={cn("text-muted-foreground", className)}
            aria-label={label}
            onClick={async () => {
              if (await copyText(text)) {
                setDone(true);
                window.setTimeout(() => setDone(false), 1400);
              }
            }}
          />
        }
      >
        {done ? <CheckIcon /> : <CopyIcon />}
      </TooltipTrigger>
      <TooltipContent>{done ? "Copied" : label}</TooltipContent>
    </Tooltip>
  );
}

export function CodeBlock({
  code,
  header,
  className,
  wrap,
}: {
  code: string;
  header?: React.ReactNode;
  className?: string;
  wrap?: boolean;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg border bg-muted/40", className)}>
      <div className="flex h-9 items-center gap-2 border-b bg-background/60 pr-1 pl-3 text-xs text-muted-foreground">
        <div className="flex min-w-0 flex-1 items-center gap-2">{header}</div>
        <CopyButton text={code} />
      </div>
      <pre
        className={cn(
          "overflow-x-auto p-3.5 font-mono text-[12.5px] leading-relaxed",
          wrap && "break-words whitespace-pre-wrap",
        )}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

export function ReaderSwitch({
  value,
  onChange,
  className,
}: {
  value: Reader;
  onChange: (r: Reader) => void;
  className?: string;
}) {
  return (
    <SegmentedControl
      value={value}
      onChange={(v) => onChange(v as Reader)}
      aria-label="Read this page as"
      className={className}
      options={[
        { value: "people", label: "People", icon: BookOpenTextIcon, title: "Read as people do" },
        {
          value: "split",
          label: "Split",
          icon: Columns2Icon,
          title: "Side by side",
          className: "hidden xl:inline-flex",
        },
        { value: "agents", label: "Agents", icon: BotIcon, title: "Read as agents do" },
      ]}
    />
  );
}

/**
 * A segmented control: one choice from a few views of the same thing. Built on
 * ToggleGroup and styled to match the default Tabs list, so it reads as one
 * control, not a row of buttons.
 */
export function SegmentedControl({
  value,
  onChange,
  options,
  className,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (value: string) => void;
  options: {
    value: string;
    label: string;
    icon?: React.ComponentType<{ className?: string }>;
    title?: string;
    className?: string;
  }[];
  className?: string;
  "aria-label": string;
}) {
  return (
    <ToggleGroup
      size="sm"
      spacing={0.5}
      value={[value]}
      onValueChange={(v: string[]) => v[0] && onChange(v[0])}
      aria-label={ariaLabel}
      className={cn("rounded-lg bg-muted p-0.5", className)}
    >
      {options.map((o) => (
        <ToggleGroupItem
          key={o.value}
          value={o.value}
          aria-label={o.title}
          className={cn(
            "h-6 gap-1.5 border border-transparent px-2 text-foreground/60 hover:bg-transparent hover:text-foreground aria-pressed:bg-background aria-pressed:text-foreground aria-pressed:shadow-sm dark:text-muted-foreground dark:aria-pressed:border-input dark:aria-pressed:bg-input/30 dark:aria-pressed:text-foreground",
            o.className,
          )}
        >
          {o.icon && <o.icon />}
          {o.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}

/** On screens without room for Split, fall back to People. */
export function useEffectiveReader(reader: Reader) {
  const [wide, setWide] = React.useState(() => window.matchMedia("(min-width: 1280px)").matches);
  React.useEffect(() => {
    const mq = window.matchMedia("(min-width: 1280px)");
    const on = () => setWide(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reader === "split" && !wide ? "people" : reader;
}

export type Hover = { key: string | null; from: "people" | "agent" | null };

export function AgentPane({
  request,
  lines,
  hover,
  onHover,
  formats,
  format,
  onFormat,
  className,
  bodyClassName,
}: {
  request: React.ReactNode;
  lines: Line[];
  hover?: Hover;
  onHover?: (h: Hover) => void;
  formats?: string[];
  format?: string;
  onFormat?: (f: string) => void;
  className?: string;
  bodyClassName?: string;
}) {
  const scroller = React.useRef<HTMLDivElement>(null);
  const text = React.useMemo(() => lines.map((l) => l.text).join("\n"), [lines]);
  const tokens = estimateTokens(lines);

  React.useEffect(() => {
    if (!hover?.key || hover.from !== "people" || !scroller.current) return;
    const el = scroller.current.querySelector<HTMLElement>(`[data-key="${hover.key}"]`);
    if (!el) return;
    const box = scroller.current;
    const top = el.offsetTop - 24;
    if (top < box.scrollTop || top > box.scrollTop + box.clientHeight - 80)
      box.scrollTo({ top, behavior: "smooth" });
  }, [hover]);

  return (
    <div
      className={cn("flex min-h-0 flex-col overflow-hidden rounded-xl border bg-card", className)}
    >
      <div className="flex min-h-10 flex-wrap items-center gap-x-3 gap-y-1 border-b py-1.5 pr-1.5 pl-3">
        <div className="min-w-0 flex-1 truncate font-mono text-xs">{request}</div>
        <span className="text-xs text-muted-foreground tabular">
          ≈ {tokens.toLocaleString()} tokens
        </span>
        {formats && format && onFormat && (
          <ToggleGroup
            size="sm"
            value={[format]}
            onValueChange={(v: string[]) => v[0] && onFormat(v[0])}
            className="h-7"
          >
            {formats.map((f) => (
              <ToggleGroupItem key={f} value={f} className="h-7 px-2 text-xs">
                {f}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        )}
        <CopyButton text={text} label="Copy payload" />
      </div>
      <div
        ref={scroller}
        className={cn(
          "relative overflow-auto py-3 font-mono text-[12.5px] leading-[1.7]",
          bodyClassName,
        )}
      >
        {lines.map((l, i) => {
          const active = !!hover?.key && l.key === hover.key;
          return (
            <div
              key={i}
              data-key={l.key}
              onMouseEnter={
                onHover && l.key ? () => onHover({ key: l.key!, from: "agent" }) : undefined
              }
              onMouseLeave={onHover ? () => onHover({ key: null, from: null }) : undefined}
              className={cn(
                "flex pr-4 transition-colors duration-150",
                active && "bg-foreground/[0.06] shadow-[inset_2px_0_0_var(--color-foreground)]",
              )}
            >
              <span className="w-10 shrink-0 pr-3 text-right text-muted-foreground/45 select-none tabular">
                {i + 1}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 break-words whitespace-pre-wrap",
                  l.kind === "h1" && "font-semibold",
                  l.kind === "h2" && "font-semibold",
                  l.kind === "meta" && "text-muted-foreground",
                  l.kind === "table" && "text-foreground/85",
                  l.kind === "code" && "text-foreground/85",
                  l.kind === "do" && "text-good",
                  l.kind === "dont" && "text-bad",
                  l.kind === "note" && "text-muted-foreground",
                  l.kind === "muted" && "text-muted-foreground",
                )}
              >
                {l.text || "\u00a0"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/** A people-facing section that lights up with its agent counterpart in Split view. */
export function DocSection({
  k,
  title,
  description,
  hover,
  onHover,
  children,
  className,
  id,
}: {
  k: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  hover?: Hover;
  onHover?: (h: Hover) => void;
  children: React.ReactNode;
  className?: string;
  id?: string;
}) {
  const linked = !!onHover;
  const active = !!hover?.key && hover.key === k;
  return (
    <section
      id={id}
      data-section={k}
      onMouseEnter={linked ? () => onHover!({ key: k, from: "people" }) : undefined}
      onMouseLeave={linked ? () => onHover!({ key: null, from: null }) : undefined}
      className={cn(
        "scroll-mt-20 rounded-xl transition-colors duration-150",
        linked && "-mx-3 px-3 py-3",
        active && "bg-foreground/[0.035] ring-1 ring-foreground/10",
        className,
      )}
    >
      {title && <h2 className="text-xl leading-snug font-semibold tracking-[-0.02em]">{title}</h2>}
      {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      <div className={cn(title && "mt-5")}>{children}</div>
    </section>
  );
}

/**
 * A selectable tile for visual pickers, like theme and palette. Put it inside a
 * RadioGroup, which handles arrow keys and keeps one tab stop for the set.
 */
export function ChoiceTile({
  className,
  ...props
}: Omit<RadioPrimitive.Root.Props, "className"> & { className?: string }) {
  return (
    <RadioPrimitive.Root
      className={cn(
        "cursor-pointer rounded-xl border p-3 text-sm transition-colors outline-none select-none hover:bg-muted/40 focus-visible:ring-3 focus-visible:ring-ring/50 data-checked:border-foreground/50 data-checked:bg-muted/60",
        className,
      )}
      {...props}
    />
  );
}

export function Meter({
  value,
  total,
  className,
}: {
  value: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      className={cn("h-1.5 overflow-hidden rounded-full bg-muted", className)}
      role="presentation"
    >
      <div
        className="h-full rounded-full bg-foreground/80"
        style={{ width: `${(value / total) * 100}%` }}
      />
    </div>
  );
}

export function Mono({ children, className }: { children: React.ReactNode; className?: string }) {
  return <code className={cn("font-mono text-[0.88em]", className)}>{children}</code>;
}
