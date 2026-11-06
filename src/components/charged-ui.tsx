import * as React from "react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InfoIcon,
  Loader2Icon,
  PlusIcon,
  TriangleAlertIcon,
  CircleCheckIcon,
  OctagonAlertIcon,
  ImageIcon,
} from "lucide-react";

import { cn } from "@/lib/utils";

/* Charged UI renders inside its own scope so its tokens never leak into Corpus. */
export function CuiScope({
  dark,
  className,
  children,
}: {
  dark?: boolean;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("cui", className)} data-canvas={dark ? "dark" : "light"}>
      {children}
    </div>
  );
}

export type CButtonProps = {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  label?: string;
  icon?: boolean;
  iconEnd?: boolean;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
};

export function CButton({
  variant = "secondary",
  size = "md",
  label = "Save changes",
  icon,
  iconEnd,
  disabled,
  loading,
  className,
}: CButtonProps) {
  const Icon = iconEnd ? ArrowRightIcon : PlusIcon;
  return (
    <button
      type="button"
      tabIndex={-1}
      aria-busy={loading || undefined}
      disabled={disabled}
      className={cn(
        "inline-flex shrink-0 cursor-default items-center justify-center gap-2 rounded-[8px] font-medium whitespace-nowrap transition-colors select-none outline-none",
        size === "sm" && "h-8 px-3 text-[13px]",
        size === "md" && "h-10 px-[14px] text-sm",
        size === "lg" && "h-12 px-5 text-[15px]",
        variant === "primary" && "bg-(--cui-charge) text-white hover:bg-(--cui-charge-deep)",
        variant === "secondary" &&
          "bg-(--cui-surface) text-(--cui-ink) ring-1 ring-(--cui-line) ring-inset hover:bg-(--cui-subtle)",
        variant === "ghost" && "text-(--cui-ink) hover:bg-(--cui-subtle)",
        variant === "danger" && "bg-(--cui-danger) text-white hover:brightness-95",
        disabled && "opacity-45",
        className,
      )}
    >
      {loading ? (
        <Loader2Icon className="size-4 animate-spin" aria-hidden />
      ) : (
        icon && !iconEnd && <Icon className="size-4" aria-hidden />
      )}
      {label}
      {icon && iconEnd && !loading && <Icon className="size-4" aria-hidden />}
    </button>
  );
}

export function CCallout({
  tone = "info",
  title,
  body,
  className,
}: {
  tone?: "info" | "success" | "warning" | "danger";
  title: string;
  body?: string;
  className?: string;
}) {
  const Icon = {
    info: InfoIcon,
    success: CircleCheckIcon,
    warning: TriangleAlertIcon,
    danger: OctagonAlertIcon,
  }[tone];
  return (
    <div
      className={cn(
        "flex gap-3 rounded-[8px] p-3.5 text-left text-sm",
        tone === "info" && "bg-(--cui-charge-soft)",
        tone === "success" && "bg-(--cui-success-soft)",
        tone === "warning" && "bg-(--cui-warning-soft)",
        tone === "danger" && "bg-(--cui-danger-soft)",
        className,
      )}
    >
      <Icon
        className={cn(
          "mt-0.5 size-4 shrink-0",
          tone === "info" && "text-(--cui-charge)",
          tone === "success" && "text-(--cui-success)",
          tone === "warning" && "text-(--cui-warning)",
          tone === "danger" && "text-(--cui-danger)",
        )}
        aria-hidden
      />
      <div className="min-w-0">
        <p className="font-medium">{title}</p>
        {body && <p className="mt-0.5 text-(--cui-muted)">{body}</p>}
      </div>
    </div>
  );
}

export function CBadge({
  tone = "neutral",
  label,
}: {
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-full px-2.5 text-xs font-medium",
        tone === "neutral" && "bg-(--cui-subtle) text-(--cui-ink)",
        tone === "info" && "bg-(--cui-charge-soft) text-(--cui-charge)",
        tone === "success" && "bg-(--cui-success-soft) text-(--cui-success)",
        tone === "warning" && "bg-(--cui-warning-soft) text-(--cui-warning)",
        tone === "danger" && "bg-(--cui-danger-soft) text-(--cui-danger)",
      )}
    >
      {label}
    </span>
  );
}

export function CCard({
  title,
  body,
  nested,
  compact,
  small,
}: {
  title: string;
  body?: string;
  nested?: boolean;
  compact?: boolean;
  small?: boolean;
}) {
  return (
    <div className="w-full overflow-hidden rounded-[12px] bg-(--cui-surface) text-left ring-1 ring-(--cui-line)">
      {!compact && (
        <div
          className={cn(
            "flex items-center justify-center bg-(--cui-subtle) text-(--cui-muted)",
            small ? "h-10" : "h-20",
          )}
        >
          <ImageIcon className="size-5" aria-hidden />
        </div>
      )}
      <div className={small ? "p-3" : "p-4"}>
        <p className={cn("font-semibold tracking-tight", small && "text-sm")}>{title}</p>
        {body && (
          <p className={cn("mt-1 text-(--cui-muted)", small ? "text-xs" : "text-sm")}>{body}</p>
        )}
        {nested && (
          <div className="mt-3 rounded-[12px] p-3 ring-1 ring-(--cui-line)">
            <p className="text-sm font-semibold">Related program</p>
            <p className="text-xs text-(--cui-muted)">Another card inside</p>
          </div>
        )}
      </div>
    </div>
  );
}

