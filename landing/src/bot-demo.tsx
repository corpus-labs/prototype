import { useState, type FormEvent } from "react";
import { cn } from "./lib/utils";
import { answerFrom, helpPages, type BotReply } from "./bot";
import { CorpusMark, Dot } from "./ui";

const EXAMPLES = [
  "How long do refunds take?",
  "Can I move my license to a new site?",
  "Does the theme work with Drupal 11?",
  "Do you offer discounts for nonprofits?",
];

type Turn = { q: string; reply: BotReply };

/**
 * A working support bot, answering from the sample help center in the prototype.
 * It starts with one answer showing, so the page reads well before anyone types.
 */
export function BotDemo({ className }: { className?: string }) {
  const [turn, setTurn] = useState<Turn>(() => ({
    q: EXAMPLES[0],
    reply: answerFrom(EXAMPLES[0]),
  }));
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);

  const ask = (q: string) => {
    const text = q.trim();
    if (!text || thinking) return;
    setDraft("");
    setThinking(true);
    setTurn({ q: text, reply: { kind: "gap" } });
    window.setTimeout(() => {
      setTurn({ q: text, reply: answerFrom(text) });
      setThinking(false);
    }, 650);
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    ask(draft);
  };

  return (
    <div className={cn("overflow-hidden rounded-2xl bg-white shot", className)}>
      <div className="flex items-center justify-between border-b px-5 py-3.5">
        <span className="flex items-center gap-2.5 text-[15px] font-medium">
          <span className="grid size-7 place-items-center rounded-lg bg-ink text-white">
            <CorpusMark className="size-3.5" />
          </span>
          Acme help
        </span>
        <Dot tone="good" className="text-[13px] text-muted">
          Answers from {helpPages.length} pages
        </Dot>
      </div>

      <div
        className="grid min-h-[260px] content-start gap-4 bg-subtle px-5 py-5"
        aria-live="polite"
      >
        <p className="max-w-[85%] justify-self-end rounded-2xl rounded-br-md bg-ink px-4 py-2.5 text-[15px] text-white">
          {turn.q}
        </p>
        <div className="max-w-[92%] rounded-2xl rounded-bl-md border bg-white px-4 py-3.5">
          {thinking ? (
            <span className="flex gap-1 py-1.5" aria-label="Looking through the help pages">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="size-1.5 animate-bounce rounded-full bg-faint"
                  style={{ animationDelay: `${i * 120}ms` }}
                />
              ))}
            </span>
          ) : turn.reply.kind === "answer" ? (
            <>
              <p className="text-[15px] leading-[1.55] text-pretty">{turn.reply.text}</p>
              <p className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1 border-t pt-2.5 text-[13px] text-muted">
                <Dot tone="good">From</Dot>
                <span className="font-medium text-ink">
                  {turn.reply.page.title}
                  {turn.reply.section ? `, ${turn.reply.section}` : ""}
                </span>
                <code className="font-mono text-[12px]">{turn.reply.page.path}</code>
              </p>
            </>
          ) : (
            <>
              <Dot tone="bad" className="text-[15px] font-medium text-bad">
                No page answers this yet
              </Dot>
              <p className="mt-1.5 pl-4 text-[14.5px] leading-[1.5] text-pretty text-muted">
                I’ll pass this to a person instead of guessing. Your team sees it in its list of
                questions to answer.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="border-t px-5 py-4">
        <div className="flex flex-wrap gap-2">
          {EXAMPLES.slice(1).map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              disabled={thinking}
              className="rounded-full border bg-white px-3 py-1.5 text-[13.5px] text-muted transition hover:border-neutral-300 hover:text-ink focus-visible:ring-4 focus-visible:ring-neutral-200 focus-visible:outline-none disabled:opacity-60"
            >
              {q}
            </button>
          ))}
        </div>
        <form onSubmit={submit} className="mt-3 flex gap-2">
          <label htmlFor="bot-question" className="sr-only">
            Ask the support bot
          </label>
          <input
            id="bot-question"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Ask your own question"
            autoComplete="off"
            className="h-11 min-w-0 flex-1 rounded-xl border bg-white px-3.5 text-[16px] transition outline-none placeholder:text-faint focus:border-neutral-400 focus:ring-4 focus:ring-neutral-200 sm:text-[15px]"
          />
          <button
            type="submit"
            disabled={thinking || !draft.trim()}
            className="h-11 shrink-0 rounded-xl bg-ink px-4 text-[15px] font-medium text-white transition hover:bg-neutral-800 focus-visible:ring-4 focus-visible:ring-neutral-300 focus-visible:outline-none disabled:opacity-50"
          >
            Ask
          </button>
        </form>
      </div>
    </div>
  );
}
