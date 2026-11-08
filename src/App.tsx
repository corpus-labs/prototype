import { AppShell } from "@/components/app-shell";
import { useRoute } from "@/lib/router";
import { Agents } from "@/pages/agents";
import { ComponentDetail, ComponentsIndex } from "@/pages/components";
import { Editor } from "@/pages/editor";
import { GuideReader, GuidelinesIndex } from "@/pages/guidelines";
import { DocsOverview, DocsPage } from "@/pages/handbook";
import { Integrations } from "@/pages/integrations";
import { Overview } from "@/pages/overview";
import { docsProjectOf, docsProjects } from "@/data/workspace";
import { PublishedSite } from "@/pages/site";
import { Projects } from "@/pages/projects";
import { Plugins } from "@/pages/plugins";
import { WorkspaceSettings } from "@/pages/settings";
import { Tokens } from "@/pages/tokens";

function Page({ route }: { route: string }) {
  if (route === "projects") return <Projects />;
  if (route === "plugins") return <Plugins />;
  const docs = docsProjectOf(route);
  if (docs) {
    if (route === docs.id) return <DocsOverview project={docs} />;
    return <DocsPage project={docs} id={route.slice(docs.id.length + 1)} />;
  }
  if (route === "components") return <ComponentsIndex />;
  if (route.startsWith("component-"))
    return <ComponentDetail id={route.slice("component-".length)} />;
  if (route === "tokens") return <Tokens />;
  if (route === "guidelines") return <GuidelinesIndex />;
  if (route.startsWith("guide-")) return <GuideReader id={route.slice("guide-".length)} />;
  if (route.startsWith("edit-")) return <Editor id={route.slice("edit-".length)} />;
  if (route === "agents") return <Agents />;
  if (route === "integrations") return <Integrations />;
  if (route === "workspace") return <WorkspaceSettings />;
  return <Overview />;
}

/** `site-help` is a docs project's published home page, `site-help-refunds` one of its pages. */
function siteOf(route: string) {
  if (!route.startsWith("site-")) return null;
  const rest = route.slice("site-".length);
  const project = docsProjects.find((p) => rest === p.id || rest.startsWith(`${p.id}-`));
  if (!project) return null;
  return { project, pageId: rest === project.id ? null : rest.slice(project.id.length + 1) };
}

export default function App() {
  const route = useRoute();
  // The published site is what readers see, so it has none of Corpus's own chrome.
  const site = siteOf(route);
  if (site) return <PublishedSite key={route} project={site.project} pageId={site.pageId} />;
  return (
    <AppShell route={route}>
      <Page key={route} route={route} />
    </AppShell>
  );
}
