import { CopyIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import {
  CopyButton,
  Dot,
  PageHeader,
  RailBlock,
  Section,
  SideRail,
  copyText,
  linkClass,
} from "@/components/common";
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
        className="flex h-12 items-end gap-1"
        role="img"
        aria-label={days.map((d, i) => `${label(i)}: ${d}`).join(", ")}
      >
        {days.map((d, i) => (
          <span
            key={i}
            title={`${label(i)}: ${d.toLocaleString()} requests`}
            className={cn(
              "flex-1 rounded-t-[3px]",
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

function openGaps(resolved: string[]) {
  return questions
    .filter((q) => q.status === "gap" && !resolved.includes(q.id))
    .sort((a, b) => b.count - a.count);
}

/**
 * The work queue, and the reason to open this page: questions agents asked that the docs
 * couldn't answer, most asked first. The ask count leads each row, the way votes lead a
 * question on a Q&A site, so the order explains itself.
 */
function NeedsAnswer() {
  const { resolved, setPendingDraft } = useStore();
  const stateOf = useQuestionState();
  const gaps = openGaps(resolved);
  if (!gaps.length)
    return (
      <div className="border-y py-8">
        <Dot tone="good" className="text-[17px] font-medium">
          Every question answered
        </Dot>
        <p className="mt-1.5 pl-3 text-sm text-muted-foreground">
          Agents found an answer in your docs all week.
        </p>
      </div>
    );
  return (
    <ol className="divide-y border-y">
      {gaps.map((q, i) => {
        const home = components.find((c) => c.id === q.fileId);
        return (
          <li
            key={q.id}
            className="grid grid-cols-[3.25rem_minmax(0,1fr)] gap-x-4 gap-y-3 py-5 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-5"
          >
            <p className="leading-none">
              <span className="block text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
                {q.count}
              </span>
              <span className="mt-1.5 block text-xs text-muted-foreground">asks</span>
            </p>
            <div className="min-w-0">
              <p className="text-[17px] leading-snug font-medium text-pretty">{q.text}</p>
              <p className="mt-1.5 flex flex-wrap items-baseline gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <QuestionStatus state={stateOf(q)} />
                {home && (
                  <span>
                    Belongs on{" "}
                    <a href={`#component-${home.id}`} className={cn(linkClass, "text-foreground")}>
                      {home.name}
                    </a>
                  </span>
                )}
              </p>
            </div>
            <Button
              variant={i === 0 ? "default" : "outline"}
              className="col-start-2 justify-self-start sm:col-start-3 sm:justify-self-end"
              onClick={() => {
                setPendingDraft(q.id);
                navigate(`edit-${q.fileId}`);
              }}
            >
              Write the answer
            </Button>
          </li>
        );
      })}
    </ol>
  );
}

/** Questions the docs did answer, in the same columns as the queue above but quiet. */
function Answered() {
  const { resolved } = useStore();
  const list = questions
    .filter((q) => q.status === "answered" || resolved.includes(q.id))
    .sort((a, b) => b.count - a.count);
  return (
    <ul className="divide-y border-y">
      {list.map((q) => {
        const source = resolved.includes(q.id) ? q.resolves : q.source;
        return (
          <li
            key={q.id}
            className="grid grid-cols-[3.25rem_minmax(0,1fr)] items-baseline gap-x-4 gap-y-1 py-3 sm:grid-cols-[4rem_minmax(0,1fr)_auto] sm:gap-x-5"
          >
            <span className="text-[15px] text-muted-foreground tabular">{q.count}</span>
            <span className="text-[15px] text-pretty">{q.text}</span>
            {source && (
              <a
                href={`#${source.route}`}
                className={cn(linkClass, "col-start-2 text-sm font-normal sm:col-start-3")}
              >
                {source.label}
              </a>
            )}
          </li>
        );
      })}
    </ul>
  );
}

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

/** The quiet column: how much the docs were used, where the project lives, what changed. */
function Rail() {
  const { commits } = useStore();
  const total = agentStats.week.reduce((a, b) => a + b, 0);
  return (
    <SideRail>
      <RailBlock title="This week">
        <p className="flex items-baseline gap-2">
          <span className="text-[28px] leading-none font-semibold tracking-[-0.03em] tabular">
            {total.toLocaleString()}
          </span>
          <span className="text-sm text-muted-foreground">agent requests</span>
        </p>
        <div className="mt-4">
          <WeekBars days={agentStats.week} />
        </div>
        <ul className="mt-4 grid gap-1.5 text-sm">
          {agentStats.clients.map((c) => (
            <li
              key={c.name}
              className="grid grid-cols-[minmax(0,1fr)_4.5rem_2.5rem] items-center gap-3"
            >
              <span className="truncate">{c.name}</span>
              <span className="h-1 overflow-hidden rounded-full bg-muted" aria-hidden>
                <span
                  className="block h-full rounded-full bg-foreground/60"
                  style={{ width: `${c.share}%` }}
                />
              </span>
              <span className="text-right text-muted-foreground tabular">{c.share}%</span>
            </li>
          ))}
        </ul>
      </RailBlock>

      <RailBlock title="Project">
        <dl className="grid gap-2 text-sm">
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Site</dt>
            <dd className="truncate">{workspace.site}</dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Branch</dt>
            <dd>
              <Dot tone="good">
                <span>
                  <code className="font-mono text-[13px]">{workspace.branch}</code>, in sync
                </span>
              </Dot>
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-4">
            <dt className="text-muted-foreground">Built</dt>
            <dd>{commits[0].when.toLowerCase()}</dd>
          </div>
        </dl>
        <div className="mt-3 flex items-center gap-1 rounded-md border py-0.5 pr-0.5 pl-2.5">
          <code className="min-w-0 flex-1 truncate font-mono text-xs">{workspace.mcp}</code>
          <CopyButton text={workspace.mcp} label="Copy MCP endpoint" />
        </div>
      </RailBlock>

      <RailBlock title="Recent changes">
        <ol className="grid gap-3 text-sm">
          {commits.slice(0, 4).map((c) => (
            <li key={c.sha}>
              <p className="text-pretty">{c.message}</p>
              <p className="mt-0.5 text-[13px] text-muted-foreground">
                {c.author}, {c.when.toLowerCase()}{" "}
                <code className="ml-1 font-mono text-xs">{c.sha}</code>
              </p>
            </li>
          ))}
        </ol>
      </RailBlock>
    </SideRail>
  );
}

export function Overview() {
  const { resolved } = useStore();
  const gaps = openGaps(resolved);
  const asked = gaps.reduce((n, q) => n + q.count, 0);
  const total = agentStats.week.reduce((a, b) => a + b, 0).toLocaleString();
  const rows = useCoverage();
  const live = rows.filter((r) => r.c.status !== "deprecated");
  const complete = live.filter((r) => !r.has.includes(false)).length;

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:px-8 md:py-10">
      <PageHeader
        title={workspace.name}
        description={
          gaps.length
            ? `Agents asked ${total} times this week. ${gaps.length} ${gaps.length === 1 ? "question" : "questions"} had no answer, asked ${asked} times in all.`
            : `Agents asked ${total} times this week, and every question found an answer.`
        }
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
      />

      {/* The work on the left, the facts on the right. The rail drops under the work on small screens. */}
      <div className="mt-10 grid gap-x-10 gap-y-14 lg:grid-cols-[minmax(0,1fr)_288px]">
        <div className="grid min-w-0 content-start gap-14">
          <Section title="Needs an answer" aside={gaps.length > 0 && <span>Most asked first</span>}>
            <NeedsAnswer />
          </Section>

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

          <Section
            title="Answered"
            aside={
              <a href="#agents" className={linkClass}>
                All agent activity
              </a>
            }
          >
            <Answered />
          </Section>
        </div>
        <Rail />
      </div>
    </div>
  );
}
