import { components, guidelineFiles, tokens, workspace, type ComponentDoc } from "@/data/workspace"
import { parseMdx, slug } from "@/lib/mdx-lite"

export type Line = {
  text: string
  key?: string
  kind?: "h1" | "h2" | "meta" | "code" | "table" | "do" | "dont" | "note" | "muted"
}

export type Ctx = { resolved: string[] }

const tokenValue = (id: string) => tokens.find((t) => t.id === id)?.value ?? ""

export function includeSnippet(machine: string, args: Record<string, string>) {
  const parts = Object.entries(args).map(([k, v]) => `${k}: '${v}'`)
  // No arguments means no empty `{  }` either.
  if (!parts.length) return `{{ include('${machine}') }}`
  return `{{ include('${machine}', { ${parts.join(", ")} }) }}`
}

/** Sections added once an agent question has been answered and committed. */
export function extraSections(c: ComponentDoc, ctx: Ctx) {
  const out: { key: string; title: string; rule: string; body: string; do: string; dont: string; preview?: string }[] = []
  if (c.id === "button" && ctx.resolved.includes("q-loading")) {
    out.push({
      key: "loading",
      title: "Loading state",
      rule: "MUST set loading: true while a request is in flight and keep the label unchanged.",
      body: "Set `loading: true` while the request is in flight. Keep the label so the button keeps its width, and ignore repeat clicks until the request finishes.",
      do: "Show the spinner beside “Save changes”.",
      dont: "Replace the label with “Loading…” or hide the button.",
      preview: "loading",
    })
  }
  if (c.id === "card" && ctx.resolved.includes("q-nesting")) {
    out.push({
      key: "nesting",
      title: "Nesting",
      rule: "MUST NOT place a Card inside another Card. Use a list in the body slot.",
      body: "Don’t put a Card inside another Card. Nested borders make the hierarchy hard to read. Use a list or a plain section inside the card body instead.",
      do: "Show related items as a simple list in the body slot.",
      dont: "Place a second bordered card inside the first.",
    })
  }
  return out
}

/** Every rule for a component, in the order agents receive them in Markdown. People see the same list. */
export function componentRules(c: ComponentDoc, ctx: Ctx): string[] {
  return [
    ...(c.examples ?? []).map((e) => e.rule),
    ...(c.agentRules ?? []).filter((r) => r.key === "usage").map((r) => r.text),
    ...extraSections(c, ctx).map((x) => x.rule),
    ...(c.agentRules ?? []).filter((r) => r.key === "a11y").map((r) => r.text),
  ]
}

