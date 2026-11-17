// The language chip at a code block's top right: it names the language the
// block is written in and opens a searchable picker. A prose plugin like the
// table bar's watches for the cursor to enter a code block and positions the
// chip.
import * as React from "react";
import { createPortal } from "react-dom";
import type { Ctx } from "@milkdown/ctx";
import { updateCodeBlockLanguageCommand } from "@milkdown/preset-commonmark";
import { Plugin } from "@milkdown/prose/state";
import type { EditorView } from "@milkdown/prose/view";
import { $prose, callCommand } from "@milkdown/utils";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { ChevronDownIcon, SearchIcon } from "./icons";

/** The languages the picker offers, all registered in refractor's build. */
export const LANGUAGES: { id: string; label: string }[] = [
  { id: "typescript", label: "TypeScript" },
  { id: "javascript", label: "JavaScript" },
  { id: "json", label: "JSON" },
  { id: "bash", label: "Bash" },
  { id: "css", label: "CSS" },
  { id: "scss", label: "SCSS" },
  { id: "html", label: "HTML" },
  { id: "markdown", label: "Markdown" },
  { id: "yaml", label: "YAML" },
  { id: "sql", label: "SQL" },
  { id: "python", label: "Python" },
  { id: "diff", label: "Diff" },
  { id: "rust", label: "Rust" },
  { id: "go", label: "Go" },
  { id: "java", label: "Java" },
  { id: "php", label: "PHP" },
  { id: "ruby", label: "Ruby" },
  { id: "xml", label: "XML" },
  { id: "", label: "Plain text" },
];

export type CodeInfo = {
  /** The chip's top, relative to the float's parent. */
  top: number;
  /** Distance from the parent's right edge to the block's right edge. */
  right: number;
  /** The code block's document position, for the language command. */
  pos: number;
  language: string;
};

/** Sets a code block's language. The caller hands focus back to the editor after. */
export function runCodeLanguage(pos: number, language: string, ctx: Ctx) {
  return callCommand(updateCodeBlockLanguageCommand.key, { pos, language })(ctx);
}

/** Where the chip goes and what it shows, from the code block around the cursor. */
function readCodeInfo(view: EditorView, float: HTMLElement): CodeInfo | null {
  const { $from } = view.state.selection;
  let depth = 0;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "code_block") {
      depth = d;
      break;
    }
  }
  if (!depth) return null;
  const pos = $from.before(depth);
  const el = view.nodeDOM(pos);
  const base = float.offsetParent;
  if (!(el instanceof HTMLElement) || !base) return null;

  const block = el.getBoundingClientRect();
  const host = base.getBoundingClientRect();
  return {
    top: block.top - host.top,
    right: host.right - block.right,
    pos,
    language: ($from.node(depth).attrs.language as string) ?? "",
  };
}

/** Positions the chip at the code block's top right whenever the cursor is inside one. */
export function codeAid(float: HTMLElement, onInfo: (info: CodeInfo | null) => void) {
  return $prose(
    () =>
      new Plugin({
        view: (view) => {
          const report = () => {
            const info = readCodeInfo(view, float);
            onInfo(info);
            float.dataset.show = info ? "true" : "false";
            if (info) {
              float.style.top = `${Math.max(info.top - 12, -4)}px`;
              float.style.right = `${info.right}px`;
              float.style.left = "auto";
            }
          };
          report();
          return { update: () => report() };
        },
      }),
  );
}

function matches(query: string, language: { id: string; label: string }) {
  const q = query.trim().toLowerCase();
  return !q || language.label.toLowerCase().includes(q) || language.id.includes(q);
}

/** The chip and its picker, rendered into the float the plugin positions. */
export function CodeLanguageChip({
  into,
  info,
  onPick,
}: {
  into: HTMLElement;
  info: CodeInfo | null;
  onPick: (pos: number, language: string) => void;
}) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(0);
  // Hooks stay above the early return: the chip appears and disappears as the
  // cursor moves, and the hook count must not change with it.
  const list = React.useRef<HTMLDivElement>(null);
  const language = info?.language;
  React.useEffect(() => {
    list.current
      ?.querySelector<HTMLElement>('[aria-selected="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);
  React.useEffect(() => {
    if (open) {
      setQuery("");
      setActive(
        Math.max(
          0,
          LANGUAGES.findIndex((l) => l.id === language),
        ),
      );
    }
  }, [open, language]);
  // Leaving the code block takes the picker with it.
  React.useEffect(() => {
    if (!info) setOpen(false);
  }, [info]);

  if (!info) return null;

  const label =
    LANGUAGES.find((l) => l.id === info.language)?.label ?? (info.language || "Plain text");
  const options = LANGUAGES.filter((l) => matches(query, l));

  const pick = (language: string) => {
    onPick(info.pos, language);
    setOpen(false);
  };

  return createPortal(
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            aria-label="Set the code language"
            title="Set the code language"
            onMouseDown={(e) => e.preventDefault()}
            className="flex h-6 items-center gap-1 rounded-md bg-popover/90 px-2 font-mono text-[11px] text-muted-foreground shadow-xs ring-1 ring-foreground/10 outline-none backdrop-blur-sm transition-colors hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        {label}
        <ChevronDownIcon className="size-3" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-52 p-1.5">
        <div className="relative">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
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
                if (options[active]) pick(options[active].id);
              }
            }}
            placeholder="Search languages"
            aria-label="Search languages"
            className="h-8 w-full rounded-md border border-input bg-transparent pr-2 pl-7 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div
          ref={list}
          role="listbox"
          aria-label="Languages"
          className="mt-1 max-h-64 overflow-y-auto"
        >
          {options.length === 0 && (
            <p className="px-2 py-1.5 text-sm text-muted-foreground">No language matches.</p>
          )}
          {options.map((language, i) => (
            <button
              key={language.id || "plain"}
              type="button"
              role="option"
              aria-selected={i === active}
              onMouseDown={(e) => e.preventDefault()}
              onMouseEnter={() => setActive(i)}
              onClick={() => pick(language.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-md px-2 py-1.5 text-left text-sm outline-none",
                i === active && "bg-accent text-accent-foreground",
              )}
            >
              {language.label}
              {language.id === info.language && (
                <span className="font-mono text-[11px] text-muted-foreground">current</span>
              )}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>,
    into,
  );
}
