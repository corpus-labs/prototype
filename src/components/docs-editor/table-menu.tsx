// The bar above the table being edited. A small prose plugin watches for the
// selection to enter a table, positions the bar over the table's top left, and
// reports the column's alignment; the bar itself carries the row and column
// menus, alignment, and delete.
import * as React from "react";
import { createPortal } from "react-dom";
import { editorViewCtx } from "@milkdown/core";
import type { Ctx } from "@milkdown/ctx";
import {
  addColAfterCommand,
  addColBeforeCommand,
  addRowAfterCommand,
  addRowBeforeCommand,
  setAlignCommand,
} from "@milkdown/preset-gfm";
import { deleteColumn, deleteRow, deleteTable, toggleHeaderRow } from "@milkdown/prose/tables";
import { Plugin, type EditorState, type Transaction } from "@milkdown/prose/state";
import type { EditorView } from "@milkdown/prose/view";
import { $prose, callCommand } from "@milkdown/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  AlignCenterIcon,
  AlignLeftIcon,
  AlignRightIcon,
  CheckIcon,
  ChevronDownIcon,
  PlusIcon,
  TrashIcon,
  type EditorIcon,
} from "./icons";

export type TableInfo = {
  top: number;
  left: number;
  /** The alignment of the column the cursor is in, when one was set. */
  align: "left" | "center" | "right" | null;
  headerRow: boolean;
};

export type TableAction =
  | "rowAbove"
  | "rowBelow"
  | "rowDelete"
  | "headerRow"
  | "colBefore"
  | "colAfter"
  | "colDelete"
  | "alignLeft"
  | "alignCenter"
  | "alignRight"
  | "tableDelete";

/** Runs one table action. The caller hands focus back to the editor after. */
export function runTableAction(action: TableAction, ctx: Ctx) {
  const view = ctx.get(editorViewCtx);
  const pm = (run: (state: EditorState, dispatch: (tr: Transaction) => void) => boolean) =>
    run(view.state, view.dispatch);
  switch (action) {
    case "rowAbove":
      return callCommand(addRowBeforeCommand.key)(ctx);
    case "rowBelow":
      return callCommand(addRowAfterCommand.key)(ctx);
    case "colBefore":
      return callCommand(addColBeforeCommand.key)(ctx);
    case "colAfter":
      return callCommand(addColAfterCommand.key)(ctx);
    case "alignLeft":
      return callCommand(setAlignCommand.key, "left")(ctx);
    case "alignCenter":
      return callCommand(setAlignCommand.key, "center")(ctx);
    case "alignRight":
      return callCommand(setAlignCommand.key, "right")(ctx);
    case "rowDelete":
      return pm(deleteRow);
    case "colDelete":
      return pm(deleteColumn);
    case "tableDelete":
      return pm(deleteTable);
    case "headerRow":
      return pm(toggleHeaderRow);
  }
}

/** Where the bar goes and what it shows, from the table around the cursor. */
function readTableInfo(view: EditorView, float: HTMLElement): TableInfo | null {
  const { $from } = view.state.selection;
  let tableDepth = 0;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "table") {
      tableDepth = d;
      break;
    }
  }
  if (!tableDepth) return null;
  const el = view.nodeDOM($from.before(tableDepth));
  const base = float.offsetParent;
  if (!(el instanceof HTMLElement) || !base) return null;

  let align: TableInfo["align"] = null;
  for (let d = $from.depth; d > 0; d--) {
    const name = $from.node(d).type.name;
    if (name === "table_cell" || name === "table_header") {
      const value = $from.node(d).attrs.alignment;
      if (value === "left" || value === "center" || value === "right") align = value;
      break;
    }
  }

  const rect = el.getBoundingClientRect();
  const host = base.getBoundingClientRect();
  return {
    top: rect.top - host.top,
    left: rect.left - host.left,
    align,
    headerRow: $from.node(tableDepth).firstChild?.type.name === "table_header_row",
  };
}

/** Positions the bar above the table whenever the selection is inside one. */
export function tableAid(float: HTMLElement, onInfo: (info: TableInfo | null) => void) {
  return $prose(
    () =>
      new Plugin({
        view: (view) => {
          const report = () => {
            const info = readTableInfo(view, float);
            onInfo(info);
            float.dataset.show = info ? "true" : "false";
            if (info) {
              float.style.left = `${info.left}px`;
              float.style.top = `${Math.max(info.top - 42, -4)}px`;
            }
          };
          report();
          return { update: () => report() };
        },
      }),
  );
}

function Tool({
  label,
  icon: Icon,
  on = false,
  onAction,
}: {
  label: string;
  icon: EditorIcon;
  on?: boolean;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={label}
      // Keep the editor's selection while clicking.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAction}
      className={cn(
        "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4",
        on && "bg-accent text-foreground",
      )}
    >
      <Icon />
    </button>
  );
}

type MenuItem = {
  id: TableAction;
  label: string;
  icon?: EditorIcon;
  checked?: boolean;
  danger?: boolean;
};

function MenuButton({
  label,
  items,
  onAction,
}: {
  label: string;
  items: MenuItem[];
  onAction: (action: TableAction) => void;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <button
            type="button"
            aria-label={`${label} options`}
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-7 items-center gap-1 rounded-md px-2 text-[13px] text-muted-foreground outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        {label}
        <ChevronDownIcon className="size-3" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-44">
        {items.map((item) => (
          <React.Fragment key={item.id}>
            {item.danger && <DropdownMenuSeparator />}
            <DropdownMenuItem
              variant={item.danger ? "destructive" : "default"}
              onClick={() => onAction(item.id)}
            >
              {item.checked ? (
                <CheckIcon />
              ) : item.icon ? (
                <item.icon />
              ) : (
                <span className="size-4" aria-hidden />
              )}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** The bar itself, rendered into the float the table plugin positions. */
export function TableMenu({
  into,
  info,
  onAction,
}: {
  into: HTMLElement;
  info: TableInfo | null;
  onAction: (action: TableAction) => void;
}) {
  if (!info) return null;
  return createPortal(
    <div
      role="toolbar"
      aria-label="Table options"
      className="flex items-center gap-0.5 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <MenuButton
        label="Row"
        onAction={onAction}
        items={[
          { id: "rowAbove", label: "Add row above", icon: PlusIcon },
          { id: "rowBelow", label: "Add row below", icon: PlusIcon },
          { id: "headerRow", label: "Header row", checked: info.headerRow },
          { id: "rowDelete", label: "Delete row", danger: true },
        ]}
      />
      <MenuButton
        label="Column"
        onAction={onAction}
        items={[
          { id: "colBefore", label: "Add column left", icon: PlusIcon },
          { id: "colAfter", label: "Add column right", icon: PlusIcon },
          { id: "colDelete", label: "Delete column", danger: true },
        ]}
      />
      <span aria-hidden className="mx-1 h-5 w-px bg-border" />
      <Tool
        label="Align left"
        icon={AlignLeftIcon}
        on={info.align === "left"}
        onAction={() => onAction("alignLeft")}
      />
      <Tool
        label="Align center"
        icon={AlignCenterIcon}
        on={info.align === "center"}
        onAction={() => onAction("alignCenter")}
      />
      <Tool
        label="Align right"
        icon={AlignRightIcon}
        on={info.align === "right"}
        onAction={() => onAction("alignRight")}
      />
      <span aria-hidden className="mx-1 h-5 w-px bg-border" />
      <Tool label="Delete table" icon={TrashIcon} onAction={() => onAction("tableDelete")} />
    </div>,
    into,
  );
}
