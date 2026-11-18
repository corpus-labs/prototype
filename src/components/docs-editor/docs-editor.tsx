import * as React from "react";
import { createPortal } from "react-dom";
import { editorViewCtx, editorViewOptionsCtx, type Editor } from "@milkdown/core";
import type { Ctx } from "@milkdown/ctx";
import { BlockProvider, blockConfig, blockSpec, type ActiveNode } from "@milkdown/plugin-block";
import { SlashProvider, slashFactory } from "@milkdown/plugin-slash";
import { TooltipProvider, tooltipFactory } from "@milkdown/plugin-tooltip";
import {
  createCodeBlockCommand,
  insertHrCommand,
  insertImageCommand,
  liftListItemCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  toggleStrongCommand,
  turnIntoTextCommand,
  updateLinkCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark";
import { insertTableCommand, toggleStrikethroughCommand } from "@milkdown/preset-gfm";
import { redoCommand, undoCommand } from "@milkdown/plugin-history";
import { uploadConfig } from "@milkdown/plugin-upload";
import { lift } from "@milkdown/prose/commands";
import { getMarkRange } from "@milkdown/prose";
import { redoDepth, undoDepth } from "@milkdown/prose/history";
import { Plugin, TextSelection, type EditorState } from "@milkdown/prose/state";
import { Decoration, DecorationSet, type EditorView } from "@milkdown/prose/view";
import { $prose, callCommand } from "@milkdown/utils";
import "@milkdown/prose/view/style/prosemirror.css";
import "@milkdown/prose/tables/style/tables.css";
import "@milkdown/prose/gapcursor/style/gapcursor.css";
import "./editor.css";

import { relativeLink } from "@core/markdown/links";
import { CodeLanguageChip, codeAid, runCodeLanguage, type CodeInfo } from "./code-block";
import { embedImages, ImageForm } from "./image-form";
import { LinkCard, type LinkCardInfo } from "./link-card";
import {
  BlockGutter,
  blockFilter,
  firstLineRect,
  GRIP_DROP,
  runBlockAction,
  type BlockAction,
} from "./block-handle";
import {
  CodeBlockIcon,
  DividerIcon,
  FileTextIcon,
  Heading1Icon,
  Heading2Icon,
  Heading3Icon,
  ImageIcon,
  BulletListIcon,
  OrderedListIcon,
  TaskListIcon,
  QuoteIcon,
  TableIcon,
  TextIcon,
} from "./icons";
import { BlockMenu, LinkForm, MenuList, type Block, type LinkTarget } from "./menus";
import { MDX_INSERTS, MdxCard, mdxNodeView, type MdxCardInfo } from "./mdx-blocks";
import { createDocsEditor } from "./milkdown";
import { TableMenu, runTableAction, tableAid, type TableInfo } from "./table-menu";
import { EMPTY_TOOLBAR, SelectionBar, type ToolbarAction, type ToolbarState } from "./toolbar";

type Menu = { kind: "slash" | "page"; query: string; from: number; to: number } | null;
type Marks = {
  strong: boolean;
  emphasis: boolean;
  strike: boolean;
  code: boolean;
  link: string | null;
};

// Milkdown gives commands their keys when the editor starts, so each block looks its command up when it runs.
const BLOCKS: Block[] = [
  {
    id: "text",
    label: "Text",
    detail: "Plain paragraph text",
    icon: TextIcon,
    run: (ctx) => callCommand(turnIntoTextCommand.key)(ctx),
  },
  {
    id: "h1",
    label: "Heading 1",
    detail: "Section title",
    icon: Heading1Icon,
    run: (ctx) => callCommand(wrapInHeadingCommand.key, 1)(ctx),
  },
  {
    id: "h2",
    label: "Heading 2",
    detail: "Subsection title",
    icon: Heading2Icon,
    run: (ctx) => callCommand(wrapInHeadingCommand.key, 2)(ctx),
  },
  {
    id: "h3",
    label: "Heading 3",
    detail: "Minor heading",
    icon: Heading3Icon,
    run: (ctx) => callCommand(wrapInHeadingCommand.key, 3)(ctx),
  },
  {
    id: "ul",
    label: "Bulleted list",
    detail: "Simple bulleted list",
    icon: BulletListIcon,
    run: (ctx) => callCommand(wrapInBulletListCommand.key)(ctx),
  },
  {
    id: "ol",
    label: "Numbered list",
    detail: "Steps in order",
    icon: OrderedListIcon,
    run: (ctx) => callCommand(wrapInOrderedListCommand.key)(ctx),
  },
  {
    id: "todo",
    label: "To-do list",
    detail: "Track work with checkboxes",
    icon: TaskListIcon,
    run: toggleTaskList,
  },
  {
    id: "quote",
    label: "Quote",
    detail: "Call out a quotation",
    icon: QuoteIcon,
    run: (ctx) => callCommand(wrapInBlockquoteCommand.key)(ctx),
  },
  {
    id: "code",
    label: "Code block",
    detail: "Fenced code with a language",
    icon: CodeBlockIcon,
    run: (ctx) => callCommand(createCodeBlockCommand.key)(ctx),
  },
  {
    id: "hr",
    label: "Divider",
    detail: "Horizontal rule",
    icon: DividerIcon,
    run: (ctx) => callCommand(insertHrCommand.key)(ctx),
  },
  {
    id: "table",
    label: "Table",
    detail: "Rows and columns",
    icon: TableIcon,
    run: (ctx) => callCommand(insertTableCommand.key, { row: 3, col: 3 })(ctx),
  },
  {
    id: "image",
    label: "Image",
    detail: "Link one or embed a file",
    icon: ImageIcon,
  },
  {
    id: "page",
    label: "Link to a page",
    detail: "Search every page in this project",
    icon: FileTextIcon,
  },
  // The image and page items open dialogs instead of running a command.
];

const NO_MARKS: Marks = { strong: false, emphasis: false, strike: false, code: false, link: null };

/** The list item around the cursor, if any, and where it starts. */
function listItemAround(state: EditorState) {
  const { $from } = state.selection;
  for (let d = $from.depth; d > 0; d--) {
    if ($from.node(d).type.name === "list_item")
      return { node: $from.node(d), pos: $from.before(d) };
  }
  return null;
}

/**
 * Turns the selected list items into to-dos, or back into plain items. Outside a
 * list it starts a bulleted one first. GFM writes these as `- [ ]` and `- [x]`.
 */
function toggleTaskList(ctx: Ctx) {
  const view = ctx.get(editorViewCtx);
  if (!listItemAround(view.state)) callCommand(wrapInBulletListCommand.key)(ctx);
  const { state } = view;
  const { from, to } = state.selection;
  const tr = state.tr;
  let toTask: boolean | null = null;
  state.doc.nodesBetween(from, to, (node, pos) => {
    if (node.type.name !== "list_item") return;
    if (toTask === null) toTask = node.attrs.checked == null;
    tr.setNodeMarkup(pos, undefined, { ...node.attrs, checked: toTask ? false : null });
  });
  if (!tr.docChanged) return false;
  view.dispatch(tr);
  return true;
}

/** Everything the formatting bar shows: block type, marks, list, quote, and history. */
function readToolbar(view: EditorView): ToolbarState {
  const { state } = view;
  const { $from } = state.selection;
  const parent = $from.parent;
  const block: ToolbarState["block"] =
    parent.type.name === "heading"
      ? (`h${Math.min(Math.max(parent.attrs.level as number, 1), 3)}` as "h1" | "h2" | "h3")
      : parent.type.name === "code_block"
        ? "code"
        : parent.type.name === "paragraph"
          ? "paragraph"
          : "other";
  let list: ToolbarState["list"] = null;
  let quote = false;
  // Innermost first, so a to-do item wins over the bulleted list it sits in.
  for (let d = $from.depth; d > 0; d--) {
    const node = $from.node(d);
    const name = node.type.name;
    if (!list && name === "list_item" && node.attrs.checked != null) list = "task";
    if (!list && name === "bullet_list") list = "bullet";
    if (!list && name === "ordered_list") list = "ordered";
    if (name === "blockquote") quote = true;
  }
  const marks = readMarks(view);
  return {
    block,
    strong: marks.strong,
    emphasis: marks.emphasis,
    strike: marks.strike,
    code: marks.code,
    link: !!marks.link,
    list,
    quote,
    canUndo: undoDepth(state) > 0,
    canRedo: redoDepth(state) > 0,
  };
}

const PLACEHOLDER = "Type / for blocks, or [[ to link a page";

/**
 * Editor behavior that isn't a command: reports the cursor's state to the
 * formatting bar, shows a hint on the empty line being typed in, and lets the
 * checkbox beside a to-do toggle it.
 */
function editingAids(onState: (state: ToolbarState) => void) {
  return $prose(
    () =>
      new Plugin({
        view: (view) => {
          onState(readToolbar(view));
          return { update: (v) => onState(readToolbar(v)) };
        },
        props: {
          decorations(state) {
            const { $from, empty } = state.selection;
            const node = $from.parent;
            if (!empty || node.type.name !== "paragraph" || node.content.size > 0) return null;
            const start = $from.before();
            return DecorationSet.create(state.doc, [
              Decoration.node(start, start + node.nodeSize, {
                class: "is-empty",
                "data-placeholder": PLACEHOLDER,
              }),
            ]);
          },
          handleDOMEvents: {
            mousedown(view, event) {
              const li = event.target instanceof HTMLElement ? event.target : null;
              if (!li || li.dataset.itemType !== "task") return false;
              // The checkbox is drawn just left of the item's own box.
              if (event.clientX > li.getBoundingClientRect().left + 2) return false;
              const $pos = view.state.doc.resolve(view.posAtDOM(li, 0));
              for (let d = $pos.depth; d > 0; d--) {
                const node = $pos.node(d);
                if (node.type.name !== "list_item") continue;
                view.dispatch(
                  view.state.tr.setNodeMarkup($pos.before(d), undefined, {
                    ...node.attrs,
                    checked: !node.attrs.checked,
                  }),
                );
                event.preventDefault();
                return true;
              }
              return false;
            },
          },
        },
      }),
  );
}

/** A slash command: `/` at the start of a line or after a space, then a few words. */
const SLASH = /(?:^|\s)(\/[\p{L}\p{N} ]{0,24})$/u;
/** A page link in progress: `[[` and whatever has been typed since. */
const PAGE = /(\[\[[^[\]\n]{0,40})$/;

function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  ref.current = value;
  return ref;
}

function floating() {
  const el = document.createElement("div");
  el.className = "docs-editor-float";
  return el;
}

/** Best matches first: the text starts with the query, then a word does, then it appears anywhere. */
/** Lowercase, with apostrophes dropped, so "dont" and "don't" both find "Don’t example". */
function fold(text: string) {
  return text.toLowerCase().replace(/['’]/g, "");
}

function ranked<T>(items: T[], query: string, text: (item: T) => string): T[] {
  const q = fold(query.trim());
  if (!q) return items;
  const score = (item: T) => {
    const t = fold(text(item));
    return t.startsWith(q)
      ? 0
      : t.split(/\s+/).some((w) => w.startsWith(q))
        ? 1
        : t.includes(q)
          ? 2
          : 3;
  };
  return items
    .map((item, i) => ({ item, i, s: score(item) }))
    .filter((x) => x.s < 3)
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.item);
}

function readMarks(view: EditorView): Marks {
  const { from, to } = view.state.selection;
  const { marks } = view.state.schema;
  const has = (name: string) => !!marks[name] && view.state.doc.rangeHasMark(from, to, marks[name]);
  let link: string | null = null;
  view.state.doc.nodesBetween(from, to, (node) => {
    const mark = node.marks.find((m) => m.type.name === "link");
    if (mark) link = mark.attrs.href as string;
  });
  return {
    strong: has("strong"),
    emphasis: has("emphasis"),
    strike: has("strike_through"),
    code: has("inlineCode"),
    link,
  };
}

/** The `/command` or `[[page` text right before the cursor, read from the document as it is now. */
function triggerAt(view: EditorView, kind: "slash" | "page") {
  const { selection } = view.state;
  if (!selection.empty) return null;
  const { $from } = selection;
  // Menus open in paragraphs only, not in headings or code.
  if ($from.parent.type.name !== "paragraph") return null;
  const text = $from.parent.textBetween(
    Math.max(0, $from.parentOffset - 500),
    $from.parentOffset,
    undefined,
    "\ufffc",
  );
  const match = text.match(kind === "slash" ? SLASH : PAGE);
  return match ? { query: match[1], from: $from.pos - match[1].length, to: $from.pos } : null;
}

/** Wires a Milkdown tooltip or slash provider into a ProseMirror plugin view. */
function providerView(
  provider: { update: (view: EditorView, prev?: EditorState) => void; destroy: () => void },
  view: EditorView,
) {
  provider.update(view);
  return {
    update: (v: EditorView, prev: EditorState) => provider.update(v, prev),
    destroy: () => provider.destroy(),
  };
}

/**
 * The rich editor for a docs page. It loads `value` once, so remount it (with a
 * new `key`) to load different content. Edits come back through `onChange` as
 * Markdown in the house style.
 */
export function DocsEditor({
  value,
  onChange,
  pagePath,
  pages,
  autoFocus,
  mdx = false,
}: {
  value: string;
  onChange: (markdown: string) => void;
  /** This page's repository path, so links can be written relative to it. */
  pagePath: string;
  /** Pages the `[[` picker and the link form can link to. */
  pages: LinkTarget[];
  autoFocus?: boolean;
  /** An MDX page, like a guideline: its Do, Don't, and Callout blocks show as cards. */
  mdx?: boolean;
}) {
  const host = React.useRef<HTMLDivElement>(null);
  const editor = React.useRef<Editor | null>(null);
  const [els] = React.useState(() => {
    const handle = floating();
    handle.classList.add("docs-editor-handle");
    const table = floating();
    table.classList.add("docs-editor-tablebar");
    const code = floating();
    code.classList.add("docs-editor-codechip");
    return {
      toolbar: floating(),
      slash: floating(),
      page: floating(),
      handle,
      table,
      code,
      card: floating(),
    };
  });
  // The open menu and its highlighted item live in refs that change the moment the
  // text does. React state mirrors them for rendering only. Key handling reads the
  // refs, so fast typing never acts on a menu from a keystroke ago.
  const menuRef = React.useRef<Menu>(null);
  // The block gutter's provider, once the editor has mounted it.
  const blockProvider = React.useRef<BlockProvider | null>(null);
  const activeRef = React.useRef(0);
  const [menu, setMenuState] = React.useState<Menu>(null);
  const [active, setActiveState] = React.useState(0);
  const [marks, setMarks] = React.useState<Marks>(NO_MARKS);
  const [toolbar, setToolbarState] = React.useState<ToolbarState>(EMPTY_TOOLBAR);
  // The bar updates on every keystroke, so only re-render when something it shows changed.
  const toolbarKey = React.useRef("");
  const setToolbar = React.useCallback((next: ToolbarState) => {
    const key = JSON.stringify(next);
    if (key === toolbarKey.current) return;
    toolbarKey.current = key;
    setToolbarState(next);
  }, []);
  const [linking, setLinking] = React.useState(false);
  const [inserting, setInserting] = React.useState(false);
  const [card, setCard] = React.useState<LinkCardInfo | null>(null);
  const [table, setTableState] = React.useState<TableInfo | null>(null);
  // Like the formatting bar, the table bar reports on every keystroke.
  const tableKey = React.useRef("");
  const setTable = React.useCallback((next: TableInfo | null) => {
    const key = JSON.stringify(next);
    if (key === tableKey.current) return;
    tableKey.current = key;
    setTableState(next);
  }, []);
  const [code, setCodeState] = React.useState<CodeInfo | null>(null);
  const codeKey = React.useRef("");
  const setCode = React.useCallback((next: CodeInfo | null) => {
    const key = JSON.stringify(next);
    if (key === codeKey.current) return;
    codeKey.current = key;
    setCodeState(next);
  }, []);
  // Where the reader pressed Escape, so the same menu doesn't reopen until they start over.
  const dismissed = React.useRef<number | null>(null);

  const setMenu = React.useCallback((next: Menu) => {
    menuRef.current = next;
    setMenuState(next);
  }, []);
  const setActive = React.useCallback((next: number) => {
    activeRef.current = next;
    setActiveState(next);
  }, []);

  const targets = pages.filter((p) => p.path !== pagePath);
  const blocks = React.useMemo(() => (mdx ? [...BLOCKS, ...MDX_INSERTS] : BLOCKS), [mdx]);
  const latest = useLatest({ onChange, targets, pagePath, blocks });

  const itemsFor = React.useCallback(
    (m: Menu): (Block | LinkTarget)[] =>
      m?.kind === "slash"
        ? ranked(latest.current.blocks, m.query.slice(1), (b) => b.label)
        : m?.kind === "page"
          ? ranked(latest.current.targets, m.query.slice(2), (p) => `${p.title} ${p.folder}`)
          : [],
    [latest],
  );
  const items = itemsFor(menu);

  // MDX blocks on the page, each rendered by React into the container its node view made.
  const [cards, setCards] = React.useState<MdxCardInfo[]>([]);
  const registry = React.useMemo(
    () => ({
      add: (card: MdxCardInfo) => setCards((list) => [...list, card]),
      update: (id: number, value: string) =>
        setCards((list) => list.map((c) => (c.id === id ? { ...c, value } : c))),
      remove: (id: number) => setCards((list) => list.filter((c) => c.id !== id)),
    }),
    [],
  );

  const run = React.useCallback((fn: (ctx: Ctx) => unknown) => editor.current?.action(fn), []);

  const choose = React.useCallback(
    (item: Block | LinkTarget, kind: "slash" | "page" | undefined = menuRef.current?.kind) => {
      if (!kind) return;
      run((ctx) => {
        const view = ctx.get(editorViewCtx);
        // Read the trigger text again now, since the menu can trail the last keystroke.
        const at = triggerAt(view, kind);
        if (!at) return;
        if (kind === "page" && "path" in item) {
          // Replace "[[query" with the page title, linked relative to this page.
          const link = view.state.schema.marks.link.create({
            href: relativeLink(latest.current.pagePath, item.path),
          });
          const tr = view.state.tr.insertText(item.title, at.from, at.to);
          tr.addMark(at.from, at.from + item.title.length, link).removeStoredMark(link.type);
          view.dispatch(tr);
        } else if (kind === "slash" && "id" in item) {
          view.dispatch(view.state.tr.delete(at.from, at.to));
          // The choice consumed the typed slash itself.
          autoSlash.current = null;
          if (item.id === "page") view.dispatch(view.state.tr.insertText("[["));
          else if (item.id === "image") setInserting(true);
          else item.run?.(ctx);
        }
        view.focus();
      });
      setMenu(null);
    },
    [latest, run, setMenu],
  );

  React.useEffect(() => {
    if (!host.current) return;
    let cancelled = false;
    let instance: Editor | null = null;

    // The providers decide visibility. Escape doesn't change the document, so it hides them directly.
    const providers: Partial<Record<"slash" | "page", SlashProvider>> = {};

    const closeIf = (kind: "slash" | "page") => {
      if (menuRef.current?.kind === kind) {
        setMenu(null);
        // The reader moved on without choosing, so take the typed slash back.
        if (kind === "slash") tidyAutoSlash();
      }
    };

    // Opens the menu while the text before the cursor matches, and closes it when it stops matching.
    const detect = (provider: SlashProvider, view: EditorView, kind: "slash" | "page") => {
      // The provider reports text only for a focused, empty selection in a paragraph.
      const found = provider.getContent(view) === undefined ? null : triggerAt(view, kind);
      if (!found) {
        closeIf(kind);
        return false;
      }
      if (dismissed.current === found.from) return false;
      dismissed.current = null;
      const open = menuRef.current;
      if (!(open?.kind === kind && open.from === found.from && open.query === found.query)) {
        if (open?.kind !== kind || open.query !== found.query) setActive(0);
        setMenu({ kind, ...found });
      }
      return true;
    };

    // Menu keys and ⌘K. Set on the view itself, not as a plugin: ProseMirror asks the
    // view's own props first, so Enter picks a menu item before the keymaps split the line.
    const handleKeyDown = (view: EditorView, event: KeyboardEvent) => {
      // Detection runs a tick after typing, so a fast Enter can arrive first. Fall back to the text itself.
      const pending = (["page", "slash"] as const).find((k) => {
        const t = triggerAt(view, k);
        return t && dismissed.current !== t.from;
      });
      const open =
        menuRef.current ?? (pending ? { kind: pending, query: "", from: 0, to: 0 } : null);
      if (open) {
        const now = triggerAt(view, open.kind);
        if (!now) {
          setMenu(null);
        } else {
          const list = itemsFor({ kind: open.kind, ...now });
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const step = event.key === "ArrowDown" ? 1 : -1;
            if (list.length) setActive((activeRef.current + step + list.length) % list.length);
            return true;
          }
          if ((event.key === "Enter" || event.key === "Tab") && list.length) {
            choose(list[Math.min(activeRef.current, list.length - 1)], open.kind);
            return true;
          }
          if (event.key === "Escape") {
            dismissed.current = now.from;
            setMenu(null);
            if (open.kind === "slash") tidyAutoSlash();
            providers[open.kind]?.hide();
            return true;
          }
        }
      }
      // ⌘K makes a link: from the selection if there is one, otherwise a page link at the cursor.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (view.state.selection.empty) view.dispatch(view.state.tr.insertText("[["));
        else setLinking(true);
        return true;
      }
      return false;
    };

    const selection = tooltipFactory("CORPUS_SELECTION");
    const slash = slashFactory("CORPUS_SLASH");
    const pageLink = slashFactory("CORPUS_PAGE_LINK");

    // The table bar, the code chip, and the link card position themselves
    // against the host, so they live there.
    host.current.appendChild(els.table);
    host.current.appendChild(els.code);
    host.current.appendChild(els.card);

    createDocsEditor({
      root: host.current,
      value,
      onChange: (markdown) => latest.current.onChange(markdown),
      plugins: [
        ...selection,
        ...slash,
        ...pageLink,
        editingAids(setToolbar),
        tableAid(els.table, setTable),
        codeAid(els.code, setCode),
      ],
      configure: (ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          handleKeyDown,
          ...(mdx && { nodeViews: { ...prev.nodeViews, html: mdxNodeView(registry) } }),
        }));
        ctx.update(blockConfig.key, (prev) => ({ ...prev, filterNodes: blockFilter }));
        // Pasted and dropped images embed as downscaled data URLs until Phase 5
        // writes them to the repository.
        ctx.update(uploadConfig.key, (prev) => ({
          ...prev,
          uploader: async (files, schema) => {
            const embedded = await embedImages([...files]);
            return embedded
              .map((image) => schema.nodes.image.createAndFill(image))
              .filter((node): node is NonNullable<typeof node> => node !== null);
          },
        }));
        ctx.set(blockSpec.key, {
          view: (view: EditorView) => {
            const provider = new BlockProvider({
              ctx,
              content: els.handle,
              getPlacement: () => "left",
              // Down the stack so the plus rides on the line and the grip below it.
              getOffset: () => ({ mainAxis: 14, crossAxis: GRIP_DROP }),
              getPosition: ({ active }) => firstLineRect(active.el),
            });
            blockProvider.current = provider;
            return providerView(provider, view);
          },
        });
        ctx.set(selection.key, {
          view: (view: EditorView) =>
            providerView(
              new TooltipProvider({
                content: els.toolbar,
                debounce: 20,
                offset: 8,
                shouldShow: (v) => {
                  const { empty } = v.state.selection;
                  const inCode = v.state.selection.$from.parent.type.name === "code_block";
                  const focused = v.hasFocus() || els.toolbar.contains(document.activeElement);
                  if (empty || inCode || !focused || !v.editable) {
                    if (!els.toolbar.contains(document.activeElement)) setLinking(false);
                    return false;
                  }
                  setMarks(readMarks(v));
                  return true;
                },
              }),
              view,
            ),
        });
        ctx.set(slash.key, {
          view: (view: EditorView) => {
            const provider: SlashProvider = new SlashProvider({
              content: els.slash,
              debounce: 0,
              offset: 6,
              shouldShow: (v) => detect(provider, v, "slash"),
            });
            providers.slash = provider;
            return providerView(provider, view);
          },
        });
        ctx.set(pageLink.key, {
          view: (view: EditorView) => {
            const provider: SlashProvider = new SlashProvider({
              content: els.page,
              debounce: 0,
              offset: 6,
              shouldShow: (v) => detect(provider, v, "page"),
            });
            providers.page = provider;
            return providerView(provider, view);
          },
        });
      },
    }).then((created) => {
      if (cancelled) {
        void created.destroy();
        return;
      }
      instance = created;
      editor.current = created;
      if (autoFocus) created.action((ctx) => ctx.get(editorViewCtx).focus());
    });

    const node = host.current;
    return () => {
      cancelled = true;
      editor.current = null;
      blockProvider.current = null;
      void instance?.destroy();
      // destroy() leaves Milkdown's DOM behind, and Strict Mode mounts twice.
      node.replaceChildren();
    };
    // The editor loads `value` once. The parent remounts it to load new content.
  }, []);

  // Where the plus button typed a slash, so an abandoned menu can undo it.
  const autoSlash = React.useRef<number | null>(null);

  /** Removes the slash the plus button typed, unless the reader typed on it. */
  const tidyAutoSlash = React.useCallback(() => {
    const at = autoSlash.current;
    if (at === null) return;
    autoSlash.current = null;
    run((ctx) => {
      const view = ctx.get(editorViewCtx);
      const $pos = view.state.doc.resolve(at);
      if ($pos.parent.type.name !== "paragraph" || $pos.parent.textContent !== "/") return;
      view.dispatch(view.state.tr.insertText("", at, at + 1));
    });
  }, [run]);

  /**
   * Opens an empty line below the gutter's block and starts a slash command
   * there. The slash is typed for the reader, so if they abandon the menu the
   * line is tidied back to empty.
   */
  const addBelow = (active: ActiveNode) => {
    run((ctx) => {
      const view = ctx.get(editorViewCtx);
      const after = active.$pos.pos + active.node.nodeSize;
      const { paragraph } = view.state.schema.nodes;
      let tr = view.state.tr.insert(after, paragraph.create());
      tr = tr.setSelection(TextSelection.create(tr.doc, after + 1)).insertText("/");
      view.dispatch(tr.scrollIntoView());
      autoSlash.current = after + 1;
      view.focus();
    });
  };

  /** Runs one action from the block menu on its block, then hands focus back. */
  const actOnBlock = (action: BlockAction, active: ActiveNode) => {
    run((ctx) => runBlockAction(action, ctx.get(editorViewCtx), active));
    run((ctx) => ctx.get(editorViewCtx).focus());
  };

  // The link card: after the pointer rests on a link for a moment, show where
  // it points. Editing selects the link first, so the link form opens on it.
  const cardAnchor = React.useRef<HTMLAnchorElement | null>(null);
  const hoverTimer = React.useRef<number | null>(null);
  const cardHide = React.useRef<number | null>(null);
  const stopHover = () => {
    if (hoverTimer.current !== null) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };
  const showCard = (anchor: HTMLAnchorElement) => {
    const base = host.current?.getBoundingClientRect();
    if (!base) return;
    const rect = anchor.getBoundingClientRect();
    cardAnchor.current = anchor;
    setCard({
      href: anchor.getAttribute("href") ?? "",
      top: rect.bottom - base.top + 6,
      left: rect.left - base.left,
    });
  };
  React.useEffect(() => {
    els.card.dataset.show = card ? "true" : "false";
    if (card) {
      els.card.style.top = `${card.top}px`;
      els.card.style.left = `${card.left}px`;
    }
  }, [card, els.card]);

  const editHoveredLink = () => {
    const anchor = cardAnchor.current;
    setCard(null);
    if (!anchor) return;
    run((ctx) => {
      const view = ctx.get(editorViewCtx);
      const $pos = view.state.doc.resolve(view.posAtDOM(anchor, 0));
      const range = getMarkRange($pos, view.state.schema.marks.link);
      if (!range) return;
      view.dispatch(
        view.state.tr.setSelection(TextSelection.create(view.state.doc, range.from, range.to)),
      );
    });
    setLinking(true);
  };

  // The selection menu's and the block menus' actions, mapped to Milkdown commands.
  const act = (action: ToolbarAction) => {
    const toggleList = (kind: "bullet" | "ordered", wrap: typeof wrapInBulletListCommand.key) =>
      run((ctx) => {
        const view = ctx.get(editorViewCtx);
        const now = readToolbar(view).list;
        // A to-do list switches back to plain items; the same list type again lifts it out.
        if (now === "task" && kind === "bullet") return toggleTaskList(ctx);
        if (now === kind) return callCommand(liftListItemCommand.key)(ctx);
        return callCommand(wrap)(ctx);
      });
    switch (action) {
      case "paragraph":
        run(callCommand(turnIntoTextCommand.key));
        break;
      case "h1":
      case "h2":
      case "h3":
        run(callCommand(wrapInHeadingCommand.key, Number(action[1])));
        break;
      case "strong":
        run(callCommand(toggleStrongCommand.key));
        break;
      case "emphasis":
        run(callCommand(toggleEmphasisCommand.key));
        break;
      case "strike":
        run(callCommand(toggleStrikethroughCommand.key));
        break;
      case "code":
        run(callCommand(toggleInlineCodeCommand.key));
        break;
      case "link":
        run((ctx) => {
          const view = ctx.get(editorViewCtx);
          // With nothing selected, a link means a page link at the cursor.
          if (view.state.selection.empty) view.dispatch(view.state.tr.insertText("[["));
          else {
            setMarks(readMarks(view));
            setLinking(true);
          }
        });
        break;
      case "bullet":
        toggleList("bullet", wrapInBulletListCommand.key);
        break;
      case "ordered":
        toggleList("ordered", wrapInOrderedListCommand.key);
        break;
      case "task":
        run(toggleTaskList);
        break;
      case "quote":
        run((ctx) => {
          const view = ctx.get(editorViewCtx);
          if (readToolbar(view).quote) return lift(view.state, view.dispatch);
          return callCommand(wrapInBlockquoteCommand.key)(ctx);
        });
        break;
      case "codeBlock":
        run((ctx) =>
          readToolbar(ctx.get(editorViewCtx)).block === "code"
            ? callCommand(turnIntoTextCommand.key)(ctx)
            : callCommand(createCodeBlockCommand.key)(ctx),
        );
        break;
      case "divider":
        run(callCommand(insertHrCommand.key));
        break;
      case "table":
        run(callCommand(insertTableCommand.key, { row: 3, col: 3 }));
        break;
      case "image":
        setInserting(true);
        break;
      case "undo":
        run(callCommand(undoCommand.key));
        break;
      case "redo":
        run(callCommand(redoCommand.key));
        break;
    }
    run((ctx) => ctx.get(editorViewCtx).focus());
  };

  const applyLink = (href: string) => {
    const clean = href.trim();
    if (!clean) return;
    run(callCommand(marks.link ? updateLinkCommand.key : toggleLinkCommand.key, { href: clean }));
    setLinking(false);
    run((ctx) => ctx.get(editorViewCtx).focus());
  };

  return (
    <>
      <div
        className="relative"
        onMouseOver={(e) => {
          const target = e.target instanceof Element ? e.target : null;
          const anchor = target?.closest?.("a");
          if (!(anchor instanceof HTMLAnchorElement) || !host.current?.contains(anchor)) return;
          if (cardHide.current !== null) window.clearTimeout(cardHide.current);
          if (cardAnchor.current === anchor) return;
          stopHover();
          hoverTimer.current = window.setTimeout(() => showCard(anchor), 250);
        }}
        onMouseOut={(e) => {
          const to = e.relatedTarget;
          if (to instanceof Node && (els.card.contains(to) || to.nodeName === "A")) return;
          stopHover();
          if (cardHide.current !== null) window.clearTimeout(cardHide.current);
          cardHide.current = window.setTimeout(() => setCard(null), 120);
        }}
        // Leaving the editor closes whatever was open, since no typing follows
        // to do it. The floats live inside this wrapper, so choosing from a
        // menu never blurs.
        onBlur={(e) => {
          if (e.currentTarget.contains(e.relatedTarget)) return;
          setMenu(null);
          tidyAutoSlash();
        }}
      >
        <div ref={host} data-docs-editor className="relative" />
      </div>

      <BlockGutter
        into={els.handle}
        getActive={() => blockProvider.current?.active ?? null}
        onAddBelow={addBelow}
        onAction={actOnBlock}
      />

      <TableMenu
        into={els.table}
        info={table}
        onAction={(action) => {
          run((ctx) => runTableAction(action, ctx));
          run((ctx) => ctx.get(editorViewCtx).focus());
        }}
      />

      <CodeLanguageChip
        into={els.code}
        info={code}
        onPick={(pos, language) => {
          run((ctx) => runCodeLanguage(pos, language, ctx));
          run((ctx) => ctx.get(editorViewCtx).focus());
        }}
      />

      <LinkCard into={els.card} info={card} onEdit={editHoveredLink} />

      {cards.map((c) =>
        createPortal(
          <MdxCard
            card={c}
            onSave={(value) =>
              run((ctx) => {
                const view = ctx.get(editorViewCtx);
                const pos = c.getPos();
                if (pos === undefined) return;
                view.dispatch(view.state.tr.setNodeMarkup(pos, undefined, { value }));
              })
            }
            onDelete={() =>
              run((ctx) => {
                const view = ctx.get(editorViewCtx);
                const pos = c.getPos();
                if (pos === undefined) return;
                const $pos = view.state.doc.resolve(pos);
                view.dispatch(view.state.tr.delete($pos.before(), $pos.after()));
                view.focus();
              })
            }
          />,
          c.dom,
          c.id,
        ),
      )}

      <ImageForm
        open={inserting}
        onOpenChange={setInserting}
        onApply={(image) => {
          run(callCommand(insertImageCommand.key, image));
          run((ctx) => ctx.get(editorViewCtx).focus());
        }}
      />

      {createPortal(
        linking ? (
          <LinkForm
            current={marks.link}
            targets={targets}
            pagePath={pagePath}
            onApply={applyLink}
            onRemove={() => {
              run(callCommand(toggleLinkCommand.key));
              setLinking(false);
            }}
            onCancel={() => {
              setLinking(false);
              run((ctx) => ctx.get(editorViewCtx).focus());
            }}
          />
        ) : (
          <SelectionBar
            state={toolbar}
            onAction={act}
            editorElement={() => host.current?.querySelector<HTMLElement>(".ProseMirror") ?? null}
          />
        ),
        els.toolbar,
      )}

      {createPortal(
        menu?.kind === "slash" ? (
          <BlockMenu items={items as Block[]} active={active} onChoose={choose} />
        ) : null,
        els.slash,
      )}

      {createPortal(
        menu?.kind === "page" ? (
          <MenuList
            label="Link to a page"
            items={items as LinkTarget[]}
            active={active}
            onChoose={choose}
            empty="No page matches. Keep typing, or press Escape."
            render={(p) => (
              <>
                <FileTextIcon className="size-4 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate">{p.title}</span>
                <span className="text-xs text-muted-foreground">{p.folder}</span>
              </>
            )}
          />
        ) : null,
        els.page,
      )}
    </>
  );
}
