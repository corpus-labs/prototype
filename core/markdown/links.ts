import remarkGfm from "remark-gfm"
import remarkParse from "remark-parse"
import { unified } from "unified"

// Pages link to each other with standard relative Markdown links, so the files
// read correctly on GitHub and agents can follow them without help. Paths here
// are repository paths with forward slashes, like `docs/team/onboarding.md`.

/** The relative link from one page to another, as it's written in the Markdown. */
export function relativeLink(from: string, to: string): string {
  const fromDir = from.split("/").slice(0, -1)
  const target = to.split("/")
  let shared = 0
  while (shared < fromDir.length && shared < target.length - 1 && fromDir[shared] === target[shared]) shared++
  return [...fromDir.slice(shared).map(() => ".."), ...target.slice(shared)].join("/")
}

/**
 * The repository path a link points to. Returns null for links that leave the
 * repository: other sites, email, anchors on the same page, or paths above the root.
 */
export function resolveLink(from: string, href: string): string | null {
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//") || href.startsWith("#")) return null
  const path = href.split(/[?#]/)[0]
  if (!path) return null
  const out = path.startsWith("/") ? [] : from.split("/").slice(0, -1)
  for (const segment of path.split("/")) {
    if (segment === "" || segment === ".") continue
    if (segment === "..") {
      if (!out.length) return null
      out.pop()
      continue
    }
    try {
      out.push(decodeURIComponent(segment))
    } catch {
      out.push(segment)
    }
  }
  return out.join("/")
}

type MdNode = { type: string; url?: string; children?: MdNode[] }

const parser = unified().use(remarkParse).use(remarkGfm)

/** Every link target in a page body, in the order they appear. */
export function linksIn(body: string): string[] {
  const out: string[] = []
  const walk = (node: MdNode) => {
    if ((node.type === "link" || node.type === "definition") && node.url) out.push(node.url)
    node.children?.forEach(walk)
  }
  walk(parser.parse(body) as unknown as MdNode)
  return out
}
