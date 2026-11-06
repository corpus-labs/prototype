// The Milkdown setup for docs pages, kept apart from React so tests can run it directly.
// Built from Milkdown's separate packages, not Crepe or the kit, which bring in Vue,
// CodeMirror, and KaTeX. See docs/decisions/proposed-docs-editor.md.
import { Editor, defaultValueCtx, editorViewOptionsCtx, remarkStringifyOptionsCtx, rootCtx } from "@milkdown/core"
import type { Ctx, MilkdownPlugin } from "@milkdown/ctx"
import { clipboard } from "@milkdown/plugin-clipboard"
import { history } from "@milkdown/plugin-history"
import { listener, listenerCtx } from "@milkdown/plugin-listener"
import { commonmark } from "@milkdown/preset-commonmark"
import { gfm } from "@milkdown/preset-gfm"
import { getMarkdown } from "@milkdown/utils"

import { markdownStyle } from "@core/markdown/style"

export type DocsEditorOptions = {
  root: HTMLElement
  /** The page body as Markdown, without frontmatter. */
  value: string
  onChange?: (markdown: string) => void
  /** More plugins, like the toolbar and menus, and their setup. */
  plugins?: MilkdownPlugin[]
  configure?: (ctx: Ctx) => void
  label?: string
}

export function createDocsEditor({ root, value, onChange, plugins = [], configure, label = "Page content" }: DocsEditorOptions) {
  return Editor.make()
    .config((ctx) => {
      ctx.set(rootCtx, root)
      ctx.set(defaultValueCtx, value)
      // Write in the house style. New bold and italic marks take their markers from it too.
      ctx.update(remarkStringifyOptionsCtx, (prev) => ({ ...prev, ...markdownStyle }))
      ctx.update(editorViewOptionsCtx, (prev) => ({
        ...prev,
        attributes: { class: "docs-prose", role: "textbox", "aria-multiline": "true", "aria-label": label, spellcheck: "true" },
      }))
      if (onChange) {
        ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prev) => {
          if (markdown !== prev) onChange(markdown)
        })
      }
      configure?.(ctx)
    })
    .use(commonmark)
    .use(gfm)
    .use(history)
    .use(listener)
    .use(clipboard)
    .use(plugins)
    .create()
}

export function readMarkdown(editor: Editor): string {
  return editor.action(getMarkdown())
}
