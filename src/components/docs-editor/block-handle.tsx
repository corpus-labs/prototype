// The gutter that appears beside the block under the pointer: a plus that
// inserts a block below, and a grip that drags the block or opens its menu.
// Milkdown's block plugin tracks the hovered block and does the dragging; this
// file draws the gutter and runs the menu's actions on that block.
import * as React from "react";
import { createPortal } from "react-dom";
import type { ActiveNode, FilterNodes } from "@milkdown/plugin-block";
import type { ResolvedPos } from "@milkdown/prose/model";
import { TextSelection } from "@milkdown/prose/state";
import type { EditorView } from "@milkdown/prose/view";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  CopyIcon,
  GripIcon,
  PlusIcon,
  TrashIcon,
  type EditorIcon,
} from "./icons";

/** Whole top-level blocks get a gutter. Tables are moved from their own menu instead. */
export const blockFilter: FilterNodes = ($pos: ResolvedPos, node: { type: { name: string } }) =>
  $pos.depth === 0 && node.type.name !== "table";

/**
 * A rect as tall as the block's first line, so the gutter sits beside that line
 * instead of centering on a tall block's middle.
 */
export function firstLineRect(el: HTMLElement) {
  const rect = el.getBoundingClientRect();
  const line = parseFloat(getComputedStyle(el).lineHeight) || 24;
  return {
    x: rect.x,
    y: rect.y,
    top: rect.top,
    bottom: rect.bottom,
    left: rect.left,
    right: rect.right,
    width: rect.width,
    height: Math.min(rect.height, line),
  };
}

export type BlockAction = "duplicate" | "up" | "down" | "delete";

/** Where the gutter's block sits in the document, for moving it around. */
export function blockSpot(active: ActiveNode) {
  const doc = active.$pos.doc;
  const index = active.$pos.index(0);
  return {
    pos: active.$pos.pos,
    size: active.node.nodeSize,
    index,
    first: index === 0,
    last: index === doc.childCount - 1,
  };
}

/** Runs one menu action on the gutter's block. */
export function runBlockAction(action: BlockAction, view: EditorView, active: ActiveNode) {
  const { pos, size, index, first, last } = blockSpot(active);
  // Node.copy's content argument defaults to empty, so pass the block's own.
  const copy = active.node.copy(active.node.content);
  const tr = view.state.tr;

  if (action === "delete") {
    view.dispatch(tr.delete(pos, pos + size).scrollIntoView());
    return;
  }
  if (action === "duplicate") {
    view.dispatch(tr.insert(pos + size, copy).scrollIntoView());
    return;
  }
  if (action === "up") {
    if (first) return;
    const prevPos = pos - active.$pos.doc.child(index - 1).nodeSize;
    tr.delete(pos, pos + size);
    tr.insert(prevPos, copy);
    tr.setSelection(TextSelection.near(tr.doc.resolve(prevPos + 1)));
  } else {
    if (last) return;
    const afterNext = pos + size + active.$pos.doc.child(index + 1).nodeSize;
    tr.insert(afterNext, copy);
    tr.delete(pos, pos + size);
    tr.setSelection(TextSelection.near(tr.doc.resolve(afterNext - size + 1)));
  }
  view.dispatch(tr.scrollIntoView());
}

/**
 * The gutter's contents, rendered into the element Milkdown's block plugin
 * positions beside the hovered block. The plugin listens for presses and drags
 * on that element, so the grip only needs to open the menu.
 */
export function BlockGutter({
  into,
  getActive,
  onAddBelow,
  onAction,
}: {
  into: HTMLElement;
  getActive: () => ActiveNode | null;
  onAddBelow: (active: ActiveNode) => void;
  onAction: (action: BlockAction, active: ActiveNode) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const active = open ? getActive() : null;
  const spot = active ? blockSpot(active) : null;

  const item = (label: string, icon: EditorIcon, action: BlockAction, disabled = false) => (
    <DropdownMenuItem
      key={label}
      disabled={disabled}
      onClick={() => {
        if (!active) return;
        onAction(action, active);
        setOpen(false);
      }}
    >
      {React.createElement(icon)}
      {label}
    </DropdownMenuItem>
  );

  return createPortal(
    <div className="hidden flex-col items-center gap-px md:flex">
      <button
        type="button"
        aria-label="Add a block below"
        title="Add a block below"
        draggable={false}
        // Keep the editor's selection while clicking.
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => {
          const current = getActive();
          if (current) onAddBelow(current);
        }}
        className="flex size-6 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-[15px]"
      >
        <PlusIcon />
      </button>
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              aria-label="Open the block menu"
              title="Drag to move, or click for more"
              className="flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 active:cursor-grabbing [&_svg]:size-[15px]"
            />
          }
        >
          <GripIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-40">
          {item("Duplicate", CopyIcon, "duplicate")}
          {item("Move up", ArrowUpIcon, "up", spot?.first)}
          {item("Move down", ArrowDownIcon, "down", spot?.last)}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => {
              if (!active) return;
              onAction("delete", active);
              setOpen(false);
            }}
          >
            <TrashIcon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>,
    into,
  );
}
