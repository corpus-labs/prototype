import * as React from "react"
import { createPortal } from "react-dom"
import { editorViewCtx, editorViewOptionsCtx, type Editor } from "@milkdown/core"
import type { Ctx } from "@milkdown/ctx"
import { SlashProvider, slashFactory } from "@milkdown/plugin-slash"
import { TooltipProvider, tooltipFactory } from "@milkdown/plugin-tooltip"
import {
  createCodeBlockCommand,
  insertHrCommand,
  toggleEmphasisCommand,
  toggleInlineCodeCommand,
  toggleLinkCommand,
  toggleStrongCommand,
  updateLinkCommand,
  wrapInBlockquoteCommand,
  wrapInBulletListCommand,
  wrapInHeadingCommand,
  wrapInOrderedListCommand,
} from "@milkdown/preset-commonmark"
import { insertTableCommand } from "@milkdown/preset-gfm"
import type { EditorState } from "@milkdown/prose/state"
import type { EditorView } from "@milkdown/prose/view"
import { callCommand } from "@milkdown/utils"
import {
  BoldIcon,
  CodeIcon,
  FileTextIcon,
  Heading2Icon,
  Heading3Icon,
  ItalicIcon,
  LinkIcon,
  ListIcon,
  ListOrderedIcon,
  MinusIcon,
  QuoteIcon,
  SquareCodeIcon,
  TableIcon,
} from "lucide-react"
import "@milkdown/prose/view/style/prosemirror.css"
import "@milkdown/prose/tables/style/tables.css"

import { relativeLink } from "@core/markdown/links"
import { cn } from "@/lib/utils"
import { createDocsEditor } from "./milkdown"

export type LinkTarget = { title: string; path: string; folder: string }

type Menu = { kind: "slash" | "page"; query: string; from: number; to: number } | null
type Marks = { strong: boolean; emphasis: boolean; code: boolean; link: string | null }

type Block = { id: string; label: string; hint: string; icon: React.ComponentType<{ className?: string }>; run?: (ctx: Ctx) => boolean }

// Milkdown gives commands their keys when the editor starts, so each block looks its command up when it runs.
const BLOCKS: Block[] = [
  { id: "h2", label: "Heading", hint: "##", icon: Heading2Icon, run: (ctx) => callCommand(wrapInHeadingCommand.key, 2)(ctx) },
  { id: "h3", label: "Subheading", hint: "###", icon: Heading3Icon, run: (ctx) => callCommand(wrapInHeadingCommand.key, 3)(ctx) },
  { id: "ul", label: "Bulleted list", hint: "-", icon: ListIcon, run: (ctx) => callCommand(wrapInBulletListCommand.key)(ctx) },
  { id: "ol", label: "Numbered list", hint: "1.", icon: ListOrderedIcon, run: (ctx) => callCommand(wrapInOrderedListCommand.key)(ctx) },
  { id: "quote", label: "Quote", hint: ">", icon: QuoteIcon, run: (ctx) => callCommand(wrapInBlockquoteCommand.key)(ctx) },
  { id: "code", label: "Code block", hint: "```", icon: SquareCodeIcon, run: (ctx) => callCommand(createCodeBlockCommand.key)(ctx) },
  { id: "hr", label: "Divider", hint: "---", icon: MinusIcon, run: (ctx) => callCommand(insertHrCommand.key)(ctx) },
  { id: "table", label: "Table", hint: "", icon: TableIcon, run: (ctx) => callCommand(insertTableCommand.key, { row: 3, col: 3 })(ctx) },
  // Doesn't run a command. It types [[, which opens the page picker.
  { id: "page", label: "Link to a page", hint: "[[", icon: FileTextIcon },
]

const NO_MARKS: Marks = { strong: false, emphasis: false, code: false, link: null }

