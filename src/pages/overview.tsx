// Exploration: a project's home is a page, not a dashboard. What it is, what's waiting on a
// person, and an index of what's in it. The weekly numbers live in Settings, under Agents and
// MCP, and the questions in the inbox. See docs/decisions/proposed-library-and-inbox.md.
import { CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  Dot,
  Facts,
  PageHeader,
  Section,
  StatusLabel,
  copyText,
  linkClass,
} from "@/components/common";
import { components, guidelineFiles, tokens, workspace } from "@/data/workspace";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { InboxNotice } from "@/pages/inbox";

const PARTS = ["Props", "Rules", "Examples", "Accessibility"] as const;

function useCoverage() {
  const { resolved } = useStore();
  return components.map((c) => ({
    c,
    has: [
      true,
      Boolean(c.whenToUse?.length || c.agentRules?.length),
      Boolean(c.examples?.length || (c.id === "button" && resolved.includes("q-loading"))),
      Boolean(c.a11y?.length),
    ],
  }));
}

/**
 * Every component against the four parts of its page. A grid shows which page is thin,
 * where four progress bars only said how many were.
 */
function Coverage({ rows }: { rows: ReturnType<typeof useCoverage> }) {
  const thin = rows.filter((r) => r.c.status !== "deprecated" && r.has.includes(false));
  return (
    <>
      <table className="hidden w-full border-collapse text-sm sm:table">
        <thead>
          <tr className="border-b text-left text-[13px] text-muted-foreground">
            <th className="py-2 pr-4 font-normal">Component</th>
            {PARTS.map((p) => (
              <th key={p} className="w-28 py-2 font-normal">
                {p}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map(({ c, has }) => {
            const retired = c.status === "deprecated";
            return (
              <tr key={c.id} className="border-b">
                <th scope="row" className="py-2.5 pr-4 text-left font-normal">
                  <a
                    href={`#component-${c.id}`}
                    className={cn(linkClass, "font-normal", retired && "text-muted-foreground")}
                  >
                    {c.name}
                  </a>
                  {retired && (
                    <span className="ml-2 text-[13px] text-muted-foreground">Deprecated</span>
                  )}
                </th>
                {has.map((ok, i) => (
                  <td key={PARTS[i]} className="py-2.5">
                    {ok ? (
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <span className="size-2 rounded-full bg-foreground/60" />
                        <span className="sr-only">Written</span>
                      </span>
                    ) : retired ? (
                      <span className="text-muted-foreground/60">None</span>
                    ) : (
                      <Dot tone="warn" className="text-warn">
                        Missing
                      </Dot>
                    )}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
      {/* Phones have no room for five columns, so they list only the thin pages. */}
      <ul className="divide-y border-y text-sm sm:hidden">
        {thin.length === 0 && <li className="py-3">Every component page is complete.</li>}
        {thin.map(({ c, has }) => (
          <li key={c.id} className="flex items-baseline justify-between gap-4 py-3">
            <a href={`#component-${c.id}`} className={cn(linkClass, "font-normal")}>
              {c.name}
            </a>
            <span className="text-right text-warn">
              Missing{" "}
              {PARTS.filter((_, i) => !has[i])
                .join(", ")
                .toLowerCase()}
            </span>
          </li>
        ))}
      </ul>
    </>
  );
}

/** Charged UI's home: what it is, what's waiting, then its components, guidelines, and tokens. */
export function Overview() {
  const { commits } = useStore();
  const rows = useCoverage();
  const live = rows.filter((r) => r.c.status !== "deprecated");
  const complete = live.filter((r) => !r.has.includes(false)).length;
  const groups = ["color", "type", "space", "radius"].map(
    (g) => [g, tokens.filter((t) => t.group === g).length] as const,
  );

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-12">
      <PageHeader
        title={workspace.name}
        description={workspace.description}
        actions={
          <>
            <Button
              variant="outline"
              onClick={async () => {
                if (await copyText(workspace.mcp))
                  toast.add({ title: "MCP endpoint copied", description: workspace.mcp });
              }}
            >
              <CopyIcon />
              Copy MCP endpoint
            </Button>
            <Button variant="outline" onClick={() => navigate("agents")}>
              Connect an agent
            </Button>
          </>
        }
        meta={
          <Facts
            items={[
              ["Site", workspace.site],
              [
                "Branch",
                <Dot tone="good">
                  <span>
                    <code className="font-mono text-[13px]">{workspace.branch}</code>, in sync
                  </span>
                </Dot>,
              ],
              ["Built", commits[0].when.toLowerCase()],
            ]}
          />
        }
      />

      <InboxNotice project={workspace.name} className="mt-8" />

      <div className="mt-12 grid gap-14">
        <Section
          title="Components"
          aside={
            <a href="#components" className={linkClass}>
              All {components.length}
            </a>
          }
        >
          <ul className="grid grid-cols-[minmax(0,1fr)] gap-x-10 border-t sm:grid-cols-[repeat(2,minmax(0,1fr))]">
            {components.map((c) => (
              <li key={c.id} className="border-b">
                <a
                  href={`#component-${c.id}`}
                  className="group flex items-baseline justify-between gap-4 py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <span className="min-w-0">
                    <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline">
                      {c.name}
                    </span>
                    <span className="mt-0.5 block truncate text-sm text-muted-foreground">
                      {c.summary}
                    </span>
                  </span>
                  <StatusLabel
                    status={c.status}
                    className="shrink-0 text-[13px] text-muted-foreground"
                  />
                </a>
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
          <Section title="Guidelines">
            <ul className="divide-y border-y">
              {guidelineFiles.map((g) => (
                <li key={g.id}>
                  <a
                    href={`#guide-${g.id}`}
                    className="group block py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  >
                    <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline">
                      {g.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-pretty text-muted-foreground">
                      {g.description}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </Section>

          <div className="grid content-start gap-14">
            <Section title="Tokens">
              <a
                href="#tokens"
                className="group block border-y py-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <span className="block text-[15px] font-medium underline-offset-4 group-hover:underline">
                  {tokens.length} tokens, synced from Figma
                </span>
                <span className="mt-0.5 block text-sm text-muted-foreground">
                  {groups.map(([g, n]) => `${n} ${g}`).join(", ")}
                </span>
              </a>
            </Section>

            <Section title="Recent changes">
              <ol className="divide-y border-y text-sm">
                {commits.slice(0, 4).map((c) => (
                  <li key={c.sha} className="py-2.5">
                    <p className="text-pretty">{c.message}</p>
                    <p className="mt-0.5 text-[13px] text-muted-foreground">
                      {c.author}, {c.when.toLowerCase()}{" "}
                      <code className="ml-1 font-mono text-xs">{c.sha}</code>
                    </p>
                  </li>
                ))}
              </ol>
            </Section>
          </div>
        </div>

        <Section
          title="Coverage"
          aside={
            <span className="tabular">
              {complete} of {live.length} pages complete
            </span>
          }
        >
          <Coverage rows={rows} />
        </Section>
      </div>
    </div>
  );
}
