import * as React from "react"

export type Block =
  | { t: "front"; data: Record<string, string>; key: string }
  | { t: "h1" | "h2" | "h3"; text: string; key: string }
  | { t: "p"; text: string; key: string }
  | { t: "ul"; items: string[]; key: string }
  | { t: "code"; lang: string; text: string; key: string }
  | { t: "do" | "dont"; title: string; text: string; key: string }
  | { t: "preview"; attrs: Record<string, string>; key: string }
  | { t: "callout"; tone: string; text: string; key: string }

export function slug(s: string) {
  return s
    .toLowerCase()
    .replace(/[`’'"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function attrs(s: string) {
  const out: Record<string, string> = {}
  for (const m of s.matchAll(/([a-zA-Z_]+)="([^"]*)"/g)) out[m[1]] = m[2]
  return out
}

/** Parses the small MDX dialect Corpus pages use. Unknown syntax falls back to paragraphs. */
export function parseMdx(src: string): Block[] {
  const lines = src.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let key = "intro"
  let i = 0

  if (lines[0]?.trim() === "---") {
    const data: Record<string, string> = {}
    i = 1
    while (i < lines.length && lines[i].trim() !== "---") {
      const m = lines[i].match(/^([\w-]+):\s*(.*)$/)
      if (m) data[m[1]] = m[2]
      i++
    }
    i++
    blocks.push({ t: "front", data, key })
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i++
      continue
    }
    const h = trimmed.match(/^(#{1,3})\s+(.*)$/)
    if (h) {
      const level = h[1].length
      const text = h[2].trim()
      if (level > 1) key = slug(text) || key
      blocks.push({ t: level === 1 ? "h1" : level === 2 ? "h2" : "h3", text, key })
      i++
      continue
    }
    if (trimmed.startsWith("```")) {
      const lang = trimmed.slice(3).trim()
      const body: string[] = []
      i++
      while (i < lines.length && !lines[i].trim().startsWith("```")) body.push(lines[i++])
      i++
      blocks.push({ t: "code", lang, text: body.join("\n"), key })
      continue
    }
    const tag = trimmed.match(/^<(Do|Dont|Callout)\b([^>]*)>(.*)$/)
    if (tag) {
      const name = tag[1]
      const a = attrs(tag[2])
      const body: string[] = []
      let rest = tag[3]
      const close = `</${name}>`
      if (rest.includes(close)) {
        body.push(rest.slice(0, rest.indexOf(close)))
        i++
      } else {
        if (rest.trim()) body.push(rest)
        i++
        while (i < lines.length && !lines[i].includes(close)) body.push(lines[i++])
        if (i < lines.length) {
          rest = lines[i]
          const before = rest.slice(0, rest.indexOf(close)).trim()
          if (before) body.push(before)
          i++
        }
      }
      const text = body.map((x) => x.trim()).filter(Boolean).join(" ")
      if (name === "Callout") blocks.push({ t: "callout", tone: a.tone ?? "info", text, key })
      else blocks.push({ t: name === "Do" ? "do" : "dont", title: a.title ?? "", text, key })
      continue
    }
    const preview = trimmed.match(/^<Preview\b([^>]*)\/>$/)
    if (preview) {
      blocks.push({ t: "preview", attrs: attrs(preview[1]), key })
      i++
      continue
    }
    if (/^[-*]\s/.test(trimmed)) {
      const items: string[] = []
      while (i < lines.length && /^[-*]\s?/.test(lines[i].trim()) && lines[i].trim()) {
        items.push(lines[i].trim().replace(/^[-*]\s?/, ""))
        i++
      }
      blocks.push({ t: "ul", items, key })
      continue
    }
    const para: string[] = []
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,3}\s|```|<(Do|Dont|Callout|Preview)\b|[-*]\s)/.test(lines[i].trim())
    ) {
      para.push(lines[i].trim())
      i++
    }
    if (para.length) blocks.push({ t: "p", text: para.join(" "), key })
    else i++
  }
  return blocks
}

/**
 * Turns a link's href into an app route, or returns undefined when it isn't a
 * page this app knows. Docs pages provide one so their relative links open the
 * right page.
 */
export const LinkResolver = React.createContext<((href: string) => string | undefined) | null>(null)

const LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/
const LINK_CLASS = "font-medium underline decoration-border underline-offset-4 transition-colors hover:decoration-foreground"

/** Inline formatting: `code`, **bold**, and [links](href). */
export function Inline({ text }: { text: string }) {
  const resolve = React.useContext(LinkResolver)
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g)
  return (
    <>
      {parts.map((p, i) => {
        const link = p.match(LINK)
        if (link) {
          const [, label, href] = link
          const route = resolve?.(href)
          if (route)
            return (
              <a key={i} href={route} className={LINK_CLASS}>
                {label}
              </a>
            )
          if (/^https?:\/\//.test(href))
            return (
              <a key={i} href={href} target="_blank" rel="noreferrer" className={LINK_CLASS}>
                {label}
              </a>
            )
          // A link to a page this app doesn't have reads as plain text, not a broken link.
          return <React.Fragment key={i}>{label}</React.Fragment>
        }
        if (p.startsWith("`") && p.endsWith("`") && p.length > 1)
          return (
            <code key={i} className="rounded-[5px] bg-muted px-1 py-0.5 font-mono text-[0.86em]">
              {p.slice(1, -1)}
            </code>
          )
        if (p.startsWith("**") && p.endsWith("**"))
          return (
            <strong key={i} className="font-semibold">
              {p.slice(2, -2)}
            </strong>
          )
        return <React.Fragment key={i}>{p}</React.Fragment>
      })}
    </>
  )
}

/** Groups blocks into sections keyed by heading so views can link them. */
export function sectionize(blocks: Block[]) {
  const sections: { key: string; blocks: Block[] }[] = []
  for (const b of blocks) {
    const last = sections[sections.length - 1]
    if (!last || last.key !== b.key) sections.push({ key: b.key, blocks: [b] })
    else last.blocks.push(b)
  }
  return sections
}