/** A slash command: `/` at the start of a line or after a space, then a few words. */
const SLASH = /(?:^|\s)(\/[\p{L}\p{N} ]{0,24})$/u
/** A page link in progress: `[[` and whatever has been typed since. */
const PAGE = /(\[\[[^[\]\n]{0,40})$/

function useLatest<T>(value: T) {
  const ref = React.useRef(value)
  ref.current = value
  return ref
}

function floating() {
  const el = document.createElement("div")
  el.className = "docs-editor-float"
  return el
}

function matches(text: string, query: string) {
  return text.toLowerCase().includes(query.trim().toLowerCase())
}

/** Best matches first: the text starts with the query, then a word does, then it appears anywhere. */
function ranked<T>(items: T[], query: string, text: (item: T) => string): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return items
  const score = (item: T) => {
    const t = text(item).toLowerCase()
    return t.startsWith(q) ? 0 : t.split(/\s+/).some((w) => w.startsWith(q)) ? 1 : t.includes(q) ? 2 : 3
  }
  return items
    .map((item, i) => ({ item, i, s: score(item) }))
    .filter((x) => x.s < 3)
    .sort((a, b) => a.s - b.s || a.i - b.i)
    .map((x) => x.item)
}

function readMarks(view: EditorView): Marks {
  const { from, to } = view.state.selection
  const { marks } = view.state.schema
  const has = (name: string) => !!marks[name] && view.state.doc.rangeHasMark(from, to, marks[name])
  let link: string | null = null
  view.state.doc.nodesBetween(from, to, (node) => {
    const mark = node.marks.find((m) => m.type.name === "link")
    if (mark) link = mark.attrs.href as string
  })
  return { strong: has("strong"), emphasis: has("emphasis"), code: has("inlineCode"), link }
}

/** The `/command` or `[[page` text right before the cursor, read from the document as it is now. */
function triggerAt(view: EditorView, kind: "slash" | "page") {
  const { selection } = view.state
  if (!selection.empty) return null
  const { $from } = selection
  // Menus open in paragraphs only, not in headings or code.
  if ($from.parent.type.name !== "paragraph") return null
  const text = $from.parent.textBetween(Math.max(0, $from.parentOffset - 500), $from.parentOffset, undefined, "\ufffc")
  const match = text.match(kind === "slash" ? SLASH : PAGE)
  return match ? { query: match[1], from: $from.pos - match[1].length, to: $from.pos } : null
}

/** Wires a Milkdown tooltip or slash provider into a ProseMirror plugin view. */
function providerView(provider: { update: (view: EditorView, prev?: EditorState) => void; destroy: () => void }, view: EditorView) {
  provider.update(view)
  return { update: (v: EditorView, prev: EditorState) => provider.update(v, prev), destroy: () => provider.destroy() }
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
}: {
  value: string
  onChange: (markdown: string) => void
  /** This page's repository path, so links can be written relative to it. */
  pagePath: string
  /** Pages the `[[` picker and the link form can link to. */
  pages: LinkTarget[]
  autoFocus?: boolean
}) {
  const host = React.useRef<HTMLDivElement>(null)
  const editor = React.useRef<Editor | null>(null)
  const [els] = React.useState(() => ({ toolbar: floating(), slash: floating(), page: floating() }))
  // The open menu and its highlighted item live in refs that change the moment the
  // text does. React state mirrors them for rendering only. Key handling reads the
  // refs, so fast typing never acts on a menu from a keystroke ago.
  const menuRef = React.useRef<Menu>(null)
  const activeRef = React.useRef(0)
  const [menu, setMenuState] = React.useState<Menu>(null)
  const [active, setActiveState] = React.useState(0)
  const [marks, setMarks] = React.useState<Marks>(NO_MARKS)
  const [linking, setLinking] = React.useState(false)
  // Where the reader pressed Escape, so the same menu doesn't reopen until they start over.
  const dismissed = React.useRef<number | null>(null)

  const setMenu = React.useCallback((next: Menu) => {
    menuRef.current = next
    setMenuState(next)
  }, [])
  const setActive = React.useCallback((next: number) => {
    activeRef.current = next
    setActiveState(next)
  }, [])

  const targets = pages.filter((p) => p.path !== pagePath)
  const latest = useLatest({ onChange, targets, pagePath })

  const itemsFor = React.useCallback(
    (m: Menu): (Block | LinkTarget)[] =>
      m?.kind === "slash"
        ? ranked(BLOCKS, m.query.slice(1), (b) => b.label)
        : m?.kind === "page"
          ? ranked(latest.current.targets, m.query.slice(2), (p) => `${p.title} ${p.folder}`)
          : [],
    [latest]
  )
  const items = itemsFor(menu)

  const run = React.useCallback((fn: (ctx: Ctx) => unknown) => editor.current?.action(fn), [])

  const choose = React.useCallback(
    (item: Block | LinkTarget, kind: "slash" | "page" | undefined = menuRef.current?.kind) => {
      if (!kind) return
      run((ctx) => {
        const view = ctx.get(editorViewCtx)
        // Read the trigger text again now, since the menu can trail the last keystroke.
        const at = triggerAt(view, kind)
        if (!at) return
        if (kind === "page" && "path" in item) {
          // Replace "[[query" with the page title, linked relative to this page.
          const link = view.state.schema.marks.link.create({ href: relativeLink(latest.current.pagePath, item.path) })
          const tr = view.state.tr.insertText(item.title, at.from, at.to)
          tr.addMark(at.from, at.from + item.title.length, link).removeStoredMark(link.type)
          view.dispatch(tr)
        } else if (kind === "slash" && "id" in item) {
          view.dispatch(view.state.tr.delete(at.from, at.to))
          if (item.id === "page") view.dispatch(view.state.tr.insertText("[["))
          else item.run?.(ctx)
        }
        view.focus()
      })
      setMenu(null)
    },
    [latest, run, setMenu]
  )

  React.useEffect(() => {
    if (!host.current) return
    let cancelled = false
    let instance: Editor | null = null

    // The providers decide visibility. Escape doesn't change the document, so it hides them directly.
    const providers: Partial<Record<"slash" | "page", SlashProvider>> = {}

    const closeIf = (kind: "slash" | "page") => {
      if (menuRef.current?.kind === kind) setMenu(null)
    }

    // Opens the menu while the text before the cursor matches, and closes it when it stops matching.
    const detect = (provider: SlashProvider, view: EditorView, kind: "slash" | "page") => {
      // The provider reports text only for a focused, empty selection in a paragraph.
      const found = provider.getContent(view) === undefined ? null : triggerAt(view, kind)
      if (!found) {
        closeIf(kind)
        return false
      }
      if (dismissed.current === found.from) return false
      dismissed.current = null
      const open = menuRef.current
      if (!(open?.kind === kind && open.from === found.from && open.query === found.query)) {
        if (open?.kind !== kind || open.query !== found.query) setActive(0)
        setMenu({ kind, ...found })
      }
      return true
    }

    // Menu keys and ⌘K. Set on the view itself, not as a plugin: ProseMirror asks the
    // view's own props first, so Enter picks a menu item before the keymaps split the line.
    const handleKeyDown = (view: EditorView, event: KeyboardEvent) => {
      // Detection runs a tick after typing, so a fast Enter can arrive first. Fall back to the text itself.
      const pending = (["page", "slash"] as const).find((k) => {
        const t = triggerAt(view, k)
        return t && dismissed.current !== t.from
      })
      const open = menuRef.current ?? (pending ? { kind: pending, query: "", from: 0, to: 0 } : null)
      if (open) {
        const now = triggerAt(view, open.kind)
        if (!now) {
          setMenu(null)
        } else {
          const list = itemsFor({ kind: open.kind, ...now })
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            const step = event.key === "ArrowDown" ? 1 : -1
            if (list.length) setActive((activeRef.current + step + list.length) % list.length)
            return true
          }
          if ((event.key === "Enter" || event.key === "Tab") && list.length) {
            choose(list[Math.min(activeRef.current, list.length - 1)], open.kind)
            return true
          }
          if (event.key === "Escape") {
            dismissed.current = now.from
            setMenu(null)
            providers[open.kind]?.hide()
            return true
          }
        }
      }
      // ⌘K makes a link: from the selection if there is one, otherwise a page link at the cursor.
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        if (view.state.selection.empty) view.dispatch(view.state.tr.insertText("[["))
        else setLinking(true)
        return true
      }
      return false
    }

    const selection = tooltipFactory("CORPUS_SELECTION")
    const slash = slashFactory("CORPUS_SLASH")
    const pageLink = slashFactory("CORPUS_PAGE_LINK")

    createDocsEditor({
      root: host.current,
      value,
      onChange: (markdown) => latest.current.onChange(markdown),
      plugins: [...selection, ...slash, ...pageLink],
      configure: (ctx) => {
        ctx.update(editorViewOptionsCtx, (prev) => ({ ...prev, handleKeyDown }))
        ctx.set(selection.key, {
          view: (view: EditorView) =>
            providerView(
              new TooltipProvider({
                content: els.toolbar,
                debounce: 20,
                offset: 8,
                shouldShow: (v) => {
                  const { empty } = v.state.selection
                  const inCode = v.state.selection.$from.parent.type.name === "code_block"
                  const focused = v.hasFocus() || els.toolbar.contains(document.activeElement)
                  if (empty || inCode || !focused || !v.editable) {
                    if (!els.toolbar.contains(document.activeElement)) setLinking(false)
                    return false
                  }
                  setMarks(readMarks(v))
                  return true
                },
              }),
              view
            ),
        })
        ctx.set(slash.key, {
          view: (view: EditorView) => {
            const provider: SlashProvider = new SlashProvider({ content: els.slash, debounce: 0, offset: 6, shouldShow: (v) => detect(provider, v, "slash") })
            providers.slash = provider
            return providerView(provider, view)
          },
        })
        ctx.set(pageLink.key, {
          view: (view: EditorView) => {
            const provider: SlashProvider = new SlashProvider({ content: els.page, debounce: 0, offset: 6, shouldShow: (v) => detect(provider, v, "page") })
            providers.page = provider
            return providerView(provider, view)
          },
        })
      },
    }).then((created) => {
      if (cancelled) {
        void created.destroy()
        return
      }
      instance = created
      editor.current = created
      if (autoFocus) created.action((ctx) => ctx.get(editorViewCtx).focus())
    })

    const node = host.current
    return () => {
      cancelled = true
      editor.current = null
      void instance?.destroy()
      // destroy() leaves Milkdown's DOM behind, and Strict Mode mounts twice.
      node.replaceChildren()
    }
    // The editor loads `value` once. The parent remounts it to load new content.
  }, [])

  const applyLink = (href: string) => {
    const clean = href.trim()
    if (!clean) return
    run(callCommand(marks.link ? updateLinkCommand.key : toggleLinkCommand.key, { href: clean }))
    setLinking(false)
    run((ctx) => ctx.get(editorViewCtx).focus())
  }

  return (
    <>
      <div ref={host} data-docs-editor className="relative" />

      {createPortal(
        linking ? (
          <LinkForm
            current={marks.link}
            targets={targets}
            pagePath={pagePath}
            onApply={applyLink}
            onRemove={() => {
              run(callCommand(toggleLinkCommand.key))
              setLinking(false)
            }}
            onCancel={() => {
              setLinking(false)
              run((ctx) => ctx.get(editorViewCtx).focus())
            }}
          />
        ) : (
          <div role="toolbar" aria-label="Format" className="flex items-center gap-0.5 rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {(
              [
                ["Bold", BoldIcon, marks.strong, () => run(callCommand(toggleStrongCommand.key))],
                ["Italic", ItalicIcon, marks.emphasis, () => run(callCommand(toggleEmphasisCommand.key))],
                ["Code", CodeIcon, marks.code, () => run(callCommand(toggleInlineCodeCommand.key))],
                ["Link", LinkIcon, !!marks.link, () => setLinking(true)],
              ] as const
            ).map(([label, Icon, on, action]) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                aria-pressed={on}
                title={label}
                // Keep the editor's selection while clicking.
                onMouseDown={(e) => e.preventDefault()}
                onClick={action}
                className={cn(
                  "flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors outline-none hover:bg-sidebar-accent hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 [&_svg]:size-4",
                  on && "bg-sidebar-accent text-foreground"
                )}
              >
                <Icon />
              </button>
            ))}
          </div>
        ),
        els.toolbar
      )}

      {createPortal(
        menu?.kind === "slash" ? (
          <MenuList label="Insert a block" items={items as Block[]} active={active} onChoose={choose} empty="No block matches." render={(b) => (
            <>
              <b.icon className="size-4 text-muted-foreground" />
              <span className="flex-1">{b.label}</span>
              {b.hint && <span className="font-mono text-xs text-muted-foreground">{b.hint}</span>}
            </>
          )} />
        ) : null,
        els.slash
      )}

      {createPortal(
        menu?.kind === "page" ? (
          <MenuList label="Link to a page" items={items as LinkTarget[]} active={active} onChoose={choose} empty="No page matches. Keep typing, or press Escape." render={(p) => (
            <>
              <FileTextIcon className="size-4 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate">{p.title}</span>
              <span className="text-xs text-muted-foreground">{p.folder}</span>
            </>
          )} />
        ) : null,
        els.page
      )}
    </>
  )
}

