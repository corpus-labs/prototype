import { AppShell } from "@/components/app-shell";
import { useRoute } from "@/lib/router";
import { Agents } from "@/pages/agents";
import { ComponentDetail, ComponentsIndex } from "@/pages/components";
import { Editor } from "@/pages/editor";
import { GuideReader, GuidelinesIndex } from "@/pages/guidelines";
import { DocsOverview, DocsPage } from "@/pages/handbook";
import { Integrations } from "@/pages/integrations";
import { Overview } from "@/pages/overview";
import { docsProjectOf } from "@/data/workspace";
import { Projects } from "@/pages/projects";
import { WorkspaceSettings } from "@/pages/settings";
import { Tokens } from "@/pages/tokens";

function Page({ route }: { route: string }) {
  if (route === "projects") return <Projects />;
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

export default function App() {
  const route = useRoute();
  return (
    <AppShell route={route}>
      <Page key={route} route={route} />
    </AppShell>
  );
}
