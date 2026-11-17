// The editor's menus: the slash menu with its grouped blocks, the page picker
// it shares a keyboard model with, and the link form inside the selection
// toolbar. Extracted from docs-editor.tsx so the editor file stays about
// wiring.
import * as React from "react";
import type { Ctx } from "@milkdown/ctx";

import { relativeLink } from "@core/markdown/links";
import { cn } from "@/lib/utils";

import { FileTextIcon, LinkIcon, type EditorIcon } from "./icons";

/** One insertable block in the slash menu. */
export type Block = {
  id: string;
  label: string;
  detail: string;
  icon: EditorIcon;
  run?: (ctx: Ctx) => boolean;
};

/** The order groups appear in the slash menu. */
export const BLOCK_GROUPS: { label: string; ids: string[] }[] = [
  {
    label: "Blocks",
    ids: ["text", "h1", "h2", "h3", "ul", "ol", "todo", "quote", "code", "hr"],
  },
  { label: "Insert", ids: ["table", "image", "page"] },
];

/**
 * The slash menu: blocks in titled groups, two lines each, with a filter
 * already applied. The keyboard model lives in the editor, which passes the
 * whole list flat and the highlighted index.
 */
export function BlockMenu({
  items,
  active,
  onChoose,
}: {
  items: Block[];
  active: number;
  onChoose: (item: Block) => void;
}) {
  const list = React.useRef<HTMLDivElement>(null);
  // Arrow keys move the highlight past the menu's edge, so keep it in view.
  React.useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  let index = -1;
  return (
    <div
      ref={list}
      role="listbox"
      aria-label="Insert a block"
      className="max-h-80 w-72 overflow-y-auto rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      {items.length === 0 && <p className="px-2 py-1.5 text-muted-foreground">No block matches.</p>}
      {BLOCK_GROUPS.map((group) => {
        const groupItems = items.filter((item) => group.ids.includes(item.id));
        if (!groupItems.length) return null;
        return (
          <div key={group.label} className="mb-1 last:mb-0">
            <p className="px-2 pt-1.5 pb-1 text-xs font-medium text-muted-foreground">
              {group.label}
            </p>
            {groupItems.map((item) => {
              index += 1;
              const i = index;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="option"
                  aria-selected={i === active}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => onChoose(item)}
                  className={cn(
                    "flex w-full items-center gap-2.5 rounded-md px-1.5 py-1.5 text-left outline-none",
                    i === active && "bg-accent text-accent-foreground",
                  )}
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 [&_svg]:size-4.5">
                    <Icon />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate">{item.label}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {item.detail}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/** The page picker's list, and any other flat option list. */
export function MenuList<T>({
  label,
  items,
  active,
  onChoose,
  render,
  empty,
}: {
  label: string;
  items: T[];
  active: number;
  onChoose: (item: T) => void;
  render: (item: T) => React.ReactNode;
  empty: string;
}) {
  const list = React.useRef<HTMLDivElement>(null);
  // Arrow keys move the highlight past the menu's edge, so keep it in view.
  React.useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  return (
    <div
      ref={list}
      role="listbox"
      aria-label={label}
      className="max-h-72 w-64 overflow-y-auto rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10"
    >
      {items.length === 0 ? (
        <p className="px-2 py-1.5 text-muted-foreground">{empty}</p>
      ) : (
        items.map((item, i) => (
          <button
            key={i}
            type="button"
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => onChoose(item)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
              i === active && "bg-accent text-accent-foreground",
            )}
          >
            {render(item)}
          </button>
        ))
      )}
    </div>
  );
}

export type LinkTarget = { title: string; path: string; folder: string };

/** Inside the selection toolbar: link to a page by name, or paste any URL. */
export function LinkForm({
  current,
  targets,
  pagePath,
  onApply,
  onRemove,
  onCancel,
}: {
  current: string | null;
  targets: LinkTarget[];
  pagePath: string;
  onApply: (href: string) => void;
  onRemove: () => void;
  onCancel: () => void;
}) {
  const [text, setText] = React.useState(current ?? "");
  const [active, setActive] = React.useState(0);
  const matches = (text: string, query: string) =>
    text.toLowerCase().includes(query.trim().toLowerCase());
  const pages = targets.filter((p) => matches(`${p.title} ${p.folder}`, text)).slice(0, 5);
  // Something that looks like an address links as typed. Otherwise the top page wins.
  const literal = /^(https?:\/\/|mailto:|\.{0,2}\/|#)/.test(text.trim());
  const options = [
    ...(literal ? [{ kind: "url" as const }] : []),
    ...pages.map((p) => ({ kind: "page" as const, page: p })),
  ];

  const pick = (i: number) => {
    const option = options[i];
    if (!option) return;
    onApply(option.kind === "url" ? text : relativeLink(pagePath, option.page.path));
  };

  return (
    <div className="w-72 rounded-lg bg-popover p-1.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <input
        autoFocus
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          setActive(0);
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) =>
              options.length
                ? (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length
                : 0,
            );
          } else if (e.key === "Enter") {
            e.preventDefault();
            pick(active);
          } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
          }
        }}
        placeholder="Search pages or paste a link"
        aria-label="Link to"
        className="h-8 w-full rounded-md border border-input bg-transparent px-2 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      />
      <div role="listbox" aria-label="Link options" className="mt-1">
        {options.map((option, i) => (
          <button
            key={option.kind === "url" ? "url" : option.page.path}
            type="button"
            role="option"
            aria-selected={i === active}
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => pick(i)}
            className={cn(
              "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none",
              i === active && "bg-accent text-accent-foreground",
            )}
          >
            {option.kind === "url" ? (
              <>
                <LinkIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate">Link to {text.trim()}</span>
              </>
            ) : (
              <>
                <FileTextIcon className="size-4 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{option.page.title}</span>
                <span className="text-xs text-muted-foreground">{option.page.folder}</span>
              </>
            )}
          </button>
        ))}
        {current && (
          <button
            type="button"
            onMouseDown={(e) => e.preventDefault()}
            onClick={onRemove}
            className="mt-1 flex w-full items-center rounded-md px-2 py-1.5 text-left text-muted-foreground outline-none hover:bg-accent hover:text-accent-foreground"
          >
            Remove link
          </button>
        )}
      </div>
    </div>
  );
}
