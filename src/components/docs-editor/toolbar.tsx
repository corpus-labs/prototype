import * as React from "react";
import {
  BoldIcon,
  CheckIcon,
  ChevronDownIcon,
  CodeIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  ListTodoIcon,
  MinusIcon,
  PilcrowIcon,
  QuoteIcon,
  Redo2Icon,
  SquareCodeIcon,
  StrikethroughIcon,
  TableIcon,
  Undo2Icon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  { id: "paragraph", label: "Text", icon: PilcrowIcon, keys: `${MOD}${ALT}0` },
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
  onAction,
}: {
  label: string;
  keys?: string;
  icon: React.ComponentType<{ className?: string }>;
  on?: boolean;
  disabled?: boolean;
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
        "flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-35 [&_svg]:size-4",
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

/**
 * The editor's formatting bar, pinned under the app's top bar while the page scrolls:
 * block type, text marks, lists and blocks, then undo and redo.
 */
export function EditorToolbar({
  state,
  onAction,
  className,
}: {
  state: ToolbarState;
  onAction: (action: ToolbarAction) => void;
  className?: string;
}) {
  const current = BLOCK_TYPES.find((b) => b.id === state.block);
  const blockLabel = current?.label ?? (state.block === "code" ? "Code" : "Text");
  const inCode = state.block === "code";
  return (
    <div
      role="toolbar"
      aria-label="Formatting"
      className={cn(
        "flex items-center gap-0.5 overflow-x-auto rounded-xl border bg-background/95 p-1 shadow-xs backdrop-blur-md [scrollbar-width:none]",
        className,
      )}
    >
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              className="flex h-8 w-[124px] shrink-0 items-center gap-2 rounded-md px-2.5 text-sm outline-none hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-accent"
              aria-label={`Block type: ${blockLabel}`}
            />
          }
        >
          <span className="flex-1 truncate text-left">{blockLabel}</span>
          <ChevronDownIcon className="size-3.5 text-muted-foreground" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-52">
          <DropdownMenuGroup>
            {BLOCK_TYPES.map((b) => (
              <DropdownMenuItem key={b.id} onClick={() => onAction(b.id)}>
                <b.icon />
                {b.label}
                {state.block === b.id ? (
                  <CheckIcon className="ml-auto" />
                ) : (
                  <DropdownMenuShortcut>{b.keys}</DropdownMenuShortcut>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      <Divider />
      <Tool
        label="Bold"
        keys={`${MOD}B`}
        icon={BoldIcon}
        on={state.strong}
        disabled={inCode}
        onAction={() => onAction("strong")}
      />
      <Tool
        label="Italic"
        keys={`${MOD}I`}
        icon={ItalicIcon}
        on={state.emphasis}
        disabled={inCode}
        onAction={() => onAction("emphasis")}
      />
      <Tool
        label="Strikethrough"
        keys={`${MOD}${ALT}X`}
        icon={StrikethroughIcon}
        on={state.strike}
        disabled={inCode}
        onAction={() => onAction("strike")}
      />
      <Tool
        label="Inline code"
        keys={`${MOD}E`}
        icon={CodeIcon}
        on={state.code}
        disabled={inCode}
        onAction={() => onAction("code")}
      />
      <Tool
        label="Link"
        keys={`${MOD}K`}
        icon={LinkIcon}
        on={state.link}
        disabled={inCode}
        onAction={() => onAction("link")}
      />

      <Divider />
      <Tool
        label="Bulleted list"
        keys={`${MOD}${ALT}8`}
        icon={ListIcon}
        on={state.list === "bullet"}
        onAction={() => onAction("bullet")}
      />
      <Tool
        label="Numbered list"
        keys={`${MOD}${ALT}7`}
        icon={ListOrderedIcon}
        on={state.list === "ordered"}
        onAction={() => onAction("ordered")}
      />
      <Tool
        label="To-do list"
        icon={ListTodoIcon}
        on={state.list === "task"}
        onAction={() => onAction("task")}
      />
      <Tool
        label="Quote"
        keys={`${MOD}⇧B`}
        icon={QuoteIcon}
        on={state.quote}
        onAction={() => onAction("quote")}
      />
      <Tool
        label="Code block"
        keys={`${MOD}${ALT}C`}
        icon={SquareCodeIcon}
        on={inCode}
        onAction={() => onAction("codeBlock")}
      />
      <Tool label="Divider" icon={MinusIcon} onAction={() => onAction("divider")} />
      <Tool label="Table" icon={TableIcon} onAction={() => onAction("table")} />

      <Divider />
      <Tool
        label="Undo"
        keys={`${MOD}Z`}
        icon={Undo2Icon}
        disabled={!state.canUndo}
        onAction={() => onAction("undo")}
      />
      <Tool
        label="Redo"
        keys={`${MOD}Y`}
        icon={Redo2Icon}
        disabled={!state.canRedo}
        onAction={() => onAction("redo")}
      />
    </div>
  );
}
