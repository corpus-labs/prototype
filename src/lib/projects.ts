// Exploration: several projects in one Corpus install. See docs/decisions/proposed-projects-and-docs.md.
import { agentStats, components, guidelineFiles, handbook, questions, tokens, workspace, type DocPage, type ProjectKind } from "@/data/workspace"
import { useStore } from "@/lib/store"

export type ProjectId = "charged-ui" | "handbook"

export type ProjectSummary = {
  id: ProjectId
  name: string
  kind: ProjectKind
  description: string
  site: string
  repo: string
  /** The route a project opens on. */
  home: string
  requests: number
  /** Agent questions with no answer in the docs. */
  open: number
  updated: string
  counts: [string, number][]
}

export const KIND_LABEL: Record<ProjectKind, string> = { "design-system": "Design system", docs: "Docs" }

export function useProjects(): ProjectSummary[] {
  const { resolved, commits } = useStore()
  return [
    {
      id: "charged-ui",
      name: workspace.name,
      kind: "design-system",
      description: workspace.description,
      site: workspace.site,
      repo: workspace.repo,
      home: "overview",
      requests: agentStats.week.reduce((a, b) => a + b, 0),
      open: questions.filter((q) => q.status === "gap" && !resolved.includes(q.id)).length,
      updated: commits[0].when,
      counts: [
        ["Components", components.length],
        ["Tokens", tokens.length],
        ["Guidelines", guidelineFiles.length],
      ],
    },
    {
      id: "handbook",
      name: handbook.name,
      kind: "docs",
      description: handbook.description,
      site: handbook.site,
      repo: handbook.repo,
      home: "handbook",
      requests: handbook.requests,
      open: handbook.questions.filter((q) => q.status === "gap").length,
      updated: handbook.updated,
      counts: [
        ["Pages", handbook.pages.length],
        ["Folders", foldersOf(handbook.pages).length],
      ],
    },
  ]
}

/** Which project a route belongs to. The projects dashboard belongs to none. */
export function projectOf(route: string): ProjectId | null {
  if (route === "projects") return null
  if (route === "handbook" || route.startsWith("handbook-")) return "handbook"
  return "charged-ui"
}

export function useCurrentProject(route: string) {
  const id = projectOf(route)
  return useProjects().find((p) => p.id === id) ?? null
}

/** Pages grouped by folder, in the order folders first appear. */
export function foldersOf(pages: DocPage[]): [string, DocPage[]][] {
  const out = new Map<string, DocPage[]>()
  for (const p of pages) out.set(p.folder, [...(out.get(p.folder) ?? []), p])
  return [...out]
}
