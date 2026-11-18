// Exploration: the sidebar as one page tree across the whole library, the way Notion's
// works. Each project is a top-level space, and components and guidelines are pages in it
// like any other. See docs/decisions/proposed-library-and-inbox.md.
import * as React from "react";
import {
  BlocksIcon,
  BookOpenIcon,
  BotIcon,
  ChevronRightIcon,
  ChevronsUpDownIcon,
  ComponentIcon,
  FileTextIcon,
  FolderIcon,
  LayoutGridIcon,
  LifeBuoyIcon,
  PlugIcon,
  Settings2Icon,
  SwatchBookIcon,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { CorpusMark } from "@/components/corpus-logo";
import {
  components,
  docsProjects,
  guidelineFiles,
  workspace,
  type ProjectKind,
} from "@/data/workspace";
import { useDocDrafts, withDraft } from "@/lib/docs-drafts";
import { useInbox } from "@/lib/inbox";
import { foldersOf } from "@/lib/projects";
import { navigate } from "@/lib/router";
import { cn } from "@/lib/utils";

type Icon = React.ComponentType<{ className?: string }>;

/** Each kind of project gets one icon, wherever projects are listed. */
export const KIND_ICON: Record<ProjectKind, Icon> = {
  "design-system": ComponentIcon,
  docs: BookOpenIcon,
  "help-center": LifeBuoyIcon,
};

type TreeNode = {
  key: string;
  label: string;
  /** Rows without a route are folders: clicking them opens or closes them. */
  route?: string;
  icon: Icon;
  children?: TreeNode[];
  /** Open inbox items in this project. */
  open?: number;
};

function useLibrary(): TreeNode[] {
  const drafts = useDocDrafts();
  const inbox = useInbox();
  const openIn = (name: string) => inbox.filter((i) => i.project === name).length;
  return [
    {
      key: "charged-ui",
      label: workspace.name,
      route: "overview",
      icon: KIND_ICON["design-system"],
      open: openIn(workspace.name),
      children: [
        {
          key: "components",
          label: "Components",
          route: "components",
          icon: FolderIcon,
          children: components.map((c) => ({
            key: `component-${c.id}`,
            label: c.name,
            route: `component-${c.id}`,
            icon: FileTextIcon,
          })),
        },
        {
          key: "guidelines",
          label: "Guidelines",
          route: "guidelines",
          icon: FolderIcon,
          children: guidelineFiles.map((g) => ({
            key: `guide-${g.id}`,
            label: g.title,
            route: `guide-${g.id}`,
            icon: FileTextIcon,
          })),
        },
        { key: "tokens", label: "Tokens", route: "tokens", icon: SwatchBookIcon },
      ],
    },
    ...docsProjects.map((d): TreeNode => ({
      key: d.id,
      label: d.name,
      route: d.id,
      icon: KIND_ICON[d.kind],
      open: openIn(d.name),
      // Titles come from this tab's drafts while a page is being edited.
      children: foldersOf(d.pages.map((p) => withDraft(p, drafts))).map(([folder, pages]) => ({
        key: `${d.id}/${folder}`,
        label: folder,
        icon: FolderIcon,
        children: pages.map((p) => ({
          key: `${d.id}-${p.id}`,
          label: p.title,
          route: `${d.id}-${p.id}`,
          icon: FileTextIcon,
        })),
      })),
    })),
  ];
}

/** The row a route belongs to. Editing a component or guideline highlights its page. */
function activeKeyOf(route: string) {
  if (!route.startsWith("edit-")) return route;
  const id = route.slice("edit-".length);
  return guidelineFiles.some((g) => g.id === id) ? `guide-${id}` : `component-${id}`;
}

function pathTo(nodes: TreeNode[], key: string): string[] | null {
  for (const n of nodes) {
    if (n.key === key || n.route === key) return [n.key];
    const below = n.children ? pathTo(n.children, key) : null;
    if (below) return [n.key, ...below];
  }
  return null;
}

function TreeRow({
  node,
  depth,
  activeKey,
  expanded,
  onToggle,
  onNavigate,
}: {
  node: TreeNode;
  depth: number;
  activeKey: string;
  expanded: Set<string>;
  onToggle: (key: string) => void;
  onNavigate: () => void;
}) {
  const kids = node.children ?? [];
  const open = expanded.has(node.key);
  const active = node.key === activeKey || node.route === activeKey;
  const label = (
    <>
      <node.icon className="size-4 shrink-0 text-muted-foreground" />
      <span className="truncate">{node.label}</span>
    </>
  );
  const target =
    "flex h-full min-w-0 flex-1 items-center gap-2 rounded-md pr-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring";
  return (
    <li>
      <div
        className={cn(
          "flex h-7 items-center rounded-md text-sm text-sidebar-foreground transition-colors hover:bg-sidebar-accent",
          active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
        )}
        style={{ paddingLeft: depth * 12 }}
      >
        {kids.length ? (
          <button
            type="button"
            onClick={() => onToggle(node.key)}
            aria-label={`${open ? "Collapse" : "Expand"} ${node.label}`}
            aria-expanded={open}
            className="grid size-6 shrink-0 place-items-center rounded-md text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <ChevronRightIcon
              className={cn("size-3.5 transition-transform duration-150", open && "rotate-90")}
            />
          </button>
        ) : (
          <span className="w-6 shrink-0" />
        )}
        {node.route ? (
          <a
            href={`#${node.route}`}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={target}
          >
            {label}
          </a>
        ) : (
          <button type="button" onClick={() => onToggle(node.key)} className={target}>
            {label}
          </button>
        )}
        {!!node.open && (
          <span className="mr-2 flex shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular">
            <span className="size-1.5 rounded-full bg-bad" />
            {node.open}
          </span>
        )}
      </div>
      {kids.length > 0 && open && (
        <ul role="group">
          {kids.map((k) => (
            <TreeRow
              key={k.key}
              node={k}
              depth={depth + 1}
              activeKey={activeKey}
              expanded={expanded}
              onToggle={onToggle}
              onNavigate={onNavigate}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

/**
 * Every project's pages in one tree. The projects start open, and the branch holding the
 * page you're on opens with it. Collapsed to icons, the tree is just the projects.
 */
export function LibraryTree({ route }: { route: string }) {
  const nodes = useLibrary();
  const { setOpenMobile } = useSidebar();
  const activeKey = activeKeyOf(route);
  const [expanded, setExpanded] = React.useState(
    () => new Set([...nodes.map((n) => n.key), ...(pathTo(nodes, activeKey) ?? [])]),
  );
  // Going to a page opens the folders above it, without closing anything you opened.
  React.useEffect(() => {
    const path = pathTo(nodes, activeKey);
    if (path) setExpanded((s) => (path.every((k) => s.has(k)) ? s : new Set([...s, ...path])));
    // nodes is rebuilt every render; the route is what matters here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey]);
  const toggle = (key: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  const top = pathTo(nodes, activeKey)?.[0];

  return (
    <>
      <ul
        role="tree"
        aria-label="Library"
        className="grid gap-px group-data-[collapsible=icon]:hidden"
      >
        {nodes.map((n) => (
          <TreeRow
            key={n.key}
            node={n}
            depth={0}
            activeKey={activeKey}
            expanded={expanded}
            onToggle={toggle}
            onNavigate={() => setOpenMobile(false)}
          />
        ))}
      </ul>
      <SidebarMenu className="hidden group-data-[collapsible=icon]:flex">
        {nodes.map((n) => (
          <SidebarMenuItem key={n.key}>
            <SidebarMenuButton
              isActive={n.key === top}
              tooltip={n.label}
              render={<a href={`#${n.route}`} />}
            >
              <n.icon />
              <span>{n.label}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </>
  );
}

/**
 * The library itself, at the top of the sidebar. Its menu holds the settings screens,
 * so the sidebar below is only pages.
 */
export function WorkspaceMenu() {
  const { setOpenMobile } = useSidebar();
  const go = (route: string) => {
    setOpenMobile(false);
    navigate(route);
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuButton
            size="lg"
            className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground group-data-[collapsible=icon]:h-9! group-data-[collapsible=icon]:p-1.5!"
          />
        }
      >
        <CorpusMark className="size-5!" />
        <span className="grid min-w-0 flex-1 text-left leading-tight group-data-[collapsible=icon]:hidden">
          <span className="truncate text-sm font-semibold">Acme, Inc</span>
          <span className="truncate text-xs text-muted-foreground">
            {docsProjects.length + 1} projects
          </span>
        </span>
        <ChevronsUpDownIcon className="ml-auto text-muted-foreground group-data-[collapsible=icon]:hidden" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="min-w-60" align="start" sideOffset={6}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Acme, Inc</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => go("projects")}>
            <LayoutGridIcon />
            All projects
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuLabel>Settings</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => go("agents")}>
            <BotIcon />
            Agents and MCP
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("plugins")}>
            <PlugIcon />
            Plugins
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("integrations")}>
            <BlocksIcon />
            Integrations
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("workspace")}>
            <Settings2Icon />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