export function componentLines(c: ComponentDoc, ctx: Ctx): Line[] {
  const L: Line[] = []
  const add = (text: string, key?: string, kind?: Line["kind"]) => L.push({ text, key, kind })
  const extras = extraSections(c, ctx)

  add(`# ${c.name}`, "summary", "h1")
  add("", "summary")
  add(`id: ${c.machine}`, "summary", "meta")
  add(`status: ${c.status}${c.replacedBy ? ` (use ${c.replacedBy} instead)` : ""}`, "summary", "meta")
  add(`source: ${c.file}`, "summary", "meta")
  add("", "summary")
  add(c.summary, "summary")

  if (c.whenToUse?.length || c.whenNotToUse?.length) {
    add("")
    add("## When to use", "usage", "h2")
    c.whenToUse?.forEach((x) => add(`- ${x}`, "usage"))
    c.whenNotToUse?.forEach((x) => add(`- Avoid: ${x}`, "usage"))
  }

  // Keyed "rules" so Split view lights them up with the Rules section on the people side.
  const rules = componentRules(c, ctx)
  if (rules.length) {
    add("")
    add("## Rules", "rules", "h2")
    rules.forEach((r) => add(`- ${r}`, "rules"))
  }

  add("")
  add("## Props", "props", "h2")
  add("| name | type | default | notes |", "props", "table")
  add("| --- | --- | --- | --- |", "props", "table")
  c.props.forEach((p) =>
    add(
      `| ${p.name}${p.required ? " (required)" : ""} | ${p.type.replace(/\|/g, "\\|")} | ${p.default ?? ""} | ${p.description} |`,
      "props",
      "table"
    )
  )
  if (c.slots?.length) {
    add("")
    add("Slots:", "props")
    c.slots.forEach((s) => add(`- ${s.name}: ${s.description}`, "props"))
  }

  add("")
  add("## Examples", "preview", "h2")
  const firstVariant = c.props.find((p) => p.name === "variant" || p.name === "tone")
  const defaultArgs: Record<string, string> = {}
  const labelProp = c.props.find((p) => p.name === "label" || p.name === "title" || p.name === "heading")
  if (firstVariant) defaultArgs[firstVariant.name] = firstVariant.type.split(" | ")[0]
  if (labelProp) defaultArgs[labelProp.name] = c.id === "button" ? "Save changes" : `Example ${labelProp.name}`
  add(includeSnippet(c.machine, defaultArgs), "preview", "code")
  c.examples?.forEach((e) => {
    add("")
    add(`Do: ${e.do.title}. ${e.do.caption}`, "dodont", "do")
    e.do.code.split("\n").forEach((x) => add(x, "dodont", "code"))
    add(`Don't: ${e.dont.title}. ${e.dont.caption}`, "dodont", "dont")
    e.dont.code.split("\n").forEach((x) => add(x, "dodont", "code"))
  })
  extras.forEach((x) => {
    add("")
    add(`Do: ${x.do}`, x.key, "do")
    add(`Don't: ${x.dont}`, x.key, "dont")
  })

  if (c.tokens?.length) {
    add("")
    add("## Tokens", "tokens", "h2")
    c.tokens.forEach((t) => add(`${t.padEnd(28)} ${tokenValue(t)}`, "tokens", "code"))
  }
  if (c.related?.length) {
    add("")
    add("## Related", "related", "h2")
    add(c.related.join(", "), "related")
  }
  return L
}

export function componentJSON(c: ComponentDoc, ctx: Ctx): Line[] {
  const extras = extraSections(c, ctx)
  const fields: [string, unknown, string][] = [
    ["id", c.machine, "summary"],
    ["name", c.name, "summary"],
    ["status", c.status, "summary"],
    ["summary", c.summary, "summary"],
  ]
  if (c.whenToUse) fields.push(["use_when", c.whenToUse, "usage"])
  if (c.whenNotToUse) fields.push(["avoid_when", c.whenNotToUse, "usage"])
  const rules = [
    ...(c.examples ?? []).map((e) => e.rule),
    ...(c.agentRules ?? []).map((r) => r.text),
    ...extras.map((x) => x.rule),
  ]
  if (rules.length) fields.push(["rules", rules, "rules"])
  fields.push([
    "props",
    c.props.map((p) => ({ name: p.name, type: p.type, ...(p.default ? { default: p.default } : {}), ...(p.required ? { required: true } : {}) })),
    "props",
  ])
  if (c.examples?.length)
    fields.push([
      "examples",
      c.examples.flatMap((e) => [
        { kind: "do", title: e.do.title, code: e.do.code },
        { kind: "dont", title: e.dont.title, code: e.dont.code },
      ]),
      "dodont",
    ])
  if (c.tokens?.length) fields.push(["tokens", Object.fromEntries(c.tokens.map((t) => [t, tokenValue(t)])), "tokens"])
  if (c.related?.length) fields.push(["related", c.related, "related"])

  const L: Line[] = [{ text: "{", kind: "code" }]
  fields.forEach(([name, value, key], i) => {
    const json = JSON.stringify(value, null, 2).split("\n")
    json.forEach((row, j) => {
      const text = (j === 0 ? `  "${name}": ${row}` : `  ${row}`) + (j === json.length - 1 && i < fields.length - 1 ? "," : "")
      L.push({ text, key, kind: "code" })
    })
  })
  L.push({ text: "}", kind: "code" })
  return L
}

