import { CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Dot, Facts, Meter, PageHeader, Section, copyText, linkClass } from "@/components/common";
import { agentStats, components, questions, workspace, type Question } from "@/data/workspace";
import { navigate } from "@/lib/router";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

type State = "answered" | "review" | "gap";

function useQuestionState() {
  const { resolved, inReview } = useStore();
  return (q: Question): State =>
    resolved.includes(q.id) ? "answered" : inReview.includes(q.id) ? "review" : q.status;
}

export function QuestionStatus({ state }: { state: State }) {
  if (state === "answered") return <Dot tone="good">Answered</Dot>;
  if (state === "review")
    return (
      <Dot tone="warn" className="text-warn">
        In review
      </Dot>
    );
  return (
    <Dot tone="bad" className="text-bad">
      No answer yet
    </Dot>
  );
}

/** Agent questions as a table, unanswered first, since those are the ones to act on. */
export function QuestionList({ limit }: { limit?: number }) {
  const { resolved, setPendingDraft } = useStore();
  const stateOf = useQuestionState();
  const sorted = [...questions].sort(
    (a, b) => Number(stateOf(b) === "gap") - Number(stateOf(a) === "gap") || b.count - a.count,
  );
  const list = limit ? sorted.slice(0, limit) : sorted;
  const cols = "sm:grid-cols-[minmax(0,1fr)_72px_128px_184px]";
  return (
    <div role="table" aria-label="Agent questions" className="border-b text-sm">
      <div
        role="row"
        className={cn("hidden gap-6 border-b pb-2 text-[13px] text-muted-foreground sm:grid", cols)}
      >
        <span role="columnheader">Question</span>
        <span role="columnheader" className="text-right">
          Asked
        </span>
        <span role="columnheader">Status</span>
        <span role="columnheader">Answer</span>
      </div>
      {list.map((q) => {
        const state = stateOf(q);
        const source = resolved.includes(q.id) ? q.resolves : q.source;
        return (
          <div
            key={q.id}
            role="row"
            className={cn(
              "grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-6 gap-y-1.5 border-t py-3 first-of-type:border-t-0 sm:min-h-14",
              cols,
            )}
          >
            <span role="cell" className="col-span-2 text-[15px] text-pretty sm:col-span-1">
              {q.text}
            </span>
            <span
              role="cell"
              className="order-3 text-muted-foreground tabular sm:order-none sm:text-right"
            >
              {q.count}
              <span className="sm:hidden"> asks</span>
            </span>
            <span role="cell" className="order-2 sm:order-none">
              <QuestionStatus state={state} />
            </span>
            <span role="cell" className="order-4 col-span-2 sm:order-none sm:col-span-1">
              {state === "gap" ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setPendingDraft(q.id);
                    navigate(`edit-${q.fileId}`);
                  }}
                >
                  Write the answer
                </Button>
              ) : source ? (
                <a href={`#${source.route}`} className={cn(linkClass, "font-normal")}>
                  {source.label}
                </a>
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
  );
}

const DAY = 24 * 60 * 60 * 1000;

/** Requests per day for the last week, today on the right. One series, so no legend. */
function WeekBars({ days }: { days: number[] }) {
  const max = Math.max(...days);
  const label = (i: number) => {
    const back = days.length - 1 - i;
    if (back === 0) return "Today";
    return new Date(Date.now() - back * DAY).toLocaleDateString("en-US", { weekday: "long" });
  };
  return (
    <div>
      <div
        className="flex h-16 items-end gap-1.5"
        role="img"
        aria-label={days.map((d, i) => `${label(i)}: ${d}`).join(", ")}
      >
        {days.map((d, i) => (
          <span
            key={i}
            title={`${label(i)}: ${d.toLocaleString()} requests`}
            className={cn(
              "flex-1 rounded-t-[4px]",
              i === days.length - 1 ? "bg-foreground/80" : "bg-foreground/15",
            )}
            style={{ height: `${Math.max(6, (d / max) * 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
        <span>7 days ago</span>
        <span>Today</span>
      </div>
    </div>
  );
}

/** Which agents asked, as one bar split by share, with each client named beside its color. */
function ClientShare() {
  const tones = ["bg-foreground/80", "bg-foreground/40", "bg-foreground/15"];
  return (
    <div>
      <div className="flex h-2 gap-0.5 overflow-hidden rounded-full">
        {agentStats.clients.map((c, i) => (
          <span key={c.name} className={tones[i % tones.length]} style={{ width: `${c.share}%` }} />
        ))}
      </div>
      <ul className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[13px]">
        {agentStats.clients.map((c, i) => (
          <li key={c.name} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", tones[i % tones.length])} />
            {c.name}
            <span className="text-muted-foreground tabular">{c.share}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The one thing to look at first: how agents used the docs, and what they couldn't find. */
function Health() {
  const { resolved, setPendingDraft } = useStore();
  const total = agentStats.week.reduce((a, b) => a + b, 0);
  const gaps = questions
    .filter((q) => q.status === "gap" && !resolved.includes(q.id))
    .sort((a, b) => b.count - a.count);
  const asked = gaps.reduce((n, q) => n + q.count, 0);
  return (
    <section
      aria-label="This week"
      className="grid overflow-hidden rounded-2xl border bg-card lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]"
    >
      <div className="grid gap-5 p-5 md:p-6">
        <div>
          <p className="text-[13px] text-muted-foreground">Agent requests this week</p>
          <p className="mt-1 text-[40px] leading-none font-semibold tracking-[-0.03em] tabular">
            {total.toLocaleString()}
          </p>
        </div>
        <WeekBars days={agentStats.week} />
        <ClientShare />
      </div>
      <div className="flex flex-col gap-4 border-t p-5 md:p-6 lg:border-t-0 lg:border-l">
        {gaps.length ? (
          <>
            <div>
              <p className="text-[13px] text-muted-foreground">No answer in your docs</p>
              <p className="mt-1 flex items-baseline gap-2">
                <span className="text-[40px] leading-none font-semibold tracking-[-0.03em] tabular text-bad">
                  {gaps.length}
                </span>
                <span className="text-sm text-muted-foreground">
                  {gaps.length === 1 ? "question" : "questions"}, asked {asked} times
                </span>
              </p>
            </div>
            <ul className="grid gap-2 text-[14px]">
              {gaps.slice(0, 3).map((q) => (
                <li key={q.id} className="flex items-start gap-2">
                  <span className="mt-[7px] size-1.5 shrink-0 rounded-full bg-bad" />
                  <span className="text-pretty">{q.text}</span>
                </li>
              ))}
            </ul>
            <Button
              className="mt-auto self-start"
              onClick={() => {
                setPendingDraft(gaps[0].id);
                navigate(`edit-${gaps[0].fileId}`);
              }}
            >
              Write the answer
            </Button>
          </>
        ) : (
          <div className="my-auto">
            <Dot tone="good" className="text-[17px] font-medium">
              Every question answered
            </Dot>
            <p className="mt-1.5 pl-4 text-sm text-muted-foreground">
              Agents found an answer in your docs all week.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

export function Overview() {
  const { commits, resolved } = useStore();
  const has = {
    usage: components.filter((c) => c.whenToUse?.length || c.agentRules?.length),
    examples: components.filter(
      (c) => c.examples?.length || (c.id === "button" && resolved.includes("q-loading")),
    ),
    a11y: components.filter((c) => c.a11y?.length),
  };
  const missing = (list: typeof components) =>
    components.filter((c) => !list.includes(c) && c.status !== "deprecated");

  const coverage = [
    { label: "Props and slots", value: components.length, missing: [] as typeof components },
    { label: "Usage rules", value: has.usage.length, missing: missing(has.usage) },
    { label: "Do and don’t examples", value: has.examples.length, missing: missing(has.examples) },
    { label: "Accessibility notes", value: has.a11y.length, missing: missing(has.a11y) },
  ];

  return (
    <div className="mx-auto w-full max-w-[1120px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title={workspace.name}
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
            <Button onClick={() => navigate("agents")}>Connect an agent</Button>
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

      <div className="mt-8 grid gap-14">
        <Health />

        <Section
          title="Questions"
          aside={
            <a href="#agents" className={linkClass}>
              All agent activity
            </a>
          }
        >
          <QuestionList limit={5} />
        </Section>

        <div className="grid gap-14 lg:grid-cols-2 lg:gap-12">
          <Section
            title="Coverage"
            aside={<span className="tabular">{components.length} components</span>}
          >
            <ul className="grid gap-4">
              {coverage.map((row) => (
                <li key={row.label}>
                  <div className="flex items-baseline justify-between gap-3 text-sm">
                    <span>{row.label}</span>
                    <span
                      className="text-muted-foreground tabular"
                      title={
                        row.missing.length
                          ? `Missing: ${row.missing.map((c) => c.name).join(", ")}`
                          : undefined
                      }
                    >
                      {row.value} of {components.length}
                    </span>
                  </div>
                  <Meter value={row.value} total={components.length} className="mt-2" />
                  {row.missing.length > 0 && (
                    <p className="mt-1.5 truncate text-[13px] text-muted-foreground">
                      Missing{" "}
                      {row.missing.map((c, i) => (
                        <span key={c.id}>
                          {i > 0 && ", "}
                          <a href={`#component-${c.id}`} className={cn(linkClass, "font-normal")}>
                            {c.name}
                          </a>
                        </span>
                      ))}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="Recent changes">
            <ol className="divide-y border-y text-sm">
              {commits.slice(0, 5).map((c) => (
                <li key={c.sha} className="grid grid-cols-[minmax(0,1fr)_auto] gap-x-4 py-2.5">
                  <span className="truncate">{c.message}</span>
                  <code className="font-mono text-xs text-muted-foreground">{c.sha}</code>
                  <span className="text-[13px] text-muted-foreground">
                    {c.author}, {c.when.toLowerCase()}
                  </span>
                </li>
              ))}
            </ol>
          </Section>
        </div>
      </div>
    </div>
  );
}