export function CField({
  label = "Email",
  value,
  placeholderOnly,
  error,
}: {
  label?: string;
  value?: string;
  placeholderOnly?: boolean;
  error?: string;
}) {
  return (
    <div className="grid w-full max-w-64 gap-1.5 text-left">
      {!placeholderOnly && <span className="text-sm font-medium">{label}</span>}
      <div
        className={cn(
          "flex h-10 items-center rounded-[8px] bg-(--cui-surface) px-3 text-sm ring-1 ring-(--cui-line) ring-inset",
          error && "ring-(--cui-danger)",
        )}
      >
        {value ? (
          <span>{value}</span>
        ) : (
          <span className="text-(--cui-muted)">{placeholderOnly ? label : "name@school.edu"}</span>
        )}
      </div>
      {error ? (
        <span className="text-xs text-(--cui-danger)">{error}</span>
      ) : (
        !placeholderOnly && (
          <span className="text-xs text-(--cui-muted)">We’ll send the receipt here.</span>
        )
      )}
    </div>
  );
}

export function CMenu({ doubleActive, short }: { doubleActive?: boolean; short?: boolean }) {
  const items = short
    ? ["Programs", "Admissions", "About"]
    : ["Programs", "Admissions", "Research", "About"];
  return (
    <nav className="flex items-center gap-1 text-sm font-medium">
      {items.map((x, i) => {
        const active = i === 1 || (doubleActive && i === 0);
        return (
          <span
            key={x}
            className={cn(
              "rounded-[8px] px-3 py-1.5",
              active ? "bg-(--cui-charge-soft) text-(--cui-charge)" : "text-(--cui-muted)",
            )}
          >
            {x}
          </span>
        );
      })}
    </nav>
  );
}

export function CTabs() {
  return (
    <div className="w-full max-w-72 text-sm">
      <div className="flex gap-5 border-b border-(--cui-line)">
        {["Overview", "Specs", "Reviews"].map((x, i) => (
          <span
            key={x}
            className={cn(
              "-mb-px border-b-2 pb-2 font-medium",
              i === 0
                ? "border-(--cui-charge) text-(--cui-ink)"
                : "border-transparent text-(--cui-muted)",
            )}
          >
            {x}
          </span>
        ))}
      </div>
      <div className="mt-3 h-2 w-4/5 rounded-full bg-(--cui-subtle)" />
      <div className="mt-2 h-2 w-3/5 rounded-full bg-(--cui-subtle)" />
    </div>
  );
}

export function CAccordion() {
  return (
    <div className="w-full max-w-72 divide-y divide-(--cui-line) rounded-[8px] text-left text-sm ring-1 ring-(--cui-line)">
      {["How long is the program?", "Can I study part time?"].map((q, i) => (
        <div key={q} className="px-3 py-2.5">
          <div className="flex items-center justify-between font-medium">
            {q}
            <ChevronDownIcon
              className={cn("size-4 text-(--cui-muted)", i === 0 && "rotate-180")}
              aria-hidden
            />
          </div>
          {i === 0 && <p className="mt-1 text-(--cui-muted)">Two years full time.</p>}
        </div>
      ))}
    </div>
  );
}

export function CHero() {
  return (
    <div className="w-full max-w-80 text-left">
      <p className="text-xl leading-tight font-bold tracking-[-0.035em]">
        Build what’s next at State
      </p>
      <p className="mt-1.5 text-sm text-(--cui-muted)">Programs for people who make things.</p>
      <CButton variant="primary" size="sm" label="Explore programs" className="mt-3" />
    </div>
  );
}

export function CBreadcrumb({ items = ["Home", "Programs", "Design"] }: { items?: string[] }) {
  return (
    <nav className="flex items-center gap-1.5 text-sm">
      {items.map((x, i) => (
        <React.Fragment key={x}>
          {i > 0 && <ChevronRightIcon className="size-3.5 text-(--cui-muted)" aria-hidden />}
          <span className={i === items.length - 1 ? "font-medium" : "text-(--cui-charge)"}>
            {x}
          </span>
        </React.Fragment>
      ))}
    </nav>
  );
}

