import type { Options } from "remark-stringify";

/**
 * The one way Corpus writes Markdown. The docs editor and normalizeMarkdown()
 * both use it, so opening and saving a page never rewrites lines nobody touched.
 * See docs/decisions/proposed-docs-editor.md.
 */
export const markdownStyle: Options = {
  bullet: "-",
  emphasis: "_",
  strong: "*",
  fence: "`",
  fences: true,
  rule: "-",
  ruleRepetition: 3,
  ruleSpaces: false,
  listItemIndent: "one",
  incrementListMarker: true,
  setext: false,
  closeAtx: false,
  quote: '"',
};
