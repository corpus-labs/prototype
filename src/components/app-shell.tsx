import * as React from "react";
import {
  BotIcon,
  BlocksIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ComponentIcon,
  CopyIcon,
  FileTextIcon,
  HouseIcon,
  InboxIcon,
  LibraryIcon,
  LayoutGridIcon,
  MoonIcon,
  PaletteIcon,
  PenLineIcon,
  PlugIcon,
  SearchIcon,
  Settings2Icon,
  SunIcon,
  SwatchBookIcon,
  ExternalLinkIcon,
} from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Kbd } from "@/components/ui/kbd";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { toast } from "@/components/ui/toast";
import { copyText } from "@/components/common";
import { CorpusMark } from "@/components/corpus-logo";
import { KIND_ICON, LibraryTree, WorkspaceMenu } from "@/components/library-nav";
import {
  components,
  docsProjectOf,
  docsProjects,
  guidelineFiles,
  questions,
  tokens,
  workspace,
} from "@/data/workspace";
import { KIND_LABEL, useCurrentProject, useProjects, type ProjectSummary } from "@/lib/projects";
import { useInbox } from "@/lib/inbox";
import { navigate } from "@/lib/router";
import { useStore, type Base, type Theme } from "@/lib/store";
import { cn } from "@/lib/utils";

export { KIND_ICON };

type NavKey =
  | "overview"
  | "components"
  | "tokens"
  | "guidelines"
  | "agents"
  | "integrations"
  | "workspace";

export function sectionOf(route: string): NavKey {
  if (route === "components" || route.startsWith("component-")) return "components";
  if (route === "tokens") return "tokens";
  if (route === "guidelines" || route.startsWith("guide-")) return "guidelines";
  if (route.startsWith("edit-")) {
    const id = route.slice(5);
    return guidelineFiles.some((g) => g.id === id) ? "guidelines" : "components";
  }
  if (route === "agents") return "agents";
  if (route === "integrations") return "integrations";
  if (route === "workspace") return "workspace";
  return "overview";
}

const NAV: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: HouseIcon },
  { key: "components", label: "Components", icon: ComponentIcon },
  { key: "tokens", label: "Tokens", icon: SwatchBookIcon },
  { key: "guidelines", label: "Guidelines", icon: BookOpenIcon },
  { key: "agents", label: "Agents", icon: BotIcon },
];

const SETUP: typeof NAV = [
  { key: "integrations", label: "Integrations", icon: BlocksIcon },
  { key: "workspace", label: "Settings", icon: Settings2Icon },
];

/** ⌘ on Apple devices, Ctrl everywhere else. */
const MOD_KEY =
  typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent)
    ? "⌘"
    : "Ctrl ";

/** The project menu's contents: switch projects, go to all of them, or to this project's setup. */
function ProjectMenuItems({ current }: { current: ProjectSummary | null }) {
  const projects = useProjects();
  const { setOpenMobile } = useSidebar();
  const go = (route: string) => {
    setOpenMobile(false);
    navigate(route);
  };
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Projects</DropdownMenuLabel>
        {projects.map((p) => (
          <DropdownMenuItem key={p.id} onClick={() => go(p.home)}>
            <span className="grid min-w-0 leading-tight">
              <span className="truncate">{p.name}</span>
              <span className="truncate text-xs text-muted-foreground">{KIND_LABEL[p.kind]}</span>
            </span>
            {p.id === current?.id && <CheckIcon className="ml-auto" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={() => go("projects")}>
        <LayoutGridIcon />
        All projects
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => go("plugins")}>
        <PlugIcon />
        Plugins
      </DropdownMenuItem>
      {current?.kind === "design-system" && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => go("workspace")}>
            <Settings2Icon />
            Project settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => go("integrations")}>
            <BlocksIcon />
            Integrations
          </DropdownMenuItem>
        </>
      )}
    </>
  );
}

