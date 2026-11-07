// Exploration: plugins for AI harnesses, two-way. Sample data only.
// See docs/decisions/0001-knowledge-notebook.md, decision 6.

export type Plugin = {
  id: string;
  name: string;
  /** Two letters for the tile, since the prototype doesn't carry other companies' logos. */
  tile: string;
  covers: string;
  installed: boolean;
  /** Who on the team has it, when installed. */
  people?: number;
};

export const plugins: Plugin[] = [
  {
    id: "claude",
    name: "Claude",
    tile: "Cl",
    covers: "Claude Code and Claude Desktop",
    installed: true,
    people: 6,
  },
  {
    id: "codex",
    name: "Codex",
    tile: "Cx",
    covers: "The Codex CLI and app",
    installed: true,
    people: 3,
  },
  { id: "cursor", name: "Cursor", tile: "Cu", covers: "Cursor’s agent and chat", installed: false },
  { id: "zai", name: "Z.ai", tile: "Z", covers: "Z.ai’s GLM coding tools", installed: false },
  {
    id: "deepseek",
    name: "DeepSeek",
    tile: "DS",
    covers: "Harnesses running DeepSeek models",
    installed: false,
  },
  {
    id: "gemini",
    name: "Gemini CLI",
    tile: "Ge",
    covers: "Google’s terminal agent",
    installed: false,
  },
];

export type SavedNote = {
  id: string;
  text: string;
  /** The tool that saved it, and the person using it. */
  from: string;
  by: string;
  page: { project: string; title: string; route: string };
  status: "review" | "approved";
  when: string;
};

/** What agents saved back to Corpus this week. A person approves each before readers see it. */
export const savedNotes: SavedNote[] = [
  {
    id: "n-refunds",
    text: "Refunds now take 3 business days, not 5 to 7.",
    from: "Claude Code",
    by: "Mitch",
    page: { project: "Customer help", title: "Refunds", route: "help-refunds" },
    status: "approved",
    when: "Monday",
  },
  {
    id: "n-loading",
    text: "Use Button’s loading state instead of a separate spinner.",
    from: "Codex",
    by: "Priya",
    page: { project: "Charged UI", title: "Button", route: "component-button" },
    status: "review",
    when: "Today",
  },
  {
    id: "n-rollback",
    text: "Roll back a deploy from the dashboard’s history, then rerun the checks.",
    from: "Claude Desktop",
    by: "Sam",
    page: { project: "Web team handbook", title: "Deploying a site", route: "handbook-deploying" },
    status: "review",
    when: "Yesterday",
  },
  {
    id: "n-staging",
    text: "Staging resets every Monday at 6 am, so don’t leave test content there.",
    from: "Codex",
    by: "Mitch",
    page: { project: "Web team handbook", title: "Deploying a site", route: "handbook-deploying" },
    status: "approved",
    when: "Tuesday",
  },
];
