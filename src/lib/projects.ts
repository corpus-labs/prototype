// Exploration: several projects in one Corpus install. See docs/decisions/proposed-projects-and-docs.md.
import {
  agentStats,
  components,
  docsProjectOf,
  docsProjects,
  guidelineFiles,
  questions,
  tokens,
  workspace,
  type DocPage,
  type ProjectKind,
} from "@/data/workspace";
import { useStore } from "@/lib/store";

export type ProjectId = "charged-ui" | "handbook" | "help";

export type ProjectSummary = {
  id: ProjectId;
  name: string;
  kind: ProjectKind;
  description: string;
  site: string;
  repo: string;
  /** The route a project opens on. */
  home: string;
  requests: number;
  /** What `requests` counts, in the words the card shows. */
  requestsLabel: string;
  /** Questions with no answer in the docs. */
  open: number;
  updated: string;
  counts: [string, number][];
  /** A docs project's pages, for its preview. */
  pages?: DocPage[];
};

export const KIND_LABEL: Record<ProjectKind, string> = {
  "design-system": "Design system",
  docs: "Docs",
  "help-center": "Help center",
};

export function useProjects(): ProjectSummary[] {
  const { resolved, commits } = useStore();
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
      requestsLabel: "Agent requests",
      open: questions.filter((q) => q.status === "gap" && !resolved.includes(q.id)).length,
      updated: commits[0].when,
      counts: [
        ["Components", components.length],
        ["Tokens", tokens.length],
        ["Guidelines", guidelineFiles.length],
      ],
    },
    ...docsProjects.map((d): ProjectSummary => ({
      id: d.id,
      name: d.name,
      kind: d.kind,
      description: d.description,
      site: d.site,
      repo: d.repo,
      home: d.id,
      requests: d.requests,
      requestsLabel: d.kind === "help-center" ? "Questions" : "Agent requests",
      open: d.questions.filter((q) => q.status === "gap").length,
      updated: d.updated,
      counts: [
        ["Pages", d.pages.length],
        ["Folders", foldersOf(d.pages).length],
      ],
      pages: d.pages,
    })),
  ];
}

/** Which project a route belongs to. The projects dashboard belongs to none. */
export function projectOf(route: string): ProjectId | null {
  if (route === "projects") return null;
  return docsProjectOf(route)?.id ?? "charged-ui";
}

export function useCurrentProject(route: string) {
  const id = projectOf(route);
  return useProjects().find((p) => p.id === id) ?? null;
}

/** Pages grouped by folder, in the order folders first appear. */
export function foldersOf(pages: DocPage[]): [string, DocPage[]][] {
  const out = new Map<string, DocPage[]>();
  for (const p of pages) out.set(p.folder, [...(out.get(p.folder) ?? []), p]);
  return [...out];
}