/** MDX to plain Markdown for agents, keyed by section so both views line up. */
export function guideLines(body: string): Line[] {
  const blocks = parseMdx(body)
  const L: Line[] = []
  for (const b of blocks) {
    switch (b.t) {
      case "front":
        if (b.data.title) L.push({ text: `# ${b.data.title}`, key: "intro", kind: "h1" })
        if (b.data.component) L.push({ text: `component: ${b.data.component}`, key: "intro", kind: "meta" })
        if (b.data.description) {
          L.push({ text: "", key: "intro" })
          L.push({ text: b.data.description, key: "intro" })
        }
        break
      case "h1":
      case "h2":
      case "h3":
        L.push({ text: "" })
        L.push({ text: `${b.t === "h3" ? "###" : "##"} ${b.text}`, key: b.key, kind: "h2" })
        break
      case "p":
        L.push({ text: "", key: b.key })
        L.push({ text: b.text, key: b.key })
        break
      case "ul":
        b.items.forEach((x) => L.push({ text: `- ${x}`, key: b.key }))
        break
      case "code":
        b.text.split("\n").forEach((x) => L.push({ text: x, key: b.key, kind: "code" }))
        break
      case "do":
        L.push({ text: `Do: ${b.title ? b.title + ". " : ""}${b.text}`, key: b.key, kind: "do" })
        break
      case "dont":
        L.push({ text: `Don't: ${b.title ? b.title + ". " : ""}${b.text}`, key: b.key, kind: "dont" })
        break
      case "preview": {
        const { component, ...rest } = b.attrs
        const c = components.find((x) => x.id === component)
        L.push({ text: "", key: b.key })
        L.push({ text: includeSnippet(c?.machine ?? `charged_ui:${component}`, rest), key: b.key, kind: "code" })
        break
      }
      case "callout":
        L.push({ text: "", key: b.key })
        L.push({ text: `> Note: ${b.text}`, key: b.key, kind: "note" })
        break
    }
  }
  return L
}

export function tokenLines(group?: string): Line[] {
  const L: Line[] = [{ text: "# Tokens", kind: "h1", key: "intro" }, { text: "" }]
  const groups = ["color", "type", "space", "radius"].filter((g) => !group || g === group)
  for (const g of groups) {
    L.push({ text: `## ${g}`, kind: "h2", key: g })
    tokens
      .filter((t) => t.group === g)
      .forEach((t) => L.push({ text: `${t.id.padEnd(28)} ${t.value.padEnd(28)} ${t.note}`, key: g, kind: "code" }))
    L.push({ text: "" })
  }
  return L
}

export function tokenExport(format: "css" | "tailwind" | "dtcg") {
  const cssName = (id: string) => "--" + id.replace(/\./g, "-")
  const flat = tokens.filter((t) => t.group !== "type")
  if (format === "css") {
    return [":root {", ...flat.map((t) => `  ${cssName(t.id)}: ${t.value};`), "}"].join("\n")
  }
  if (format === "tailwind") {
    const tw = (id: string) =>
      id.startsWith("color.") ? "--color-" + id.slice(6).replace(/\./g, "-")
      : id.startsWith("space.") ? "--spacing-" + id.slice(6)
      : id.startsWith("radius.") ? "--radius-" + id.slice(7)
      : cssName(id)
    return [
      '@import "tailwindcss";',
      "",
      "@theme {",
      '  --font-sans: "Geist", ui-sans-serif, system-ui, sans-serif;',
      '  --font-mono: "Geist Mono", ui-monospace, monospace;',
      ...flat.map((t) => `  ${tw(t.id)}: ${t.value};`),
      "}",
    ].join("\n")
  }
  const tree: Record<string, unknown> = {}
  for (const t of tokens) {
    const parts = t.id.split(".")
    let node = tree as Record<string, unknown>
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        node[p] = {
          $type: t.group === "color" ? "color" : t.group === "type" ? "typography" : "dimension",
          $value: t.value,
          $description: t.note,
        }
      } else {
        node[p] = (node[p] as Record<string, unknown>) ?? {}
        node = node[p] as Record<string, unknown>
      }
    })
  }
  return JSON.stringify(tree, null, 2)
}

