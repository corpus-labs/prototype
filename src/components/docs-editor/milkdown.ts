// The Milkdown setup for docs pages, kept apart from React so tests can run it directly.
// Built from Milkdown's separate packages, not Crepe or the kit, which bring in Vue,
// CodeMirror, and KaTeX. See docs/decisions/proposed-docs-editor.md.
import {
  Editor,
  defaultValueCtx,
  editorViewOptionsCtx,
  remarkStringifyOptionsCtx,
  rootCtx,
} from "@milkdown/core";
import type { Ctx, MilkdownPlugin } from "@milkdown/ctx";
import { block } from "@milkdown/plugin-block";
import { clipboard } from "@milkdown/plugin-clipboard";
import { cursor, dropIndicatorConfig } from "@milkdown/plugin-cursor";
import { history } from "@milkdown/plugin-history";
import { listener, listenerCtx } from "@milkdown/plugin-listener";
import { prism, prismConfig } from "@milkdown/plugin-prism";
import { upload } from "@milkdown/plugin-upload";
import { commonmark, updateCodeBlockLanguageCommand } from "@milkdown/preset-commonmark";
import type { Refractor } from "refractor/core";
import bash from "refractor/bash";
import css from "refractor/css";
import diff from "refractor/diff";
import go from "refractor/go";
import markup from "refractor/markup";
import java from "refractor/java";
import javascript from "refractor/javascript";
import json from "refractor/json";
import markdown from "refractor/markdown";
import php from "refractor/php";
import python from "refractor/python";
import ruby from "refractor/ruby";
import rust from "refractor/rust";
import scss from "refractor/scss";
import sql from "refractor/sql";
import typescript from "refractor/typescript";
import yaml from "refractor/yaml";
import { columnResizingPlugin, gfm } from "@milkdown/preset-gfm";
import { getMarkdown } from "@milkdown/utils";

import { markdownStyle } from "@core/markdown/style";

/** The languages the editor highlights, matching the picker's list. */
const HIGHLIGHT_LANGUAGES = [
  typescript,
  javascript,
  json,
  bash,
  css,
  scss,
  markup,
  markdown,
  yaml,
  sql,
  python,
  diff,
  rust,
  go,
  java,
  php,
  ruby,
];

export type DocsEditorOptions = {
  root: HTMLElement;
  /** The page body as Markdown, without frontmatter. */
  value: string;
  onChange?: (markdown: string) => void;
  /** More plugins, like the toolbar and menus, and their setup. */
  plugins?: MilkdownPlugin[];
  configure?: (ctx: Ctx) => void;
  label?: string;
};

export function createDocsEditor({
  root,
  value,
  onChange,
  plugins = [],
  configure,
  label = "Page content",
}: DocsEditorOptions) {
  return (
    Editor.make()
      .config((ctx) => {
        ctx.set(rootCtx, root);
        ctx.set(defaultValueCtx, value);
        // Write in the house style. New bold and italic marks take their markers from it too.
        ctx.update(remarkStringifyOptionsCtx, (prev) => ({ ...prev, ...markdownStyle }));
        ctx.update(editorViewOptionsCtx, (prev) => ({
          ...prev,
          attributes: {
            class: "docs-prose",
            role: "textbox",
            "aria-multiline": "true",
            "aria-label": label,
            spellcheck: "true",
          },
        }));
        // The line shown where a dragged block would land.
        ctx.set(dropIndicatorConfig.key, {
          width: 2,
          color: "color-mix(in oklch, var(--foreground) 55%, transparent)",
          class: "docs-editor-drop-line",
        });
        // Refractor arrives as its empty core (see the alias in vite.config.ts),
        // so the languages the picker offers are the ones registered here.
        ctx.update(prismConfig.key, (prev) => ({
          ...prev,
          configureRefractor: (instance: Refractor) => {
            for (const language of HIGHLIGHT_LANGUAGES) instance.register(language);
            return instance;
          },
        }));
        if (onChange) {
          ctx.get(listenerCtx).markdownUpdated((_ctx, markdown, prev) => {
            if (markdown !== prev) onChange(markdown);
          });
        }
        configure?.(ctx);
      })
      .use(commonmark)
      .use(gfm)
      // The gfm preset ships column resizing but does not enable it, and
      // commonmark exports this command without registering it.
      .use(columnResizingPlugin)
      .use(updateCodeBlockLanguageCommand)
      .use(history)
      .use(listener)
      .use(clipboard)
      .use(cursor)
      .use(block)
      .use(prism)
      .use(upload)
      .use(plugins)
      .create()
  );
}

export function readMarkdown(editor: Editor): string {
  return editor.action(getMarkdown());
}
