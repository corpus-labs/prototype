import { z } from "zod"

// Docs pages keep their metadata in YAML frontmatter. People edit `title` and
// `description` as fields above the page, and every other line is kept exactly
// as written. These helpers only handle flat string fields. Phase 1's YAML
// loader replaces them.

const NO_TITLE = "The page has no title. Add `title:` to its frontmatter."

export const pageMetaSchema = z.object({
  // The message covers a missing field and an empty one alike.
  title: z.string({ error: NO_TITLE }).trim().min(1, NO_TITLE),
  description: z.string().default(""),
})

export type PageMeta = z.infer<typeof pageMetaSchema>

/** A page split into its frontmatter lines (without the `---` fences) and its Markdown body. */
export type SplitPage = { lines: string[]; body: string }

const FENCED = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/

export function splitFrontmatter(source: string): SplitPage {
  const m = source.match(FENCED)
  if (!m) return { lines: [], body: source }
  // One blank line separates the frontmatter from the body, and belongs to neither.
  return { lines: m[1].split(/\r?\n/), body: source.slice(m[0].length).replace(/^\r?\n/, "") }
}

export function joinFrontmatter({ lines, body }: SplitPage): string {
  return lines.length ? `---\n${lines.join("\n")}\n---\n\n${body}` : body
}

function fieldPattern(key: string) {
  return new RegExp(`^${key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}:[ \\t]?(.*)$`)
}

export function readField(lines: string[], key: string): string | undefined {
  const pattern = fieldPattern(key)
  for (const line of lines) {
    const m = line.match(pattern)
    if (m) return unquote(m[1].trim())
  }
  return undefined
}

/** Sets a field. An unchanged value keeps its original spelling, so saving doesn't touch the line. */
export function writeField(lines: string[], key: string, value: string): string[] {
  const pattern = fieldPattern(key)
  const i = lines.findIndex((l) => pattern.test(l))
  const line = `${key}: ${quote(value)}`
  if (i === -1) return [...lines, line]
  if (readField([lines[i]], key) === value) return lines
  return lines.map((l, j) => (j === i ? line : l))
}

export function readPageMeta(lines: string[]) {
  return pageMetaSchema.safeParse({ title: readField(lines, "title"), description: readField(lines, "description") })
}

function unquote(value: string) {
  if (value.length >= 2 && value.startsWith('"') && value.endsWith('"')) {
    try {
      return JSON.parse(value) as string
    } catch {
      return value.slice(1, -1)
    }
  }
  if (value.length >= 2 && value.startsWith("'") && value.endsWith("'")) return value.slice(1, -1).replace(/''/g, "'")
  return value
}

/** A plain YAML scalar can't start with these characters or contain `: ` or ` #`, so those get double quotes. */
function quote(value: string) {
  return value === "" || /^[\s'"&*!|>%@`#,[\]{}?:-]|: | #|\s$/.test(value) ? JSON.stringify(value) : value
}