function MenuList<T>({
  label,
  items,
  active,
  onChoose,
  render,
  empty,
}: {
  label: string
  items: T[]
  active: number
  onChoose: (item: T) => void
  render: (item: T) => React.ReactNode
  empty: string
}) {
  return (
    <div role="listbox" aria-label={label} className="w-64 rounded-lg bg-popover p-1 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
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
            className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none", i === active && "bg-accent text-accent-foreground")}
          >
            {render(item)}
          </button>
        ))
      )}
    </div>
  )
}

/** Inside the selection toolbar: link to a page by name, or paste any URL. */
function LinkForm({
  current,
  targets,
  pagePath,
  onApply,
  onRemove,
  onCancel,
}: {
  current: string | null
  targets: LinkTarget[]
  pagePath: string
  onApply: (href: string) => void
  onRemove: () => void
  onCancel: () => void
}) {
  const [text, setText] = React.useState(current ?? "")
  const [active, setActive] = React.useState(0)
  const pages = targets.filter((p) => matches(`${p.title} ${p.folder}`, text)).slice(0, 5)
  // Something that looks like an address links as typed. Otherwise the top page wins.
  const literal = /^(https?:\/\/|mailto:|\.{0,2}\/|#)/.test(text.trim())
  const options = [...(literal ? [{ kind: "url" as const }] : []), ...pages.map((p) => ({ kind: "page" as const, page: p }))]

  const pick = (i: number) => {
    const option = options[i]
    if (!option) return
    onApply(option.kind === "url" ? text : relativeLink(pagePath, option.page.path))
  }

  return (
    <div className="w-72 rounded-lg bg-popover p-1.5 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
      <input
        autoFocus
        value={text}
        onChange={(e) => {
          setText(e.target.value)
          setActive(0)
        }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault()
            setActive((i) => (options.length ? (i + (e.key === "ArrowDown" ? 1 : -1) + options.length) % options.length : 0))
          } else if (e.key === "Enter") {
            e.preventDefault()
            pick(active)
          } else if (e.key === "Escape") {
            e.preventDefault()
            onCancel()
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
            className={cn("flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none", i === active && "bg-accent text-accent-foreground")}
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
  )
}