/** On phones there's no sidebar, so the project's name is the page title and opens the same menu. */
function ProjectMenu({ current }: { current: ProjectSummary }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="group/workspace -ml-1.5 flex h-9 min-w-0 items-center gap-1 rounded-md px-1.5 text-[15px] font-semibold tracking-tight transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground">
        <span className="truncate">{current.name}</span>
        <ChevronDownIcon className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-popup-open/workspace:rotate-180" />
      </DropdownMenuTrigger>
      {/* Offsets line the menu’s text up with the name above it. */}
      <DropdownMenuContent className="min-w-56" align="start" alignOffset={-4} sideOffset={4}>
        <ProjectMenuItems current={current} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function useOpenGaps() {
  const { resolved } = useStore();
  return questions.filter((q) => q.status === "gap" && !resolved.includes(q.id));
}

function crumbs(route: string): { label: string; route?: string }[] {
  const docs = docsProjectOf(route);
  if (docs) {
    if (route === docs.id) return [{ label: "Overview" }];
    const page = docs.pages.find((p) => `${docs.id}-${p.id}` === route);
    return [{ label: page?.folder ?? "Pages" }, { label: page?.title ?? "" }];
  }
  const section = sectionOf(route);
  const label = [...NAV, ...SETUP].find((n) => n.key === section)?.label ?? "Overview";
  const out: { label: string; route?: string }[] = [{ label, route: section }];
  if (route.startsWith("component-"))
    out.push({ label: components.find((c) => `component-${c.id}` === route)?.name ?? "" });
  if (route.startsWith("guide-"))
    out.push({ label: guidelineFiles.find((g) => `guide-${g.id}` === route)?.title ?? "" });
  if (route.startsWith("edit-")) {
    const id = route.slice(5);
    const g = guidelineFiles.find((x) => x.id === id);
    const c = components.find((x) => x.id === id);
    if (g) out.push({ label: g.title, route: `guide-${g.id}` });
    if (c) out.push({ label: c.name, route: `component-${c.id}` });
    out.push({ label: "Edit" });
  }
  return out;
}

function ThemeRadio() {
  const { theme, setTheme, base, setBase } = useStore();
  return (
    <>
      <DropdownMenuGroup>
        <DropdownMenuLabel>Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={(v: Theme) => setTheme(v)}>
          <DropdownMenuRadioItem value="system">System</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="light">Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark">Dark</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
      <DropdownMenuSeparator />
      <DropdownMenuGroup>
        <DropdownMenuLabel>Neutral palette</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={base} onValueChange={(v: Base) => setBase(v)}>
          {(["neutral", "zinc", "stone", "slate", "gray"] as const).map((b) => (
            <DropdownMenuRadioItem key={b} value={b} className="capitalize">
              <span
                className="size-3 rounded-full border"
                style={{ background: `var(--color-${b}-400)` }}
              />
              {b}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
    </>
  );
}

function AppSidebar({ route }: { route: string }) {
  const { setOpenMobile } = useSidebar();
  const { setCommandOpen } = useStore();
  const inbox = useInbox();
  const inInbox = route === "inbox" || route.startsWith("inbox-");

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <WorkspaceMenu />
          </SidebarMenuItem>
        </SidebarMenu>
        {/* Its own menu, so the header's gap separates it from the workspace, collapsed or not. */}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              className="text-muted-foreground"
              onClick={() => {
                setOpenMobile(false);
                setCommandOpen(true);
              }}
            >
              <SearchIcon />
              <span>Search</span>
              <Kbd className="ml-auto group-data-[collapsible=icon]:hidden max-md:hidden">
                {MOD_KEY}K
              </Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={inInbox}
              tooltip="Inbox"
              render={<a href="#inbox" onClick={() => setOpenMobile(false)} />}
            >
              <InboxIcon />
              <span>Inbox</span>
            </SidebarMenuButton>
            {inbox.length > 0 && (
              <SidebarMenuBadge className="text-muted-foreground tabular">
                <span className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-bad" />
                  {inbox.length}
                </span>
              </SidebarMenuBadge>
            )}
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Library</SidebarGroupLabel>
          <SidebarGroupContent>
            <LibraryTree route={route} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground"
                  />
                }
              >
                <Avatar className="size-8 rounded-lg after:rounded-lg">
                  <AvatarFallback className="rounded-lg text-xs">MK</AvatarFallback>
                </Avatar>
                <span className="grid flex-1 text-left leading-tight">
                  <span className="truncate text-sm font-medium">Mitch Kostelecky</span>
                  <span className="truncate text-xs text-muted-foreground">Owner</span>
                </span>
                <ChevronsUpDownIcon className="ml-auto text-muted-foreground" />
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-56" side="top" align="start" sideOffset={6}>
                <ThemeRadio />
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

/** Screens that belong to the whole library, not one project. */
function wholeInstallTitle(route: string) {
  if (["plugins", "agents", "integrations", "workspace"].includes(route)) return "Settings";
  if (route === "inbox" || route.startsWith("inbox-")) return "Inbox";
  return "Projects";
}

function ThemeToggle({ className }: { className?: string }) {
  const { dark, setTheme } = useStore();
  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn("text-muted-foreground", className)}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      onClick={() => setTheme(dark ? "light" : "dark")}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </Button>
  );
}

function DesktopTopbar({ route }: { route: string }) {
  const { setCommandOpen } = useStore();
  const { state } = useSidebar();
  const project = useCurrentProject(route);
  const trail = project
    ? [{ label: project.name, route: project.home }, ...crumbs(route)]
    : [{ label: wholeInstallTitle(route) }];
  return (
    <header className="sticky top-0 z-20 hidden h-12 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md md:flex">
      <SidebarTrigger className="text-muted-foreground" />
      {/* Full height, with equal space on both sides of the sidebar toggle. */}
      <Separator orientation="vertical" className="mx-1" />
      {/* One line at any width: long crumbs truncate instead of wrapping out of the bar. */}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap gap-2">
          {trail.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && (
                <BreadcrumbSeparator className="text-muted-foreground/50">/</BreadcrumbSeparator>
              )}
              <BreadcrumbItem className="min-w-0">
                {c.route && i < trail.length - 1 ? (
                  <BreadcrumbLink href={`#${c.route}`} className="truncate">
                    {c.label}
                  </BreadcrumbLink>
                ) : (
                  <BreadcrumbPage className="truncate">{c.label}</BreadcrumbPage>
                )}
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
      <div className="ml-auto flex shrink-0 items-center gap-1">
        {/* Search lives in the sidebar. With the sidebar collapsed, it's here. */}
        {state === "collapsed" && (
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search everything"
            className="text-muted-foreground"
            onClick={() => setCommandOpen(true)}
          >
            <SearchIcon />
          </Button>
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}

function MobileTopbar({ route }: { route: string }) {
  const { setCommandOpen } = useStore();
  const project = useCurrentProject(route);
  return (
    <header className="sticky top-[env(safe-area-inset-top,0px)] z-30 flex h-13 shrink-0 items-center gap-2 border-b bg-background/90 px-3 backdrop-blur-md md:hidden">
      <a
        href="#projects"
        aria-label="All projects"
        className="-ml-1.5 flex size-9 shrink-0 items-center justify-center rounded-md outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <CorpusMark className="size-5" />
      </a>
      {project ? (
        <ProjectMenu current={project} />
      ) : (
        <span className="text-[15px] font-semibold tracking-tight">{wholeInstallTitle(route)}</span>
      )}
      <div className="ml-auto flex items-center">
        <Button
          variant="ghost"
          size="icon-lg"
          className="text-muted-foreground"
          aria-label="Search"
          onClick={() => setCommandOpen(true)}
        >
          <SearchIcon />
        </Button>
        <ThemeToggle className="size-9" />
      </div>
    </header>
  );
}

type Tab = {
  key: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Tabs without a route run an action instead: open search or the sidebar sheet. */
  action?: "search" | "more";
  active: boolean;
  dot?: boolean;
};

const COLS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" };

/** Phone tabs are the same everywhere: the inbox, search, and the library tree in a sheet. */
function MobileTabbar({ route }: { route: string }) {
  const { setOpenMobile } = useSidebar();
  const { setCommandOpen } = useStore();
  const inbox = useInbox();
  const inInbox = route === "inbox" || route.startsWith("inbox-");
  const tabs: Tab[] = [
    { key: "inbox", label: "Inbox", icon: InboxIcon, active: inInbox, dot: inbox.length > 0 },
    { key: "search", label: "Search", icon: SearchIcon, action: "search", active: false },
    { key: "more", label: "Library", icon: LibraryIcon, action: "more", active: !inInbox },
  ];
  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 pb-[env(safe-area-inset-bottom,0px)] backdrop-blur-md md:hidden"
    >
      <div className={cn("grid h-14", COLS[tabs.length])}>
        {tabs.map((t) => {
          const content = (
            <>
              <span className="relative">
                <t.icon className="size-5" />
                {t.dot && (
                  <span className="absolute -top-0.5 -right-1 size-2 rounded-full bg-bad ring-2 ring-background" />
                )}
              </span>
              <span className="text-[11px] leading-none">{t.label}</span>
            </>
          );
          const cls = cn(
            "flex flex-col items-center justify-center gap-1 outline-none focus-visible:bg-muted",
            t.active ? "text-foreground" : "text-muted-foreground",
          );
          return t.action ? (
            <button
              key={t.key}
              type="button"
              className={cls}
              onClick={() => (t.action === "search" ? setCommandOpen(true) : setOpenMobile(true))}
            >
              {content}
            </button>
          ) : (
            <a
              key={t.key}
              href={`#${t.key}`}
              className={cls}
              aria-current={t.active ? "page" : undefined}
            >
              {content}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

function CommandMenu() {
  const { commandOpen, setCommandOpen, setTheme, dark, setPendingDraft } = useStore();
  const gaps = useOpenGaps();
  const projects = useProjects();

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        // Inside the docs editor, ⌘K makes a link instead.
        if (e.target instanceof Element && e.target.closest("[data-docs-editor]")) return;
        e.preventDefault();
        setCommandOpen(true);
      }
    };
    document.addEventListener("keydown", on);
    return () => document.removeEventListener("keydown", on);
  }, [setCommandOpen]);

  const go = (route: string) => {
    setCommandOpen(false);
    navigate(route);
  };

  return (
    <CommandDialog
      open={commandOpen}
      onOpenChange={setCommandOpen}
      title="Search"
      description="Search components, guidelines, tokens, and actions"
      // shadcn pins the top at a third of the window, which sits a full list well below center.
      // Instead, pin the top where a full-height menu is exactly centered (the input row is 2.75rem),
      // so it opens centered and the input stays put while results filter.
      // Phones keep it near the top, clear of the on-screen keyboard.
      className="top-[calc(env(safe-area-inset-top,0px)+1rem)] [--command-list:min(60svh,420px)] sm:top-[calc(50svh-(var(--command-list)+2.75rem)/2)]"
    >
      <Command>
        <CommandInput placeholder="Search pages, components, and tokens…" />
        <CommandList className="max-h-(--command-list)">
          <CommandEmpty>
            Nothing matches. Agents asking the same thing would hit a gap too.
          </CommandEmpty>
          {gaps.length > 0 && (
            <CommandGroup heading="Unanswered agent questions">
              {gaps.map((q) => (
                <CommandItem
                  key={q.id}
                  value={`gap ${q.text}`}
                  onSelect={() => {
                    setPendingDraft(q.id);
                    go(`edit-${q.fileId}`);
                  }}
                >
                  <PenLineIcon />
                  {q.text}
                  <CommandShortcut>{q.count}×</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          <CommandGroup heading="Projects">
            {projects.map((p) => (
              <CommandItem key={p.id} value={`project ${p.name}`} onSelect={() => go(p.home)}>
                {React.createElement(KIND_ICON[p.kind])}
                {p.name}
                <CommandShortcut>{KIND_LABEL[p.kind]}</CommandShortcut>
              </CommandItem>
            ))}
            <CommandItem value="all projects dashboard" onSelect={() => go("projects")}>
              <LayoutGridIcon />
              All projects
            </CommandItem>
            <CommandItem
              value="plugins claude codex cursor ai tools"
              onSelect={() => go("plugins")}
            >
              <PlugIcon />
              Plugins
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Components">
            {components.map((c) => (
              <CommandItem
                key={c.id}
                value={`component ${c.name} ${c.machine}`}
                onSelect={() => go(`component-${c.id}`)}
              >
                <ComponentIcon />
                {c.name}
                <CommandShortcut className="font-mono">{c.machine}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Guidelines">
            {guidelineFiles.map((g) => (
              <CommandItem
                key={g.id}
                value={`guideline ${g.title}`}
                onSelect={() => go(`guide-${g.id}`)}
              >
                <BookOpenIcon />
                {g.title}
              </CommandItem>
            ))}
          </CommandGroup>
          {docsProjects.map((d) => (
            <CommandGroup key={d.id} heading={d.name}>
              {d.pages.map((p) => (
                <CommandItem
                  key={p.id}
                  value={`page ${d.name} ${p.title} ${p.folder}`}
                  onSelect={() => go(`${d.id}-${p.id}`)}
                >
                  <FileTextIcon />
                  {p.title}
                  <CommandShortcut>{p.folder}</CommandShortcut>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandGroup heading="Tokens">
            {tokens
              .filter((t) => t.group === "color")
              .map((t) => (
                <CommandItem
                  key={t.id}
                  value={`token ${t.id} ${t.value}`}
                  onSelect={() => go("tokens")}
                >
                  <span className="size-3.5 rounded-[4px] border" style={{ background: t.value }} />
                  <span className="font-mono text-[13px]">{t.id}</span>
                  <CommandShortcut className="font-mono">{t.value}</CommandShortcut>
                </CommandItem>
              ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="copy mcp endpoint url"
              onSelect={async () => {
                setCommandOpen(false);
                if (await copyText(workspace.mcp))
                  toast.add({ title: "MCP endpoint copied", description: workspace.mcp });
              }}
            >
              <CopyIcon />
              Copy MCP endpoint
            </CommandItem>
            <CommandItem value="open llms.txt" onSelect={() => go("agents")}>
              <ExternalLinkIcon />
              View llms.txt
            </CommandItem>
            <CommandItem
              value="toggle theme dark light"
              onSelect={() => {
                setTheme(dark ? "light" : "dark");
                setCommandOpen(false);
              }}
            >
              {dark ? <SunIcon /> : <MoonIcon />}
              Switch to {dark ? "light" : "dark"} theme
            </CommandItem>
            <CommandItem value="appearance neutral palette" onSelect={() => go("workspace")}>
              <PaletteIcon />
              Change neutral palette
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </CommandDialog>
  );
}

export function AppShell({ route, children }: { route: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar route={route} />
      {/*
        On desktop the content is a panel on the tinted canvas, like an app window, and scrolls on its own.
        It runs off the bottom of the screen, so only the top corners are rounded and text never meets a curve.
      */}
      <SidebarInset
        data-scroll-root
        className="min-w-0 md:h-[calc(100svh-0.5rem)] md:overflow-y-auto md:ring-1 md:ring-black/[0.06] md:peer-data-[variant=inset]:mb-0 md:peer-data-[variant=inset]:rounded-b-none md:peer-data-[variant=inset]:peer-data-[state=collapsed]:ml-0 dark:md:ring-white/[0.08]"
      >
        <DesktopTopbar route={route} />
        <MobileTopbar route={route} />
        <div className="flex-1 pb-24 md:pb-12">{children}</div>
        <MobileTabbar route={route} />
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  );
}