export function CPagination({ all, short }: { all?: boolean; short?: boolean }) {
  const pages = all
    ? Array.from({ length: 12 }, (_, i) => String(i + 1))
    : short
      ? ["1", "…", "4", "5", "…", "12"]
      : ["1", "…", "3", "4", "5", "…", "12"];
  return (
    <nav className={cn("flex items-center gap-1 text-sm", all ? "flex-wrap" : "flex-nowrap")}>
      <span className="flex size-8 items-center justify-center rounded-[8px] text-(--cui-muted)">
        <ChevronLeftIcon className="size-4" aria-hidden />
      </span>
      {pages.map((p, i) => (
        <span
          key={i}
          className={cn(
            "flex h-8 min-w-8 items-center justify-center rounded-[8px] px-1.5 tabular-nums",
            p === "4" ? "bg-(--cui-charge) text-white" : "text-(--cui-ink)",
          )}
        >
          {p}
        </span>
      ))}
      <span className="flex size-8 items-center justify-center rounded-[8px] text-(--cui-muted)">
        <ChevronRightIcon className="size-4" aria-hidden />
      </span>
    </nav>
  );
}

export function CPager() {
  return (
    <nav className="flex w-full max-w-64 items-center justify-between text-sm font-medium text-(--cui-charge)">
      <span className="flex items-center gap-1">
        <ChevronLeftIcon className="size-4" aria-hidden /> Previous
      </span>
      <span className="flex items-center gap-1">
        Next <ChevronRightIcon className="size-4" aria-hidden />
      </span>
    </nav>
  );
}

/** Small, static preview for each component in the gallery. */
export function ComponentThumb({ id }: { id: string }) {
  switch (id) {
    case "button":
      return (
        <div className="flex gap-2">
          <CButton variant="primary" size="sm" label="Save changes" />
          <CButton size="sm" label="Cancel" />
        </div>
      );
    case "card":
      return (
        <div className="w-40">
          <CCard small title="Industrial design" body="Two-year studio program" />
        </div>
      );
    case "callout":
      return <CCallout tone="warning" title="Applications close Friday" className="w-56" />;
    case "form-field":
      return <CField />;
    case "menu":
      return <CMenu short />;
    case "tabs":
      return <CTabs />;
    case "badge":
      return (
        <div className="flex gap-1.5">
          <CBadge tone="success" label="Open" />
          <CBadge tone="info" label="New" />
          <CBadge label="Online" />
        </div>
      );
    case "accordion":
      return <CAccordion />;
    case "hero":
      return <CHero />;
    case "breadcrumb":
      return <CBreadcrumb />;
    case "pagination":
      return <CPagination short />;
    case "pager":
      return <CPager />;
    default:
      return null;
  }
}

/** Previews for do and don't examples. */
export function ExamplePreview({ name }: { name: string }) {
  switch (name) {
    case "pair-good":
      return (
        <div className="flex gap-2">
          <CButton size="sm" label="Cancel" />
          <CButton size="sm" variant="primary" label="Save changes" />
        </div>
      );
    case "pair-bad":
      return (
        <div className="flex gap-2">
          <CButton size="sm" variant="primary" label="Save" />
          <CButton size="sm" variant="primary" label="Publish" />
        </div>
      );
    case "label-good":
      return <CButton size="sm" variant="primary" label="Invite people" />;
    case "label-bad":
      return <CButton size="sm" variant="primary" label="Click here" />;
    case "link-good":
      return <CButton size="sm" label="Read the guide" icon iconEnd />;
    case "link-bad":
      return (
        <span className="text-sm text-(--cui-charge) underline decoration-dotted">
          Read the guide
        </span>
      );
    case "loading-good":
      return <CButton size="sm" variant="primary" label="Save changes" loading />;
    case "loading-bad":
      return <CButton size="sm" variant="primary" label="Loading…" disabled />;
    case "callout-good":
      return <CCallout tone="warning" title="Deleting removes all versions" className="w-60" />;
    case "callout-bad":
      return (
        <div className="grid w-60 gap-1.5">
          <CCallout tone="info" title="Heads up" />
          <CCallout tone="warning" title="Note" />
          <CCallout tone="info" title="Tip" />
        </div>
      );
    case "field-good":
      return <CField />;
    case "field-bad":
      return <CField placeholderOnly />;
    case "menu-good":
      return <CMenu short />;
    case "menu-bad":
      return <CMenu short doubleActive />;
    case "crumb-good":
      return <CBreadcrumb />;
    case "crumb-bad":
      return <CBreadcrumb items={["Home", "About"]} />;
    case "pages-good":
      return <CPagination short />;
    case "pages-bad":
      return (
        <div className="w-60">
          <CPagination all />
        </div>
      );
    case "nesting-good":
      return (
        <div className="w-48 overflow-hidden rounded-[12px] bg-(--cui-surface) p-4 text-left ring-1 ring-(--cui-line)">
          <p className="font-semibold tracking-tight">Design school</p>
          <ul className="mt-2 grid gap-1 text-sm text-(--cui-muted)">
            <li>Industrial design</li>
            <li>Interaction design</li>
          </ul>
        </div>
      );
    case "nesting-bad":
      return (
        <div className="w-48">
          <CCard title="Design school" nested compact />
        </div>
      );
    default:
      return null;
  }
}