export function llmsTxt(ctx: Ctx) {
  const lines = [
    `# ${workspace.name}`,
    "",
    `> ${workspace.description} Every page is available as Markdown by adding .md to its URL.`,
    "",
    "## Components",
    ...components.map(
      (c) => `- [${c.name}](https://${workspace.site}/components/${c.id}.md): ${c.summary}${c.status !== "stable" ? ` (${c.status})` : ""}`
    ),
    "",
    "## Guidelines",
    ...guidelineFiles.map((g) => `- [${g.title}](https://${workspace.site}/guidelines/${g.id}.md): ${g.description}`),
    "",
    "## Tokens",
    `- [All tokens](https://${workspace.site}/tokens.md): ${tokens.length} tokens for color, type, space, and radius.`,
  ]
  if (ctx.resolved.length) lines.push("", `<!-- ${ctx.resolved.length} new answers since last week -->`)
  return lines.join("\n")
}

export function estimateTokens(lines: Line[]) {
  const chars = lines.reduce((n, l) => n + l.text.length + 1, 0)
  return Math.max(1, Math.round(chars / 3.8))
}

export type Issue = { rule: string; message: string; line: number }

export function checkUsage(code: string): Issue[] {
  const issues: Issue[] = []
  const lines = code.split("\n")
  lines.forEach((row, i) => {
    if (/<a\b[^>]*class="[^"]*\bbtn\b/.test(row))
      issues.push({ rule: "button/no-raw-anchor", message: "Pass href to charged_ui:button instead of styling an <a> with button classes.", line: i + 1 })
    const label = row.match(/label:\s*'([^']+)'/)?.[1] ?? row.match(/>\s*([^<]{2,40})\s*<\/(a|button)>/)?.[1]
    if (label && /^(click here|submit|ok|go)$/i.test(label.trim()))
      issues.push({ rule: "button/label-verb", message: `“${label.trim()}” doesn’t say what happens. Try “Save changes”.`, line: i + 1 })
    if (/margin(-bottom)?:\s*\d+px/.test(row))
      issues.push({ rule: "layout/use-space-tokens", message: "Use a space token. Form fields stack with space.4.", line: i + 1 })
  })
  const primaries = (code.match(/variant:\s*'primary'/g) ?? []).length
  if (primaries > 1)
    issues.push({ rule: "button/one-primary", message: `Found ${primaries} primary buttons. Keep one per view.`, line: lines.findIndex((l) => /variant:\s*'primary'/.test(l)) + 1 })
  return issues
}

export function searchDocs(query: string, ctx: Ctx, files: Record<string, string>) {
  const q = query.toLowerCase().trim()
  if (!q) return []
  const words = q.split(/\s+/).filter((w) => w.length > 2)
  const hits: { source: string; heading: string; text: string; score: number }[] = []
  const scan = (source: string, body: string) => {
    let heading = "Introduction"
    for (const b of parseMdx(body)) {
      if (b.t === "h2" || b.t === "h3") heading = b.text
      const text = b.t === "p" || b.t === "do" || b.t === "dont" || b.t === "callout" ? b.text : b.t === "ul" ? b.items.join(" ") : ""
      if (!text) continue
      const hay = (heading + " " + text).toLowerCase()
      const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0)
      if (score > 0) hits.push({ source, heading, text, score })
    }
  }
  guidelineFiles.forEach((g) => scan(`guidelines/${g.id}.md`, files[g.id] ?? g.body))
  for (const c of components) {
    if (files[c.id]) scan(`components/${c.id}.md`, files[c.id])
    extraSections(c, ctx).forEach((x) => {
      const hay = (x.title + " " + x.body).toLowerCase()
      const score = words.reduce((s, w) => s + (hay.includes(w) ? 1 : 0), 0) + 1
      if (score > 1) hits.push({ source: `components/${c.id}.md`, heading: x.title, text: x.body, score })
    })
  }
  const seen = new Set<string>()
  return hits
    .sort((a, b) => b.score - a.score)
    .filter((h) => {
      const k = h.source + h.heading
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
    .slice(0, 3)
}

export { slug }
