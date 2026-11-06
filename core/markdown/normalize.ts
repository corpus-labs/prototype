import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import remarkStringify from "remark-stringify"
import { unified } from "unified"

import { markdownStyle } from "./style"

const processor = unified().use(remarkParse).use(remarkGfm).use(remarkStringify, markdownStyle)

/** Rewrites a Markdown body in the house style. A body already in the style comes back unchanged. */
export function normalizeMarkdown(markdown: string): string {
  return String(processor.processSync(markdown))
}
