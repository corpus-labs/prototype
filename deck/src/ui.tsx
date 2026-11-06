import type { ReactNode } from "react";
import { cn } from "./lib/utils";

/**
 * The Corpus mark: four petals. In `duo` mode the left pair renders in the
 * current ink and the right pair in emerald — people + agents, one mark.
 */
export function CorpusMark({
  className,
  duo = false,
}: {
  className?: string;
  duo?: boolean;
}) {
  const left =
    "M0 24C0 10.7501 10.7501 0 24 0C24 13.2499 13.2499 24 0 24ZM0 24C0 37.2499 10.7501 48 24 48C24 34.7501 13.2499 24 0 24Z";
  const right =
    "M48 24C48 10.7501 37.2499 0 24 0C24 13.2499 34.7501 24 48 24ZM48 24C48 37.2499 37.2499 48 24 48C24 34.7501 34.7501 24 48 24Z";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d={left} fill={duo ? "currentColor" : "currentColor"} />
      <path d={right} fill={duo ? "var(--color-emerald-500)" : "currentColor"} />
    </svg>
  );
}

export function Kicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p
      className={cn(
        "font-mono text-[11px] font-medium tracking-[0.22em] uppercase",
        dark ? "text-neutral-500" : "text-neutral-400",
      )}
    >
      {children}
    </p>
  );
}

export function Slide({
  n,
  dark = false,
  className,
  children,
}: {
  n: number;
  dark?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section
      className={cn(
        "slide",
        dark ? "bg-neutral-950 text-neutral-50" : "bg-white text-neutral-950",
        className,
      )}
    >
      {children}
      <span
        className={cn(
          "absolute right-6 bottom-5 font-mono text-[10px] tabular",
          dark ? "text-neutral-600" : "text-neutral-300",
        )}
      >
        {String(n).padStart(2, "0")} / 10
      </span>
    </section>
  );
}

export function SlideHeading({
  kicker,
  title,
}: {
  kicker: string;
  title: ReactNode;
}) {
  return (
    <div className="space-y-4">
      <Kicker>{kicker}</Kicker>
      <h2 className="max-w-4xl text-[38px] leading-[1.2] font-semibold tracking-[-0.02em] text-balance">
        {title}
      </h2>
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-[52px] leading-[1.22] font-semibold tracking-[-0.03em] tabular">
        {value}
      </div>
      <div className="mt-2 font-mono text-[11px] tracking-[0.14em] text-neutral-400 uppercase">
        {label}
      </div>
    </div>
  );
}

/** A framed product screenshot with a minimal browser chrome. */
export function ShotFrame({
  src,
  url,
  label,
  accent = false,
  className,
  imgClassName,
}: {
  src: string;
  url: string;
  label?: string;
  accent?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={cn("flex h-full flex-col", className)}>
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden rounded-xl border bg-white",
          accent ? "border-emerald-300" : "border-neutral-200",
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 border-b px-3.5 py-2.5",
            accent ? "border-emerald-200 bg-emerald-50/60" : "border-neutral-200 bg-neutral-50",
          )}
        >
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="size-2.5 rounded-full bg-neutral-300" />
          <span className="ml-2 truncate font-mono text-[11px] text-neutral-500">{url}</span>
        </div>
        <img
          src={src}
          alt={label ?? url}
          className={cn("w-full flex-1 object-cover object-top", imgClassName)}
        />
      </div>
      {label ? (
        <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase">
          <span className={cn("size-1.5 rounded-full", accent ? "bg-emerald-500" : "bg-neutral-900")} />
          <span className="text-neutral-500">{label}</span>
        </figcaption>
      ) : null}
    </figure>
  );
}

export function LinkSlot({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-md border border-dashed border-neutral-300 px-2.5 py-1 font-mono text-[11px] text-neutral-400">
      {label}
    </span>
  );
}
