import * as React from "react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

import {
  BoldIcon,
  BulletListIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeBlockIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  OrderedListIcon,
  QuoteIcon,
  StrikeIcon,
  TaskListIcon,
  TextIcon,
} from "./icons";

/** What the cursor is in right now, so every control can show its state. */
export type ToolbarState = {
  block: "paragraph" | "h1" | "h2" | "h3" | "code" | "other";
  strong: boolean;
  emphasis: boolean;
  strike: boolean;
  code: boolean;
  link: boolean;
  list: "bullet" | "ordered" | "task" | null;
  quote: boolean;
  canUndo: boolean;
  canRedo: boolean;
};

export const EMPTY_TOOLBAR: ToolbarState = {
  block: "paragraph",
  strong: false,
  emphasis: false,
  strike: false,
  code: false,
  link: false,
  list: null,
  quote: false,
  canUndo: false,
  canRedo: false,
};

export type ToolbarAction =
  | "paragraph"
  | "h1"
  | "h2"
  | "h3"
  | "strong"
  | "emphasis"
  | "strike"
  | "code"
  | "link"
  | "bullet"
  | "ordered"
  | "task"
  | "quote"
  | "codeBlock"
  | "divider"
  | "table"
  | "image"
  | "undo"
  | "redo";

const MOD =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform) ? "⌘" : "Ctrl+";
const ALT = MOD === "⌘" ? "⌥" : "Alt+";

const BLOCK_TYPES: {
  id: "paragraph" | "h1" | "h2" | "h3";
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keys: string;
}[] = [
  { id: "paragraph", label: "Text", icon: TextIcon, keys: `${MOD}${ALT}0` },
  { id: "h1", label: "Heading 1", icon: Heading1Icon, keys: `${MOD}${ALT}1` },
  { id: "h2", label: "Heading 2", icon: Heading2Icon, keys: `${MOD}${ALT}2` },
  { id: "h3", label: "Heading 3", icon: Heading3Icon, keys: `${MOD}${ALT}3` },
];

function Tool({
  label,
  keys,
  icon: Icon,
  on = false,
  disabled = false,
  small = false,
  onAction,
}: {
  label: string;
  keys?: string;
  icon: React.ComponentType<{ className?: string }>;
  on?: boolean;
  disabled?: boolean;
  /** The selection menu's tighter size. */
  small?: boolean;
  onAction: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      title={keys ? `${label}  ${keys}` : label}
      disabled={disabled}
      // Keep the editor's selection while clicking.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onAction}
      className={cn(
        "flex shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
        small ? "size-7" : "size-8",
        on && "bg-accent text-foreground",
      )}
    >
      <Icon />
    </button>
  );
}

function Divider() {
  return <span aria-hidden className="mx-1 h-5 w-px shrink-0 bg-border" />;
}

/** What a block can be turned into from the selection menu, in the order Notion lists them. */
const TURN_INTO: {
  id: ToolbarAction;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  keys?: string;
  on: (s: ToolbarState) => boolean;
}[] = [
  ...BLOCK_TYPES.map((b) => ({
    id: b.id,
    label: b.label,
    icon: b.icon,
    keys: b.keys,
    on: (s: ToolbarState) => s.block === b.id && !s.list && !s.quote,
  })),
  {
    id: "bullet",
    label: "Bulleted list",
    icon: BulletListIcon,
    keys: `${MOD}${ALT}8`,
    on: (s) => s.list === "bullet",
  },
  {
    id: "ordered",
    label: "Numbered list",
    icon: OrderedListIcon,
    keys: `${MOD}${ALT}7`,
    on: (s) => s.list === "ordered",
  },
  { id: "task", label: "To-do list", icon: TaskListIcon, on: (s) => s.list === "task" },
  { id: "quote", label: "Quote", icon: QuoteIcon, keys: `${MOD}⇧B`, on: (s) => s.quote },
  {
    id: "codeBlock",
    label: "Code block",
    icon: CodeBlockIcon,
    keys: `${MOD}${ALT}C`,
    on: (s) => s.block === "code",
  },
];

/**
 * The menu over selected text, the way Notion's works: what the block is, which can be
 * turned into another kind, then the text marks. Blocks are added with the slash menu
 * and the gutter beside each block, so the page needs no fixed toolbar.
 */
export function SelectionBar({
  state,
  onAction,
  editorElement,
}: {
  state: ToolbarState;
  onAction: (action: ToolbarAction) => void;
  /** The editable text, which gets focus back when the menu closes. */
  editorElement: () => HTMLElement | null;
}) {
  const current = TURN_INTO.find((t) => t.on(state));
  const blockLabel = current?.label ?? "Text";
  const inCode = state.block === "code";
  return (
    <div
      role="toolbar"
      aria-label="Format"
      className="flex items-center gap-0.5 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              // Keep the editor's selection while the menu opens.
              onMouseDown={(e) => e.preventDefault()}
              className="flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-sm whitespace-nowrap outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-accent"
              aria-label={`Turn into, now ${blockLabel}`}
            />
          }
        >
          {blockLabel}
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        {/* Closing hands focus back to the text, so typing carries on in the new block. */}
        <DropdownMenuContent align="start" className="w-56" finalFocus={editorElement}>
          <DropdownMenuGroup>
            <DropdownMenuLabel>Turn into</DropdownMenuLabel>
            {TURN_INTO.slice(0, 4).map((t) => (
              <TurnIntoItem key={t.id} item={t} on={t.on(state)} onAction={onAction} />
            ))}
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            {TURN_INTO.slice(4).map((t) => (
              <TurnIntoItem key={t.id} item={t} on={t.on(state)} onAction={onAction} />
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />
      <Tool
        small
        label="Bold"
        keys={`${MOD}B`}
        icon={BoldIcon}
        on={state.strong}
        disabled={inCode}
        onAction={() => onAction("strong")}
      />
      <Tool
        small
        label="Italic"
        keys={`${MOD}I`}
        icon={ItalicIcon}
        on={state.emphasis}
        disabled={inCode}
        onAction={() => onAction("emphasis")}
      />
      <Tool
        small
        label="Strikethrough"
        keys={`${MOD}${ALT}X`}
        icon={StrikeIcon}
        on={state.strike}
        disabled={inCode}
        onAction={() => onAction("strike")}
      />
      <Tool
        small
        label="Inline code"
        keys={`${MOD}E`}
        icon={CodeIcon}
        on={state.code}
        disabled={inCode}
        onAction={() => onAction("code")}
      />
      <Tool
        small
        label="Link"
        keys={`${MOD}K`}
        icon={LinkIcon}
        on={state.link}
        disabled={inCode}
        onAction={() => onAction("link")}
      />
    </div>
  );
}

function TurnIntoItem({
  item,
  on,
  onAction,
}: {
  item: (typeof TURN_INTO)[number];
  on: boolean;
  onAction: (action: ToolbarAction) => void;
}) {
  return (
    <DropdownMenuItem onClick={() => onAction(item.id)}>
      <item.icon />
      {item.label}
      {on ? (
        <CheckIcon className="ml-auto" />
      ) : (
        item.keys && <DropdownMenuShortcut>{item.keys}</DropdownMenuShortcut>
      )}
    </DropdownMenuItem>
  );
}
