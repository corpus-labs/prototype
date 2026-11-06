import * as React from "react"
import {
  BotIcon,
  BlocksIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ChevronsUpDownIcon,
  ComponentIcon,
  CopyIcon,
  EllipsisIcon,
  FileTextIcon,
  HouseIcon,
  LayoutGridIcon,
  MoonIcon,
  PaletteIcon,
  PenLineIcon,
  SearchIcon,
  Settings2Icon,
  SunIcon,
  SwatchBookIcon,
  ExternalLinkIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
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
} from "@/components/ui/command"
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
} from "@/components/ui/dropdown-menu"
import { Kbd } from "@/components/ui/kbd"
import { Separator } from "@/components/ui/separator"
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
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import { toast } from "@/components/ui/toast"
import { copyText } from "@/components/common"
import { CorpusLogo, CorpusMark } from "@/components/corpus-logo"
import { components, guidelineFiles, handbook, questions, tokens, workspace } from "@/data/workspace"
import { KIND_LABEL, foldersOf, projectOf, useCurrentProject, useProjects, type ProjectSummary } from "@/lib/projects"
import { navigate } from "@/lib/router"
import { useDocDrafts, withDraft } from "@/lib/docs-drafts"
import { useStore, type Base, type Theme } from "@/lib/store"
import { cn } from "@/lib/utils"

type NavKey = "overview" | "components" | "tokens" | "guidelines" | "agents" | "integrations" | "workspace"

export function sectionOf(route: string): NavKey {
  if (route === "components" || route.startsWith("component-")) return "components"
  if (route === "tokens") return "tokens"
  if (route === "guidelines" || route.startsWith("guide-")) return "guidelines"
  if (route.startsWith("edit-")) {
    const id = route.slice(5)
    return guidelineFiles.some((g) => g.id === id) ? "guidelines" : "components"
  }
  if (route === "agents") return "agents"
  if (route === "integrations") return "integrations"
  if (route === "workspace") return "workspace"
  return "overview"
}

const NAV: { key: NavKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "overview", label: "Overview", icon: HouseIcon },
  { key: "components", label: "Components", icon: ComponentIcon },
  { key: "tokens", label: "Tokens", icon: SwatchBookIcon },
  { key: "guidelines", label: "Guidelines", icon: BookOpenIcon },
  { key: "agents", label: "Agents", icon: BotIcon },
]

const SETUP: typeof NAV = [
  { key: "integrations", label: "Integrations", icon: BlocksIcon },
  { key: "workspace", label: "Settings", icon: Settings2Icon },
]

/** ⌘ on Apple devices, Ctrl everywhere else. */
const MOD_KEY = typeof navigator !== "undefined" && /Mac|iPhone|iPad|iPod/.test(navigator.userAgent) ? "⌘" : "Ctrl "

/**
 * The current project’s name, which opens a menu to switch projects or go to
 * all of them. In the desktop breadcrumb it looks like any other crumb plus a
 * chevron. On phones it’s the page title.
 */
