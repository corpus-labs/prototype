// The card that appears when the pointer rests on a link: where it points,
// and Copy, Edit, and Open. The editor tracks the hover and positions the
// card's float; this file draws it.
import * as React from "react";
import { createPortal } from "react-dom";

import { cn } from "@/lib/utils";

import { CheckIcon, CopyIcon, OpenIcon } from "./icons";

export type LinkCardInfo = {
  href: string;
  /** Position relative to the editor's host. */
  top: number;
  left: number;
};

/** The card itself, rendered into the float the editor positions. */
export function LinkCard({
  into,
  info,
  onEdit,
}: {
  into: HTMLElement;
  info: LinkCardInfo | null;
  onEdit: () => void;
}) {
  const [copied, setCopied] = React.useState(false);
  // Hooks stay above the early return; the card appears and disappears with
  // the pointer.
  React.useEffect(() => {
    if (!info) setCopied(false);
  }, [info]);
  if (!info) return null;

  const external = /^https?:\/\//.test(info.href);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(info.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const button =
    "flex h-7 items-center gap-1.5 rounded-md px-2 text-xs text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50";

  return createPortal(
    <div
      role="toolbar"
      aria-label="Link actions"
      className="flex max-w-md items-center gap-0.5 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <span
        className="max-w-56 truncate px-2 font-mono text-xs text-muted-foreground"
        title={info.href}
      >
        {info.href}
      </span>
      <button type="button" className={button} onClick={() => void copy()}>
        {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
        {copied ? "Copied" : "Copy"}
      </button>
      <button type="button" className={button} onClick={onEdit}>
        Edit
      </button>
      {external && (
        <button
          type="button"
          className={cn(button, "gap-1")}
          onClick={() => window.open(info.href, "_blank", "noopener,noreferrer")}
        >
          <OpenIcon className="size-3.5" />
          Open
        </button>
      )}
    </div>,
    into,
  );
}
