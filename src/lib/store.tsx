import * as React from "react";

import {
  componentFiles,
  components,
  guidelineFiles,
  initialCommits,
  type Commit,
} from "@/data/workspace";

export type Theme = "system" | "light" | "dark";
export type Base = "neutral" | "zinc" | "stone" | "slate" | "gray";
export type Reader = "people" | "split" | "agents";
export type Provider = "anthropic" | "openai" | "openrouter" | "ollama";

type Publishing = {
  buildOnPush: boolean;
  llms: boolean;
  markdown: boolean;
  mcp: boolean;
  mcpToken: boolean;
  badge: boolean;
};

type AI = {
  provider: Provider;
  model: string;
  key: string;
  editor: boolean;
  site: boolean;
  drafts: boolean;
  perHour: number;
};

type Store = {
  theme: Theme;
  setTheme: (t: Theme) => void;
  dark: boolean;
  base: Base;
  setBase: (b: Base) => void;
  reader: Reader;
  setReader: (r: Reader) => void;
  files: Record<string, string>;
  saved: Record<string, string>;
  setFile: (id: string, body: string) => void;
  commit: (input: { fileId: string; message: string; mode: "main" | "pr" }) => Commit;
  commits: Commit[];
  resolved: string[];
  inReview: string[];
  pendingDraft: string | null;
  setPendingDraft: (id: string | null) => void;
  ai: AI;
  setAI: (patch: Partial<AI>) => void;
  publishing: Publishing;
  setPublishing: (patch: Partial<Publishing>) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
};

const StoreContext = React.createContext<Store | null>(null);

function read<T extends string>(key: string, fallback: T, allowed: readonly T[]): T {
  try {
    const v = window.localStorage.getItem(key) as T | null;
    return v && allowed.includes(v) ? v : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    /* storage can be unavailable; the prototype still works without it */
  }
}

export function templateFor(id: string) {
  const c = components.find((x) => x.id === id);
  if (!c) return "";
  return `---
component: ${c.machine}
status: ${c.status}
---

${c.summary}

## When to use

- 
`;
}

function initialFiles() {
  const files: Record<string, string> = { ...componentFiles };
  for (const g of guidelineFiles) files[g.id] = g.body;
  return files;
}

// The viewer hosting the published page may set data-theme itself; "System"
// hands control back to whatever it set.
const hostTheme =
  typeof document !== "undefined" ? document.documentElement.getAttribute("data-theme") : null;

function useSystemDark() {
  const [dark, setDark] = React.useState(
    () =>
      typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches,
  );
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => setDark(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return dark;
}

/**
 * Switches every color in the same frame. Without this, elements with color
 * transitions fade to the new theme while everything else snaps.
 */
function withoutTransitions(apply: () => void) {
  const root = document.documentElement;
  root.setAttribute("data-switching-theme", "");
  apply();
  // The first frame paints the new colors. The second turns transitions back on.
  requestAnimationFrame(() =>
    requestAnimationFrame(() => root.removeAttribute("data-switching-theme")),
  );
}

let shaSeed = 0x5c3a91;
function nextSha() {
  shaSeed = (shaSeed * 1103515245 + 12345) & 0x7fffffff;
  return shaSeed.toString(16).padStart(7, "0").slice(0, 7);
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = React.useState<Theme>(() =>
    read("corpus.theme", "system", ["system", "light", "dark"] as const),
  );
  const [base, setBaseState] = React.useState<Base>(() =>
    read("corpus.base", "neutral", ["neutral", "zinc", "stone", "slate", "gray"] as const),
  );
  const [reader, setReaderState] = React.useState<Reader>(() =>
    read("corpus.reader", "people", ["people", "split", "agents"] as const),
  );
  const systemDark = useSystemDark();
  const [files, setFiles] = React.useState<Record<string, string>>(initialFiles);
  const [saved, setSaved] = React.useState<Record<string, string>>(initialFiles);
  const [commits, setCommits] = React.useState<Commit[]>(initialCommits);
  const [resolved, setResolved] = React.useState<string[]>([]);
  const [inReview, setInReview] = React.useState<string[]>([]);
  const [pendingDraft, setPendingDraft] = React.useState<string | null>(null);
  const [commandOpen, setCommandOpen] = React.useState(false);
  const [ai, setAIState] = React.useState<AI>({
    provider: "anthropic",
    model: "claude-sonnet-5-5",
    key: "sk-ant-api03-••••••••••••••••••••••••7f3Q",
    editor: true,
    site: true,
    drafts: true,
    perHour: 20,
  });
  const [publishing, setPublishingState] = React.useState<Publishing>({
    buildOnPush: true,
    llms: true,
    markdown: true,
    mcp: true,
    mcpToken: false,
    badge: true,
  });

  const dark =
    theme === "dark" || (theme === "system" && (hostTheme ? hostTheme === "dark" : systemDark));

  React.useEffect(() => {
    const root = document.documentElement;
    withoutTransitions(() => {
      if (theme === "system") {
        if (hostTheme) root.setAttribute("data-theme", hostTheme);
        else root.removeAttribute("data-theme");
      } else {
        root.setAttribute("data-theme", theme);
      }
    });
    write("corpus.theme", theme);
  }, [theme]);

  React.useEffect(() => {
    withoutTransitions(() => document.documentElement.setAttribute("data-base", base));
    write("corpus.base", base);
  }, [base]);

  React.useEffect(() => {
    write("corpus.reader", reader);
  }, [reader]);

  const setFile = React.useCallback((id: string, body: string) => {
    setFiles((f) => ({ ...f, [id]: body }));
  }, []);

  const commit = React.useCallback(
    ({ fileId, message, mode }: { fileId: string; message: string; mode: "main" | "pr" }) => {
      const body = files[fileId] ?? "";
      const c: Commit = { sha: nextSha(), message, author: "Mitch Kostelecky", when: "Just now" };
      const answers: string[] = [];
      if (fileId === "button" && /##\s+Loading state/i.test(body)) answers.push("q-loading");
      if (fileId === "card" && /##\s+Nesting/i.test(body)) answers.push("q-nesting");
      if (mode === "main") {
        setSaved((s) => ({ ...s, [fileId]: body }));
        setCommits((list) => [c, ...list]);
        setResolved((r) => Array.from(new Set([...r, ...answers])));
        setInReview((r) => r.filter((x) => !answers.includes(x)));
      } else {
        setInReview((r) => Array.from(new Set([...r, ...answers])));
      }
      return c;
    },
    [files],
  );

  const value: Store = {
    theme,
    setTheme: setThemeState,
    dark,
    base,
    setBase: setBaseState,
    reader,
    setReader: setReaderState,
    files,
    saved,
    setFile,
    commit,
    commits,
    resolved,
    inReview,
    pendingDraft,
    setPendingDraft,
    ai,
    setAI: (patch) => setAIState((a) => ({ ...a, ...patch })),
    publishing,
    setPublishing: (patch) => setPublishingState((p) => ({ ...p, ...patch })),
    commandOpen,
    setCommandOpen,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = React.useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside StoreProvider");
  return ctx;
}

export function fileMeta(id: string) {
  const g = guidelineFiles.find((x) => x.id === id);
  if (g) return { id, title: g.title, path: g.path, kind: "guideline" as const };
  const c = components.find((x) => x.id === id);
  if (c)
    return { id, title: c.name, path: `docs/components/${c.id}.mdx`, kind: "component" as const };
  return null;
}
