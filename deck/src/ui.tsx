import type { ReactNode } from "react";
import { cn } from "./lib/utils";

/**
 * The Corpus mark: four petals. In `duo` mode the left pair renders in the
 * current ink and the right pair in emerald — people + agents, one mark.
 */
export function CorpusMark({ className, duo = false }: { className?: string; duo?: boolean }) {
  const left =
    "M0 24C0 10.7501 10.7501 0 24 0C24 13.2499 13.2499 24 0 24ZM0 24C0 37.2499 10.7501 48 24 48C24 34.7501 13.2499 24 0 24Z";
  const right =
    "M48 24C48 10.7501 37.2499 0 24 0C24 13.2499 34.7501 24 48 24ZM48 24C48 37.2499 37.2499 48 24 48C24 34.7501 34.7501 24 48 24Z";
  return (
    <svg viewBox="0 0 48 48" className={className} aria-hidden="true">
      <path d={left} fill="currentColor" />
      <path d={right} fill={duo ? "var(--color-emerald-500)" : "currentColor"} />
    </svg>
  );
}

/** The accent gesture used across the deck: the emerald full stop. */
export function Stop() {
  return <span className="text-emerald-500">.</span>;
}

export function Kicker({ children, dark = false }: { children: ReactNode; dark?: boolean }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] font-medium tracking-[0.22em] uppercase">
      <span className={cn("h-px w-6", dark ? "bg-neutral-700" : "bg-neutral-300")} />
      <span className={dark ? "text-neutral-400" : "text-neutral-400"}>{children}</span>
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
      {n > 1 && n < 10 && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute top-0 right-8 font-mono text-[120px] leading-[1.3] font-semibold tracking-[-0.04em] select-none",
            dark ? "text-neutral-900" : "text-neutral-100",
          )}
        >
          {String(n).padStart(2, "0")}
        </span>
      )}
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
  dark = false,
}: {
  kicker: string;
  title: ReactNode;
  dark?: boolean;
}) {
  return (
    <div className="space-y-5">
      <Kicker dark={dark}>{kicker}</Kicker>
      <h2
        className={cn(
          "max-w-4xl text-[42px] leading-[1.18] font-semibold tracking-[-0.025em] text-balance",
          dark && "text-neutral-50",
        )}
      >
        {title}
      </h2>
    </div>
  );
}

/** Spec-sheet stat: number + mono label, used in vertical ledgers. */
export function Stat({
  value,
  label,
  size = "lg",
  rule = false,
}: {
  value: string;
  label: string;
  size?: "lg" | "md";
  rule?: boolean;
}) {
  return (
    <div className={cn(rule && "border-t border-neutral-200 pt-4")}>
      <div
        className={cn(
          "font-semibold tracking-[-0.03em] tabular",
          size === "lg" ? "text-[56px] leading-[1.2]" : "text-[30px] leading-[1.2]",
        )}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10.5px] tracking-[0.16em] text-neutral-400 uppercase">
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
  dark = false,
  className,
  imgClassName,
}: {
  src: string;
  url: string;
  label?: string;
  accent?: boolean;
  dark?: boolean;
  className?: string;
  imgClassName?: string;
}) {
  return (
    <figure className={cn("flex h-full flex-col", className)}>
      <div
        className={cn(
          "flex flex-1 flex-col overflow-hidden rounded-2xl",
          dark
            ? "bg-neutral-950 shadow-[0_32px_64px_-32px_rgb(0_0_0/0.6)] ring-1 ring-neutral-800"
            : cn(
                "bg-white shadow-[0_32px_64px_-32px_rgb(0_0_0/0.35)] ring-1",
                accent ? "ring-emerald-200" : "ring-neutral-200",
              ),
        )}
      >
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-3",
            dark
              ? "bg-neutral-900"
              : cn(
                  "border-b",
                  accent
                    ? "border-emerald-100 bg-emerald-50/50"
                    : "border-neutral-100 bg-neutral-50",
                ),
          )}
        >
          <span
            className={cn("size-2.5 rounded-full", dark ? "bg-neutral-700" : "bg-neutral-300")}
          />
          <span
            className={cn("size-2.5 rounded-full", dark ? "bg-neutral-700" : "bg-neutral-300")}
          />
          <span
            className={cn("size-2.5 rounded-full", dark ? "bg-neutral-700" : "bg-neutral-300")}
          />
          <span
            className={cn(
              "ml-2 truncate font-mono text-[11px]",
              dark ? "text-neutral-500" : "text-neutral-400",
            )}
          >
            {url}
          </span>
        </div>
        <img
          src={src}
          alt={label ?? url}
          className={cn("w-full flex-1 object-cover object-top", imgClassName)}
        />
      </div>
      {label ? (
        <figcaption className="mt-3 flex items-center gap-2 font-mono text-[11px] tracking-[0.12em] uppercase">
          <span
            className={cn(
              "size-1.5 rounded-full",
              accent ? "bg-emerald-500" : dark ? "bg-emerald-400" : "bg-neutral-900",
            )}
          />
          <span className={dark ? "text-neutral-400" : "text-neutral-500"}>{label}</span>
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