function ProjectMenu({ variant, current }: { variant: "crumb" | "title"; current: ProjectSummary }) {
  const title = variant === "title"
  const projects = useProjects()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          // The same hover grey as the sidebar items. It stays while the menu is open.
          "group/workspace flex min-w-0 items-center gap-1 rounded-md px-1.5 transition-colors outline-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-3 focus-visible:ring-ring/50 data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground",
          // Negative margins keep the name where the text sits, so only the grey reaches past it.
          title ? "-ml-1.5 h-9 text-[15px] font-semibold tracking-tight" : "-mx-1.5 h-7"
        )}
      >
        <span className="truncate">{current.name}</span>
        <ChevronDownIcon
          className={cn(
            "shrink-0 transition-transform duration-200 group-data-popup-open/workspace:rotate-180",
            title ? "size-4 text-muted-foreground" : "size-3.5"
          )}
        />
      </DropdownMenuTrigger>
      {/* Offsets line the menu’s text up with the name above it. */}
      <DropdownMenuContent className="min-w-56" align="start" alignOffset={-4} sideOffset={title ? 4 : 6}>
        <DropdownMenuGroup>
          <DropdownMenuLabel>Projects</DropdownMenuLabel>
          {projects.map((p) => (
            <DropdownMenuItem key={p.id} onClick={() => navigate(p.home)}>
              <span className="grid min-w-0 leading-tight">
                <span className="truncate">{p.name}</span>
                <span className="truncate text-xs text-muted-foreground">{KIND_LABEL[p.kind]}</span>
              </span>
              {p.id === current.id && <CheckIcon className="ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("projects")}>
          <LayoutGridIcon />
          All projects
        </DropdownMenuItem>
        {current.kind === "design-system" && (
          <>
            <DropdownMenuItem onClick={() => navigate("workspace")}>
              <Settings2Icon />
              Project settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate("integrations")}>
              <BlocksIcon />
              Integrations
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function useOpenGaps() {
  const { resolved } = useStore()
  return questions.filter((q) => q.status === "gap" && !resolved.includes(q.id))
}

function crumbs(route: string): { label: string; route?: string }[] {
  if (route === "handbook") return [{ label: "Pages" }]
  if (route.startsWith("handbook-")) {
    return [{ label: "Pages", route: "handbook" }, { label: handbook.pages.find((p) => `handbook-${p.id}` === route)?.title ?? "" }]
  }
  const section = sectionOf(route)
  const label = [...NAV, ...SETUP].find((n) => n.key === section)?.label ?? "Overview"
  const out: { label: string; route?: string }[] = [{ label, route: section }]
  if (route.startsWith("component-")) out.push({ label: components.find((c) => `component-${c.id}` === route)?.name ?? "" })
  if (route.startsWith("guide-")) out.push({ label: guidelineFiles.find((g) => `guide-${g.id}` === route)?.title ?? "" })
  if (route.startsWith("edit-")) {
    const id = route.slice(5)
    const g = guidelineFiles.find((x) => x.id === id)
    const c = components.find((x) => x.id === id)
    if (g) out.push({ label: g.title, route: `guide-${g.id}` })
    if (c) out.push({ label: c.name, route: `component-${c.id}` })
    out.push({ label: "Edit" })
  }
  return out
}

function ThemeRadio() {
  const { theme, setTheme, base, setBase } = useStore()
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
              <span className="size-3 rounded-full border" style={{ background: `var(--color-${b}-400)` }} />
              {b}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuGroup>
    </>
  )
}

function AppSidebar({ route }: { route: string }) {
  const section = sectionOf(route)
  const { setOpenMobile } = useSidebar()
  const { setCommandOpen } = useStore()
  const gaps = useOpenGaps()
  const counts: Partial<Record<NavKey, React.ReactNode>> = {
    components: components.length,
    tokens: tokens.length,
    guidelines: guidelineFiles.length,
    agents: gaps.length ? (
      <span className="flex items-center gap-1.5">
        <span className="size-1.5 rounded-full bg-bad" />
        {gaps.length}
      </span>
    ) : undefined,
  }

  const item = (n: (typeof NAV)[number]) => (
    <SidebarMenuItem key={n.key}>
      <SidebarMenuButton
        isActive={section === n.key}
        tooltip={n.label}
        render={<a href={`#${n.key}`} onClick={() => setOpenMobile(false)} />}
      >
        <n.icon />
        <span>{n.label}</span>
      </SidebarMenuButton>
      {counts[n.key] !== undefined && (
        <SidebarMenuBadge className="text-muted-foreground tabular">{counts[n.key]}</SidebarMenuBadge>
      )}
    </SidebarMenuItem>
  )

  const project = projectOf(route)

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <a
          href="#projects"
          aria-label="All projects"
          onClick={() => setOpenMobile(false)}
          className="flex h-9 items-center rounded-md px-2 text-sidebar-foreground outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring group-data-[collapsible=icon]:px-1.5"
        >
          <CorpusLogo className="h-5 group-data-[collapsible=icon]:hidden" />
          <CorpusMark className="hidden size-5 group-data-[collapsible=icon]:block" />
        </a>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Search"
              className="text-muted-foreground"
              onClick={() => {
                setOpenMobile(false)
                setCommandOpen(true)
              }}
            >
              <SearchIcon />
              <span>Search</span>
              <Kbd className="ml-auto group-data-[collapsible=icon]:hidden max-md:hidden">{MOD_KEY}K</Kbd>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        {project === null && <ProjectsNav />}
        {project === "charged-ui" && (
          <>
            <SidebarGroup>
              <SidebarGroupLabel>Design system</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{NAV.map(item)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
            <SidebarGroup>
              <SidebarGroupLabel>Setup</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>{SETUP.map(item)}</SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}
        {project === "handbook" && <DocsNav route={route} />}
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
      <SidebarRail />
    </Sidebar>
  )
}

/** On the projects dashboard, the sidebar lists the projects themselves. */
function ProjectsNav() {
  const { setOpenMobile } = useSidebar()
  const projects = useProjects()
  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {projects.map((p) => {
            const Icon = p.kind === "docs" ? BookOpenIcon : ComponentIcon
            return (
              <SidebarMenuItem key={p.id}>
                <SidebarMenuButton tooltip={p.name} render={<a href={`#${p.home}`} onClick={() => setOpenMobile(false)} />}>
                  <Icon />
                  <span>{p.name}</span>
                </SidebarMenuButton>
                {p.open > 0 && (
                  <SidebarMenuBadge className="text-muted-foreground tabular">
                    <span className="flex items-center gap-1.5">
                      <span className="size-1.5 rounded-full bg-bad" />
                      {p.open}
                    </span>
                  </SidebarMenuBadge>
                )}
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

/** A docs project’s sidebar is its page tree: one group per folder, like a notes app. */
function DocsNav({ route }: { route: string }) {
  const { setOpenMobile } = useSidebar()
  const drafts = useDocDrafts()
  const link = (to: string) => <a href={`#${to}`} onClick={() => setOpenMobile(false)} />
  return (
    <>
      <SidebarGroup>
        <SidebarGroupLabel>Docs</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={route === "handbook"} tooltip="Overview" render={link("handbook")}>
                <HouseIcon />
                <span>Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      {/* Titles come from this tab's drafts while a page is being edited. */}
      {foldersOf(handbook.pages.map((p) => withDraft(p, drafts))).map(([folder, pages]) => (
        <SidebarGroup key={folder}>
          <SidebarGroupLabel>{folder}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {pages.map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton isActive={route === `handbook-${p.id}`} tooltip={p.title} render={link(`handbook-${p.id}`)}>
                    <FileTextIcon />
                    <span>{p.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </>
  )
}

function ThemeToggle({ className }: { className?: string }) {
  const { dark, setTheme } = useStore()
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
  )
}

function DesktopTopbar({ route }: { route: string }) {
  const { setCommandOpen } = useStore()
  const project = useCurrentProject(route)
  const trail = project ? crumbs(route) : []
  return (
    <header className="sticky top-0 z-20 hidden h-12 shrink-0 items-center gap-2 border-b bg-background/85 px-3 backdrop-blur-md md:flex">
      <SidebarTrigger className="text-muted-foreground" />
      {/* Full height, with equal space on both sides of the sidebar toggle. */}
      <Separator orientation="vertical" className="mx-1" />
      {/* One line at any width: long crumbs truncate instead of wrapping out of the bar. */}
      <Breadcrumb className="min-w-0">
        <BreadcrumbList className="flex-nowrap gap-2">
          <BreadcrumbItem className="min-w-0 shrink-0">
            {project ? <ProjectMenu variant="crumb" current={project} /> : <BreadcrumbPage>Projects</BreadcrumbPage>}
          </BreadcrumbItem>
          {trail.map((c, i) => (
            <React.Fragment key={i}>
              {/* Slashes, so the workspace chevron is the only one in the trail. */}
              <BreadcrumbSeparator className="text-muted-foreground/50">/</BreadcrumbSeparator>
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
        {/* Icon only until there’s room for the full field. */}
        <Button
          variant="outline"
          size="sm"
          aria-label="Search docs and tokens"
          className="w-8 gap-2 px-0 text-muted-foreground lg:w-56 lg:justify-start lg:px-2.5"
          onClick={() => setCommandOpen(true)}
        >
          <SearchIcon />
          <span className="hidden lg:inline">Search docs and tokens</span>
          <Kbd className="ml-auto hidden lg:inline-flex">{MOD_KEY}K</Kbd>
        </Button>
        <ThemeToggle />
      </div>
    </header>
  )
}

function MobileTopbar({ route }: { route: string }) {
  const { setCommandOpen } = useStore()
  const project = useCurrentProject(route)
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
        <ProjectMenu variant="title" current={project} />
      ) : (
        <span className="text-[15px] font-semibold tracking-tight">Projects</span>
      )}
      <div className="ml-auto flex items-center">
        <Button variant="ghost" size="icon-lg" className="text-muted-foreground" aria-label="Search" onClick={() => setCommandOpen(true)}>
          <SearchIcon />
        </Button>
        <ThemeToggle className="size-9" />
      </div>
    </header>
  )
}

type Tab = {
  key: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  /** Tabs without a route run an action instead: open search or the sidebar sheet. */
  action?: "search" | "more"
  active: boolean
  dot?: boolean
}

const COLS: Record<number, string> = { 3: "grid-cols-3", 4: "grid-cols-4", 5: "grid-cols-5" }

/** Phone tabs follow the context: the dashboard, a design system, or a docs project. */
function MobileTabbar({ route }: { route: string }) {
  const section = sectionOf(route)
  const project = projectOf(route)
  const { setOpenMobile } = useSidebar()
  const { setCommandOpen } = useStore()
  const gaps = useOpenGaps()
  const search: Tab = { key: "search", label: "Search", icon: SearchIcon, action: "search", active: false }
  const tabs: Tab[] =
    project === "charged-ui"
      ? [
          { key: "overview", label: "Overview", icon: HouseIcon, active: section === "overview" },
          { key: "components", label: "Components", icon: ComponentIcon, active: section === "components" },
          { key: "tokens", label: "Tokens", icon: SwatchBookIcon, active: section === "tokens" },
          { key: "agents", label: "Agents", icon: BotIcon, active: section === "agents", dot: gaps.length > 0 },
          { key: "more", label: "More", icon: EllipsisIcon, action: "more", active: ["guidelines", "integrations", "workspace"].includes(section) },
        ]
      : project === "handbook"
        ? [
            { key: "handbook", label: "Overview", icon: HouseIcon, active: route === "handbook" },
            search,
            { key: "projects", label: "Projects", icon: LayoutGridIcon, active: false },
            { key: "more", label: "Pages", icon: FileTextIcon, action: "more", active: route.startsWith("handbook-") },
          ]
        : [
            { key: "projects", label: "Projects", icon: LayoutGridIcon, active: true },
            search,
            { key: "more", label: "More", icon: EllipsisIcon, action: "more", active: false },
          ]
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
                {t.dot && <span className="absolute -top-0.5 -right-1 size-2 rounded-full bg-bad ring-2 ring-background" />}
              </span>
              <span className="text-[11px] leading-none">{t.label}</span>
            </>
          )
          const cls = cn(
            "flex flex-col items-center justify-center gap-1 outline-none focus-visible:bg-muted",
            t.active ? "text-foreground" : "text-muted-foreground"
          )
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
            <a key={t.key} href={`#${t.key}`} className={cls} aria-current={t.active ? "page" : undefined}>
              {content}
            </a>
          )
        })}
      </div>
    </nav>
  )
}

function CommandMenu() {
  const { commandOpen, setCommandOpen, setTheme, dark, setPendingDraft } = useStore()
  const gaps = useOpenGaps()
  const projects = useProjects()

  React.useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === "k" && (e.metaKey || e.ctrlKey)) {
        // Inside the docs editor, ⌘K makes a link instead.
        if (e.target instanceof Element && e.target.closest("[data-docs-editor]")) return
        e.preventDefault()
        setCommandOpen(true)
      }
    }
    document.addEventListener("keydown", on)
    return () => document.removeEventListener("keydown", on)
  }, [setCommandOpen])

  const go = (route: string) => {
    setCommandOpen(false)
    navigate(route)
  }

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
        <CommandInput placeholder="Search components, guidelines, tokens…" />
        <CommandList className="max-h-(--command-list)">
          <CommandEmpty>Nothing matches. Agents asking the same thing would hit a gap too.</CommandEmpty>
          {gaps.length > 0 && (
            <CommandGroup heading="Unanswered agent questions">
              {gaps.map((q) => (
                <CommandItem
                  key={q.id}
                  value={`gap ${q.text}`}
                  onSelect={() => {
                    setPendingDraft(q.id)
                    go(`edit-${q.fileId}`)
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
                {p.kind === "docs" ? <BookOpenIcon /> : <ComponentIcon />}
                {p.name}
                <CommandShortcut>{KIND_LABEL[p.kind]}</CommandShortcut>
              </CommandItem>
            ))}
            <CommandItem value="all projects dashboard" onSelect={() => go("projects")}>
              <LayoutGridIcon />
              All projects
            </CommandItem>
          </CommandGroup>
          <CommandGroup heading="Components">
            {components.map((c) => (
              <CommandItem key={c.id} value={`component ${c.name} ${c.machine}`} onSelect={() => go(`component-${c.id}`)}>
                <ComponentIcon />
                {c.name}
                <CommandShortcut className="font-mono">{c.machine}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Guidelines">
            {guidelineFiles.map((g) => (
              <CommandItem key={g.id} value={`guideline ${g.title}`} onSelect={() => go(`guide-${g.id}`)}>
                <BookOpenIcon />
                {g.title}
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading={handbook.name}>
            {handbook.pages.map((p) => (
              <CommandItem key={p.id} value={`page ${p.title} ${p.folder}`} onSelect={() => go(`handbook-${p.id}`)}>
                <FileTextIcon />
                {p.title}
                <CommandShortcut>{p.folder}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandGroup heading="Tokens">
            {tokens
              .filter((t) => t.group === "color")
              .map((t) => (
                <CommandItem key={t.id} value={`token ${t.id} ${t.value}`} onSelect={() => go("tokens")}>
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
                setCommandOpen(false)
                if (await copyText(workspace.mcp)) toast.add({ title: "MCP endpoint copied", description: workspace.mcp })
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
                setTheme(dark ? "light" : "dark")
                setCommandOpen(false)
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
  )
}

export function AppShell({ route, children }: { route: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar route={route} />
      <SidebarInset className="min-w-0">
        <DesktopTopbar route={route} />
        <MobileTopbar route={route} />
        <div className="flex-1 pb-24 md:pb-12">{children}</div>
        <MobileTabbar route={route} />
      </SidebarInset>
      <CommandMenu />
    </SidebarProvider>
  )
}
